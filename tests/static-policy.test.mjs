import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { staticPolicy } from '../scripts/static-policy.mjs';

const policy = JSON.parse(await readFile('vercel.json', 'utf8'));
const generated = staticPolicy(policy);

test('generated Workers redirects preserve all Vercel permanent aliases exactly', async () => {
  const redirects = generated.redirects.trim().split('\n');
  assert.equal(policy.redirects.length, 22);
  assert.deepEqual(redirects, policy.redirects.map(({ source, destination, permanent }) =>
    `${source} ${destination} ${permanent ? 308 : 307}`));
});

test('generated Workers headers preserve Vercel security and bundle caching', async () => {
  const expected = policy.headers.map(({ source, headers }) => [
    source.replace('(.*)', '*'),
    ...headers.map(({ key, value }) => `  ${key}: ${value}`),
  ].join('\n')).join('\n\n') + '\n';
  assert.equal(generated.headers, expected);
});

test('unsupported Vercel patterns fail rather than silently changing routing', () => {
  assert.throws(() => staticPolicy({ ...policy, headers: [{ source: '/blog/:slug', headers: [] }] }), /Unsupported header pattern/);
  assert.throws(() => staticPolicy({ ...policy, redirects: [{ source: '/blog/:slug', destination: '/blog', permanent: true }] }), /literal redirect/);
  assert.throws(() => staticPolicy({ ...policy, redirects: [{ source: '/old', destination: '/new' }] }));
  assert.equal(staticPolicy({ headers: [], redirects: [{ source: '/old', destination: '/new', permanent: false }] }).redirects, '/old /new 307\n');
});
