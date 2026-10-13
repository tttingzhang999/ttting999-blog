import { articleRoute } from './blog/transform.mjs';
import { validArticleSlug } from '../worker/article-views.mjs';

// Validate the publisher inventory rather than inventing another slug algorithm.
export function publishedRoutes(manifest) {
  const routes = manifest.articles.map(({ source, route }) => {
    if (articleRoute(source) !== route || !validArticleSlug(route))
      throw new Error('Invalid published article route');
    return route;
  });
  if (new Set(routes).size !== routes.length)
    throw new Error('Duplicate published article route');
  return routes.toSorted();
}
