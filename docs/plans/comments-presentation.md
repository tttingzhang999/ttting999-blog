# Comments presentation

Approved 2026-10-19: rename the section to 留言, remove the explanatory sentence and automatically load comments when readers approach the section.

Use an IntersectionObserver with a 300px vertical margin. Disconnect it on the first intersection and on unmount; keep the existing OAuth-return exception, single in-flight load, timeout, failure/retry state, theme synchronization and strict article identity. Do not fetch giscus while reading the top of a long article. No new dependencies or backend changes.

Update browser regressions first: no manual-load control or deleted copy; no third-party requests until the section approaches the viewport; automatic load once, navigation cleanup, OAuth/session recovery, failure isolation and explicit retry. Deny giscus in the existing quota-isolation browser suite to keep it independent of the external service. Verify typecheck, generated static build, unit tests and browser checks. Deliver a separate PR from the favicon change.
