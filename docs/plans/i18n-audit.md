# i18n audit

Investigate raw translation keys on English projects and scan the localized home,
resume and projects routes. Check translation references and catalog parity,
server-rendered HTML, hydration, client navigation, and repeated language changes.
Blog articles and archive intentionally keep one Chinese content URL.

Add regressions before fixing confirmed failures. Keep fixes limited to translation
loading and missing catalog entries. Validate with unit tests, typecheck, static
generation and browser tests against the generated site.

Completed: catalog parity repaired; 29 unit/integration and 12 focused browser
tests pass, typecheck passes, and final static generation succeeds. See
`docs/audits/i18n.md` for evidence and the unconfirmed original rendering issue.
