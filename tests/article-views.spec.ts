import { test, expect } from '@playwright/test';
const slug = '/blog/decrease-coding-agent-illusion';
const success = (slug: string, views = 42) => ({ success: true, data: { slug, views }, error: null });

test('first mount posts once, refresh reads, and storage is marked before the write', async ({ page }) => {
  const methods: string[] = [];
  await page.route('**/api/views**', async route => {
    methods.push(route.request().method());
    expect(await page.evaluate(() => sessionStorage.length)).toBeGreaterThan(0);
    if (route.request().method() === 'POST') expect(route.request().postDataJSON()).toEqual({ slug });
    else expect(new URL(route.request().url()).searchParams.get('slug')).toBe(slug);
    await route.fulfill({ json: success(slug) });
  });
  await page.goto(slug);
  await expect(page.getByText('42 次瀏覽', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('42 次瀏覽', { exact: true })).toBeVisible();
  expect(methods).toEqual(['POST', 'GET']);
});

test('denied storage only reads and still displays a valid count', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Denied', 'SecurityError'); } }));
  const methods: string[] = [];
  await page.route('**/api/views**', route => {
    methods.push(route.request().method());
    return route.fulfill({ json: success(slug, 0) });
  });
  await page.goto(slug);
  await expect(page.getByText('0 次瀏覽', { exact: true })).toBeVisible();
  expect(methods).toEqual(['GET']);
});

test('timeout hides the count without retry and a refresh never replays the write', async ({ page }) => {
  const methods: string[] = [];
  await page.route('**/api/views**', async route => {
    methods.push(route.request().method());
    if (methods.length === 1) { await new Promise(resolve => setTimeout(resolve, 4000)); }
    await route.fulfill({ json: success(slug) });
  });
  await page.goto(slug);
  await expect(page.locator('.reading-content .prose')).not.toBeEmpty();
  await page.waitForTimeout(4500);
  await expect(page.locator('.article-views')).toHaveCount(0);
  expect(methods).toEqual(['POST']);
  await page.reload();
  await expect(page.getByText('42 次瀏覽', { exact: true })).toBeVisible();
  expect(methods).toEqual(['POST', 'GET']);
});

test('navigation ignores an old delayed response and counts the new article once', async ({ page }) => {
  const requested: string[] = [];
  let release!: () => void;
  const delayed = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/views**', async route => {
    const target = route.request().postDataJSON()?.slug ?? new URL(route.request().url()).searchParams.get('slug');
    requested.push(target);
    if (target === slug) await delayed;
    await route.fulfill({ json: success(target, target === slug ? 999 : 7) });
  });
  await page.goto(slug);
  await expect.poll(() => requested.length).toBe(1);
  const related = page.locator('.reader-related a').first();
  const next = await related.getAttribute('href');
  await related.click();
  await expect(page.getByText('7 次瀏覽', { exact: true })).toBeVisible();
  release();
  await page.waitForTimeout(200);
  await expect(page.getByText('999 次瀏覽', { exact: true })).toHaveCount(0);
  expect(requested).toEqual([slug, next]);
});
