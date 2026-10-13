import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';

test('release artifact implementation exists', () => {
  assert.ok(existsSync(new URL('../scripts/release-artifact.mjs', import.meta.url)), 'release packer is missing');
});

import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const sourceSha = 'a'.repeat(40);
const contentManifestDigest = 'b'.repeat(64);
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'release-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ['static', 'worker', 'migrations']) await mkdir(join(root, dir));
  for (const [name, value] of Object.entries({
    'static/index.html': '<h1>public</h1>', 'static/404.html': 'missing',
    'static/_headers': '/*\n  X-Frame-Options: DENY\n',
    'worker/index.js': 'export default {}', 'migrations/0001_views.sql': 'CREATE TABLE views(id TEXT);',
    'published-routes.json': '["/blog/hello"]',
  })) await writeFile(join(root, name), value);
  return root;
}
const api = async () => {
  assert.ok(existsSync(new URL('../scripts/release-artifact.mjs', import.meta.url)), 'release packer is missing');
  return import('../scripts/release-artifact.mjs');
};
test('seals deterministic hashes and public identity without circular hash', async t => {
  const { sealRelease, validateRelease } = await api();
  const root = await fixture(t);
  const manifest = await sealRelease(root, { sourceSha, contentManifestDigest });
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.files['release-manifest.json'], undefined);
  assert.deepEqual(JSON.parse(await readFile(join(root, 'static/release.json'))), { sourceSha, contentManifestDigest });
  assert.match(await readFile(join(root, 'static/_headers'), 'utf8'), /\/release.json\n  Cache-Control: no-store/);
  assert.deepEqual(await validateRelease(root, sourceSha), manifest);
  await assert.rejects(validateRelease(root, 'c'.repeat(40)), /source/);
});
for (const [name, mutate] of Object.entries({
  tamper: root => writeFile(join(root, 'worker/index.js'), 'different'),
  extra: root => writeFile(join(root, 'static/extra.html'), 'extra'),
  missing: root => rm(join(root, 'static/index.html')),
  symlink: root => symlink('/etc/hosts', join(root, 'static/link')),
  traversal: async root => { const path = join(root, 'release-manifest.json'); const m = JSON.parse(await readFile(path)); m.files['../outside'] = 'a'.repeat(64); await writeFile(path, JSON.stringify(m)); },
})) test(`rejects ${name}`, async t => {
  const { sealRelease, validateRelease } = await api(); const root = await fixture(t);
  await sealRelease(root, { sourceSha, contentManifestDigest }); await mutate(root);
  await assert.rejects(validateRelease(root, sourceSha));
});
for (const name of ['static/.env', 'static/terraform.tfstate', 'static/drafts/secret.md', 'static/vault/private.txt', 'secret.txt']) test(`rejects private input ${name}`, async t => {
  const { sealRelease } = await api(); const root = await fixture(t);
  await mkdir(join(root, name, '..'), { recursive: true }); await writeFile(join(root, name), 'private');
  await assert.rejects(sealRelease(root, { sourceSha, contentManifestDigest }));
});

import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const builder = fileURLToPath(new URL('../scripts/build-release.mjs', import.meta.url));
test('release builder rejects dirty and symlink source before running builds', async t => {
  const root = await mkdtemp(join(tmpdir(), 'release-source-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  git('init'); git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Release test');
  await writeFile(join(root, 'source.txt'), 'committed'); git('add', '.'); git('commit', '-m', 'test fixture');
  await writeFile(join(root, 'source.txt'), 'mixed source');
  const dirty = spawnSync(process.execPath, [builder, sourceSha], { cwd: root, encoding: 'utf8' });
  assert.notEqual(dirty.status, 0); assert.match(dirty.stderr, /clean committed checkout/);
  git('checkout', '--', 'source.txt');
  await symlink('/etc/hosts', join(root, 'private-link')); git('add', '.'); git('commit', '-m', 'symlink fixture');
  const linked = spawnSync(process.execPath, [builder], { cwd: root, encoding: 'utf8' });
  assert.notEqual(linked.status, 0); assert.match(linked.stderr, /Source symlinks are forbidden/);
});
