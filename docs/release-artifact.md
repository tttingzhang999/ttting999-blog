# Release artifact v1

Run `npm run release:build` with Node 24 from a clean committed checkout. The
command exports exactly HEAD into ignored `.output/release-build`, installs the
lockfile with npm ci, regenerates the complete static site, and bundles the
Worker using Wrangler `deploy --dry-run`. No credentials or cloud deployment
are used. Local dotenv, caches and pre-existing build output are not inputs.
The temporary Wrangler config contains only local bundling metadata.

Output `.output/release/` contains:

- `static/`: complete generated website, policy files and `release.json`.
- `worker/index.js`: bundled ES module with the published allowlist embedded.
- `migrations/`: versioned SQL files.
- `published-routes.json`: canonical allowed article routes.
- `release-manifest.json`: `schemaVersion: 1`, `sourceSha` (40-character Git SHA),
  `contentManifestDigest` (SHA-256 of exact committed `.blog-sync/manifest.json`
  bytes), `runtime`, and `files` (relative path → SHA-256 of file bytes).

`runtime` contains `compatibilityDate: "2026-10-13"`, `compatibilityFlags: []`,
and `bindings: {DB: "d1", VIEW_LIMITER: "ratelimit", SITE_ORIGIN: "string"}`.
Infra owns actual resource IDs, binding values, routing and deployment commands.
`static/release.json` exposes only `sourceSha` and `contentManifestDigest`, with
`Cache-Control: no-store`. The manifest excludes its own hash to avoid circularity.
No generated file is written into tracked source directories.

Infra must validate every file hash, reject missing/extra files, symlinks and
unsafe paths, and compare sourceSha with the independently verified successful
blog CI run. A digest manifest detects corruption; it is not a signature or
proof of trusted provenance by itself. Never execute an artifact before source
and producing-run verification. Archive extraction must reject traversal and
symlinks before writing files. Only this fixed bundle is transportable; source,
Vault, draft files, credentials, Terraform state and node_modules are excluded.

CI transports one artifact from main, with one-day retention and a 100 MiB
compressed ceiling. Transport expires; infra keeps its deployment receipt and
Cloudflare version identifiers for rollback. Release creation does not report
Production deployment success. After a PR merges to main, successful main-push
CI notifies infra, which independently verifies the artifact and deploys directly
to the single Production environment. There is no Preview or manual promotion.
Success requires live verification and an authenticated Production receipt.
Rollback selects a verified retained Production version without upload or
migrations. Workflow activation and billing enforcement remain separate gates.
