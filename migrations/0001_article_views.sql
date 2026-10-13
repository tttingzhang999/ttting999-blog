CREATE TABLE article_views (
  slug TEXT PRIMARY KEY NOT NULL,
  views INTEGER NOT NULL CHECK (typeof(views) = 'integer' AND views >= 0)
);
