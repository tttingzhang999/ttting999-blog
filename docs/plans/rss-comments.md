# RSS and article comments

Approved scope: static RSS plus giscus using the public `tttingzhang999/ttting999-blog` repository. Deliver a PR; do not merge or deploy in this task.

## Plan

1. Generate `/feed.xml` after the verified published-route inventory, using only manifest-listed Markdown. Include the latest 30 summaries, original publication dates and canonical URL GUIDs; deterministic ordering and XML escaping. Keep the feed outside `/api/*`.
2. Advertise RSS in document metadata and the writing footer.
3. Use the official giscus web component, loaded only on reader request (or the OAuth return). Store discussions in the existing Announcements category with strict matching on the canonical article path. React to the site's color mode. Show a bounded failure state and a GitHub fallback without blocking article content.
4. Restrict the production giscus embedding origin. No new Cloudflare resources, secrets, paid services or Actions jobs.

## Acceptance and verification

- Test RSS before implementation: publication inventory, newest-first maximum 30, unchanged GUID on edits, original publication dates, XML control characters and escaping, empty inventory and malformed metadata.
- Exercise generated static assets in Playwright: parse RSS as XML, verify links and autodiscovery, no giscus request before opt-in, correct article mapping, theme changes, navigation cleanup, OAuth return, empty discussion and service/timeout failure.
- Run existing unit, type, static generation, SEO/blog build and static routing/quota-isolation checks. Review the final diff and record external setup and validation in the PR.

## Operational setup

GitHub Discussions enabled during implementation. Ting installed the giscus App for this repo. The Announcements category is reserved for article comments; moderation happens in GitHub. RSS and discussion identities use canonical paths; renaming a path needs explicit feed/discussion migration. This task does not claim identity survives path renames.
