import { test, expect } from '@playwright/test';

test('theme control switches every surface and persists across routes', async ({ page }) => {
  await page.goto('/en/resume');
  const toggle = page.locator('[data-theme-toggle]');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toBeEnabled();
  const dark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
  await expect(page.locator('.writing-shell')).toHaveCSS('background-color', dark ? 'rgb(24, 26, 27)' : 'rgb(243, 240, 232)');
  await page.reload();
  await expect(page.locator('html')).toHaveClass(dark ? /dark/ : /light/);
  await toggle.click();
  await expect(toggle).toBeEnabled();
  await expect(page.locator('.writing-shell')).toHaveCSS('background-color', dark ? 'rgb(243, 240, 232)' : 'rgb(24, 26, 27)');
  for (const path of ['/en/projects', '/blog', '/blog/concurrency', '/en#intro']) {
    await page.goto(path);
    await expect(page.locator('[data-theme-toggle]')).toBeVisible();
    await expect(page.locator('.writing-shell, .home-scenes')).toHaveCSS('background-color', dark ? 'rgb(243, 240, 232)' : 'rgb(24, 26, 27)');
  }
});
