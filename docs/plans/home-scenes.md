# Homepage scene integration

## Scope
Replace the homepage with the approved ink/amber three-scene composition: Plan / Execute identity, technical writing, and selected projects/contact. Integrate only the selected horizontal timestamp transition. Preserve existing article/index pages, SEO, and locale routes. Keep prototype comparisons outside the repo.

## Design
Ink #181A1B, paper #F3F0E8, amber #F2B55A, sage #ACBDAA, muted #999A94. Oversized identity typography; open article list with no cards. Separate identity, transition, article focus, and project curves. Reuse approved copy; translate interface for existing English/Japanese routes.

## Data and lifecycle
Nuxt Content query selects metadata only and excludes drafts. Shared pure projection selects technical categories, stable newest-first order, latest five and chronological timeline. SSR renders real links. Client-only fullPage/GSAP setup, scoped DOM, reduced-motion/native small-screen fallback, and cleanup on route departure. Repeat A→B plays; C→B stays readable. Article click and keyboard focus can interrupt the animation.

## Verification
First write failing metadata tests and browser acceptance checks. Validate filtering/order/metadata-only output, initial SSR, repeated transitions, hover, article navigation/back, locale, native mobile, reduced motion, resize, and no stale fullPage DOM after unmount. Run build and focused type checks. Review changed files for correctness and unrelated changes.

## Constraints
No deploy or licensing change. fullPage uses public runtime configuration for a license key; preserve upstream credits. Existing Node/native SQLite ABI mismatch may require rebuilding local dependencies before Nuxt runs. Static-generated article updates require a normal site rebuild.

## Implementation and validation — 2026-09-12
- Homepage now renders `HomeScenes` with SSR metadata from Nuxt Content. The animation module is lazy-loaded on mount and removed on unmount. No preview server/API or manually maintained article titles are used.
- Existing Chinese/English/Japanese routes retain localized navigation. Technical article links point to the existing single-language `/blog` pages.
- Node 24 is recorded in `.nvmrc`. Local native SQLite dependency was rebuilt under Node 24; system Node was not changed. Use Node 24 for `npm install`, `npm run dev`, and build/test commands.
- `npm test`: 2 tests pass; metadata projection has 100% line/branch/function coverage. This percentage does not represent animation or whole-site coverage.
- `npm run test:e2e`: 5 tests pass against the production build on Chrome. Covers no-JS SSR, repeated A→B, full title count from current metadata, skip, hover, project selection, C→B, article route/back cleanup, reduced motion, mobile overflow, locale routes, initial keyboard navigation, and resize mode changes.
- `npm run build`: passes. Existing Nuxt Image warning about darwin-arm64 sharp binaries remains; no image optimization was introduced by this homepage.
- `npm run typecheck`: still fails with 26 diagnostics in existing app/blog/resume/image/i18n code. After fixing the new module types, no diagnostics remain in the new homepage modules. Unrelated existing issues were not suppressed or edited.
- `git diff --check`: clean. Reviewed DOM scoping, animation cancellation, SSR links, data projection, and route cleanup; no unresolved critical/high issue identified in this change.
- Local preview uses `node .output/server/index.mjs` under Node 24 at port 3000. No deploy, commit or push performed.

## Deployment notes
- Set `NUXT_PUBLIC_FULLPAGE_LICENSE_KEY` to the project's valid fullPage license before a commercial deployment, or satisfy its applicable GPL terms. The integration preserves upstream notices; no license was purchased or project license changed.
- Article additions in `content/blog` appear through the normal content build/deployment. Static hosting requires rebuilding the site; it does not poll the author's filesystem at runtime.
- Article index/reading-page redesign remains the next separate scope.

## Gold continuity repair — 2026-09-12
Use one fixed Canvas for the gold curve and light in all scenes, including scan. Keep scan metadata choreography; send its moving geometry to the shared renderer. Preserve point velocities when targets change with a critically damped spring. Begin the destination bridge in onLeave; finish at afterLoad without resetting. Separate intro metadata cleanup from curve completion and cancellation. Track native scroll in viewport coordinates. Test pure motion integration first, then capture actual Canvas strokes across scene changes, scan exit, interruptions and focus to detect displacement spikes/visibility gaps.

## Text visibility repair
Audit: A/C text is visible during fullPage movement then hidden again by arrival fromTo; A→B exposes the final list before timeline initialization; leaving B mid-scan restores its final list while still onscreen; first hydration and responsive reinitialization replay entrances over already-visible SSR text. Fix: retain A/C text throughout navigation, prepare B before movement only for an intentional A→B scan, freeze outgoing scan until offscreen, and settle initial/deep-link/responsive entry without hiding visible SSR text. Add frame-sampled opacity regression tests before implementation; retain no-JS SSR and gold continuity checks.

## Background continuity repair
All three sections share the same ink base and transparent scene surfaces. The global `.light` opacity switches instantly from 1 to 0.1 on `journalIntro=playing`, then instantly restores on completion, skip or leave. Keep the approved colors; separate ambient state from text animation state, start its dimming in onLeave, and interpolate opacity over the section movement. Confirm local article/project scrims follow their content opacity, and preserve reduced-motion behavior. Add a frame-sampled regression for normal completion, reverse/direct navigation, skip and mid-scan leave before changing implementation.

## Scan ending simplification
Keep chronological horizontal scan, but remove title-to-list relocation and all exit-time font/width/date layout changes. At scan end, flow the existing gold line toward the selected article while fading the scan out (0.55s), then fade the already-laid-out complete writing composition in (0.85s). Brief separation avoids overlapping duplicate titles. Add regression checking that scan title y/width/font and final-list geometry stay fixed throughout the exit.
