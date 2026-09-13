import { test, expect } from "@playwright/test";

test("scan exits without relocating or resizing titles; static list only fades in", async ({
  page,
}) => {
  await page.goto("/en");
  const root = page.locator(".home-scenes");
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await page.locator('nav [data-go="writing"]').click();
  await expect(root).toHaveAttribute("data-journal-intro", "playing");
  const total = await page.locator(".timeline-node").count();
  const journey = Math.min(6, Math.max(3.7, total * 0.36));
  await page.waitForTimeout((journey + 0.2) * 1000);
  const read = () =>
    page.evaluate(() => {
      const node = document.querySelector<HTMLElement>(
        ".timeline-node:last-child",
      )!;
      const title = node.querySelector<HTMLElement>(".timeline-title")!;
      const item = document.querySelector<HTMLElement>(".article-item")!;
      return {
        y: node.getBoundingClientRect().y,
        width: node.getBoundingClientRect().width,
        font: getComputedStyle(title).fontSize,
        itemY: item.getBoundingClientRect().y,
      };
    });
  const before = await read();
  await page.waitForTimeout(650);
  const middle = await read();
  await expect(root).toHaveAttribute("data-journal-intro", "done");
  const after = await read();
  for (const sample of [middle, after]) {
    expect(sample.font).toBe(before.font);
    expect(Math.abs(sample.y - before.y)).toBeLessThan(0.5);
    expect(Math.abs(sample.width - before.width)).toBeLessThan(0.5);
    expect(Math.abs(sample.itemY - before.itemY)).toBeLessThan(0.5);
  }
  await expect(page.locator(".journal-composition")).toHaveCSS("opacity", "1");
  await expect(page.locator(".article-panorama")).toHaveCSS(
    "visibility",
    "hidden",
  );
});
