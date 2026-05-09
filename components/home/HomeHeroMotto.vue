<template>
  <section id="hero" class="hero relative min-h-screen flex flex-col">
    <div
      class="absolute top-6 left-8 sm:left-12 lg:left-20 gutter-label flex items-center in-view"
    >
      <span class="h2-rule" />01 · Motto
    </div>

    <div
      ref="heroStageEl"
      class="hero-stage flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-20"
    >
      <h1 ref="mottoStackEl" class="motto-stack" :aria-label="mottoAria">
        <span class="motto-base" aria-hidden="true">
          <span class="motto-line">{{ $t("home.motto.verb") }}</span>
          <span class="motto-line motto-and">{{ $t("home.motto.and") }}</span>
          <span class="motto-line"
            >{{ $t("home.motto.execute")
            }}<span class="motto-dot">.</span></span
          >
        </span>
        <span class="motto-reveal" aria-hidden="true">
          <span class="motto-line">{{ $t("home.motto.verb") }}</span>
          <span class="motto-line motto-and">{{ $t("home.motto.and") }}</span>
          <span class="motto-line"
            >{{ $t("home.motto.execute")
            }}<span class="motto-dot">.</span></span
          >
        </span>
      </h1>
    </div>

    <div
      class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground-faint pointer-events-none"
    >
      <span class="gutter-label">scroll</span>
      <span class="block w-px h-10 bg-current" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const { t } = useI18n();

const heroStageEl = ref<HTMLElement | null>(null);
const mottoStackEl = ref<HTMLElement | null>(null);

const mottoAria = computed(
  () =>
    `${t("home.motto.verb")} ${t("home.motto.and")} ${t("home.motto.execute")}.`,
);

let cleanupFns: Array<() => void> = [];

function applyMottoCursor(e: MouseEvent) {
  const stack = mottoStackEl.value;
  if (!stack) return;
  const r = stack.getBoundingClientRect();
  stack.style.setProperty("--x", `${e.clientX - r.left}px`);
  stack.style.setProperty("--y", `${e.clientY - r.top}px`);
  (stack as any).__lastMove = performance.now();
}

onMounted(() => {
  const prefersReduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = heroStageEl.value;
  const stack = mottoStackEl.value;
  if (!stage || !stack || prefersReduce) return;

  stage.addEventListener("mousemove", applyMottoCursor);
  stage.addEventListener("mouseenter", applyMottoCursor);

  let raf = 0;
  let inView = true;
  let running = false;

  const drift = (now: number) => {
    const last = (stack as any).__lastMove ?? 0;
    if (performance.now() - last > 1400) {
      const r = stack.getBoundingClientRect();
      const cx = r.width / 2;
      const cy = r.height / 2;
      const ax = Math.sin(now * 0.0006) * r.width * 0.34;
      const ay = Math.cos(now * 0.00085) * r.height * 0.3;
      stack.style.setProperty("--x", `${cx + ax}px`);
      stack.style.setProperty("--y", `${cy + ay}px`);
    }
    raf = requestAnimationFrame(drift);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(drift);
  };
  const stop = () => {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
  };
  const sync = () => {
    if (inView && !document.hidden) start();
    else stop();
  };

  const io = new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting);
      sync();
    },
    { threshold: 0 },
  );
  io.observe(stage);

  const onVis = () => sync();
  document.addEventListener("visibilitychange", onVis);

  sync();

  cleanupFns.push(() => {
    stage.removeEventListener("mousemove", applyMottoCursor);
    stage.removeEventListener("mouseenter", applyMottoCursor);
    document.removeEventListener("visibilitychange", onVis);
    io.disconnect();
    stop();
  });
});

onBeforeUnmount(() => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
});
</script>

<style scoped>
@property --r {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

.hero-stage {
  position: relative;
  --x: 50%;
  --y: 50%;
}

.motto-stack {
  position: relative;
  font-weight: 800;
  letter-spacing: -0.06em;
  line-height: 0.86;
  font-size: clamp(72px, 17vw, 260px);
  text-align: center;
  user-select: none;
  font-family: "Inter", "Noto Sans TC", system-ui, sans-serif;
}
.motto-stack .motto-line {
  display: block;
}
.motto-stack .motto-and {
  font-family: "Fraunces", "Noto Serif TC", serif;
  font-weight: 300;
  font-style: italic;
  font-size: 0.42em;
  letter-spacing: -0.01em;
  margin: 0.1em 0;
  color: var(--color-accent);
}
.motto-stack .motto-and::before,
.motto-stack .motto-and::after {
  content: "";
  display: inline-block;
  width: 0.9em;
  height: 1px;
  background: var(--color-foreground-faint);
  vertical-align: middle;
  margin: 0 0.55em 0.18em;
}
.motto-stack .motto-dot {
  color: var(--color-accent);
}
.motto-base {
  display: block;
  position: relative;
  color: transparent;
  -webkit-text-stroke: 1.4px
    color-mix(in oklab, var(--color-foreground) 22%, transparent);
}
.motto-reveal {
  position: absolute;
  inset: 0;
  display: block;
  color: var(--color-foreground);
  pointer-events: none;
  --r: 0px;
  -webkit-mask-image: radial-gradient(
    circle var(--r) at var(--x) var(--y),
    #000 55%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle var(--r) at var(--x) var(--y),
    #000 55%,
    transparent 100%
  );
  filter: url(#hero-ink);
  animation: mottoEntry 1.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0.25s both;
}
@keyframes mottoEntry {
  0% {
    --r: 0px;
  }
  100% {
    --r: 560px;
  }
}

@media (max-width: 720px) {
  .motto-stack {
    font-size: clamp(58px, 22vw, 120px);
  }
  .motto-stack .motto-and::before,
  .motto-stack .motto-and::after {
    width: 0.6em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .motto-reveal {
    -webkit-mask-image: none;
    mask-image: none;
    filter: none;
    animation: none;
  }
  .motto-base {
    -webkit-text-stroke: 0;
    color: var(--color-foreground);
  }
}
</style>
