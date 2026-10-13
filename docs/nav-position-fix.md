# Stable primary navigation

Keep Home, Resume, Projects, and Writing at the same coordinates when switching pages within a language.

1. Reproduce with browser measurements of every primary link across a full navigation round trip, in Chinese, English, and Japanese at desktop widths.
2. Correct only the header sizing responsible for the shift; preserve the existing mobile menu and language controls.
3. Re-run the regression tests and existing header/navigation tests, and review the diff.

Acceptance: link positions and dimensions differ by less than one CSS pixel across routes; existing navigation and mobile-menu behavior pass.

Reproduced: English navigation shifted 19.4px on Writing. Its language select reserves 70px while the other pages' language dropdown had intrinsic width. Matching those widths removes that shift. Writing also changes the document language to Chinese, affecting fallback font metrics; the persistent header must declare its own display language.

Verified: all 12 header/navigation Playwright tests pass, including the full route round trip at 1024px and 1440px in all three languages and the existing mobile menu test. All 26 unit tests pass. Used the installed Node 24 runtime to match the existing SQLite native module.
