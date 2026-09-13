import { test, expect } from "@playwright/test";

test("ambient light fades across entry, completion, skip and scene interruption", async ({
  page,
}) => {
  test.setTimeout(45000);
  await page.emulateMedia({colorScheme:"dark"});
  await page.goto("/en");
  const root = page.locator(".home-scenes");
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await page.evaluate(() => {
    const samples: number[] = [];
    Object.assign(window, { backgroundSamples: samples });
    function sample() {
      const light = document.querySelector(".home-scenes .light");
      if (light) samples.push(Number(getComputedStyle(light).opacity));
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  const go = async (anchor: string) => {
    await page.locator(`nav [data-go="${anchor}"]`).click();
    await expect(root).toHaveAttribute(
      "data-scene",
      String(["intro", "writing", "practice"].indexOf(anchor)),
    );
  };
  await go("writing");
  await expect(root).toHaveAttribute("data-journal-intro", "done", {
    timeout: 9000,
  });
  await page.waitForTimeout(1100);
  await go("practice");
  await go("intro");
  await go("writing");
  await page.locator("[data-skip]").click();
  await page.waitForTimeout(1100);
  await go("intro");
  await go("writing");
  await page.waitForTimeout(150);
  await go("practice");
  await page.waitForTimeout(1100);
  const values = await page.evaluate(
    () => (window as any).backgroundSamples as number[],
  );
  const maxStep = Math.max(
    ...values.slice(1).map((v, i) => Math.abs(v - values[i]!)),
  );
  expect(
    maxStep,
    "background must not switch brightness in a single frame",
  ).toBeLessThan(0.18);
  expect(values.filter((v) => v > 0.15 && v < 0.95).length).toBeGreaterThan(15);
  await expect(page.locator(".home-scenes .light")).toHaveCSS("opacity", "1");
  await expect(root).toHaveCSS("background-color", "rgb(24, 26, 27)");
  for (const section of await page.locator(".section").all())
    await expect(section).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".home-scenes .light")).toHaveCSS("transition-duration", "0s");
});
