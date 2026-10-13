import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleViews } from '../worker/views-api.mjs';
const origin = 'https://blog.example.test';
const slug = '/blog/技術/d1';
const routes = [slug, '/blog/' + 'a'.repeat(2042)];
function setup() {
  const calls = [];
  const env = { SITE_ORIGIN: origin, VIEW_LIMITER: { async limit({ key }) { calls.push(['limit', key]); return { success: true }; } }, DB: { prepare(sql) { calls.push(['sql', sql]); return { bind(value) { assert.equal(value.startsWith('/blog/'), true); return { async first() { return { views: 3 }; } }; } }; } } };
  return { calls, env };
}
function request(method = 'GET', body, suffix = '?slug=' + encodeURIComponent(slug), headers = {}) {
  const req = new Request(origin + '/api/views' + suffix, { method, headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1', ...headers }, ...(body === undefined ? {} : { body, duplex: 'half' }) });
  Object.defineProperty(req, 'cf', { value: { colo: 'TPE' } });
  return req;
}
async function check(req, status, code, env = setup().env) {
  const response = await handleViews(req, env, routes);
  assert.equal(response.status, status);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  const json = await response.json();
  if (code) assert.deepEqual(json, { success: false, data: null, error: { code } });
  return { response, json };
}
test('GET and POST exact envelopes; shared pseudonymous limiter runs before parameterized D1', async () => {
  const { env, calls } = setup();
  for (const req of [request(), request('POST', JSON.stringify({ slug }), '')]) {
    const { json } = await check(req, 200, null, env);
    assert.deepEqual(json, { success: true, data: { slug, views: 3 }, error: null });
  }
  assert.deepEqual(calls.map(([type]) => type), ['limit', 'sql', 'limit', 'sql']);
  assert.match(calls[0][1], /^[0-9a-f]{64}$/);
  assert.equal(calls[0][1], calls[2][1]);
  assert.match(calls[1][1], /WHERE slug = \?/);
  assert.match(calls[3][1], /VALUES \(\?, 1\)/);
});
test('invalid request matrix never reaches D1', async () => {
  const cases = [
    [request('DELETE'), 405, 'METHOD_NOT_ALLOWED'],
    [request('OPTIONS'), 405, 'METHOD_NOT_ALLOWED'],
    [request('GET', undefined, '/extra'), 404, 'NOT_FOUND'],
    [request('GET', undefined, ''), 400, 'INVALID_INPUT'],
    [request('GET', undefined, '?slug=%GG'), 400, 'INVALID_INPUT'],
    [request('GET', undefined, '?slug=%E0%A4'), 400, 'INVALID_INPUT'],
    [request('GET', undefined, '?slug=%252Fblog%252Fx'), 400, 'INVALID_INPUT'],
    [request('GET', undefined, '?slug=/blog/x&slug=/blog/y'), 400, 'INVALID_INPUT'],
    [request('GET', undefined, '?slug=/blog/x&extra=1'), 400, 'INVALID_INPUT'],
    [request('GET', undefined, '?slug=/blog/missing'), 404, 'UNKNOWN_ARTICLE'],
    [request('POST', '{}', '', { Origin: 'https://evil.test' }), 403, 'ORIGIN_DENIED'],
    [request('POST', '{}', '', { Origin: 'null' }), 403, 'ORIGIN_DENIED'],
    [request('POST', '{}', '', { 'Content-Type': 'text/plain' }), 415, 'UNSUPPORTED_MEDIA_TYPE'],
    [request('POST', '{', ''), 400, 'INVALID_INPUT'],
    [request('POST', 'null', ''), 400, 'INVALID_INPUT'],
    [request('POST', '[]', ''), 400, 'INVALID_INPUT'],
    [request('POST', JSON.stringify({ slug, views: 3 }), ''), 400, 'INVALID_INPUT'],
    [request('POST', JSON.stringify({ slug }), '?extra=1'), 400, 'INVALID_INPUT'],
    [request('POST', JSON.stringify({ slug: '/blog/' + '界'.repeat(681) }), ''), 400, 'INVALID_INPUT'],
    [request('POST', ' '.repeat(4097), '', { 'Content-Length': '1' }), 413, 'BODY_TOO_LARGE'],
  ];
  for (const [req, status, code] of cases) {
    const { env, calls } = setup();
    await check(req, status, code, env);
    assert.equal(calls.some(([type]) => type === 'sql'), false);
  }
});
test('stream byte boundaries, empty and broken bodies', async () => {
  const json = JSON.stringify({ slug });
  const exact = json + ' '.repeat(4096 - Buffer.byteLength(json));
  await check(request('POST', exact, ''), 200);
  const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(2048)); c.enqueue(new Uint8Array(2049)); c.close(); } });
  await check(request('POST', stream, ''), 413, 'BODY_TOO_LARGE');
  await check(request('POST', undefined, ''), 400, 'INVALID_INPUT');
  const broken = new ReadableStream({ start(c) { c.error(new Error('private stream failure')); } });
  await check(request('POST', broken, ''), 400, 'INVALID_INPUT');
  await check(request('POST', new Uint8Array([255]), ''), 400, 'INVALID_INPUT');
  await check(request('GET', undefined, '?slug=' + encodeURIComponent(routes[1])), 200);
});
test('missing bindings/metadata, limiter failure/denial and D1 failure fail closed', async () => {
  for (const missing of ['DB', 'VIEW_LIMITER', 'SITE_ORIGIN']) {
    const { env, calls } = setup(); delete env[missing];
    await check(request('POST', JSON.stringify({ slug }), ''), 503, 'UNAVAILABLE', env);
    assert.equal(calls.length, 0);
  }
  for (const req of [new Request(origin + '/api/views?slug=' + encodeURIComponent(slug)), request('GET', undefined, undefined, { 'CF-Connecting-IP': '' })]) {
    const { env, calls } = setup(); await check(req, 503, 'UNAVAILABLE', env); assert.equal(calls.length, 0);
  }
  for (const result of [false, null, 'throws']) {
    const { env, calls } = setup();
    env.VIEW_LIMITER = { async limit() { if (result === 'throws') throw new Error('private limiter detail'); return result === null ? null : { success: result }; } };
    const limited = result === false;
    const { response } = await check(request(), limited ? 429 : 503, limited ? 'RATE_LIMITED' : 'UNAVAILABLE', env);
    if (limited) assert.equal(response.headers.get('retry-after'), '60');
    assert.equal(calls.length, 0);
  }
  const { env } = setup(); env.DB = { prepare() { throw new Error('secret SQL'); } };
  await check(request(), 503, 'UNAVAILABLE', env);
});

test('Worker entry bundles a fixed publisher allowlist and never reads it from requests', async () => {
  const { registerHooks } = await import('node:module');
  const hook = registerHooks({ resolve(specifier, context, nextResolve) {
    if (specifier === '../.output/published-routes.json')
      return { url: 'data:application/json,' + encodeURIComponent(JSON.stringify(routes)), shortCircuit: true };
    return nextResolve(specifier, context);
  } });
  try {
    const { default: worker } = await import('../worker/index.mjs');
    const response = await worker.fetch(request(), setup().env);
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).data, { slug, views: 3 });
  } finally { hook.deregister(); }
});

test('unavailable diagnostics contain only a fixed code', async (t) => {
  const log = t.mock.method(console, 'warn', () => {});
  const { env } = setup();
  env.DB = { prepare() { throw new Error('private SQL and credential'); } };
  await check(request(), 503, 'UNAVAILABLE', env);
  assert.deepEqual(log.mock.calls.map(call => call.arguments), [['VIEWS_UNAVAILABLE']]);
});

test('UTF-8 body bytes without Content-Length and forged IP header remain bounded', async () => {
  const { env, calls } = setup();
  await check(request('POST', JSON.stringify({ slug: '界'.repeat(1400) }), ''), 413, 'BODY_TOO_LARGE', env);
  const forged = new Request(origin + '/api/views?slug=' + encodeURIComponent(slug), { headers: { 'CF-Connecting-IP': '192.0.2.1' } });
  await check(forged, 503, 'UNAVAILABLE', env);
  assert.equal(calls.length, 0);
});
