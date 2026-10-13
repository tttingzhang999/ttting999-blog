import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, lstat } from 'node:fs/promises';
import { join } from 'node:path';

export const runtimeContract = {
  compatibilityDate: '2026-10-13', compatibilityFlags: [],
  bindings: { DB: 'd1', VIEW_LIMITER: 'ratelimit', SITE_ORIGIN: 'string' },
};
export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
function allowed(path) {
  assert.ok(!path.startsWith('/') && !path.includes('\\') && path.split('/').every(p => p && p !== '.' && p !== '..'), 'Unsafe release path');
  assert.ok(!/(^|\/)(?:\.[^/]+|drafts|vault|node_modules)(\/|$)|\.(?:tfstate|tfplan|tfvars|pem|key)(\.|$)/i.test(path), 'Private release input');
  assert.ok(path.startsWith('static/') || /^migrations\/\d+_[\w-]+\.sql$/.test(path) || ['worker/index.js', 'published-routes.json', 'release-manifest.json'].includes(path), 'Unexpected release input');
}
export async function releaseFiles(root, prefix = '') {
  const files = [];
  for (const name of (await readdir(join(root, prefix))).sort()) {
    const path = prefix + name;
    const stat = await lstat(join(root, path));
    assert.ok(!stat.isSymbolicLink(), 'Symlinks are forbidden');
    if (stat.isDirectory()) files.push(...await releaseFiles(root, path + '/'));
    else { assert.ok(stat.isFile(), 'Only regular release files allowed'); allowed(path); files.push(path); }
  }
  return files;
}
async function hashes(root) {
  return Object.fromEntries(await Promise.all((await releaseFiles(root)).filter(p => p !== 'release-manifest.json').map(async p => [p, digest(await readFile(join(root, p)))])));
}
function identity(value) {
  assert.match(value.sourceSha, /^[a-f0-9]{40}$/, 'Invalid source SHA');
  assert.match(value.contentManifestDigest, /^[a-f0-9]{64}$/, 'Invalid content manifest digest');
}
export async function sealRelease(root, value) {
  identity(value);
  await writeFile(join(root, 'static/release.json'), json(value));
  const headers = await readFile(join(root, 'static/_headers'), 'utf8');
  await writeFile(join(root, 'static/_headers'), headers + '\n/release.json\n  Cache-Control: no-store\n');
  const manifest = { schemaVersion: 1, ...value, runtime: runtimeContract, files: await hashes(root) };
  await writeFile(join(root, 'release-manifest.json'), json(manifest));
  return validateRelease(root, value.sourceSha);
}
export async function validateRelease(root, expectedSourceSha) {
  const manifest = JSON.parse(await readFile(join(root, 'release-manifest.json'), 'utf8'));
  identity(manifest);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.sourceSha, expectedSourceSha, 'Release source mismatch');
  assert.deepEqual(manifest.runtime, runtimeContract);
  for (const path of Object.keys(manifest.files)) allowed(path);
  assert.deepEqual(await hashes(root), manifest.files, 'Release file hashes mismatch');
  for (const path of ['static/index.html', 'static/404.html', 'static/_headers', 'static/release.json', 'worker/index.js', 'published-routes.json']) assert.ok(manifest.files[path], `Missing ${path}`);
  assert.ok(Object.keys(manifest.files).some(p => p.startsWith('migrations/')), 'Missing migrations');
  assert.deepEqual(JSON.parse(await readFile(join(root, 'static/release.json'))), { sourceSha: manifest.sourceSha, contentManifestDigest: manifest.contentManifestDigest });
  assert.match(await readFile(join(root, 'static/_headers'), 'utf8'), /\/release.json\n  Cache-Control: no-store\n/);
  return manifest;
}
