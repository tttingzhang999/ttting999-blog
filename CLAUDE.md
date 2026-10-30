<!-- Generated from Obsidian .claude/project-configs/ttting999-blog/CLAUDE.md by install.sh. Edit the Vault original. -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ting's personal portfolio and blog: a **Nuxt 4 + Nuxt Content 3** site, generated statically and served from **Cloudflare Workers** at https://info.tttingzhang999.com/. Node 24 (`.nvmrc`), install with `npm ci`.

`README.md` (Traditional Chinese) is the operational reference for the blog sync, the Cloudflare static routing and the release handoff. Read it before changing any of those; this file only summarises them.

The site was migrated from Hugo and was once hosted on Vercel. Neither is in use any more, but `vercel.json` is still read (see Deployment).

## Commands

```bash
npm ci                       # Node 24; runs `nuxt prepare` on postinstall
npm run dev                  # http://localhost:3000; do not start it unless asked
npm run typecheck            # nuxt typecheck (typeCheck is off in nuxt.config for build speed)
npm run generate             # static SSG to .output/public + _headers/_redirects, published-routes.json, feed.xml

# Unit tests: CI no longer runs these, so run them locally before every PR
npm test                     # node --test tests/*.test.mjs
node --test tests/blog-sync.test.mjs          # a single unit test file
npm run test:views           # Worker + D1 view counter in a local wrangler runtime, 80% coverage gate
npm run test:release         # release artifact, 80% coverage gate
npm run test:handoff         # CI → infra handoff, 80% coverage gate

# Build and browser checks (CI runs these)
npm run test:generate-provider   # full generate under VERCEL=1; checks policy files and static images
npm run test:seo-build && npm run test:blog-build   # need a prior `npm run generate`
npm run test:static              # Playwright against .output/public in a local Workers runtime; needs `npm run generate` and local Chrome
npx playwright test tests/blog-nested.spec.ts      # a single Playwright spec (playwright.config.ts)

npm run release:build        # clean committed checkout only; builds .output/release/ for infra, never deploys
```

`tests/*.test.mjs` are `node --test` unit tests and `tests/*.spec.ts` are Playwright specs. `playwright.static.config.ts` serves the generated site; `playwright.config.ts` runs against the app.

## Deployment

There is only Production; there is no Preview environment.

1. When a PR is merged into `main`, `.github/workflows/ci.yml` runs on the push. It runs typecheck, `release:build`, the SEO and blog build checks and `test:static`. It then uploads exactly one `blog-release` artifact, but only when the repo variable `INFRA_HANDOFF_ENABLED` is `true`.
2. `.github/workflows/notify-infra.yml` runs on `workflow_run`. It checks the producing run and its artifact through the API. It then sends a `blog-release` `repository_dispatch` to `tttingzhang999/ttting999-cloudflare-infra`. This job has no checkout and runs no application code; keep it that way.
3. The infra repo verifies the source and the artifact on its own, then deploys with Wrangler. Cloudflare and R2 credentials, Terraform, D1 resources and bindings all live in infra, never in this repo.

A release counts as live only when infra records a successful Production deployment and the `sourceSha` in the domain's `/release.json` matches. The artifact contract is in `docs/release-artifact.md`.

`vercel.json` is still the source of the security headers and the 22 permanent redirects:

- `npm run generate` converts it into `.output/public/_headers` and `_redirects`, through `scripts/static-policy.mjs`.
- `server/middleware/legacy-blog.ts` applies the same redirects in dev.
- Do not hand-maintain the generated files. If the converter cannot express a Vercel pattern, the build fails on purpose.

Two settings are pinned so the output never depends on the host:

- `generate` forces the Nitro `static` preset, so the output is always `.output/public`.
- Nuxt Image is forced to `ipx`, so generation emits real image files instead of `/_vercel/image` URLs.

Production uses `auto-trailing-slash`: article directories redirect `/blog/slug` → `/blog/slug/` with a 307. An unknown article must return the generated `404.html` with a real 404; never enable SPA fallback.

## Architecture

- `app.vue` sits in the repository root, and there is no `app/` directory. Nuxt 4 uses an `app/` directory as `srcDir`, so creating one would move the source root. Keep everything at the repository root.
- `pages/` holds:
  - `index.vue`: the home scenes, built with fullpage.js and GSAP
  - `resume.vue`
  - `projects/index.vue`
  - `blog/index.vue`
  - `blog/[...slug].vue`
- `layouts/` holds `default`, `home` and `editorial`. `app.vue` renders `SiteHeader`. `components/layout/` holds TopBar, Sidebar, Footer and HomeControls.
- Resume and projects data live in `data/`, one file per locale (`resume-{locale}.ts`, `projects-{locale}.ts`). Pages read them through `useResumeData` and `useProjectsData`. Projects are **not** a Content collection; the old collection is commented out in `content.config.ts`.
- `content.config.ts` defines a single collection, `blog` (`type: 'page'`, `blog/**/*.md`), validated with Zod:
  - Required fields: title, description, date (string), tags, category.
  - Optional fields: `updatedAt`, `language` (default `zh-TW`), `author` (default `Ting Zhang`), `image`.
- `nuxt.config.ts` sets two Content options:
  - It takes the slugify options from `utils/blog/path.ts`, which keep CJK characters in URLs.
  - It adds Python highlighting through a remark plugin in `utils/markdown/`.
- `worker/` is the Cloudflare Worker that counts article views:
  - `views-api.mjs` is the HTTP layer.
  - `article-views.mjs` is the D1 storage.
  - Allowed keys come from the generated `.output/published-routes.json`.
  - For a schema change, add a new file in `migrations/`. Never edit `0001`, and never wipe the database. See `docs/article-views.md`.
- `scripts/build-feed.mjs` generates the RSS feed. `giscus.json` and `ArticleComments.vue` provide comments. Both are documented in `docs/rss-comments.md`.

### Internationalization

- Locales are `zh-TW` (default), `en` and `ja`, with strategy `prefix_except_default`. Catalogs live in `i18n/locales/`. `tests/i18n-catalogs.test.mjs` enforces that every locale has the same keys.
- Every **non-blog** internal link must go through `localePath()`. A hardcoded `/resume` sends a user on `/en` back to zh-TW.
- Blog routes are **not** locale-prefixed; each article has one URL:
  - On `/blog`, the UI language comes from the `editorial-language` cookie (see `composables/useSiteLanguage.ts`).
  - On those routes `app.vue` suppresses the hreflang alternates.
  - Old `/en/blog/...` and `/ja/blog/...` URLs exist only as redirects.

### Nuxt Content v3 API

The project uses Content **v3**. The v2 API was removed. If you call it anyway, lists come back empty and links render as `/blog/undefined`, without an error.

| v2 (removed)                    | v3 (use)                                                                   |
| ------------------------------- | -------------------------------------------------------------------------- |
| `queryContent('blog')`          | `queryCollection('blog')`                                                  |
| `.where({ f: v })`              | `.where('f', '=', v)` (`!=`, `>`, `LIKE`, `IN`, …; chain with `.andWhere`) |
| `.sort({ date: -1 })`           | `.order('date', 'DESC')`                                                   |
| `.find()` / `.findOne()`        | `.all()` / `.first()`                                                      |
| `.where({ _path })`             | `.path(path)`                                                              |
| `article._path` / `article._id` | `article.path` / `article.id`                                              |

`type: 'page'` collections get `path`, `title`, `description`, `seo`, `body` and `navigation` automatically. Restart the dev server after editing `content.config.ts`.

## Blog publishing

All article text and images originate in the Obsidian vault. To write, edit or proofread a vault article, use the globally installed `write-article` skill. To publish, use `cook-blog-publish`. Do not create project-local copies of either skill.

- The sync mirrors the vault's `03 Writing/blog/**` tree into `content/blog/**` and keeps nested relative paths. It skips `drafts/**`. When an article is moved back to drafts, deleted or renamed, the next full sync withdraws it.
- There is no `draft` frontmatter and no publication quality gate.
- Never edit `content/blog/**`, the managed images or `.blog-sync/manifest.json` by hand. The sync reports a manual edit as a conflict. To recover, copy the changes you want to keep back into the vault; never fix the manifest hash.
- The commands run in this order:
  1. `npm run blog:plan` and `npm run blog:status` are read-only.
  2. `npm run blog:sync` writes local files only; it never commits or pushes.
  3. `npm run blog:status -- --verify` checks the live domain.
- `docs/plan-cross-platform-publisher.md` is historical; `tools/publisher` does not exist.

## Conventions

- Components use PascalCase and are auto-imported. They are grouped by area: `layout/`, `home/`, `resume/`, `projects/`, `editorial/`. Pages and content files use kebab-case. Locale data files take a locale suffix.
- TypeScript runs in strict mode. Shared types live in `types/`. Type `defineProps` and `defineEmits`.
- Every component must work in both light and dark mode:
  - Colors come from the CSS variables in `assets/css/site-colors.css` (for example `--color-surface`, `--color-foreground`).
  - `tailwind.config.ts` exposes them as classes such as `bg-surface` and `text-foreground`.
  - Fonts are Inter with Noto Sans TC, Fraunces for display, and JetBrains Mono.
- The fixed TopBar is 64px tall (`h-16`). A full-height section in the default layout uses `min-h-[calc(100vh-4rem)]`, not `min-h-screen`.
- Every page sets `useSeoMeta` or `useHead` with locale-aware text. The home and resume pages also emit Schema.org `Person` data. Article SEO lives in `utils/seo/article.ts`.

## Troubleshooting

- A Nitro error after files move: run `rm -rf .nuxt .output`.
- `better-sqlite3` (used by Content) and `sharp` (used by Image) are native modules, built for Node 24. Other Node major versions may fail to build them.
- `test:static` and `test:views` use the configs in `tests/fixtures/*-runtime`. Those hold only fake IDs and local bindings, and never touch the cloud.

## Notes and docs

- Write Markdown notes and docs in Traditional Chinese unless the prompt says otherwise.
- Make them engaging, easy to read and easy to understand.
