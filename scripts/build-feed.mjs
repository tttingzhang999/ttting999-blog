import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import YAML from 'yaml';
import { inside } from './blog/files.mjs';
import { publishedRoutes } from './published-routes.mjs';

const escapeXml = value => value
  .replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;');

function timestamp(value) {
  assert.equal(typeof value, 'string', 'RSS date must be a string');
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/, 'Invalid RSS date');
  const date = new Date(`${value}T00:00:00Z`);
  assert.equal(date.toISOString().slice(0, 10), value, 'Invalid RSS date');
  return date.toUTCString();
}

export function renderRss(articles, siteUrl) {
  const origin = new URL(siteUrl);
  assert.equal(origin.protocol, 'https:', 'RSS requires an HTTPS site URL');
  const posts = articles.map(article => {
    assert.ok(typeof article.title === 'string' && article.title.trim(), 'Missing RSS title');
    assert.equal(typeof article.description, 'string', 'Missing RSS description');
    assert.match(article.route, /^\/blog\/[^?#]+$/, 'Invalid RSS route');
    const pubDate = timestamp(article.date);
    const modified = timestamp(article.updatedAt ?? article.date);
    return { ...article, pubDate, modified, url: new URL(article.route, origin.origin).href };
  }).toSorted((a, b) => b.date.localeCompare(a.date) || a.route.localeCompare(b.route, 'en')).slice(0, 30);
  const lastBuildDate = posts.length
    ? `<lastBuildDate>${new Date(Math.max(...posts.map(post => Date.parse(post.modified)))).toUTCString()}</lastBuildDate>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Ting Zhang — Writing</title>
<link>${escapeXml(new URL('/blog', origin.origin).href)}</link>
<description>技術實作、工程筆記，以及生活裡的觀察。</description>
<language>zh-TW</language>
<atom:link href="${escapeXml(new URL('/feed.xml', origin.origin).href)}" rel="self" type="application/rss+xml"/>
${lastBuildDate}
${posts.map(post => `<item>
<title>${escapeXml(post.title)}</title>
<link>${escapeXml(post.url)}</link>
<guid isPermaLink="true">${escapeXml(post.url)}</guid>
<pubDate>${post.pubDate}</pubDate>
<description>${escapeXml(escapeXml(post.description))}</description>
</item>`).join('\n')}
</channel>
</rss>
`;
}

export async function buildFeed(root, siteUrl) {
  const manifest = JSON.parse(await readFile(resolve(root, '.blog-sync/manifest.json'), 'utf8'));
  const verified = JSON.parse(await readFile(resolve(root, '.output/published-routes.json'), 'utf8'));
  assert.deepEqual(publishedRoutes(manifest), verified, 'RSS publication inventory mismatch');
  const articles = await Promise.all(manifest.articles.map(async ({ source, route }) => {
    const raw = await readFile(inside(resolve(root, 'content/blog'), source), 'utf8');
    const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    assert.ok(frontmatter, `Missing RSS frontmatter: ${source}`);
    const metadata = YAML.parse(frontmatter[1]);
    return { ...metadata, route };
  }));
  await writeFile(resolve(root, '.output/public/feed.xml'), renderRss(articles, siteUrl));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildFeed(process.cwd(), process.env.NUXT_PUBLIC_SITE_URL || 'https://info.tttingzhang999.com');
  console.log('Static RSS generated from verified published articles.');
}
