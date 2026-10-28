import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { createI18n } from 'vue-i18n';
import en from '../i18n/locales/en.ts';
import ja from '../i18n/locales/ja.ts';
import zh from '../i18n/locales/zh-TW.ts';

const catalogs = { en, ja, 'zh-TW': zh };
const flatten = (messages, prefix = '') => Object.entries(messages).flatMap(([key, value]) =>
  typeof value === 'string' ? [[`${prefix}${key}`, value]] : flatten(value, `${prefix}${key}.`),
);
const keys = [...new Set(Object.values(catalogs).flatMap(messages => flatten(messages).map(([key]) => key)))].sort();

test('all locales contain the same translation keys without relying on fallback', () => {
  for (const [locale, messages] of Object.entries(catalogs)) {
    assert.deepEqual(flatten(messages).map(([key]) => key).sort(), keys, locale);
  }
});

test('every static translation reference resolves in every locale', () => {
  const roots = ['pages', 'components', 'composables', 'layouts'];
  const files = roots.flatMap(root => readdirSync(new URL(`../${root}/`, import.meta.url), { recursive: true })
    .filter(file => /\.(vue|ts)$/.test(file)).map(file => `${root}/${file}`));
  const references = files.flatMap(file => [...readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
    .matchAll(/(?:\$t|\bt)\(\s*['"]([^'"]+)['"]/g)].map(match => ({ file, key: match[1] })));
  assert.ok(references.length > 0);
  for (const [locale, messages] of Object.entries(catalogs)) {
    const translations = Object.fromEntries(flatten(messages));
    for (const { file, key } of references) {
      assert.equal(typeof translations[key], 'string', `${locale}: ${file}: ${key}`);
    }
  }
});

test('all messages compile and interpolate without exposing translation keys', () => {
  for (const [locale, messages] of Object.entries(catalogs)) {
    const errors = [];
    const i18n = createI18n({ legacy: false, locale, fallbackLocale: false, messages: { [locale]: messages }, onError: error => errors.push(error) });
    try {
      for (const [key, message] of flatten(messages)) {
        const values = Object.fromEntries([...message.matchAll(/\{(\w+)\}/g)].map(match => [match[1], 2]));
        assert.notEqual(i18n.global.t(key, values), key, `${locale}: ${key}`);
      }
      assert.deepEqual(errors, [], locale);
    } finally {
      i18n.dispose();
    }
  }
});
