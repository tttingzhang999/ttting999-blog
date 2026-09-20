# Obsidian publishing implementation

Approved 2026-09-20. Vault `03 Writing/blog/**` is the entire published collection;
`drafts/**` stays private. Remove draft metadata and publication quality gates.
Mirror relative Markdown paths, transform Obsidian syntax without rewriting prose,
track output/asset hashes, reconcile removals on every run, and distinguish local
sync from verified Production deployment. Agent configuration SoT stays in Vault;
run its install.sh and validate Claude/Codex links after editing skills.

## Delivery
- [x] Integration tests first: recursive sync, updates, removals, images, idempotency,
  missing sources/assets, conflicts, unsafe paths, no partial writes.
- [x] Sync CLI: status / plan / sync, deterministic manifest, deployment inspection.
- [x] Nested route, full-path links, remove draft schema/filter/type logic.
- [x] Vault metadata migration, simple writing/publishing skills and board.
- [x] Unit coverage >=80% for sync, typecheck, generate, SEO checks, route E2E.
- [ ] Review, commit/push, verify Production URLs and withdrawn article.
- [x] Run Vault configuration installer and verify both agent settings.

No new CMS, scheduler, quality cache, reverse sync, or inferred redirects.
Preserve existing repo/Vault changes and article prose. The empty Decode Ways source was moved to drafts/Leetcode Problem with user approval.

## Validation evidence

21 unit/integration tests, >90% line coverage; typecheck passes. Isolated full
static build: 14 articles (13 real sources plus a Chinese route fixture), 24 SEO
pages, 1 withdrawn route; 6 browser E2E tests pass. Real sync now matches all 13 published sources with zero remaining changes.
Production verification runs after the reviewed branch is merged.

Final local checks: 21 unit/integration tests, 6 browser tests, typecheck, static
generation, SEO checks (23 pages / 13 articles), and blog build checks
(13 published routes / 1 withdrawn route). Source updates are committed in Vault.
