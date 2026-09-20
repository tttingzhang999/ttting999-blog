# SEO maintenance

## Article metadata

Every article uses one `/blog/<slug>` URL. Its `language` describes the body, not the navigation preference. Omit it for `zh-TW`, or set a language tag such as `en`, `ja`, or `en-GB`. There are no translated article paths or article hreflang alternates.

```yaml
language: zh-TW
date: '2026-01-26'
updatedAt: '2026-09-20'
```

`date` is the original publication date. Add/change `updatedAt` only for a real editorial update; do not refresh it on deployment. It feeds Article `dateModified`, `article:modified_time`, and the generated sitemap `lastmod`. If the actual modification date is unknown, leave it absent. Keep summaries nonempty and aligned with the body's language. Use H2/H3 for body headings; the reader supplies H1. Keep fenced code unchanged when editing heading levels.

If publishing from an external source such as Obsidian, preserve these frontmatter fields and the edited summaries/headings there to avoid overwriting them on the next sync.

## URLs and deployment

`NUXT_PUBLIC_SITE_URL` defaults to `https://info.tttingzhang999.com` for runtime metadata, sitemap and i18n. Set that same value in Vercel Production. A static build embeds metadata: changing an environment variable requires a new build/deployment.

`vercel.json` lists only known published legacy en/ja blog URLs. Vercel redirects them permanently; `server/middleware/legacy-blog.ts` mirrors that exact list for dev/SSR. Do not add blanket redirects for missing/draft articles, and do not add translated article routes. The existing homepage/resume/projects translations retain their own canonical and hreflang.

## Verification

Use Node 24 (the local SQLite binary must match the Node major version):

```sh
npm test
npm run typecheck
npx playwright test tests/seo.spec.ts tests/language-continuity.spec.ts tests/site-header.spec.ts tests/blog-experience.spec.ts tests/anchor-scrolling.spec.ts
npm run generate
npm run test:seo-build
```

Run Nuxt dev/tests, typecheck, and generation sequentially: they share `.nuxt` and Content's generated database. The SEO build check inspects every sitemap page, canonical, OG URL, article language/schema, modification date and legacy redirect destination. Unit coverage measures the tested utilities, not the whole application.

After deployment, recheck the public HTML and permanent redirects. Use Search Console URL Inspection to track actual indexing; passing a live test or requesting indexing does not establish that Google has indexed the URL.
