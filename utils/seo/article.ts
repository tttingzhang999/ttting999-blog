interface ArticleMetadata {
  title: string;
  description: string;
  path: string;
  date: string;
  language: string;
  updatedAt?: string;
  image?: string;
  author?: string;
  tags: string[];
  category: string;
}

export function articleStructuredData(article: ArticleMetadata, siteUrl: string) {
  const url = new URL(article.path, siteUrl).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: url,
    image: new URL(article.image || '/og-image.jpg', siteUrl).href,
    inLanguage: article.language,
    datePublished: article.date,
    dateModified: article.updatedAt || undefined,
    author: {
      '@type': 'Person',
      name: article.author || 'Ting Zhang',
      alternateName: '張碩庭',
      url: new URL('/', siteUrl).href,
    },
    publisher: {
      '@type': 'Person',
      name: 'Ting Zhang',
      alternateName: '張碩庭',
      url: new URL('/', siteUrl).href,
    },
    keywords: article.tags.join(', '),
    articleSection: article.category,
  };
}
