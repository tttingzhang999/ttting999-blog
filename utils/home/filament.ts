import { advanceMotion, type Motion } from "./motion";

export function createFilament(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("#continuity")!;
  const context = canvas.getContext("2d");
  const abort = new AbortController();
  const signal = abort.signal;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const anchors = ["intro", "writing", "practice"];
  let state = {
    scene: Math.max(0, anchors.indexOf(location.hash.slice(1))),
    article: 0,
    project: 0,
  };
  let size = { width: innerWidth, height: innerHeight };
  let scan: { progress: number; count: number } | undefined;
  let cursor = 0,
    frame = 0,
    previous = 0,
    disposed = false;
  let points: { x: Motion; y: Motion }[] = [];
  let head: Motion = { position: 0.85, velocity: 0 };
  let ticks: Motion = { position: 0, velocity: 0 };
  const count = 100;
  function contentBox(selector: string, scene: number) {
    const element = root.querySelector<HTMLElement>(selector)!;
    const rect = element.getBoundingClientRect();
    const section = root
      .querySelectorAll(".section")
      [scene]!.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y - (root.dataset.mode === "scenes" ? section.y : 0),
      width: rect.width,
      height: rect.height,
    };
  }
  function targetPaths() {
    const { width: w, height: h } = size;
    if (state.scene === 0)
      return [0, 1, 2].map((i) => [
        -0.08 * w,
        0.78 * h,
        0.17 * w,
        0.83 * h,
        0.08 * w,
        0.17 * h,
        0.56 * w,
        0.2 * h,
        0.96 * w,
        0.22 * h,
        0.54 * w,
        0.84 * h,
        1.09 * w,
        (0.65 + (i - 1) * 0.012) * h,
      ]);
    if (state.scene === 1) {
      const items = root.querySelectorAll<HTMLElement>(".article-item");
      const selected = items[Math.min(state.article, items.length - 1)];
      const selector = selected
        ? '[data-article="' + selected.dataset.article + '"]'
        : ".article-list";
      const item = contentBox(selector, 1),
        x = item.x - 24,
        y = item.y + 24;
      return [0, 1, 2].map((i) => [
        -0.06 * w,
        0.82 * h,
        0.3 * w,
        0.96 * h,
        x - 100,
        y + 220,
        x - 75,
        y + 80,
        x - 50,
        y - 60,
        x - 38,
        y + (i - 1) * 3,
        x,
        y,
      ]);
    }
    const key = ["moniit", "eatswiper", "promptlingo"][state.project];
    const item = contentBox(`[data-project="${key}"]`, 2);
    const x = item.x - 22,
      y = item.y + item.height * 0.52;
    return [0, 1, 2].map((i) => [
      1.04 * w,
      0.05 * h,
      0.61 * w,
      -0.05 * h,
      0.7 * w,
      0.69 * h,
      0.42 * w,
      0.71 * h,
      0.16 * w,
      0.74 * h,
      x - 68,
      y + (i - 1) * 4,
      x,
      y,
    ]);
  }
  function target() {
    const w = size.width,
      h = size.height;
    if (scan) {
      const offset =
        Math.max(0, scan.count - 1) * w * 0.37 * scan.progress +
        w * 0.07 * scan.progress;
      return Array.from({ length: count + 1 }, (_, i) => {
        const x = w * (-0.1 + (1.2 * i) / count);
        return {
          x,
          y:
            h * 0.53 +
            Math.sin(((x + offset - w * 0.5) / (w * 0.37)) * 0.8) * h * 0.055,
        };
      });
    }
    const path = targetPaths()[1]!;
    return Array.from({ length: count + 1 }, (_, i) => {
      const t = i / count,
        start = t < 0.5 ? 0 : 6,
        u = t < 0.5 ? t * 2 : (t - 0.5) * 2,
        v = 1 - u;
      return {
        x:
          v ** 3 * path[start]! +
          3 * v * v * u * path[start + 2]! +
          3 * v * u * u * path[start + 4]! +
          u ** 3 * path[start + 6]! +
          (state.scene === 0 ? Math.sin(Math.PI * t) * cursor * 45 : 0),
        y:
          v ** 3 * path[start + 1]! +
          3 * v * v * u * path[start + 3]! +
          3 * v * u * u * path[start + 5]! +
          u ** 3 * path[start + 7]!,
      };
    });
  }
  function at(t: number) {
    const p = Math.max(0, Math.min(count, t * count)),
      a = Math.floor(p),
      b = Math.min(count, a + 1),
      u = p - a;
    return {
      x: points[a]!.x.position * (1 - u) + points[b]!.x.position * u,
      y: points[a]!.y.position * (1 - u) + points[b]!.y.position * u,
    };
  }
  function draw() {
    if (!context || !points.length) return;
    const dark = document.documentElement.classList.contains("dark");
    const amber = dark ? "#f2b55a" : "#94601b";
    context.clearRect(0, 0, size.width, size.height);
    const gradient = context.createLinearGradient(
      0,
      size.height * 0.7,
      size.width,
      size.height * 0.3,
    );
    gradient.addColorStop(0, dark ? "#acbdaa30" : "#52674f55");
    gradient.addColorStop(0.3, `${amber}88`);
    gradient.addColorStop(0.65, dark ? "#fff0c5d0" : "#94601bcc");
    gradient.addColorStop(1, `${amber}70`);
    for (const spread of [0, -5, 5, -12, 12]) {
      context.beginPath();
      points.forEach((p, i) => {
        const y = p.y.position + Math.sin((i / count) * Math.PI) * spread;
        if (i === 0) context.moveTo(p.x.position, y);
        else context.lineTo(p.x.position, y);
      });
      context.strokeStyle = gradient;
      context.lineWidth = spread === 0 ? 1.2 : 0.6;
      context.globalAlpha = spread === 0 ? 1 : 0.22;
      context.stroke();
    }
    if (scan && ticks.position > 0.01) {
      const offset =
        (Math.max(0, scan.count - 1) * size.width * 0.37 + size.width * 0.07) *
        scan.progress;
      context.globalAlpha = ticks.position * 0.7;
      context.strokeStyle = amber;
      context.lineWidth = 1;
      for (let i = 0; i < scan.count; i++) {
        const t =
          (size.width * 0.5 +
            i * size.width * 0.37 -
            offset +
            size.width * 0.1) /
          (size.width * 1.2);
        if (t < 0 || t > 1) continue;
        const p = at(t);
        context.beginPath();
        context.moveTo(p.x, p.y - 6);
        context.lineTo(p.x, p.y + 6);
        context.stroke();
      }
    }
    const p = at(head.position);
    context.globalAlpha = 1;
    const halo = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, 25);
    halo.addColorStop(0, dark ? "#fff4d9ee" : "#94601b99");
    halo.addColorStop(0.15, `${amber}99`);
    halo.addColorStop(1, `${amber}00`);
    context.fillStyle = halo;
    context.fillRect(p.x - 25, p.y - 25, 50, 50);
    context.beginPath();
    context.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    context.fillStyle = dark ? "#fff4dd" : "#754a11";
    context.fill();
  }
  function render(now: number) {
    frame = 0;
    const dt = previous ? (now - previous) / 1000 : 1 / 60;
    previous = now;
    const destination = target();
    const staticMode = reduced.matches;
    let moving = false;
    points = destination.map((p, i) => {
      const old = points[i];
      const x =
        !old || staticMode
          ? { position: p.x, velocity: 0 }
          : advanceMotion(old.x, p.x, dt, 8);
      const y =
        !old || staticMode
          ? { position: p.y, velocity: 0 }
          : advanceMotion(old.y, p.y, dt, 8);
      if (
        Math.abs(x.position - p.x) +
          Math.abs(y.position - p.y) +
          Math.abs(x.velocity) +
          Math.abs(y.velocity) >
        0.02
      )
        moving = true;
      return { x, y };
    });
    const lightTarget = scan
      ? (0.6 - 0.07 * scan.progress) / 1.2
      : state.scene === 0
        ? 0.85
        : 1;
    head = staticMode
      ? { position: lightTarget, velocity: 0 }
      : advanceMotion(head, lightTarget, dt);
    ticks = advanceMotion(ticks, scan ? 1 : 0, dt);
    if (
      Math.abs(head.position - lightTarget) + Math.abs(head.velocity) >
      0.0001
    )
      moving = true;
    if (Math.abs(ticks.position - (scan ? 1 : 0)) > 0.001) moving = true;
    draw();
    if (moving && !staticMode) requestRender();
    else previous = 0;
  }
  function requestRender() {
    if (!disposed && !document.hidden && !frame)
      frame = requestAnimationFrame(render);
  }
  function resize() {
    size = { width: innerWidth, height: innerHeight };
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.width * ratio);
    canvas.height = Math.round(size.height * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
    requestRender();
  }
  root.addEventListener(
    "articlevisual",
    (event) => {
      state = {
        ...state,
        article: (event as CustomEvent<{ index: number }>).detail.index,
      };
      requestRender();
    },
    { signal },
  );
  root.addEventListener(
    "projectvisual",
    (event) => {
      state = {
        ...state,
        project: (event as CustomEvent<{ index: number }>).detail.index,
      };
      requestRender();
    },
    { signal },
  );
  window.addEventListener(
    "pointermove",
    (event) => {
      if (state.scene !== 0 || reduced.matches || event.pointerType !== "mouse")
        return;
      cursor = event.clientX / size.width - 0.5;
      requestRender();
    },
    { signal, passive: true },
  );
  window.addEventListener("resize", resize, { signal, passive: true });
  window.addEventListener(
    "scroll",
    () => {
      if (root.dataset.mode === "reading") requestRender();
    },
    { signal, passive: true },
  );
  reduced.addEventListener("change", requestRender, { signal });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        previous = 0;
        requestRender();
      }
    },
    { signal },
  );
  document.fonts.ready.then(() => {
    if (!disposed) requestRender();
  });
  const themeObserver = new MutationObserver(draw);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  resize();
  return {
    scene(index: number, scanCount = 0) {
      if (index === state.scene && !scanCount) return;
      state = { ...state, scene: index };
      scan = scanCount ? { progress: 0, count: scanCount } : undefined;
      requestRender();
    },
    scan(progress: number, count: number) {
      scan = { progress, count };
      requestRender();
    },
    finishScan() {
      scan = undefined;
      requestRender();
    },
    destroy() {
      disposed = true;
      abort.abort();
      themeObserver.disconnect();
      cancelAnimationFrame(frame);
    },
  };
}
