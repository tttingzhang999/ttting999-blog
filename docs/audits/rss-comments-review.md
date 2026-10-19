# RSS and giscus review — 2026-10-19

Scope: `codex/rss-giscus`, based on `bfc942a`. Independent read-only review of all new/changed files, the publication/path helpers and the pinned official giscus implementation.

Verdict: **APPROVE** after re-review. No remaining actionable correctness, type safety, convention, security, performance, test or scope findings.

A HIGH finding was fixed before delivery: generic failure handling removed the widget before its own listener could clear expired GitHub sessions. A new browser regression first reproduced the persisted stale-session failure; recovery now leaves the official listener alive with a bounded timeout, clears the old session and reloads anonymously. Comments are outside the reading-progress measurement.

Security boundaries checked: feed reads only verified published paths, XML/HTML escaping, no runtime feed API, fixed giscus host/repo/category, strict article mapping, exact iframe origin/source checks, canonical sharing URLs without OAuth query tokens, lazy loading, bounded failures and unmount cleanup. Public repository/category IDs are configuration, not credentials. No secrets or reader data added to the repository.

External setup: Discussions enabled; owner confirmed giscus App installation; giscus category API returned the exact repository and category IDs. Browser tests use synthetic sessions/mocked third-party frames and create no public comments. An authenticated comment submission after deployment remains a manual smoke test.

Validation results are recorded in the PR. No production deployment or PR merge is part of this delivery.
