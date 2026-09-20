import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = '.output/public';
const origin = 'https://info.tttingzhang999.com';
const read = path => readFile(join(root, path), 'utf8');
const locations = xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const maps = await Promise.all(locations(await read('sitemap_index.xml')).map(url => read(new URL(url).pathname)));
const urls = [...new Set(maps.flatMap(locations))];
assert.ok(urls.length > 0, 'sitemap must contain published pages');
let articles = 0;
for (const url of urls) {
  const path = new URL(url).pathname;
  assert.ok(!/^\/(en|ja)\/blog/.test(path), `legacy path in sitemap: ${path}`);
  const html = await read(join(path, 'index.html'));
  const head = html.split('</head>')[0];
  assert.ok(!head.includes('localhost'), `localhost in ${path}`);
  assert.equal([...head.matchAll(/rel="canonical"/g)].length, 1, path);
  const canonical = head.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  assert.equal(new URL(canonical).href, new URL(path, origin).href, path);
  assert.ok(!/<meta[^>]*name="robots"[^>]*noindex/.test(head), path);
  const og = head.match(/<meta[^>]*property="og:url"[^>]*content="([^"]+)"/)?.[1];
  assert.equal(new URL(og).href, new URL(path, origin).href, path);
  assert.ok(/<meta name="description" content="[^"]+"/.test(head), `empty description: ${path}`);
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, path);
  if (path.startsWith('/blog/')) {
    articles++;
    assert.ok(!head.includes('hreflang='), path);
    const schema = JSON.parse(head.match(/<script[^>]*application\/ld\+json[^>]*>(.*?)<\/script>/s)[1]);
    assert.equal(schema.url, url);
    assert.equal(schema.inLanguage, html.match(/<html[^>]*lang="([^"]+)"/)[1]);
    assert.ok(schema.image.startsWith(origin + '/'), path);
    const entry = maps.flatMap(xml => [...xml.matchAll(/<url>(.*?)<\/url>/gs)].map(m => m[1])).find(entry => entry.includes(`<loc>${url}</loc>`));
    if (schema.dateModified) assert.ok(entry.includes(`<lastmod>${schema.dateModified}`), `missing lastmod: ${path}`);
    else assert.ok(!entry.includes('<lastmod>'), `invented lastmod: ${path}`);
  }
}
const deployment = JSON.parse(await readFile('vercel.json', 'utf8'));
for (const redirect of deployment.redirects) {
  assert.equal(redirect.permanent, true);
  assert.ok(urls.includes(origin + redirect.destination));
}
console.log(`SEO verified: ${urls.length} pages, ${articles} articles, ${deployment.redirects.length} permanent redirects.`);
