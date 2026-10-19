# Wedding and AWS Diagram portfolio entries

Add Wedding and AWS Diagram to all three localized project datasets and the
legacy dataset. Reuse the existing editorial page and gallery. Display order:
Ongoing projects first, followed by the most recent period end: Moniit, AWS
Diagram, Wedding, Promptlingo, EatSwiper. Read the end of the displayed period;
Present ranks first and a single month is its own end. Fall back to the date
when no period exists. Sort a copy without mutating the source.

Wedding copy explicitly identifies this as a website built for my own wedding,
preserving our story and the experience of sharing it with guests. Apply this
personal framing to all three languages and the legacy Chinese dataset.

Wedding describes the public static recap, envelope design and local paper-plane
demo. Capture only this public portfolio flow; do not read or copy guest data.
Link to the public demo, but omit its private GitHub repository. AWS Diagram
links to its verified public repository and uses the existing network and HA
sample exports. Keep framework/code-native visuals unchanged.

First extend the portfolio regression tests and reproduce missing entries. Then
add localized copy and compressed images. Verify dataset parity, local assets,
chapter order, galleries, links, mobile layout, typecheck and static generation.
Preserve unrelated in-progress i18n audit files. No deployment is part of this
change.

Validation (2026-10-19): 30 unit/integration tests pass (99.34% measured line
coverage); typecheck passes. Twelve existing navigation/interior browser checks
pass, and all three localized new-project checks pass after adjusting the test
to scroll lazy-loaded galleries into view before checking decoded images.
Node 24, as specified in .nvmrc, is required for the installed SQLite binary.
Static generation succeeds for 88 routes; all three generated project pages
contain the expected five chapters, public links and five new WebP assets.
Desktop and mobile screenshots were visually inspected. New images total about
420 KB. Wedding screenshots come from a fresh portfolio build, since its existing
local dist directory was stale; no source changes were made in that repository.
