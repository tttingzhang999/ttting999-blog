import { test, expect } from "@playwright/test";

test("destination text never shows and then resets on scene arrival", async ({
  page,
}) => {
  await page.goto("/en");
  const root = page.locator(".home-scenes");
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await page.evaluate(() => {
    const rows: {
      scene: string | undefined;
      playing: string | undefined;
      article: number;
      hero: number;
      practice: number;
    }[] = [];
    Object.assign(window, { textFrames: rows });
    const opacity = (selector: string) => {
      let e = document.querySelector(selector);
      let value = 1;
      while (e && e !== document.body) {
        value *= Number(getComputedStyle(e).opacity);
        e = e.parentElement;
      }
      return value;
    };
    let recording = false;
    document.addEventListener('click', event => {
      if ((event.target as Element).closest('nav [data-go="writing"]')) { recording = true; rows.length = 0; }
    }, true);
    const sample = () => {
      if (recording) rows.push({
        scene:
          document.querySelector(".home-scenes")?.getAttribute("data-scene") ??
          undefined,
        playing:
          document
            .querySelector(".home-scenes")
            ?.getAttribute("data-journal-intro") ?? undefined,
        article: opacity(".article-item"),
        hero: opacity(".word"),
        practice: opacity(".practice-heading"),
      });
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.locator('nav [data-go="writing"]').click();
  await page.waitForTimeout(1300);
  const entry = await page.evaluate(
    () => (window as any).textFrames as { article: number }[],
  );
  // The list must be hidden from the first scrolling frame, not only after arrival.
  expect(entry.length).toBeGreaterThan(10);
  expect(entry.every((row) => row.article < 0.01)).toBe(true);
  await page.locator("[data-skip]").click();
  await page.evaluate(() => {
    (window as any).textFrames.length = 0;
  });
  await page.locator('nav [data-go="intro"]').click();
  await page.waitForTimeout(1900);
  expect(
    await page.evaluate(() =>
      (window as any).textFrames.every((r: { hero: number }) => r.hero > 0.99),
    ),
  ).toBe(true);
  await page.evaluate(() => {
    (window as any).textFrames.length = 0;
  });
  await page.locator('nav [data-go="practice"]').click();
  await page.waitForTimeout(1900);
  expect(
    await page.evaluate(() =>
      (window as any).textFrames.every(
        (r: { practice: number }) => r.practice > 0.99,
      ),
    ),
  ).toBe(true);
});

test("leaving scan does not flash the static list; direct entry remains readable", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-mode",
    "scenes",
  );
  await page.locator('nav [data-go="writing"]').click();
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-journal-intro",
    "playing",
  );
  await page.locator('nav [data-go="practice"]').click();
  await page.waitForTimeout(150);
  expect(
    await page
      .locator(".journal-composition")
      .evaluate((e) => Number(getComputedStyle(e).opacity)),
  ).toBeLessThan(0.01);
  await expect(page.locator(".home-scenes")).toHaveAttribute("data-scene", "2");
  await page.goto("/en#writing");
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-mode",
    "scenes",
  );
  await expect(page.locator(".home-scenes")).toHaveAttribute(
    "data-journal-intro",
    "done",
  );
  await expect(page.locator(".journal-composition")).toHaveCSS("opacity", "1");
});
