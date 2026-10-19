import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderRss, buildFeed } from '../scripts/build-feed.mjs';

const site = 'https://info.tttingzhang999.com';
const article = (fields = {}) => ({ route: '/blog/hello', title: 'Hello', description: 'Summary', date: '2026-01-01', ...fields });

test('RSS is newest first, capped at 30, deterministic and does not mutate inputs', () => {
  const articles = Array.from({ length: 35 }, (_, i) => article({ route: `/blog/post-${i}`, date: `2026-02-${String(i % 28 + 1).padStart(2, '0')}` }));
  const before = structuredClone(articles);
  const xml = renderRss(articles, site);
  assert.equal((xml.match(/<item>/g) || []).length, 30);
  assert.ok(xml.indexOf('/blog/post-27') < xml.indexOf('/blog/post-26'));
  assert.equal(xml, renderRss(articles.toReversed(), site));
  assert.deepEqual(articles, before);
});

test('editing title or modification date preserves GUID and original publication date', () => {
  const first = renderRss([article()], site);
  const edited = renderRss([article({ title: 'Updated title', updatedAt: '2026-10-19' })], site);
  assert.equal(first.match(/<guid[^>]*>.*?<\/guid>/)[0], edited.match(/<guid[^>]*>.*?<\/guid>/)[0]);
  assert.ok(edited.includes('<pubDate>Thu, 01 Jan 2026 00:00:00 GMT</pubDate>'));
  assert.ok(edited.includes('<lastBuildDate>Mon, 19 Oct 2026 00:00:00 GMT</lastBuildDate>'));
});

test('XML escapes titles, URLs and HTML summaries; removes illegal XML characters', () => {
  const xml = renderRss([article({ route: '/blog/中文', title: 'A & <B> "C"\u0000', description: '<script>alert("x")</script> & test\u0001' })], site);
  assert.ok(xml.includes('A &amp; &lt;B&gt; &quot;C&quot;'));
  assert.ok(xml.includes('/blog/%E4%B8%AD%E6%96%87'));
  assert.ok(xml.includes('&amp;lt;script&amp;gt;'));
  assert.doesNotMatch(xml, /[\u0000\u0001]|<script>/);
});

test('empty inventory is a valid channel without fabricated dates', () => {
  const xml = renderRss([], site);
  assert.ok(xml.includes('<rss version="2.0"'));
  assert.ok(xml.includes(`${site}/feed.xml`));
  assert.doesNotMatch(xml, /<item>|Invalid Date|lastBuildDate/);
});

test('invalid article metadata or origin stops the build', () => {
  for (const fields of [{ title: '' }, { description: null }, { date: 'invalid' }, { date: '2026-02-30' }, { updatedAt: '2026-13-01' }, { route: '//evil.example/post' }]) {
    assert.throws(() => renderRss([article(fields)], site));
  }
  assert.throws(() => renderRss([article()], 'javascript:alert(1)'));
});

test('build reads only verified published files and rejects inventory mismatch or unsafe sources', async () => {
  const root = await mkdtemp(join(tmpdir(), 'blog-rss-'));
  try {
    await mkdir(join(root, 'content/blog'), { recursive: true });
    await mkdir(join(root, '.blog-sync'), { recursive: true });
    await mkdir(join(root, '.output/public'), { recursive: true });
    const manifest = { articles: [{ source: 'hello.md', route: '/blog/hello' }] };
    await writeFile(join(root, '.blog-sync/manifest.json'), JSON.stringify(manifest));
    await writeFile(join(root, '.output/published-routes.json'), JSON.stringify(['/blog/hello']));
    await writeFile(join(root, 'content/blog/hello.md'), '---\r\ntitle: Hello\r\ndescription: Summary\r\ndate: "2026-01-01"\r\n---\r\nBody');
    await writeFile(join(root, 'content/blog/draft.md'), 'PRIVATE DRAFT');
    await buildFeed(root, site);
    const xml = await readFile(join(root, '.output/public/feed.xml'), 'utf8');
    assert.ok(xml.includes('<title>Hello</title>'));
    assert.doesNotMatch(xml, /PRIVATE DRAFT|draft/);
    await writeFile(join(root, '.output/published-routes.json'), '[]');
    await assert.rejects(() => buildFeed(root, site), /inventory/i);
    await writeFile(join(root, '.output/published-routes.json'), JSON.stringify(['/blog/hello']));
    await writeFile(join(root, 'content/blog/hello.md'), 'no frontmatter');
    await assert.rejects(() => buildFeed(root, site), /frontmatter/i);
    await writeFile(join(root, '.blog-sync/manifest.json'), JSON.stringify({ articles: [{ source: '../outside.md', route: '/blog/outside' }] }));
    await assert.rejects(() => buildFeed(root, site));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
