import { test, expect } from '@playwright/test';
const origin = 'https://info.tttingzhang999.com';

test('localized homepage exposes its own share URL and crawlable language links', async ({ page }) => {
  await page.goto('/en');
 await expect(page.locator(".site-header")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${origin}/en`);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${origin}/og-image.jpg`);
  await expect(page.locator('.site-language-links a[hreflang="ja"]')).toHaveAttribute('href', '/ja');
  await page.getByLabel('Language', { exact: true }).click();
  await page.locator('.site-language-links a[hreflang="ja"]').click();
  await expect(page).toHaveURL(/\/ja(?:#intro)?$/);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${origin}/ja`);
});

test('article has consistent metadata after changing UI language', async ({ page }) => {
  await page.goto('/blog/uv-and-ruff');
 await expect(page.locator(".site-header")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page).toHaveTitle(/uv.*Ting Zhang$/);
  await page.getByLabel('Language', { exact: true }).selectOption('ja');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(schema.inLanguage).toBe('zh-TW');
  expect(schema.image).toBe(`${origin}/og-image.jpg`);
  expect(schema.dateModified).toBe('2026-09-20');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
});

test('legacy published article redirects, missing and draft articles stay missing', async ({ request }) => {
  const legacy = await request.get('/en/blog/2025-review', { maxRedirects: 0 });
  expect(legacy.status()).toBe(308);
  expect(legacy.headers().location).toBe('/blog/2025-review');
  for (const path of ['/en/blog/not-a-published-article', '/ja/blog/how-i-get-saa']) {
    expect((await request.get(path, { maxRedirects: 0 })).status()).toBe(404);
  }
});
