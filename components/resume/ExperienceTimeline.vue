<template>
  <!-- ===== Deck mode: scroll-driven 3D flip stack ===== -->
  <div
    v-if="mode === 'deck'"
    ref="wrapEl"
    class="exp-scroller"
    :style="{ height: `calc((100vh - 64px) + ${extraVh}vh)` }"
  >
    <div class="exp-sticky">
      <!-- pinned section header -->
      <div class="exp-pinhead">
        <span class="gutter-label inline-flex items-center">
          <span class="h2-rule" style="transform: scaleX(1)" />01 ·
          {{ $t("resume.heads.experience.kicker") }}
        </span>
        <h2 class="exp-pinhead-h2">
          {{ $t("resume.heads.experience.pre")
          }}<span class="font-fraunces italic font-normal text-accent">{{
            $t("resume.heads.experience.accent")
          }}</span
          >{{ $t("resume.heads.experience.post") }}
        </h2>
      </div>

      <div ref="numEl" class="exp-bignum" aria-hidden="true">01</div>

      <!-- company / title rail -->
      <div class="exp-rail">
        <div
          v-for="(e, i) in experiences"
          :key="i"
          :ref="(node) => setRailRef(node, i)"
          class="exp-rail-item"
          :class="{ on: i === 0 }"
        >
          <span class="err-idx">{{ pad(i + 1) }}</span>
          <span class="err-text">
            <span class="err-co">{{ e.company }}</span>
            <span class="err-title">{{ e.title }}</span>
          </span>
        </div>
      </div>

      <!-- card stage -->
      <div class="exp-stage">
        <article
          v-for="(e, i) in experiences"
          :key="i"
          :ref="(node) => setCardRef(node, i)"
          class="exp-card"
        >
          <ResumeExperienceCard :experience="e" :present-label="presentLabel" />
        </article>
      </div>

      <!-- progress + hint -->
      <div class="exp-progress" aria-hidden="true">
        <span ref="countEl" class="ep-count">01</span>
        <span class="ep-track"><span ref="barEl" class="ep-bar" /></span>
        <span class="ep-total">{{ pad(experiences.length) }}</span>
      </div>
      <div class="exp-hint" aria-hidden="true">
        <span>scroll</span><span class="exp-hint-tick" />
      </div>
    </div>
  </div>

  <!-- ===== Simple mode: stacked cards (mobile / reduced-motion / SSR) ===== -->
  <section v-else class="exp-simple-wrap">
    <div class="rs-head in-view">
      <span class="gutter-label inline-flex items-center">
        <span class="h2-rule" />01 · {{ $t("resume.heads.experience.kicker") }}
      </span>
      <h2 class="rs-h2">
        {{ $t("resume.heads.experience.pre")
        }}<span class="font-fraunces italic font-normal text-accent">{{
          $t("resume.heads.experience.accent")
        }}</span
        >{{ $t("resume.heads.experience.post") }}
      </h2>
    </div>
    <div class="exp-simple">
      <article
        v-for="(e, i) in experiences"
        :key="i"
        class="exp-card exp-card-static"
      >
        <ResumeExperienceCard :experience="e" :present-label="presentLabel" />
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import type { WorkExperience } from "~/types/resume";

interface Props {
  experiences: WorkExperience[];
}
const props = defineProps<Props>();

const { t } = useI18n();
const presentLabel = computed(() => t("resume.experience.present"));

// Scroll choreography (in viewport-height units): each card dwells (reading
// time) then flips over TRANS. Leading/trailing dwell give breathing room.
const DWELL = 0.72;
const TRANS = 0.7;
const N = computed(() => props.experiences.length);
const extraVh = computed(() => (N.value * DWELL + (N.value - 1) * TRANS) * 100);

const mode = ref<"simple" | "deck">("simple");

const wrapEl = ref<HTMLElement | null>(null);
const numEl = ref<HTMLElement | null>(null);
const barEl = ref<HTMLElement | null>(null);
const countEl = ref<HTMLElement | null>(null);
const cardRefs = ref<(HTMLElement | null)[]>([]);
const railRefs = ref<(HTMLElement | null)[]>([]);

function setCardRef(node: Element | null, i: number) {
  cardRefs.value[i] = node as HTMLElement | null;
}
function setRailRef(node: Element | null, i: number) {
  railRefs.value[i] = node as HTMLElement | null;
}

const pad = (n: number) => String(n).padStart(2, "0");

let raf = 0;
let kickInterval: ReturnType<typeof setInterval> | null = null;
let kickTimeout: ReturnType<typeof setTimeout> | null = null;

function render() {
  raf = 0;
  const wrap = wrapEl.value;
  if (!wrap) return;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  if (vh <= 0) return;
  const rect = wrap.getBoundingClientRect();
  const dist = wrap.offsetHeight - (vh - 64);
  let prog = dist > 0 ? (64 - rect.top) / dist : 0;
  prog = Math.max(0, Math.min(1, prog));

  const n = N.value;
  const totalU = n * DWELL + (n - 1) * TRANS;
  const posU = prog * totalU;
  let acc = 0;
  let p = n - 1;
  for (let i = 0; i < n; i++) {
    if (posU <= acc + DWELL) {
      p = i;
      break;
    }
    acc += DWELL;
    if (i < n - 1) {
      if (posU <= acc + TRANS) {
        let f = (posU - acc) / TRANS;
        f = f < 0 ? 0 : f > 1 ? 1 : f;
        const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
        p = i + e;
        break;
      }
      acc += TRANS;
    }
  }
  const active = Math.round(p);

  if (numEl.value) numEl.value.textContent = pad(active + 1);
  if (countEl.value) countEl.value.textContent = pad(active + 1);
  if (barEl.value) barEl.value.style.transform = `scaleX(${n > 1 ? prog : 1})`;
  railRefs.value.forEach((el, i) => {
    if (el) el.classList.toggle("on", i === active);
  });

  cardRefs.value.forEach((el, i) => {
    if (!el) return;
    const x = p - i;
    let tf: string;
    let op: number;
    let z: number;
    let show = true;
    if (x >= 0) {
      // leaving — lift up & away, flip back, fade out quickly
      const tt = Math.min(x, 1);
      const rotX = -85 * tt;
      const ty = -48 * tt;
      const tz = 95 * tt;
      const sc = 1 + 0.07 * tt;
      op = 1 - Math.min(1, tt / 0.6);
      tf = `translateY(${ty}%) translateZ(${tz}px) rotateX(${rotX}deg) scale(${sc})`;
      z = 500 + Math.round(x * 60);
      if (x > 1.03) show = false;
    } else {
      // arriving / waiting in the stack below
      const s = -x;
      const ty = Math.min(s, 3) * 4.5;
      const tz = -Math.min(s, 3) * 64;
      const sc = 1 - Math.min(s, 3) * 0.055;
      const rotX = Math.min(s, 3) * 3.5;
      op = s < 1 ? 1 : Math.max(0, 1 - (s - 1) * 0.7);
      tf = `translateY(${ty}%) translateZ(${tz}px) rotateX(${rotX}deg) scale(${sc})`;
      z = 500 - Math.round(s * 60);
      if (s > 2.4) show = false;
    }
    el.style.transform = tf;
    el.style.opacity = String(show ? op : 0);
    el.style.zIndex = String(z);
    el.style.visibility = show && op > 0.01 ? "visible" : "hidden";
    el.style.pointerEvents = Math.abs(x) < 0.5 ? "auto" : "none";
  });
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(render);
}

let mqNarrow: MediaQueryList | null = null;
let mqReduce: MediaQueryList | null = null;

function updateMode() {
  const narrow = mqNarrow?.matches ?? false;
  const reduce = mqReduce?.matches ?? false;
  mode.value = narrow || reduce ? "simple" : "deck";
}

function attachDeck() {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  // Kick a few renders to settle transforms once layout/refs are ready.
  requestAnimationFrame(render);
  kickInterval = setInterval(render, 200);
  kickTimeout = setTimeout(() => {
    if (kickInterval) clearInterval(kickInterval);
    kickInterval = null;
  }, 2000);
}

function detachDeck() {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (kickInterval) clearInterval(kickInterval);
  if (kickTimeout) clearTimeout(kickTimeout);
  kickInterval = null;
  kickTimeout = null;
}

function onModeChange() {
  const wasDeck = mode.value === "deck";
  updateMode();
  if (mode.value === "deck" && !wasDeck) {
    nextTick(attachDeck);
  } else if (mode.value !== "deck" && wasDeck) {
    detachDeck();
  }
}

onMounted(() => {
  mqNarrow = window.matchMedia("(max-width: 820px)");
  mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  updateMode();
  mqNarrow.addEventListener("change", onModeChange);
  mqReduce.addEventListener("change", onModeChange);
  if (mode.value === "deck") {
    // SPA navigation from a tall page (e.g. the homepage) can leave the window
    // scrolled before Nuxt resets it to top on the new route. The scroll-driven
    // deck would then compute an advanced progress on its first render and
    // visibly "rewind" as the page settles back to the top. Snap to top up
    // front so the first render starts from the real page head. (Back-nav scroll
    // restoration still wins: Nuxt re-applies savedPosition after page:finish.)
    if (window.scrollY > 0) window.scrollTo(0, 0);
    nextTick(attachDeck);
  }
});

onBeforeUnmount(() => {
  detachDeck();
  mqNarrow?.removeEventListener("change", onModeChange);
  mqReduce?.removeEventListener("change", onModeChange);
});
</script>

<style scoped>
/* shared rs-head (simple mode) */
.rs-head {
  margin-bottom: 30px;
}
.rs-h2 {
  font-weight: 700;
  font-size: clamp(26px, 3.6vw, 40px);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-top: 12px;
  color: var(--color-foreground);
}

/* ===== scroll-driven flip deck ===== */
.exp-scroller {
  position: relative;
}
.exp-sticky {
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(28px, 4vw, 72px);
  overflow: hidden;
}
.exp-pinhead {
  position: absolute;
  top: clamp(24px, 5vh, 52px);
  left: 0;
  z-index: 6;
  pointer-events: none;
}
.exp-pinhead-h2 {
  font-weight: 700;
  font-size: clamp(26px, 3.6vw, 40px);
  letter-spacing: -0.03em;
  margin-top: 12px;
  color: var(--color-foreground);
}
.exp-bignum {
  position: absolute;
  right: clamp(-10px, 1vw, 32px);
  top: 50%;
  transform: translateY(-50%);
  font-family: "Fraunces", "Noto Serif TC", Georgia, serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(190px, 32vw, 440px);
  line-height: 0.8;
  color: var(--color-accent);
  opacity: 0.07;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  font-variant-numeric: tabular-nums;
}
.exp-rail {
  flex: 0 0 auto;
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 22px;
  z-index: 5;
  max-width: 220px;
}
.exp-rail-item {
  display: flex;
  align-items: baseline;
  gap: 13px;
  opacity: 0.35;
  transition: opacity 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.exp-rail-item.on {
  opacity: 1;
}
.err-idx {
  font-family: "Fraunces", "Noto Serif TC", Georgia, serif;
  font-style: italic;
  font-weight: 300;
  font-size: 20px;
  line-height: 1;
  color: var(--color-accent);
  flex: 0 0 auto;
  width: 24px;
  font-variant-numeric: tabular-nums;
}
.err-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.err-co {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-foreground-muted);
  white-space: nowrap;
  width: fit-content;
}
.exp-rail-item.on .err-co {
  color: var(--color-accent);
}
.err-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-foreground-faint);
  letter-spacing: -0.01em;
  line-height: 1.25;
  transition: color 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.exp-rail-item.on .err-title {
  color: var(--color-foreground);
}

.exp-stage {
  position: relative;
  flex: 0 0 auto;
  width: min(640px, 76vw);
  height: min(540px, 74vh);
  perspective: 1700px;
  transform-style: preserve-3d;
  z-index: 2;
}

/* card container — shared by deck + simple modes */
.exp-card {
  position: absolute;
  inset: 0;
  background: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: clamp(24px, 3.2vw, 40px);
  box-shadow: 0 12px 32px rgba(44, 44, 44, 0.08);
  transform-origin: 50% 45%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform, opacity;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.exp-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-accent);
  opacity: 0.9;
}
/* static variant for the stacked fallback */
.exp-card-static {
  position: relative;
  inset: auto;
  box-shadow: 0 4px 16px rgba(44, 44, 44, 0.06);
  transition:
    border-color 0.3s,
    transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.exp-card-static:hover {
  border-color: var(--color-accent);
  transform: translateY(-3px);
}

.exp-progress {
  position: absolute;
  bottom: clamp(18px, 4vh, 38px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 5;
}
.ep-count {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--color-foreground);
  font-variant-numeric: tabular-nums;
}
.ep-track {
  width: clamp(110px, 20vw, 240px);
  height: 1px;
  background: var(--color-border);
  position: relative;
  overflow: hidden;
}
.ep-bar {
  position: absolute;
  inset: 0;
  background: var(--color-accent);
  transform-origin: left;
  transform: scaleX(0);
}
.ep-total {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 13px;
  color: var(--color-foreground-muted);
}
.exp-hint {
  position: absolute;
  right: clamp(0px, 2vw, 40px);
  bottom: clamp(18px, 4vh, 38px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-foreground-faint);
  z-index: 5;
}
.exp-hint-tick {
  width: 1px;
  height: 30px;
  background: currentColor;
  animation: hintTick 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
  transform-origin: top;
}
@keyframes hintTick {
  0%,
  100% {
    transform: scaleY(0.4);
    opacity: 0.4;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* simple (stacked) fallback */
.exp-simple {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* hide the rail on mid widths to avoid overlap */
@media (max-width: 1040px) {
  .exp-rail {
    display: none;
  }
}
</style>
