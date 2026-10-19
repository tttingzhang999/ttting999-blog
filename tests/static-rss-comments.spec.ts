import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('.blog-sync/manifest.json', 'utf8'));
const first = '/blog/concurrency';
const second = '/blog/python-gil-introduction';

async function mockGiscus(page: import('@playwright/test').Page, error?: string) {
  await page.route('https://giscus.app/**', route => route.fulfill({
    contentType: 'text/html',
    body: `<html><body>Test comments<script>
      const send = data => parent.postMessage({giscus:data}, new URL(document.referrer).origin);
      send(${JSON.stringify(error ? { error } : { resizeHeight: 240, discussion: null })});
      addEventListener('message', event => {
        if (event.data.giscus?.setConfig) document.body.dataset.theme = event.data.giscus.setConfig.theme;
      });
    </script></body></html>`,
  }));
}

test('RSS is valid static XML, advertises itself and includes only published canonical articles', async ({ page, request }) => {
  const response = await request.get('/feed.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('xml');
  expect(response.headers()['cache-control'] || '').not.toContain('immutable');
  const xml = await response.text();
  await page.goto('/blog');
  const feed = await page.evaluate(xml => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    return {
      error: doc.querySelector('parsererror')?.textContent,
      items: [...doc.querySelectorAll('item')].map(item => ({
        link: item.querySelector('link')?.textContent,
        guid: item.querySelector('guid')?.textContent,
        date: item.querySelector('pubDate')?.textContent,
      })),
    };
  }, xml);
  expect(feed.error).toBeUndefined();
  expect(feed.items).toHaveLength(Math.min(manifest.articles.length, 30));
  const published = manifest.articles.map((a: {route: string}) => new URL(a.route, 'https://info.tttingzhang999.com').href);
  for (const item of feed.items) {
    expect(published).toContain(item.link);
    expect(item.guid).toBe(item.link);
    expect(Number.isFinite(Date.parse(item.date!))).toBe(true);
  }
  expect(feed.items.map(item => Date.parse(item.date!))).toEqual(feed.items.map(item => Date.parse(item.date!)).toSorted((a,b) => b-a));
  await expect(page.locator('head link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', 'https://info.tttingzhang999.com/feed.xml');
  await expect(page.getByRole('link', { name: 'RSS 訂閱' })).toHaveAttribute('href', '/feed.xml');
});

test('comments load only on request, map the canonical path, follow theme and clean up on navigation', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().startsWith('https://giscus.app')) requests.push(request.url()); });
  await mockGiscus(page);
  await page.goto(`${first}?from=rss#comments`);
  await expect(page.getByRole('button', { name: '載入留言', exact: true })).toBeVisible();
  expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: '載入留言', exact: true }).click();
  const iframe = page.locator('giscus-widget iframe');
  await expect(iframe).toBeVisible();
  await expect(page.getByText('留言載入中…', { exact: true })).not.toBeVisible();
  const url = new URL((await iframe.getAttribute('src'))!);
  expect(url.searchParams.get('repo')).toBe('tttingzhang999/ttting999-blog');
  expect(url.searchParams.get('term')).toBe(first);
  expect(url.searchParams.get('strict')).toBe('1');
  expect(url.searchParams.get('category')).toBe('Announcements');
  const wasDark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
  const toggle = page.locator('[data-theme-toggle]');
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(wasDark ? /light/ : /dark/);
  await expect(toggle).toBeEnabled();
  await expect(page.locator('giscus-widget')).toHaveAttribute('theme', wasDark ? 'light' : 'dark_dimmed');
  await expect(page.frameLocator('giscus-widget iframe').locator('body')).toHaveAttribute('data-theme', wasDark ? 'light' : 'dark_dimmed');
  const back = page.getByRole('link', { name: '返回文章列表' });
  // Position the target before clicking; article-wide smooth scrolling is asynchronous.
  await back.evaluate(link => link.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await back.click();
  await expect(page).toHaveURL('http://127.0.0.1:8787/blog');
  await expect(page.locator('giscus-widget')).toHaveCount(0);
  await page.locator(`a[href="${second}"]`).first().click();
  await page.getByRole('button', { name: '載入留言', exact: true }).click();
  await expect(page.locator('giscus-widget')).toHaveAttribute('term', second);
  await expect(page.locator('giscus-widget iframe')).toHaveCount(1);
});

test('a new article with no discussion remains ready for its first comment', async ({ page }) => {
  await mockGiscus(page, 'Discussion not found');
  await page.goto(first);
  await page.getByRole('button', { name: '載入留言', exact: true }).click();
  await expect(page.locator('giscus-widget iframe')).toBeVisible();
  await expect(page.getByText('留言載入中…', { exact: true })).not.toBeVisible();
  await expect(page.getByText('留言暫時無法載入。')).toHaveCount(0);
});

test('service errors are isolated from articles and provide retry and GitHub fallback', async ({ page }) => {
  await mockGiscus(page, 'API rate limit exceeded');
  await page.route('**/api/views', route => route.fulfill({ status: 503, body: 'unavailable' }));
  await page.goto(first);
  const content = await page.locator('.prose').innerText();
  await page.getByRole('button', { name: '載入留言', exact: true }).click();
  await expect(page.getByText('留言暫時無法載入。')).toBeVisible();
  await expect(page.locator('.prose')).toHaveText(content, { useInnerText: true });
  await expect(page.getByRole('link', { name: '在 GitHub 查看討論' })).toHaveAttribute('href', /github.com\/tttingzhang999\/ttting999-blog\/discussions/);
  await mockGiscus(page);
  await page.getByRole('button', { name: '重試留言' }).click();
  await expect(page.locator('giscus-widget iframe')).toBeVisible();
  await expect(page.getByText('留言暫時無法載入。')).toHaveCount(0);
});

test('blocked third-party requests time out; forged messages cannot hide the failure', async ({ page }) => {
  await page.clock.install();
  await page.route('https://giscus.app/**', route => route.abort());
  await page.goto(first);
  await page.getByRole('button', { name: '載入留言', exact: true }).click();
  await expect(page.locator('giscus-widget')).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new MessageEvent('message', {
    origin: 'https://giscus.app', source: window, data: { giscus: { resizeHeight: 200 } },
  })));
  await page.clock.fastForward(16_000);
  await expect(page.getByText('留言暫時無法載入。')).toBeVisible();
  await expect(page.locator('.prose')).toBeVisible();
});

test('OAuth return loads the widget to consume the session, while sharing uses the canonical URL', async ({ page }) => {
  await mockGiscus(page);
  await page.goto(`${first}?giscus=test-session#comments`);
  await expect(page.locator('giscus-widget iframe')).toBeVisible();
  await expect(page).not.toHaveURL(/giscus=/);
  const sharing = await page.getByRole('link', { name: 'X / Twitter' }).getAttribute('href');
  expect(sharing).not.toContain('test-session');
  expect(new URL(sharing!).searchParams.get('url')).toBe(`https://info.tttingzhang999.com${first}`);
});

test('an expired GitHub session is cleared by giscus and recovers without a retry loop', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('giscus-session', JSON.stringify('expired-session')));
  await page.route('https://giscus.app/**', route => {
    const session = new URL(route.request().url()).searchParams.get('session');
    return route.fulfill({
      contentType: 'text/html',
      body: `<html><body>Test comments<script>
        parent.postMessage({giscus:${JSON.stringify(session ? { error: 'Bad credentials' } : { resizeHeight: 240 })}}, new URL(document.referrer).origin);
      </script></body></html>`,
    });
  });
  await page.goto(first);
  await page.getByRole('button', { name: '載入留言', exact: true }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('giscus-session'))).toBeNull();
  await expect(page.locator('giscus-widget iframe')).toBeVisible();
  await expect(page.getByText('留言載入中…', { exact: true })).not.toBeVisible();
  await expect(page.getByText('留言暫時無法載入。')).toHaveCount(0);
  const src = await page.locator('giscus-widget iframe').getAttribute('src');
  expect(new URL(src!).searchParams.get('session')).toBe('');
});

test('blocked local storage cannot break article reading when loading comments', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key) {
      if (key === 'giscus-session') throw new DOMException('Storage denied', 'SecurityError');
      return original.call(this, key);
    };
  });
  await page.goto(first);
  await page.getByRole('button', { name: '載入留言', exact: true }).click();
  await expect(page.getByText('留言暫時無法載入。')).toBeVisible();
  await expect(page.locator('.prose')).toBeVisible();
});
