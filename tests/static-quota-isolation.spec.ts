import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const manifest = JSON.parse(readFileSync(".blog-sync/manifest.json", "utf8"));
const output = resolve(".output/public");

// Nuxt Content's generated SQL dumps and IPX images are static files too.
// Deny anything that would require a content/image server and fail on attempts.
test.beforeEach(async ({ page }) => {
  await page.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.origin !== "http://127.0.0.1:8787") return route.continue();
    if (url.pathname === "/api/views") {
      return route.fulfill({ status: 503, contentType: "text/html", body: "Quota exhausted" });
    }
    if (/^\/(api\/|__nuxt_content\/|_ipx\/)/.test(url.pathname)) {
      const file = resolve(output, "." + decodeURIComponent(url.pathname));
      expect(existsSync(file), `dynamic content/image request: ${url.pathname}`).toBe(true);
    }
    return route.continue();
  });
});

test("every published article has readable generated HTML without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    for (const { route } of manifest.articles) {
      const response = await page.goto(`http://127.0.0.1:8787${route}`);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator(".reader-heading h1")).not.toBeEmpty();
      await expect(page.locator(".reading-content .prose")).not.toBeEmpty();
    }
  } finally {
    await context.close();
  }
});

test("archive filters and client navigation work with dynamic services denied", async ({ page }) => {
  const documents: string[] = [];
  page.on("request", request => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents.push(request.url());
  });
  await page.goto("/blog");
  await expect(page.locator(".site-header")).toHaveAttribute("aria-busy", "false");
  await page.getByRole("searchbox").fill("591");
  await expect(page.locator(".archive-entry")).toHaveCount(1);
  await page.locator('.archive-entry a[href="/blog/leetcode-contest/leetcode-weekly-591"]').click();
  await expect(page.locator(".reader-heading h1")).toContainText("591");
  await expect(page.locator(".reading-content .prose")).not.toBeEmpty();
  const related = page.locator(".reader-related a").first();
  const nextRoute = await related.getAttribute("href");
  const nextTitle = await related.locator("h3").innerText();
  await related.click();
  await expect(page).toHaveURL(new URL(nextRoute!, "http://127.0.0.1:8787").href);
  await expect(page.locator(".reader-heading h1")).toHaveText(nextTitle);
  await expect(page.locator(".reading-content .prose")).not.toBeEmpty();
  expect(documents).toHaveLength(1); // Nuxt navigation, not a full-page fallback.
  await page.getByRole("link", { name: "返回文章列表", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("591");
  await page.getByRole("button", { name: "清除篩選" }).click();
  await expect(page.locator(".archive-entry")).toHaveCount(manifest.articles.length);
  await page.getByRole("searchbox").fill("no-matching-static-article");
  await expect(page.getByText("沒有符合的文章")).toBeVisible();
});

test("direct load, reload, TOC and first-party assets need no dynamic content server", async ({ page }) => {
  const failures: string[] = [];
  page.on("response", response => {
    const url = new URL(response.url());
    if (url.origin === "http://127.0.0.1:8787" && url.pathname !== "/api/views" && response.status() >= 400) {
      failures.push(`${response.status()} ${url.pathname}`);
    }
  });
  await page.goto("/blog/decrease-coding-agent-illusion");
  await expect(page.locator(".site-header")).toHaveAttribute("aria-busy", "false");
  const title = await page.locator(".reader-heading h1").innerText();
  const toc = page.locator(".reader-toc a").first();
  const anchor = await toc.getAttribute("href");
  await toc.click();
  await expect.poll(() => decodeURIComponent(new URL(page.url()).hash)).toBe(decodeURIComponent(anchor!));
  const images = page.locator(".reading-content img");
  expect(await images.count()).toBeGreaterThan(0);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await page.reload();
  await expect(page.locator(".reader-heading h1")).toHaveText(title);
  await expect(page.locator(".reading-content .prose")).not.toBeEmpty();
  expect(failures).toEqual([]);
});
