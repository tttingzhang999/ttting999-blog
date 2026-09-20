# SEO indexing corrections

## Scope
Keep each article at one `/blog/<slug>` URL, independently of its language. Keep translated home/resume/projects. Preserve existing visual navigation and scroll behavior.

## Sequence
1. Reproduce metadata bugs with browser tests; test article metadata independently.
2. Unify production URL fallback and use the current homepage locale path for OG.
3. Add explicit permanent redirects for published legacy en/ja blog paths only, shared by Vercel and local Nitro.
4. Add crawlable language links on translated pages; preserve blog UI-language preference without claiming translations.
5. Add per-article language and optional updatedAt; synchronize Article schema, html lang and modification metadata. Let sitemap discover article:modified_time during generation.
6. Improve audited summaries/titles and heading hierarchy, leaving fenced code untouched. Record today's date only for articles edited today.
7. Run unit coverage, typecheck, focused browser regressions, static generation, and validate all generated sitemap URLs and metadata. Review the final diff.

## Acceptance
No localhost in SEO metadata; locale-specific OG URLs; one canonical per page; no translated blog alternates; published legacy paths redirect permanently while unknown/draft paths remain 404; article language independent of UI; meaningful descriptions and one H1 per article; truthful lastmod. No deployment-time dates.

## Deployment
Generate and inspect locally first. Production requires a deployment of this change; Google indexing remains asynchronous and must be checked separately in Search Console.

## Implementation notes
- Shared redirect map uses a Nitro middleware, not route rules: i18n expanded already-localized redirect rules into spurious doubly-prefixed static pages during the first build. The final build has no such artifacts.
- Six edited articles explicitly record 2026-09-20; unchanged articles do not acquire invented modification dates.
- Language links preserve the existing JS scroll transition; browser tests await hydration before asserting those JS behaviors.
- Local Node 26 did not match the installed SQLite native binary. Validation uses the bundled Node 24 runtime and a rebuilt local SQLite dependency; package versions are unchanged.

## Verification results
- 7 unit tests passed; the new article schema utility has 100% line/branch/function coverage.
- 17 focused browser tests passed across SEO, language continuity, header navigation, article/archive experience and anchor scrolling.
- Production static generation passed. `test:seo-build` verified 20 pages, 10 articles and 22 permanent redirects; six edited articles have matching lastmod and dateModified.
- Desktop and 390px mobile language menus visually checked; no mobile horizontal overflow.
- Baseline typecheck from the pre-change commit reports 9 errors. The modified branch fixes the head/config errors and retains 7 pre-existing errors in ImageCarousel, LanguageSwitcher, CertItem, ExperienceTimeline and useReadingTime; no new type errors observed.
- Self-review: only the approved SEO/navigation/content metadata scope changed; fenced article code is preserved, draft/missing routes do not redirect, JSON-LD is escaped, and no credentials were added.
