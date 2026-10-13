import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { lstat } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function assertArchiveSize(bytes) {
  // Reserve 1 KiB for upload-artifact's outer ZIP metadata.
  assert.ok(Number.isSafeInteger(bytes) && bytes > 0 && bytes <= 100 * 1024 * 1024 - 1024,
    'Release transport must fit within 100 MiB including ZIP overhead');
}

export async function packageTransport() {
  execFileSync('tar', ['-czf', '.output/blog-release.tar.gz', '-C', '.output/release', '.']);
  assertArchiveSize((await lstat('.output/blog-release.tar.gz')).size);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await packageTransport();
