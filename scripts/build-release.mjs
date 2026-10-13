import { resolve } from "node:path";
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { digest, sealRelease } from './release-artifact.mjs';

// No caller-supplied SHA or build directory: rebuild the current clean commit.
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const sourceSha = git('rev-parse', 'HEAD');
const clean = () => {
  assert.equal(git('status', '--porcelain', '--untracked-files=all'), '', 'Release requires a clean committed checkout');
  assert.equal(git('rev-parse', 'HEAD'), sourceSha, 'Source changed during release build');
};
clean();
assert.ok(!git("ls-tree", "-r", sourceSha).split("\n").some(line => line.startsWith("120000 ")), "Source symlinks are forbidden");
assert.equal(process.versions.node.split('.')[0], '24', 'Release requires Node 24');
// Ignore local caches, dotenv and stale generated files by building a Git export.
const root = '.output/release-build';
await rm(root, { recursive: true, force: true });
await mkdir(root, { recursive: true });
const archive = execFileSync('git', ['archive', sourceSha], { maxBuffer: 256 * 1024 * 1024 });
execFileSync('tar', ['-x', '-C', root], { input: archive });
const env = { PATH: process.env.PATH, HOME: process.env.HOME, CI: 'true', WRANGLER_SEND_METRICS: 'false' };
const run = (command, args) => execFileSync(command, args, { cwd: root, env, stdio: 'inherit' });
run('npm', ['ci']);
run('npm', ['run', 'generate']);
await writeFile(`${root}/.output/bundle.json`, JSON.stringify({ name: 'blog-local-bundle', main: '../worker/index.mjs', compatibility_date: '2026-10-13' }));
run('node', ['node_modules/wrangler/bin/wrangler.js', 'deploy', '--dry-run', '--config', '.output/bundle.json', '--outdir', resolve(root, '.output/worker-bundle')]);
const output = '.output/release';
await rm(output, { recursive: true, force: true });
await mkdir(`${output}/worker`, { recursive: true });
await cp(`${root}/.output/public`, `${output}/static`, { recursive: true, dereference: false });
await cp(`${root}/.output/worker-bundle/index.js`, `${output}/worker/index.js`);
await cp(`${root}/migrations`, `${output}/migrations`, { recursive: true, dereference: false });
await cp(`${root}/.output/published-routes.json`, `${output}/published-routes.json`);
const contentManifestDigest = digest(await readFile(`${root}/.blog-sync/manifest.json`));
await sealRelease(output, { sourceSha, contentManifestDigest });
clean();
console.log(`Release ${sourceSha}: ${output}`);
