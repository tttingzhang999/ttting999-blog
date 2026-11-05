import { test, expect } from "@playwright/test";

test("SSR publishes metadata and real article links without animation JavaScript", async ({
  browser,
}) => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".article-item")).toHaveCount(6);
  await expect(page.locator(".article-item").first()).toHaveAttribute(
    "href",
    /^\/blog\//,
  );
  await expect(page.locator("#intro-title")).toContainText("Plan");
  await page.close();
});

test("scene navigation, repeated timeline, hover, routing cleanup and return", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const root = page.locator(".home-scenes");
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await page.locator('.scene-nav [data-go="writing"]').click();
  await expect(root).toHaveAttribute("data-journal-intro", "playing");
  await expect(page.locator(".timeline-node")).toHaveCount(6);
  await page.waitForTimeout(400);
  const stage = await page.locator(".article-panorama").boundingBox();
  expect(Math.abs(stage!.y)).toBeLessThan(2);
  await page.screenshot({ path: "/tmp/nuxt-home-timeline.png" });
  await expect(root).toHaveAttribute("data-journal-intro", "done", {
    timeout: 3500,
  });
  await page.locator(".article-item").nth(2).hover();
  await page.locator('.scene-nav [data-go="intro"]').click();
  await expect(root).toHaveAttribute("data-scene", "0");
  await page.locator('.scene-nav [data-go="writing"]').click();
  await expect(root).toHaveAttribute("data-journal-intro", "playing");
  await page.locator("[data-skip]").click();
  await expect(root).toHaveAttribute("data-journal-intro", "done");
  await page.locator('.scene-nav [data-go="practice"]').click();
  await expect(root).toHaveAttribute("data-scene", "2");
  await page.locator('[data-project="eatswiper"]').click();
  await expect(page.locator("#project-description")).toContainText("Flutter");
  await page.locator('.scene-nav [data-go="writing"]').click();
  await expect(root).toHaveAttribute("data-scene", "1");
  await expect(root).toHaveAttribute("data-journal-intro", "done");
  await page.screenshot({ path: "/tmp/nuxt-home-writing.png" });
  await page.locator(".article-item").first().click();
  await expect(page).toHaveURL(/\/blog\//);
  await expect(page.locator("html")).not.toHaveClass(/fp-enabled/);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.goBack();
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-mode",
    "scenes",
  );
  await expect(page.locator("#home-fullpage")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("deep link, reduced motion and mobile remain readable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#writing", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-mode",
    "reading",
  );
  await expect(page.locator(".article-item")).toHaveCount(6);
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-journal-intro",
    "done",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#writing", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-mode",
    "scenes",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/nuxt-home-mobile.png" });
  const lastArticle = page.locator(".article-item:visible").last();
  await expect(lastArticle).toBeInViewport();
  await expect(page.locator(".home-scenes")).toHaveAttribute("data-scene", "1");
});

test("locale routes retain localized interface and article links", async ({
  page,
}) => {
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-mode",
    "scenes",
  );
  await expect(page.locator(".hero-copy .text-link")).toHaveText("Recent articles ↓");
  await expect(page.locator(".article-item").first()).toHaveAttribute(
    "href",
    /^\/blog\//,
  );
  await page.goto("/ja", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".hero-copy .text-link")).toHaveText("最近の記事 ↓");
});

test("keyboard entry and responsive mode switches settle without stale animation", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const root = page.locator(".home-scenes");
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await page.keyboard.press("ArrowDown");
  await expect(root).toHaveAttribute("data-journal-intro", "playing");
  await page.setViewportSize({ width: 1440, height: 740 });
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await expect(root).toHaveAttribute("data-journal-intro", "done");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(root).toHaveAttribute("data-mode", "reading");
  await expect(page.locator("html")).not.toHaveClass(/fp-enabled/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await expect(root).toHaveAttribute("data-scene", "1");
});

for (const viewport of [
  { width: 898, height: 751 },
  { width: 390, height: 844 },
]) {
  test(`wheel navigation settles on full sections at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const root = page.locator(".home-scenes");
    await expect(root).toHaveAttribute("data-mode", "scenes");
    await page.mouse.move(viewport.width / 2, viewport.height / 2);
    await page.mouse.wheel(0, 200);
    await expect(root).toHaveAttribute("data-scene", "1");
    const writing = await page.locator(".section.writing").boundingBox();
    expect(Math.abs(writing!.y)).toBeLessThan(2);
    if (viewport.width > 700) {
      await page.locator("[data-skip]").click();
    }
    await page.mouse.move(20, viewport.height / 2);
    await page.mouse.wheel(0, -200);
    await expect(root).toHaveAttribute("data-scene", "0");
    const intro = await page.locator(".section.intro").boundingBox();
    expect(Math.abs(intro!.y)).toBeLessThan(2);
    await page.screenshot({ path: `/tmp/home-refined-intro-${viewport.width}.png` });
  });
}

test("touch swipe moves between full sections on mobile", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded" });
  const root = page.locator(".home-scenes");
  await expect(root).toHaveAttribute("data-mode", "scenes");
  const session = await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 195, y: 650 }],
  });
  for (const y of [570, 490, 410, 330]) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 195, y }],
    });
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(root).toHaveAttribute("data-scene", "1");
  const writing = await page.locator(".section.writing").boundingBox();
  expect(Math.abs(writing!.y)).toBeLessThan(2);
  await context.close();
});

test("article count fits the viewport without scrolling inside the writing section", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/#writing", { waitUntil: "load" });
  await expect(page.locator(".home-scenes")).toHaveAttribute("data-mode", "scenes");
  await expect(page.locator(".home-scenes")).toHaveAttribute("data-scene", "1");
  const firstPath = await page.locator(".article-item").first().getAttribute("href");
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 898, height: 751 },
    { width: 390, height: 844 },
    { width: 390, height: 600 },
  ]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => {
      return page.locator(".section.writing").evaluate((section) => {
        const visible = [...section.querySelectorAll<HTMLElement>(".article-item")]
          .filter((article) => !article.hidden);
        const composition = section.querySelector<HTMLElement>(".journal-composition")!;
        const top = composition.getBoundingClientRect().top;
        const bottom = innerHeight - parseFloat(getComputedStyle(composition).paddingBottom);
        return visible.length > 0 && visible.every((article) =>
          article.getBoundingClientRect().bottom - top <= bottom + 1,
        );
      });
    }).toBe(true);
    const visibleCount = await page.locator(".article-item:visible").count();
    expect(visibleCount).toBeLessThanOrEqual(6);
    await expect(page.locator(".article-item:visible").first()).toHaveAttribute("href", firstPath!);
    await expect(page.locator(".section.writing")).toHaveClass(/fp-noscroll/);
    await expect.poll(async () => {
      const composition = await page.locator(".journal-composition").boundingBox();
      return Math.abs(composition!.y);
    }).toBeLessThan(2);
    await page.screenshot({ path: `/tmp/home-fitted-articles-${viewport.width}-${viewport.height}.png` });
  }
  await page.mouse.move(195, 400);
  await page.mouse.wheel(0, 200);
  await expect(page.locator(".home-scenes")).toHaveAttribute("data-scene", "2");
});
