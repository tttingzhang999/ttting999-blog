# Interior navigation and continuity

First fix stable navigation, language context and layout shifts; then restrained transitions and chapter controls. Preserve homepage motion and SSR content.

- Shared sticky header with fixed desktop slots, native mobile menu and explicit language selection. Remember UI language across single-language article routes.
- Mobile article TOC must be collapsed in server HTML without a hydration-time collapse; desktop TOC remains visible through CSS. Sticky mobile TOC available while reading.
- Route scroll restoration belongs to router navigation, not delayed post-mount jumps. Preserve hash and browser history behavior.
- Reserve cover/gallery geometry. Avoid new font swapping: share DM Sans declaration across homepage and interior, prefer optional display for first-visit stability.
- Short content-only entrance when navigation is resolved; shell/background remain opaque. Never re-hide mounted text. Honor reduced motion.
- Chapter anchors for resume, sticky project index, article active heading, explicit gallery previous/next controls.

Verify RED navigation geometry/language + mobile initial TOC tests, then GREEN production build and regression suite. No commits/deployment.

## Verified result

- Build, five unit tests and all 22 browser cases pass.
- Frame sampling verifies archive return starts at its saved position, with no intermediate top-of-list frame.
- Fixed nav position and remembered language survive article reload. Mobile navigation is 72px; TOC starts collapsed even without JavaScript.
- Chapter anchors account for fractional CSS positions; gallery controls and article active-heading navigation pass.
- Desktop/mobile screenshots inspected. Existing project typecheck errors remain; no new diagnostics in changed modules.
- Navigation indicator and gallery motion respect reduced motion. Native details height animation uses progressive enhancement; unsupported browsers keep the functional disclosure.
- Content arrival uses a brief brightness change, with no text relocation, scaling or opacity reset. Fonts are requested once with optional display; cover and gallery dimensions are reserved.
