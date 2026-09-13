# Unified navigation and appearance

Use one persistent header in app.vue, outside route layouts: Ting Zhang signature, Home / Resume / Projects / Writing / Contact destinations, language selector and theme control. Home scene shortcuts remain contextual within the page rather than changing the global information architecture. Contact targets home #practice. Desktop and mobile share destinations, labels and active state.

Preserve the existing ink/amber/DM Sans identity. Light mode uses paper with dark ink and deeper amber for readable contrast. Theme changes use a restrained snapshot dissolve with reduced-motion fallback; no cursor effects or page geometry changes.

Language changes preserve route, query, hash and reading position. Snapshot transition covers locale route replacement and fullpage initialization; do not animate unrelated anchor navigation or hide live content. Blog content remains Chinese while navigation preference changes.

Validation: new browser regressions for shared header across routes, theme persistence/light contrast, locale switching and mobile controls. Run existing anchor/home continuity checks, production build, inspect screenshots and review changes.

## Completed verification

- One app-level header stays mounted across home, resume, projects, archive and reader; scene shortcuts now live in the homepage footer.
- Light/dark colors include editorial prose, forms, homepage scan and canvas filament. Old snapshot dissolves over the fully prepared view in 320 ms; reduced motion updates directly.
- Locale navigation retains query/hash/reading position. fullPage teardown preserves the new URL; initial anchor positioning does not replay the scan. Runtime completion (including fallback) releases the shared transition.
- Production build passed. All 34 browser regressions and 5 unit tests passed. Inspected desktop dark/light and Japanese mobile menu screenshots; no browser page errors in visual checks.
- Typecheck still reports the same 9 pre-existing diagnostics (app head types, legacy components, reading-time Content type, and i18n config); no new diagnostics from this task.
