# Smooth chapter navigation

User request: clicking in-page navigation should scroll to the section, with no flicker or instant replacement.

Use router links consistently for project/resume chapter links and article TOC. In the existing scroll integration, request smooth scrolling only for same-page hash navigation. Keep route changes, history restoration and homepage scenes unchanged; reduced motion stays instant. Remove the editorial brightness entrance effect, which can look like a flicker.

Verify frame-by-frame intermediate scroll positions, same mounted page element, stable text opacity/filter, target offset and reduced-motion behavior. Retain archive restoration tests.

Validation: production build passes. Frame tests for projects, resume and article TOC confirm multiple intermediate scroll positions, unchanged DOM identity, opacity 1 and no brightness filter. Reduced motion uses instant positioning. Article return and interior navigation regressions pass. Existing unrelated typecheck diagnostics remain.
