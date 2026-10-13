import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadArticleViews } from '../utils/article-views.ts';
const slug = '/blog/中文/article';
const valid = { success: true, data: { slug, views: 42 }, error: null };
const storage = () => ({ getItem: () => '1', setItem: () => {} });

test('exact response validation hides malformed, mismatched, negative and unsafe counts', async t => {
  for (const payload of [null, [], {}, { ...valid, extra: true }, { ...valid, success: false }, { ...valid, error: {} },
    { ...valid, data: null }, { ...valid, data: [] }, { ...valid, data: { ...valid.data, extra: true } },
    { ...valid, data: { slug: '/blog/other', views: 42 } }, ...[-1, 1.1, '42', Number.MAX_SAFE_INTEGER + 1].map(views => ({ ...valid, data: { slug, views } }))]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json(payload));
    assert.equal(await loadArticleViews(slug, storage).result, null);
    t.mock.restoreAll();
  }
  t.mock.method(globalThis, 'fetch', async () => Response.json(valid));
  assert.equal(await loadArticleViews(slug, storage).result, 42);
});

test('mark precedes POST and a failed storage write degrades to GET', async t => {
  let marked = false;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(marked, true);
    assert.equal(url, '/api/views');
    assert.equal(options.method, 'POST');
    assert.equal(options.body, JSON.stringify({ slug }));
    return Response.json(valid);
  });
  assert.equal(await loadArticleViews(slug, () => ({ getItem: () => null, setItem: () => { marked = true; } })).result, 42);
  t.mock.restoreAll();
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(new URL(url, 'https://example.test').searchParams.get('slug'), slug);
    assert.equal(options.method, 'GET');
    return Response.json(valid);
  });
  assert.equal(await loadArticleViews(slug, () => ({ getItem: () => null, setItem: () => { throw new Error('full'); } })).result, 42);
  assert.equal(await loadArticleViews(slug, () => { throw new Error('denied'); }).result, 42);
});

test('HTTP, non-JSON, transport and cancellation failures return no fabricated zero', async t => {
  for (const response of [new Response('quota', { status: 429 }), new Response('not json')]) {
    t.mock.method(globalThis, 'fetch', async () => response);
    assert.equal(await loadArticleViews(slug, storage).result, null);
    t.mock.restoreAll();
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline'); });
  assert.equal(await loadArticleViews(slug, storage).result, null);
  t.mock.restoreAll();
  let finish;
  let signal;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    signal = options.signal;
    return new Promise(resolve => { finish = resolve; });
  });
  const request = loadArticleViews(slug, storage);
  request.cancel();
  assert.equal(signal.aborted, true);
  finish(Response.json(valid));
  assert.equal(await request.result, null);
});

test('three second timeout cancels exactly one request and ignores a late successful response', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let finish;
  let signal;
  const fetch = t.mock.method(globalThis, 'fetch', async (_url, options) => {
    signal = options.signal;
    return new Promise(resolve => { finish = resolve; });
  });
  const request = loadArticleViews(slug, storage);
  t.mock.timers.tick(2999);
  assert.equal(signal.aborted, false);
  t.mock.timers.tick(1);
  assert.equal(signal.aborted, true);
  finish(Response.json(valid));
  assert.equal(await request.result, null);
  assert.equal(fetch.mock.callCount(), 1);
});
