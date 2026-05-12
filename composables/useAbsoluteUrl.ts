/**
 * Resolve a path (or URL) to an absolute URL using the configured siteUrl.
 * Useful for og:image, og:url, twitter:image and structured data which
 * require fully-qualified URLs.
 */
export const useAbsoluteUrl = (path?: string): string => {
  const {
    public: { siteUrl },
  } = useRuntimeConfig();
  const base = (siteUrl as string).replace(/\/$/, "");
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};
