import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, glob, readFile, rm } from 'node:fs/promises';
import test from 'node:test';
import { staticPolicy } from '../scripts/static-policy.mjs';

test('Vercel generation produces the shared static output and verified article allowlist', async () => {
  // GitHub's provider marker takes precedence over VERCEL in std-env.
  const { GITHUB_ACTIONS, NITRO_PRESET, SERVER_PRESET, ...inheritedEnv } = process.env;
  const env = { ...inheritedEnv, VERCEL: '1' };
  const provider = spawnSync(process.execPath, ['--input-type=module', '-e',
    "import { provider } from 'std-env'; process.stdout.write(provider)"], { env, encoding: 'utf8' });
  assert.equal(provider.stdout, 'vercel');

  // A previous local build must not hide a provider-specific output mismatch.
  await rm('.output', { recursive: true, force: true });
  await rm('.vercel/output', { recursive: true, force: true });
  const build = spawnSync('npm', ['run', 'generate'], {
    env, encoding: 'utf8', timeout: 300_000, maxBuffer: 10 * 1024 * 1024,
  });
  assert.equal(build.status, 0, `${build.error ?? ''}\n${build.stdout}\n${build.stderr}`);

  const policy = JSON.parse(await readFile('vercel.json', 'utf8'));
  assert.equal(policy.outputDirectory, '.output/public');
  const expected = staticPolicy(policy);
  assert.equal(await readFile('.output/public/_headers', 'utf8'), expected.headers);
  assert.equal(await readFile('.output/public/_redirects', 'utf8'), expected.redirects);
  const manifest = JSON.parse(await readFile('.blog-sync/manifest.json', 'utf8'));
  const routes = JSON.parse(await readFile('.output/published-routes.json', 'utf8'));
  assert.ok(routes.length > 0);
  assert.deepEqual(routes, manifest.articles.map(({ route }) => route).toSorted());
  for (const route of routes) await access(`.output/public${route}/index.html`);
  await access('.output/public/404.html');
  let imageCount = 0;
  for await (const file of glob('.output/public/**/*.html')) {
    const html = await readFile(file, 'utf8');
    assert.doesNotMatch(html, /\/_vercel\/image/, `${file} depends on Vercel image optimization`);
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      const src = tag.match(/\bsrc="([^"]+)"/)?.[1].replaceAll('&amp;', '&');
      assert.ok(src?.startsWith('/') && !src.startsWith('//'), `Non-local image in ${file}: ${src}`);
      await access(`.output/public${decodeURIComponent(src.split('?')[0])}`);
      imageCount += 1;
    }
  }
  assert.ok(imageCount > 0, 'Generated HTML must include static images');
});
