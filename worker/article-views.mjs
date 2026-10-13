const fail = (code) => { throw Object.assign(new Error(code), { code }); };

// Inputs are canonical publisher paths. Transport decoding belongs to the API,
// never this layer: accepting a second decoding would alias distinct requests.
export function validArticleSlug(slug) {
  return typeof slug === 'string' && slug.isWellFormed() &&
    new TextEncoder().encode(slug).length <= 2048 &&
    slug.startsWith('/blog/') && !/[%?#\\\u0000-\u0020\u007f]/u.test(slug) &&
    slug.slice(6).split('/').every((part) => part && part !== '.' && part !== '..');
}

export async function articleViews(db, publishedRoutes, slug, increment = false) {
  if (!validArticleSlug(slug)) fail('INVALID_SLUG');
  if (!publishedRoutes.includes(slug)) fail('UNKNOWN_ARTICLE');
  const sql = increment
    ? 'INSERT INTO article_views (slug, views) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET views = views + 1 RETURNING views'
    : 'SELECT views FROM article_views WHERE slug = ?';
  const row = await db.prepare(sql).bind(slug).first();
  const views = row === null && !increment ? 0 : row?.views;
  if (!Number.isSafeInteger(views) || views < 0) fail('INVALID_COUNT');
  return { slug, views };
}
