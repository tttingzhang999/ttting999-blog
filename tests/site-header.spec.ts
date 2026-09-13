import { test, expect } from '@playwright/test';

test('one persistent header connects home and editorial destinations', async ({ page }) => {
  await page.goto('/en');
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
  await page.locator('.site-header .mobile-menu summary').click();
  await page.locator('.site-header .mobile-menu a[href="/ja/projects"]').click();
  await expect(page.locator('.editorial-projects')).toBeVisible();
  await expect(page.locator('.site-header .mobile-menu')).not.toHaveAttribute('open', '');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
