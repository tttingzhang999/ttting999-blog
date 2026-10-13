import { articleViews, validArticleSlug } from './article-views.mjs';

function reply(status, code, data = null, headers = {}) {
  return Response.json({ success: status === 200, data, error: code ? { code } : null }, {
    status, headers: { 'Cache-Control': 'no-store', ...headers },
  });
}

async function readBody(request) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return { oversized: true };
      }
      text += decoder.decode(value, { stream: true });
    }
    return { value: JSON.parse(text + decoder.decode()) };
  } finally {
    reader.releaseLock();
  }
}

export async function handleViews(request, env, routes) {
  const url = new URL(request.url);
  if (url.pathname !== '/api/views') return reply(404, 'NOT_FOUND');
  if (!['GET', 'POST'].includes(request.method))
    return reply(405, 'METHOD_NOT_ALLOWED', null, { Allow: 'GET, POST' });
  if (!env.DB?.prepare || !env.VIEW_LIMITER?.limit || !env.SITE_ORIGIN)
    return reply(503, 'UNAVAILABLE');
  const increment = request.method === 'POST';
  if (increment && request.headers.get('Origin') !== env.SITE_ORIGIN)
    return reply(403, 'ORIGIN_DENIED');
  if (increment && request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json')
    return reply(415, 'UNSUPPORTED_MEDIA_TYPE');

  let slug;
  try {
    if (increment) {
      if (url.search) return reply(400, 'INVALID_INPUT');
      const body = await readBody(request);
      if (body?.oversized) return reply(413, 'BODY_TOO_LARGE');
      const value = body?.value;
      if (!value || Array.isArray(value) || typeof value !== 'object' ||
          Object.keys(value).length !== 1 || !Object.hasOwn(value, 'slug'))
        return reply(400, 'INVALID_INPUT');
      slug = value.slug;
    } else {
      // URLSearchParams replaces malformed UTF-8; reject it before decoding once.
      decodeURIComponent(url.search.replace(/\+/g, ' '));
      const entries = [...url.searchParams];
      if (entries.length !== 1 || entries[0][0] !== 'slug') return reply(400, 'INVALID_INPUT');
      slug = entries[0][1];
    }
  } catch {
    return reply(400, 'INVALID_INPUT');
  }
  if (!validArticleSlug(slug)) return reply(400, 'INVALID_INPUT');
  if (!routes.includes(slug)) return reply(404, 'UNKNOWN_ARTICLE');

  // Only Cloudflare-provided edge metadata is accepted; never X-Forwarded-For.
  const ip = request.headers.get('CF-Connecting-IP');
  if (!request.cf || !ip) return reply(503, 'UNAVAILABLE');
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
    const key = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const limited = await env.VIEW_LIMITER.limit({ key });
    if (limited?.success === false) return reply(429, 'RATE_LIMITED', null, { 'Retry-After': '60' });
    if (limited?.success !== true) return reply(503, 'UNAVAILABLE');
    return reply(200, null, await articleViews(env.DB, routes, slug, increment));
  } catch {
    console.warn('VIEWS_UNAVAILABLE');
    return reply(503, 'UNAVAILABLE');
  }
}
