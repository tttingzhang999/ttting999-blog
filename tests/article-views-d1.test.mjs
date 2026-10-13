import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { getPlatformProxy } from 'wrangler';
import { articleViews } from '../worker/article-views.mjs';

// Real local workerd D1, not a mock. No Cloudflare credentials or remote access.
test('D1 migrations, concurrent atomic updates and runtime restart preserve counts', { timeout: 60000 }, async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'article-views-d1-'));
  const configPath = path.resolve('tests/fixtures/views-runtime/wrangler.json');
  const migrate = () => execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'migrations', 'apply', 'DB', '--local', '--config', configPath, '--persist-to', directory], { env: { ...process.env, WRANGLER_SEND_METRICS: 'false' }, stdio: 'pipe' });
  const start = () => getPlatformProxy({ configPath, persist: { path: path.join(directory, 'v3') }, remoteBindings: false });
  let runtime;
  const slug = '/blog/技術/d1';
  const routes = [slug, '/blog/new'];
  try {
    migrate();
    runtime = await start();
    const db = runtime.env.DB;
    assert.deepEqual(await articleViews(db, routes, slug), { slug, views: 0 });
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM article_views').first()).n, 0);
    const results = await Promise.all(Array.from({ length: 32 }, () => articleViews(db, routes, slug, true)));
    assert.deepEqual(results.map((result) => result.views).toSorted((a, b) => a - b), Array.from({ length: 32 }, (_, i) => i + 1));
    await assert.rejects(articleViews(db, routes, '/blog/unknown', true), { code: 'UNKNOWN_ARTICLE' });
    await assert.rejects(db.prepare('INSERT INTO article_views VALUES (?, ?)').bind('/blog/invalid', -1).run());
    await assert.rejects(db.prepare('INSERT INTO article_views VALUES (?, ?)').bind('/blog/invalid', 1.5).run());
    await runtime.dispose();
    runtime = null;
    migrate(); // Already-applied migration must not reset data.
    runtime = await start();
    assert.deepEqual(await articleViews(runtime.env.DB, routes, slug), { slug, views: 32 });
    assert.deepEqual(await articleViews(runtime.env.DB, routes, '/blog/new'), { slug: '/blog/new', views: 0 });
    assert.equal((await runtime.env.DB.prepare('SELECT COUNT(*) AS n FROM article_views').first()).n, 1);
    assert.deepEqual(await articleViews(runtime.env.DB, routes, slug, true), { slug, views: 33 });
  } finally {
    await runtime?.dispose();
    await rm(directory, { recursive: true, force: true });
  }
});
