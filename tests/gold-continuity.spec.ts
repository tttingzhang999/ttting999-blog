import { test, expect } from "@playwright/test";

test("one continuously visible line survives scene bridges, scan exit, focus and interruption", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const audit: { time: number; points: number[][]; alpha: number }[] = [];
    Object.assign(window, { goldAudit: audit });
    const proto = CanvasRenderingContext2D.prototype;
    const original = {
      clear: proto.clearRect,
      move: proto.moveTo,
      line: proto.lineTo,
      stroke: proto.stroke,
    };
    let points: number[][] = [],
      first = true;
    let latest: number[][] = [];
    function sample(time: number) {
      const canvas = document.querySelector("#continuity");
      if (canvas && latest.length)
        audit.push({
          time,
          points: latest,
          alpha: Number(getComputedStyle(canvas).opacity),
        });
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
    proto.clearRect = function (...args) {
      if (this.canvas.id === "continuity") {
        first = true;
        points = [];
      }
      return original.clear.apply(this, args);
    };
    proto.moveTo = function (x, y) {
      if (this.canvas.id === "continuity" && first) points = [[x, y]];
      return original.move.call(this, x, y);
    };
    proto.lineTo = function (x, y) {
      if (this.canvas.id === "continuity" && first) points.push([x, y]);
      return original.line.call(this, x, y);
    };
    proto.stroke = function (path?: Path2D) {
      if (this.canvas.id === "continuity" && first) {
        first = false;
        latest = points;
      }
      return path
        ? original.stroke.call(this, path)
        : (original.stroke as () => void).call(this);
    };
  });
  await page.goto("/en");
  const root = page.locator(".home-scenes");
  await expect(root).toHaveAttribute("data-mode", "scenes");
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    (window as any).goldAudit.length = 0;
  });
  await page.locator('nav [data-go="writing"]').click();
  await expect(root).toHaveAttribute("data-journal-intro", "playing");
  await expect(page.locator("#continuity")).toHaveCSS("opacity", "1");
  await expect(page.locator(".timeline-geometry")).toHaveCount(0);
  await page.waitForTimeout(4500);
  await expect(page.locator("#continuity")).toHaveCSS("opacity", "1");
  await expect(root).toHaveAttribute("data-journal-intro", "done");
  await page.locator(".article-item").nth(4).focus();
  await page.waitForTimeout(200);
  await page.locator('nav [data-go="practice"]').click();
  await expect(root).toHaveAttribute("data-scene", "2");
  await page.locator('[data-project="promptlingo"]').click();
  await page.waitForTimeout(200);
  await page.locator('nav [data-go="intro"]').click();
  await expect(root).toHaveAttribute("data-scene", "0");
  await page.locator('nav [data-go="writing"]').click();
  await expect(root).toHaveAttribute("data-journal-intro", "playing");
  await page.locator("[data-skip]").click();
  await page.waitForTimeout(700);
  const samples = await page.evaluate(
    () =>
      (window as any).goldAudit as {
        time: number;
        points: number[][];
        alpha: number;
      }[],
  );
  expect(samples.length).toBeGreaterThan(100);
  expect(samples.every((s) => s.alpha > 0.95)).toBe(true);
  let maximumSpeed = 0;
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1]!,
      b = samples[i]!;
    if (b.time - a.time > 80) continue;
    const dt = Math.max(8, b.time - a.time) / 1000;
    for (let j = 0; j < Math.min(a.points.length, b.points.length); j++) {
      maximumSpeed = Math.max(
        maximumSpeed,
        Math.hypot(
          b.points[j]![0]! - a.points[j]![0]!,
          b.points[j]![1]! - a.points[j]![1]!,
        ) / dt,
      );
    }
  }
  await test.info().attach("gold-frame-samples", {body: JSON.stringify({maximumSpeed,samples}),contentType:"application/json"});
  expect(
    maximumSpeed,
    "no control-point teleport between adjacent rendered frames",
  ).toBeLessThan(6000);
  await page.screenshot({ path: "/tmp/gold-continuity-fixed.png" });
});
