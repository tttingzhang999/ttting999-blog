import { gsap } from "gsap";
import type { HomeArticle } from "./articles";

/** Metadata choreography; all gold geometry is drawn by the persistent filament. */
export function articleTimeline(
  root: HTMLElement,
  articles: readonly HomeArticle[],
  complete: () => void,
  flow: {
    scan: (progress: number, count: number) => void;
    finishScan: () => void;
  },
) {
  const stage = root.querySelector<HTMLElement>(".article-panorama")!;
  const w = innerWidth,
    h = innerHeight;
  stage.replaceChildren();
  const entries = articles.map((article, index) => {
    const node = document.createElement("div");
    node.className = "timeline-node";
    const time = document.createElement("time");
    time.textContent = article.date.replaceAll("-", ".");
    time.dateTime = article.date;
    const title = document.createElement("div");
    title.className = "timeline-title";
    title.textContent = article.title;
    node.append(time, title);
    stage.append(node);
    return {
      node,
      x: w * 0.5 + index * w * 0.37,
      y: h * 0.53 + Math.sin(index * 0.8) * h * 0.055,
    };
  });
  const driver = { progress: 0 };
  const update = () => flow.scan(driver.progress, articles.length);
  update();
  entries.forEach((entry) => {
    gsap.set(entry.node, {
      x: entry.x + 18,
      y: entry.y - 18,
      width: w * 0.35,
      opacity: 0,
    });
  });
  const composition = root.querySelector(".journal-composition");
  const journey = Math.min(6, Math.max(3.7, articles.length * 0.36));
  const end = journey + 0.3;
  const tl = gsap.timeline({ onComplete: complete });
  tl.set(stage, { autoAlpha: 1 }).set(composition, { opacity: 0 });
  tl.to(
    driver,
    { progress: 1, duration: journey, ease: "power1.inOut", onUpdate: update },
    0.15,
  );
  const offset = entries.at(-1)!.x - w * 0.43;

  entries.forEach((entry, i) => {
    tl.to(
      entry.node,
      { opacity: 1, duration: 0.38 },
      (i / Math.max(1, entries.length - 1)) * (journey - 0.8),
    );
    tl.to(
      entry.node,
      { x: entry.x + 18 - offset, duration: journey, ease: "power1.inOut" },
      0.15,
    );
  });
  tl.call(() => flow.finishScan(), [], end);
  // Keep both layouts fixed: retire the scan before revealing the real links.
  tl.to(stage, { autoAlpha: 0, duration: 0.55, ease: "power1.inOut" }, end);
  tl.to(
    composition,
    { opacity: 1, duration: 0.85, ease: "power1.inOut" },
    end + 0.65,
  );
  return tl;
}
