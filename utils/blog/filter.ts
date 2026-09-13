type ArticleMetadata = {
  title: string;
  description: string;
  date: string;
  category: string;
  tags: readonly string[];
};
export function filterArticles<T extends ArticleMetadata>(
  articles: readonly T[],
  filters: { q: string; category: string; year: string },
): T[] {
  const query = filters.q.trim().toLocaleLowerCase();
  return articles.filter((article) =>
    (filters.category === 'all' || article.category === filters.category) &&
    (filters.year === 'all' || article.date.slice(0, 4) === filters.year) &&
    (!query || [article.title, article.description, ...article.tags].join(' ').toLocaleLowerCase().includes(query)),
  );
}
