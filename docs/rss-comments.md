# RSS and comments

## RSS

Subscribe to `https://info.tttingzhang999.com/feed.xml` in an RSS reader. This is a summary feed, not an email subscription. An RSS link appears in the writing footer; every page advertises the feed in its document head.

`npm run generate` writes the feed after validating the published-route inventory. It reads only Markdown listed in `.blog-sync/manifest.json`, selects the latest 30 by original publication date and uses canonical article URLs as GUIDs. Editing a title, summary or `updatedAt` preserves the GUID and publication date. Build output is deterministic; XML text is escaped, and summaries are encoded as plain text within RSS's HTML description field.

The feed is an ordinary static asset outside `/api/*`, included automatically in the existing release artifact. It needs no Worker execution, D1 queries, subscription database or new workflow. Feed generation failures stop the build before release. Withdrawn articles disappear from subsequent feed builds, although readers may retain previously downloaded copies.

## Comments

Comments use the official `giscus` web component and GitHub Discussions in the public `tttingzhang999/ttting999-blog` repository, category **Announcements**. GitHub Discussions has been enabled; Ting installed the giscus App for this repo. The public giscus category API confirmed the repository/category IDs used by `ArticleComments.vue`.

- Reading an article makes no giscus request. Clicking **載入留言** imports the widget and connects to `giscus.app`. Readers need a GitHub account and authorize giscus to post comments; comments are public.
- The widget uses strict, explicit matching on the canonical `/blog/...` path. Query strings, navigation language, title edits and URL fragments do not change the discussion identity.
- Site light/dark changes update the widget theme. Vue unmount removes the widget, timer and parent message listener; the official widget removes its own listener.
- The giscus OAuth callback automatically loads the widget to consume/remove its session query parameter. Expired sessions are cleared by the official widget and reload with a bounded recovery timeout. Sharing links always use the canonical article URL, never the OAuth session or tracking query.
- A 15-second timeout or service error displays a retry button and a GitHub discussion-category fallback. No third-party error details are rendered. A missing discussion is normal: giscus creates it on the first comment or reaction. Article content and D1 view counts remain independent of comments.

Moderate comments on GitHub: hide/delete inappropriate comments, lock discussions or block abusive accounts as needed. `giscus.json` allows embedding on the production origin only; the restriction takes effect from the repository's default branch. Automated browser tests mock the third-party frame so they neither require login nor create public comments.

Canonical paths are the identity for both feed entries and discussions. If renaming a path, plan a redirect plus discussion-mapping/feed-identity migration; path renames are not handled automatically. Keep Announcements reserved for article comments.

## Verification

```sh
npm test
npm run typecheck
npm run test:generate-provider
npm run test:seo-build
npm run test:blog-build
npm run test:static
```

RSS tests cover inventory isolation, ordering/limits, identity, dates and XML safety. Static browser tests parse the real generated feed and exercise opt-in loading, mapping, theme changes, SPA cleanup, OAuth return, blocked storage, missing discussions, third-party errors/timeouts and spoofed messages. They do not prove an authenticated GitHub comment has been submitted; that requires a real reader session after deployment.
