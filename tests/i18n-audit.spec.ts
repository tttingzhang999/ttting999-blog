import { test, expect } from '@playwright/test';

const locales = [
  { code: 'zh-TW', prefix: '', projects: '專案', detail: '查看專案', experience: '工作經歷' },
  { code: 'en', prefix: '/en', projects: 'Projects', detail: 'View Project', experience: 'Work Experience' },
  { code: 'ja', prefix: '/ja', projects: 'プロジェクト', detail: 'プロジェクトを見る', experience: '職務経歴' },
] as const;

for (const locale of locales) {
  test(`projects translations are available without JavaScript: ${locale.code}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}${locale.prefix}/projects`);
      await expect(page.locator('h1')).toHaveText(`${locale.projects}.`);
      await expect(page.locator('.case-study summary').first()).toHaveText(locale.detail);
      await expect(page.locator('.chapter-nav')).toHaveAttribute('aria-label', locale.projects);
    } finally {
      await context.close();
    }
  });

  test(`localized pages render translations after hydration: ${locale.code}`, async ({ page }) => {
    for (const path of ['/projects', '/resume', '']) {
      await page.goto(`${locale.prefix}${path}` || '/');
      await expect(page.locator('.site-header')).toHaveAttribute('aria-busy', 'false');
      expect(await page.locator('body').innerText()).not.toMatch(/\b(?:nav|projects|resume|seo|home)\.[a-zA-Z]+/);
      if (path === '/projects') {
        await expect(page.locator('h1')).toHaveText(`${locale.projects}.`);
        await expect(page.locator('.case-study summary').first()).toHaveText(locale.detail);
      }
      if (path === '/resume') {
        await expect(page.locator('#experience h2')).toHaveText(locale.experience);
        await expect(page.locator('#side-projects h2')).toHaveText(locale.projects);
      }
    }
  });
}

test('client navigation and repeated locale changes keep translated projects and resume', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-header')).toHaveAttribute('aria-busy', 'false');
  for (const locale of [locales[1], locales[2], locales[0], locales[1]]) {
    await page.getByLabel('Language', { exact: true }).click();
    await page.locator(`.site-language-links a[hreflang="${locale.code}"]`).click();
    await expect(page.locator('.site-header')).toHaveAttribute('aria-busy', 'false');
    await page.locator('.site-primary a[href$="/projects"]').click();
    await expect(page.locator('.site-header')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('h1')).toHaveText(`${locale.projects}.`);
    await expect(page.locator('.case-study summary').first()).toHaveText(locale.detail);
    await page.locator('.site-primary a[href$="/resume"]').click();
    await expect(page.locator('.site-header')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('#side-projects h2')).toHaveText(locale.projects);
  }
});

test('English preference survives the Chinese blog and mobile project navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/projects');
  await expect(page.locator('.site-header')).toHaveAttribute('aria-busy', 'false');
  await page.locator('.mobile-menu > summary').click();
  await page.locator('.mobile-menu a[href="/blog"]').click();
  await expect(page.locator('.site-header')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByLabel('Language', { exact: true })).toHaveValue('en');
  await page.locator('.mobile-menu > summary').click();
  await page.locator('.mobile-menu a[href="/en/projects"]').click();
  await expect(page.locator('.site-header')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('h1')).toHaveText('Projects.');
  await expect(page.locator('.case-study summary').first()).toHaveText('View Project');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
