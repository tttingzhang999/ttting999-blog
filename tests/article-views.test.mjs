import assert from 'node:assert/strict';
import { test } from 'node:test';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { articleViews } from '../worker/article-views.mjs';
import { publishedRoutes } from '../scripts/published-routes.mjs';

const slug = '/blog/技術/d1';
const routes = [slug, '/blog/new'];
function database() {
  const sqlite = new Database(':memory:');
  sqlite.exec('CREATE TABLE article_views (slug TEXT PRIMARY KEY NOT NULL, views INTEGER NOT NULL CHECK (views >= 0))');
  return { sqlite, prepare: (sql) => ({ bind: (value) => ({ first: async () => sqlite.prepare(sql).get(value) ?? null }) }) };
}

test('publisher allowlist uses existing canonical nested Unicode routes', () => {
  assert.deepEqual(publishedRoutes({ articles: [{ source: '技術/D1.md', route: slug }] }), [slug]);
  assert.throws(() => publishedRoutes({ articles: [{ source: '技術/D1.md', route: '/blog/wrong' }] }));
  assert.throws(() => publishedRoutes({ articles: [{ source: 'a.md', route: '/blog/a' }, { source: 'a.md', route: '/blog/a' }] }));
  const manifest = JSON.parse(readFileSync('.blog-sync/manifest.json', 'utf8'));
  assert.equal(publishedRoutes(manifest).length, manifest.articles.length);
});

test('GET returns zero only for published missing row without creating a row; increments persist', async () => {
  const db = database();
  assert.deepEqual(await articleViews(db, routes, slug), { slug, views: 0 });
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM article_views').get().n, 0);
  assert.deepEqual(await articleViews(db, routes, slug, true), { slug, views: 1 });
  assert.deepEqual(await articleViews(db, routes, slug, true), { slug, views: 2 });
  assert.deepEqual(await articleViews(db, routes, slug), { slug, views: 2 });
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM article_views').get().n, 1);
});

test('invalid, encoded, noncanonical and unknown paths never access D1', async () => {
  const db = { prepare() { assert.fail('invalid input touched D1'); } };
  for (const value of [null, 4, '', '/blog/', '/blog/../a', '/blog/a/', '/blog//a', '/blog/%E6%8A%80', '/blog/%252F', '/blog/a?x=1', '/blog/a#x', '/blog/a\\b', '/blog/\u0000', '/blog/\ud800', '/blog/' + 'a'.repeat(2048)]) {
    await assert.rejects(articleViews(db, routes, value, true), { code: 'INVALID_SLUG' });
  }
  await assert.rejects(articleViews(db, routes, '/blog/missing', true), { code: 'UNKNOWN_ARTICLE' });
  await assert.rejects(articleViews(db, routes, "/blog/x');DROP TABLE article_views;--", true), { code: 'INVALID_SLUG' });
});

test('storage errors propagate and invalid count never becomes a success', async () => {
  await assert.rejects(articleViews(null, routes, slug));
  for (const views of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1, null]) {
    const db = { prepare: () => ({ bind: () => ({ first: async () => ({ views }) }) }) };
    await assert.rejects(articleViews(db, routes, slug), { code: 'INVALID_COUNT' });
  }
});
