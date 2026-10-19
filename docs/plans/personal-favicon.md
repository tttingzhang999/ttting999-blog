# Personal favicon

Approved 2026-10-19: use the rounded lowercase **t.** proposal. Replace the Nuxt default icon with this compact personal mark: bold sans-serif t and circular period, charcoal on cream. Do not use the rejected gold uppercase T/arrow or the chamfered t alternative.

Export a reusable 512px PNG, 32px PNG favicon, 180px Apple touch icon and a 16/32/48px multi-resolution ICO. Update document head links, using a new favicon filename/query to avoid the cached Nuxt icon. No layout, header wordmark, dependency or workflow changes.

Verify decoded dimensions/ICO entries, inspect 16px/32px rendering, generate the static site and inspect generated icon links/assets. This is a reversible asset/config change; no implementation-mirroring tests are needed.

## Design source

Built-in `image_gen`, logo-brand mode. Final prompt: one youthful, minimal custom heavy geometric lowercase `t.` with a substantial circular period; solid charcoal #181a1b on cream #f3f0e8, compact and optically centered, no serif, arrow, extra text, frames or mockups. Generate a flat icon with strong negative spaces that survive at 32px. Final PNG exports preserve the approved artwork; the ICO embeds resized PNG frames.

Files: `public/ting-mark.png` (512), `public/favicon-32.png`, `public/apple-touch-icon.png` (180), `public/favicon.ico` (16/32/48). The full-size generated reference remains outside the repository; the exported artwork is self-contained here.
