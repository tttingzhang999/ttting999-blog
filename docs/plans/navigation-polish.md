# Navigation polish

Remove Contact from the global header; Home covers all three scenes. Use one title type scale and top/left alignment for resume, projects and archive, with resume role moved below its name. Apply the existing snapshot dissolve to normal header route navigation while leaving scene links and modifier clicks native. Wait for page completion and home runtime readiness before revealing. Verify title rectangles on desktop/mobile, four-item navigation and transition invocation. Inspect fullPage's supported credits configuration and licensing before changing attribution.

## Result

- Header now has Home / Resume / Projects / Writing; Home remains active throughout all home scenes.
- At 1440 px the three title boxes share x=186.39, y=168, height=105.59; desktop and 390 px tests also verify matching font size/line height.
- Header route changes use the existing 320 ms dissolve and await new content/home initialization. Explicit archive entry starts at the title; article-back restoration remains intact.
- Set fullPage credits.enabled=false using its official option. Installed documentation says a valid licenseKey is required; runtime forces watermark when key validation fails. Current empty key means the mark remains visible until a valid key is configured (NUXT_PUBLIC_FULLPAGE_LICENSE_KEY). No CSS hiding or library patches.
- Build and 17 relevant browser tests passed, screenshots reviewed. Typecheck has the same 9 existing diagnostics; no new ones.

## PR regression follow-up

A navigation request during an active dissolve was silently discarded by the shared busy guard. Queue the latest header destination until the transition finishes, then navigate; cancel superseded requests. Release finished snapshot animation effects so they do not accumulate across navigation. Validate with a deliberate navigation request during the active dissolve and the existing full browser suite.
