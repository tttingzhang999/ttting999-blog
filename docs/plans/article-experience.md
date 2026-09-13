# Article browsing and reading

Approved scope: index, reader, return to homepage writing scene.

Design: ink #181A1B, paper #F3F0E8, amber #F2B55A, muted #B6B4AD, grey #343638. DM Sans/Noto Sans TC. Left aligned oversized Writing title; a restrained gold spine joins chronological metadata rows. No cards or automatic text motion. Reading uses a narrow measure with quiet sticky TOC and gold progress.

Index: all published articles (including life writing), newest first; metadata-only query. Search title/description/tags, categories derived from content, year selection. URL stores filters; app state remembers the archive URL and scroll for return from reader. No pagination needed for current small collection.

Reader: preserve renderer, metadata SEO, related articles and sharing. Reduce header clutter, plain description, code/table overflow containment, mobile TOC. Homepage links target localized #writing, where current runtime renders the static scene.

Validation: RED filter tests and browser journey; GREEN implementation; production build, unit coverage, browser tests, desktop/mobile screenshots. Preserve unrelated pending homepage work.

Critique: avoid an ornamental newspaper grid. Chronological dates and the gold spine communicate the real archive; descriptions remain visible without hover. Motion only on explicit focus/hover, no entrance opacity hiding text.

## Verification

- Production build passes.
- Five unit tests pass; filter.ts line/branch/function coverage 100% (not whole-app coverage).
- Twelve-test browser regression passes, plus four archive/reader tests including the two added return-scroll/progress and no-JavaScript scenarios. Fourteen distinct browser cases covered in total.
- Desktop archive/reader/code and 390px reader screenshots inspected.
- Typecheck retains pre-existing diagnostics outside this change; reader query operator and author metadata types corrected.
- No commit or deployment performed.
