# Unified interior pages

Scope: resume, projects, existing article index/reader. Preserve localized source content, SEO, PDF/contact links, all project highlights and screenshots. No fabricated career copy or outcomes.

Reuse the approved writing shell as a shared editorial layout: ink/paper/amber, DM Sans/Noto Sans TC, common localized navigation, responsive footer. Articles retain their completed browsing and return behavior.

Resume: readable chronological experience on a gold spine, open skill rows and certification list, compact project summaries. Remove scroll-pinned deck from this route so all content is reachable with native scrolling and no JavaScript.
Projects: content-first vertical case studies; title, role, description and technologies visible; native details reveal complete highlights and image gallery on demand. No automatic screenshot slideshow or modal scrolling. Anchor index offers quick navigation.

Tests first: route layout, localized data, disclosure keyboard behavior, all content SSR, mobile overflow and cross-page navigation. Then build, existing article/home regressions, screenshot review and scoped typecheck audit.

## Review and verification

- All source career/project records retained through localized composables; SEO preserved.
- Article routes share the editorial shell and retain query/scroll restoration.
- Keyboard and no-JavaScript disclosure behavior passes; screenshots inspected at desktop and mobile sizes.
- Production build and five unit tests pass. Unit coverage covers metadata filtering and filament motion, not Vue templates.
- Existing typecheck diagnostics remain in app.vue, legacy components, useReadingTime and Nuxt config; no new diagnostics in changed pages/layout.
- Old resume deck/project reel components remain untouched for now; current routes no longer use them.
