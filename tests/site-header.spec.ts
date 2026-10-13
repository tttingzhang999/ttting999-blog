import { test, expect } from '@playwright/test';

for (const width of [1024, 1440]) {
  for (const prefix of ['', '/en', '/ja']) {
    test(`primary links keep their positions across routes at ${width}px in ${prefix || 'zh-TW'}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(prefix || '/');
      const header = page.locator('.site-header');
      const links = header.locator('.site-primary a');
      await expect(header).toHaveAttribute('aria-busy', 'false');
      await page.evaluate(() => document.fonts.ready);
      const positions = () => links.evaluateAll(elements => elements.map(element => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      }));
      const initial = await positions();
      for (const path of [`${prefix}/resume`, `${prefix}/projects`, '/blog', prefix || '/']) {
        await header.locator(`.site-primary a[href="${path}"]`).click();
        await expect(page).toHaveURL(url => url.pathname === path);
        await expect(header).toHaveAttribute('aria-busy', 'false');
        await page.evaluate(() => document.fonts.ready);
        const current = await positions();
        for (const [index, bounds] of current.entries()) {
          for (const key of ['x', 'y', 'width', 'height'] as const) {
            expect(Math.abs(bounds[key] - initial[index]![key]), `${path}: link ${index} ${key}`).toBeLessThan(1);
          }
        }
      }
    });
  }
}

test('one persistent header connects home and editorial destinations', async ({ page }) => {
  await page.goto('/en');
 await expect(page.locator(".site-header")).toHaveAttribute("aria-busy", "false");
  const header = page.locator('.site-header');
  await expect(header).toHaveCount(1);
  await expect(header.locator('.site-primary a')).toHaveText(['Home', 'Resume', 'Projects', 'Writing']);
  await header.evaluate(element => element.setAttribute('data-persistence-test', 'same'));
  await header.locator('.site-primary a[href="/en/resume"]').click();
  await expect(page.locator('.editorial-resume')).toBeVisible();
  await expect(header).toHaveAttribute('data-persistence-test', 'same');
  await expect(header.locator('.site-logo')).toHaveText('Ting Zhang↗');
  await header.locator('.site-primary a[href="/blog"]').click();
  await expect(page.locator('.archive-page')).toBeVisible();
  await expect(header).toHaveAttribute('data-persistence-test', 'same');
  await expect(header.locator('.site-primary a[href="/en/resume"]')).toBeVisible();
});

test('unified mobile menu closes after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ja/resume');
 await expect(page.locator(".site-header")).toHaveAttribute("aria-busy", "false");
  await page.locator('.site-header .mobile-menu summary').click();
  await page.locator('.site-header .mobile-menu a[href="/ja/projects"]').click();
  await expect(page.locator('.editorial-projects')).toBeVisible();
  await expect(page.locator('.site-header .mobile-menu')).not.toHaveAttribute('open', '');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
