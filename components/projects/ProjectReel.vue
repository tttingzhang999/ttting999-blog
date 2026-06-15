<template>
  <div class="pr-frame">
    <div ref="reelEl" class="pr-reel">
      <div
        v-for="(p, i) in list"
        :key="p.id"
        class="pr-slide"
        :class="{ on: i === active }"
        :style="{ '--dist': Math.abs(i - active) } as any"
      >
        <ProjectsProjectSpread
          :project="p"
          :idx="i"
          :flip="i % 2 === 1"
          :is-active="i === active"
          :autoplay="!reduced"
          @open="$emit('open', p)"
        />
      </div>
    </div>

    <span class="pr-progress" aria-hidden="true">
      <span ref="fillEl" class="pr-progress-fill" />
    </span>

    <nav class="pr-contents" :aria-label="$t('projects.title')">
      <button
        v-for="(p, i) in list"
        :key="p.id"
        class="pr-c-item"
        :class="{ on: i === active }"
        @click="go(i)"
      >
        <span class="pr-c-name">{{ p.shortName || p.title }}</span>
        <span class="pr-c-idx">{{ String(i + 1).padStart(2, "0") }}</span>
        <span class="pr-c-tick" aria-hidden="true" />
      </button>
    </nav>

    <span
      class="pr-scrollhint"
      :class="{ hide: active >= list.length - 1 }"
      aria-hidden="true"
    >
      scroll<span class="pr-scrollhint-tick" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { Project } from "~/types/project";

const props = defineProps<{ list: Project[] }>();
defineEmits<{ open: [project: Project] }>();

const reelEl = ref<HTMLElement | null>(null);
const fillEl = ref<HTMLElement | null>(null);
const active = ref(0);

const reduced = ref(false);
const activeIdx = ref(0); // mirror used inside listeners without stale closures
let raf = 0;
let wheelLock = false;
let snapTimer: ReturnType<typeof setTimeout> | undefined;

function measure() {
  raf = 0;
  const reel = reelEl.value;
  if (!reel) return;
  const n = props.list.length;
  const h = reel.clientHeight || 1;
  const top = reel.scrollTop;
  const max = Math.max(1, reel.scrollHeight - h);
  const a = Math.max(0, Math.min(n - 1, Math.round(top / h)));
  if (a !== activeIdx.value) {
    activeIdx.value = a;
    active.value = a;
  }
  if (fillEl.value)
    fillEl.value.style.transform = `scaleY(${n > 1 ? top / max : 1})`;
  // depth falloff for neighbours
  const slides = reel.children;
  for (let i = 0; i < slides.length; i++) {
    (slides[i] as HTMLElement).style.setProperty(
      "--dist",
      String(Math.abs(i - top / h)),
    );
  }
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(measure);
}

function go(i: number) {
  const reel = reelEl.value;
  if (!reel) return;
  const t = Math.max(0, Math.min(props.list.length - 1, i));
  // scroll-snap: mandatory fights programmatic scrollTop (snaps back to 0);
  // disable it for the duration of the animated scroll, then restore.
  reel.style.scrollSnapType = "none";
  reel.scrollTo({
    top: t * reel.clientHeight,
    behavior: reduced.value ? "auto" : "smooth",
  });
  active.value = t;
  activeIdx.value = t;
  clearTimeout(snapTimer);
  snapTimer = setTimeout(
    () => {
      if (reel) reel.style.scrollSnapType = "";
    },
    reduced.value ? 0 : 680,
  );
}

function onWheel(e: WheelEvent) {
  if (Math.abs(e.deltaY) < 4) return;
  e.preventDefault();
  if (wheelLock) return;
  wheelLock = true;
  go(activeIdx.value + (e.deltaY > 0 ? 1 : -1));
  setTimeout(() => {
    wheelLock = false;
  }, 620);
}

function onKey(e: KeyboardEvent) {
  if (e.key === "ArrowDown" || e.key === "PageDown") {
    e.preventDefault();
    go(activeIdx.value + 1);
  } else if (e.key === "ArrowUp" || e.key === "PageUp") {
    e.preventDefault();
    go(activeIdx.value - 1);
  }
}

function onReducedChange(e: MediaQueryListEvent) {
  reduced.value = e.matches;
}

let mql: MediaQueryList | undefined;

onMounted(() => {
  mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduced.value = mql.matches;
  mql.addEventListener("change", onReducedChange);

  const reel = reelEl.value;
  if (!reel) return;
  reel.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  measure();

  // wheel + keyboard snap one project per gesture (desktop, motion-on only)
  if (!reduced.value) {
    reel.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
  }
});

onBeforeUnmount(() => {
  mql?.removeEventListener("change", onReducedChange);
  const reel = reelEl.value;
  reel?.removeEventListener("scroll", onScroll);
  reel?.removeEventListener("wheel", onWheel);
  window.removeEventListener("resize", onScroll);
  window.removeEventListener("keydown", onKey);
  if (raf) cancelAnimationFrame(raf);
  clearTimeout(snapTimer);
});
</script>

<style scoped>
.pr-frame {
  position: relative;
  height: calc(100vh - 64px);
  min-height: 560px;
}
.pr-reel {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  overscroll-behavior: contain;
}
.pr-reel::-webkit-scrollbar {
  display: none;
}
.pr-slide {
  height: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: grid;
  place-items: center;
  padding: clamp(20px, 3vh, 48px) clamp(96px, 11vw, 200px)
    clamp(20px, 3vh, 48px) var(--gutter);
}
.pr-slide :deep(.pr-spread) {
  opacity: calc(1 - clamp(0, var(--dist, 0), 1) * 0.85);
  transform: translateY(calc(clamp(-1, calc(0px - var(--dist, 0)), 1) * 22px));
  transition:
    opacity 0.55s var(--ease-out-expo),
    transform 0.55s var(--ease-out-expo);
}
.pr-slide.on :deep(.pr-media) {
  border-color: color-mix(
    in oklab,
    var(--color-accent) 30%,
    var(--color-border)
  );
}
.pr-slide.on :deep(.pr-media):hover .pr-shot.on {
  transform: scale(1.04);
  transition: transform 0.7s var(--ease-out-expo);
}

/* Right progress rail */
.pr-progress {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 2px;
  background: var(--color-hairline);
  z-index: 6;
  pointer-events: none;
}
.pr-progress-fill {
  position: absolute;
  inset: 0;
  background: var(--color-accent);
  transform-origin: top;
  transform: scaleY(0);
}

/* Right index rail */
.pr-contents {
  position: absolute;
  top: 50%;
  right: clamp(18px, 2.4vw, 40px);
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 5;
}
.pr-c-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 7px 0;
  text-align: right;
  opacity: 0.4;
  transition: opacity 0.3s var(--ease-out-expo);
}
.pr-c-item:hover {
  opacity: 0.8;
}
.pr-c-item.on {
  opacity: 1;
}
.pr-c-idx {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-foreground-faint);
  font-variant-numeric: tabular-nums;
  transition: color 0.3s;
}
.pr-c-item.on .pr-c-idx {
  color: var(--color-accent);
}
.pr-c-name {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-foreground);
  white-space: nowrap;
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    max-width 0.4s var(--ease-out-expo),
    opacity 0.3s;
}
.pr-c-item:hover .pr-c-name,
.pr-c-item.on .pr-c-name {
  max-width: 160px;
  opacity: 1;
}
.pr-c-tick {
  width: 18px;
  height: 1px;
  background: currentColor;
  color: var(--color-border);
  flex: 0 0 auto;
  transition:
    width 0.3s var(--ease-out-expo),
    background 0.3s;
}
.pr-c-item.on .pr-c-tick {
  width: 30px;
  background: var(--color-accent);
}

/* Scroll hint */
.pr-scrollhint {
  position: absolute;
  bottom: clamp(20px, 4vh, 38px);
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-foreground-faint);
  z-index: 4;
  transition: opacity 0.4s;
}
.pr-scrollhint.hide {
  opacity: 0;
  pointer-events: none;
}
.pr-scrollhint-tick {
  width: 1px;
  height: 30px;
  background: currentColor;
  position: relative;
  overflow: hidden;
}
.pr-scrollhint-tick::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--color-accent);
  animation: prTick 1.9s var(--ease-out-expo) infinite;
  transform-origin: top;
}
@keyframes prTick {
  0%,
  100% {
    transform: scaleY(0.12);
    opacity: 0.35;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* Mobile / reduced-motion fallback: a normal vertical document */
@media (max-width: 900px) {
  .pr-frame {
    height: auto;
  }
  .pr-reel {
    height: auto;
    scroll-snap-type: none;
    overflow: visible;
  }
  .pr-slide {
    height: auto;
    min-height: calc(100vh - 64px);
    padding: 40px var(--gutter) 64px;
    scroll-snap-stop: normal;
  }
  .pr-slide :deep(.pr-spread) {
    opacity: 1 !important;
    transform: none !important;
  }
  .pr-contents,
  .pr-progress,
  .pr-scrollhint {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pr-reel {
    scroll-behavior: auto;
  }
  .pr-slide :deep(.pr-spread),
  .pr-progress-fill,
  .pr-c-tick,
  .pr-c-name {
    transition: none;
  }
  .pr-scrollhint-tick::after {
    animation: none;
  }
}
</style>
