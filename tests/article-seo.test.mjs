import assert from 'node:assert/strict';
import { test } from 'node:test';
import { articleStructuredData } from '../utils/seo/article.ts';
const article = Object.freeze({title:'Title',description:'Summary',path:'/blog/test',date:'2026-01-01',language:'en',tags:['Python'],category:'技術'});
test('article schema uses its language, canonical and absolute image without invented modification dates', () => {
  const schema = articleStructuredData(article, 'https://example.com/');
  assert.equal(schema.url, 'https://example.com/blog/test');
  assert.equal(schema.mainEntityOfPage, schema.url);
  assert.equal(schema.image, 'https://example.com/og-image.jpg');
  assert.equal(schema.inLanguage, 'en');
  assert.equal(schema.dateModified, undefined);
  assert.equal(schema.author.name, 'Ting Zhang');
  assert.equal(article.language, 'en');
});
test('explicit modification, author and absolute or relative covers are preserved', () => {
  for (const image of ['/images/cover.jpg','https://cdn.example.com/cover.jpg']) {
    const schema = articleStructuredData({...article,language:'ja',updatedAt:'2026-09-20',author:'Author',image}, 'https://example.com');
    assert.equal(schema.image, new URL(image,'https://example.com').href);
    assert.equal(schema.dateModified, '2026-09-20');
    assert.equal(schema.author.name, 'Author');
    assert.equal(schema.inLanguage, 'ja');
  }
});
