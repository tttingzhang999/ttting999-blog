import { test, expect } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
  test(`Python tokens have distinct colors in ${colorScheme} mode without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      colorScheme,
      viewport: { width: 390, height: 844 },
    });
    try {
      const page = await context.newPage();
      await page.goto("/blog/concurrency");
      // With scripts disabled, explicitly select the same theme class as color-mode.
      await page.locator("html").evaluate((el, mode) => {
        el.classList.remove("light", "dark");
        el.classList.add(mode);
      }, colorScheme);
      const python = page.locator("pre").filter({ hasText: "import asyncio" });
      await expect(python).toContainText("    @wraps(func)");
      const keyword = python.locator("span").filter({ hasText: /^import$/ }).first();
      const comment = python.locator("span").filter({ hasText: /^# 計時裝飾器/ }).last();
      const string = python.locator("span").filter({ hasText: /I\/O 任務完成/ }).last();
      await expect(keyword).toHaveCount(1);
      const colors = await Promise.all([keyword, comment, string].map(
        token => token.evaluate(el => getComputedStyle(el).color),
      ));
      expect(new Set(colors).size).toBe(3);
      await expect(python).toHaveCSS("overflow-x", "auto");
      expect(await python.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);

      const bash = page.locator("pre").filter({ hasText: "python" }).last();
      expect(await bash.locator("span").evaluateAll(elements =>
        new Set(elements.filter(el => !el.children.length).map(el => getComputedStyle(el).color)).size,
      )).toBeGreaterThan(1);

      await page.goto("/blog/leetcode-contest/leetcode-weekly-591");
      // This article uses capitalized ```Python fences.
      await expect(page.locator("pre").first().locator("span").filter({ hasText: /^class$/ })).toHaveCount(1);
    } finally {
      await context.close();
    }
  });
}
