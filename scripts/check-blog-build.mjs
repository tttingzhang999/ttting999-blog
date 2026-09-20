import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const manifest=JSON.parse(fs.readFileSync('.blog-sync/manifest.json','utf8'));
const output='.output/public';
const sitemap=fs.readdirSync(path.join(output,'__sitemap__')).filter(p=>p.endsWith('.xml')).map(p=>fs.readFileSync(path.join(output,'__sitemap__',p),'utf8')).join('\n');
for(const article of manifest.articles) {
  const html=fs.readFileSync(path.join(output,article.route,'index.html'),'utf8');
  const url=new URL(article.route,'https://info.tttingzhang999.com').href;
  assert.ok(sitemap.includes(`<loc>${url}</loc>`),`missing from sitemap: ${article.route}`);
  const schema=JSON.parse(html.match(/<script[^>]*application\/ld\+json[^>]*>(.*?)<\/script>/s)[1]);
  assert.equal(schema.url,url,article.route);
}
for(const route of manifest.withdrawn) {
  assert.equal(fs.existsSync(path.join(output,route,'index.html')),false,`withdrawn output: ${route}`);
  assert.ok(!sitemap.includes(`<loc>${new URL(route,'https://info.tttingzhang999.com').href}</loc>`));
}
console.log(`Blog build verified: ${manifest.articles.length} routes, ${manifest.withdrawn.length} withdrawn.`);
