export interface HomeArticle {
  path: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

interface ArticleSource extends HomeArticle {
  draft?: boolean;
}
export const technicalCategories = [
  "AI",
  "技術",
  "技術隨筆",
  "雲端認證",
] as const;

export function getHomeArticles(rows: readonly ArticleSource[]) {
  const all = rows
    .filter(
      (row) =>
        !row.draft &&
        technicalCategories.some((category) => category === row.category) &&
        Number.isFinite(Date.parse(row.date)),
    )
    .map(({ path, title, description, date, category }) => ({
      path,
      title,
      description,
      date,
      category,
    }))
    .sort(
      (a, b) =>
        Date.parse(b.date) - Date.parse(a.date) || a.path.localeCompare(b.path),
    );
  return { all, latest: all.slice(0, 5), timeline: [...all].reverse() };
}
