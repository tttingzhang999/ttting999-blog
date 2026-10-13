import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { assertArchiveSize } from '../scripts/release-transport.mjs';

test('compressed transport size permits boundary and rejects oversize/invalid', () => {
  assertArchiveSize(1);
  assertArchiveSize(100 * 1024 * 1024 - 1024);
  for (const size of [0, -1, 1.5, NaN, Infinity, 100 * 1024 * 1024 - 1023]) assert.throws(() => assertArchiveSize(size));
});
test('transport packages exact release bytes into a single archive', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'blog-transport-'));
  try {
    await mkdir(join(temp, '.output/release/static'), { recursive: true });
    await writeFile(join(temp, '.output/release/static/index.html'), 'hello');
    execFileSync(process.execPath, [resolve('scripts/release-transport.mjs')], { cwd: temp });
    const result = execFileSync('tar', ['-xOzf', '.output/blog-release.tar.gz', './static/index.html'], { cwd: temp, encoding: 'utf8' });
    assert.equal(result, 'hello');
    assert.ok((await readFile(join(temp, '.output/blog-release.tar.gz'))).length > 0);
  } finally { await rm(temp, { recursive: true, force: true }); }
});
