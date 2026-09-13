import { test, expect } from "@playwright/test";

test("SSR publishes metadata and real article links without animation JavaScript", async ({
  browser,
}) => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto("/");
  await expect(page.locator(".article-item")).toHaveCount(5);
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
  await page.goto("/");
  const root = page.locator(".home-scenes");
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await page.locator('.scene-nav [data-go="writing"]').click();
  await expect(root).toHaveAttribute("data-journal-intro", "playing");
  const total = Number((await page.locator(".journal-count").textContent())!.split(" ")[0]);
  await expect(page.locator(".timeline-node")).toHaveCount(total);
  await page.waitForTimeout(1600);
  const stage = await page.locator(".article-panorama").boundingBox();
  expect(Math.abs(stage!.y)).toBeLessThan(2);
  await page.screenshot({ path: "/tmp/nuxt-home-timeline.png" });
  await expect(root).toHaveAttribute("data-journal-intro", "done", {
    timeout: 9000,
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
  await page.goto("/#writing");
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-mode",
    "reading",
  );
  await expect(page.locator(".article-item")).toHaveCount(5);
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-journal-intro",
    "done",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#writing");
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-mode",
    "reading",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/nuxt-home-mobile.png" });
});

test("locale routes retain localized interface and article links", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-mode",
    "scenes",
  );
  await expect(page.locator(".hero-statement")).toHaveText(
    "Think it through. Build it.",
  );
  await expect(page.locator(".article-item").first()).toHaveAttribute(
    "href",
    /^\/blog\//,
  );
  await page.goto("/ja");
  await expect(page.locator(".hero-statement")).toHaveText("考えて、つくる。");
});

test("keyboard entry and responsive mode switches settle without stale animation", async ({
  page,
}) => {
  await page.goto("/");
  const root = page.locator(".home-scenes");
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await page.keyboard.press("ArrowDown");
  await expect(root).toHaveAttribute("data-journal-intro", "playing");
  await page.setViewportSize({ width: 1440, height: 740 });
  await expect(root).toHaveAttribute("data-mode", "reading");
  await expect(root).toHaveAttribute("data-journal-intro", "done");
  await expect(page.locator("html")).not.toHaveClass(/fp-enabled/);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await expect(root).toHaveAttribute("data-scene", "1");
});
