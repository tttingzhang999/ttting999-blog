# Personal projects only

Remove employer projects (EV charging, Solar PV, Power Transfer) from all
portfolio datasets and the projects chapter order. Retain Moniit, EatSwiper,
Promptlingo and existing employment history/blog content. Remove the employer
screenshots and logos from public assets so a static deployment cannot serve them.

Verification: first reproduce exposure with a dataset/asset regression test;
update existing project navigation tests to use personal projects; run unit tests,
typecheck, focused browser checks and static generation. Inspect generated project
pages and asset paths before delivery.

Validation: 25 unit/integration tests and typecheck pass. All 16 focused browser
scenarios pass across the initial run and a rerun of the continuity suite after
fixing its hydration wait. Static generation passes; all three localized project
pages contain exactly the three personal projects and no employer asset paths.
Employer asset directories are absent from the generated public output.
