# Text visibility audit and repair — 2026-09-12

Confirmed causes:
- A and C text remained visible during the 950ms scroll, then arrival `fromTo` forced opacity back to zero and moved it down. This also replayed over SSR text on initial mount.
- A→B did not hide its final composition until the article timeline was created after arrival.
- Leaving an active B intro immediately restored static article metadata while B was still in view.
- Initial #writing entry and responsive reinitialization could play an intro over an already visible list.

Changes in `utils/home/runtime.ts`:
- A/C retain readable text throughout the page movement; removed the redundant arrival entrance tween.
- B's hidden state is prepared synchronously inside onLeave, before the scrolling frame. A pending flag authorizes the scan only for intentional A→B navigation.
- Outgoing scan is frozen in its current state; its DOM is restored only after the outgoing section is offscreen.
- Initial/deep-link/responsive entry settles to readable content. Resize and visibility cancellation clear the pending flag so an arrival callback cannot restart the intro afterward.
- Gold-line scene bridges and the persistent Canvas are unchanged.

Validation:
- Two new Chrome regressions failed on the old build, reproducing early article exposure and outgoing-list restoration.
- Frame sampling on the repaired build checks article effective opacity from the navigation click through scan start, and verifies A/C text never resets to hidden during arrival.
- Additional regression checks outgoing scan freeze and direct #writing readability.
- Production build passes; all 8 browser tests and 4 unit tests pass, including gold-line frame sampling, routing, SSR/no-JS, reduced motion, mobile, locale and responsive entry checks.
- Global typecheck retains the existing unrelated diagnostics; no diagnostics in this repair's runtime/test files. No deployment or push. Local production preview refreshed at port 3000.

## Scan ending revision
Replaced title relocation with a sequential fade: scan text fades out in place over 0.55s, followed after 0.1s by a 0.85s fade-in of the fixed writing composition. Removed exit-time title position, width, font-size and date-layout tweens and target measurements. Gold flow still transitions at scan end. New regression failed on the old build's changing font size, then passed on the revised build with stable title/list geometry. Production build and all 10 browser regressions pass, including gold, background and text visibility continuity. Local preview refreshed; no deployment.
