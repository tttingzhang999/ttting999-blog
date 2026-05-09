<template>
  <section
    ref="aboutSectionEl"
    id="about"
    class="about-section"
    :class="{ 'is-revealed': aboutRevealed }"
  >
    <div class="about-stage px-8 sm:px-12 lg:px-20">
      <div
        class="gutter-label flex items-center"
        :class="{ 'in-view': aboutRevealed }"
      >
        <span class="h2-rule" />02 · About
      </div>

      <div class="identity-row flex items-center gap-5">
        <div
          class="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-hairline shrink-0"
          aria-hidden="true"
        >
          <NuxtImg
            src="/tuan_zmi.jpeg"
            alt=""
            class="w-full h-full object-cover object-bottom-right"
            width="64"
            height="64"
          />
        </div>
        <div class="min-w-0">
          <div
            class="text-foreground text-[18px] sm:text-[20px] font-medium leading-tight tracking-tight"
          >
            {{ $t("home.about.dateline") }}
          </div>
          <div class="gutter-label mt-2">{{ $t("home.about.role") }}</div>
        </div>
      </div>

      <div class="grid md:grid-cols-[1.5fr_1fr] gap-12 lg:gap-20 items-start">
        <div>
          <h2 class="about-title-stack">
            <span class="at-base" aria-hidden="true">
              {{ $t("home.about.titlePre")
              }}<span class="font-fraunces italic font-normal text-accent">{{
                $t("home.about.titleAccent")
              }}</span
              >{{ $t("home.about.titlePost") }}
            </span>
            <span class="at-reveal">
              {{ $t("home.about.titlePre")
              }}<span class="font-fraunces italic font-normal text-accent">{{
                $t("home.about.titleAccent")
              }}</span
              >{{ $t("home.about.titlePost") }}
            </span>
          </h2>
          <p
            class="about-body mt-6 sm:mt-8 text-[16px] sm:text-[17px] leading-[1.7] text-foreground-muted max-w-[600px]"
          >
            {{ $t("home.about.body") }}
          </p>
        </div>

        <div
          class="stat-slab grid grid-cols-2 gap-px bg-hairline border border-hairline"
        >
          <div
            v-for="(stat, i) in stats"
            :key="i"
            class="bg-surface p-5 sm:p-7"
          >
            <div
              class="font-fraunces font-light tabular-nums leading-none text-foreground"
              style="font-size: clamp(48px, 6vw, 76px)"
            >
              {{ stat.target === null ? "∞" : displayStat(i) }}
            </div>
            <div class="gutter-label mt-2">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const { t } = useI18n();
const { years, projectCount } = useSiteStats();

const { data: blogTotal } = await useAsyncData(
  "home-blog-total",
  async () => {
    try {
      const all = await queryCollection("blog")
        .where("draft", "<>", true)
        .all();
      return Array.isArray(all) ? all.length : 0;
    } catch (err) {
      console.error("[home] failed to count blog total:", err);
      return 0;
    }
  },
  { default: () => 0 },
);

const stats = computed<Array<{ target: number | null; label: string }>>(() => [
  { target: years.value, label: t("home.about.stats.years") },
  { target: projectCount.value, label: t("home.about.stats.projects") },
  { target: blogTotal.value ?? 0, label: t("home.about.stats.notes") },
  { target: null, label: t("home.about.stats.coffee") },
]);

const aboutSectionEl = ref<HTMLElement | null>(null);
const aboutRevealed = ref(false);
const animatedStats = ref<number[]>([0, 0, 0, 0]);

function displayStat(i: number) {
  return animatedStats.value[i] ?? 0;
}

function animateStats() {
  const targets = stats.value.map((s) =>
    typeof s.target === "number" ? s.target : 0,
  );
  const duration = 1100;
  const start = performance.now();
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const e = easeOut(t);
    animatedStats.value = targets.map((target) => Math.round(target * e));
    if (t < 1) requestAnimationFrame(tick);
    else animatedStats.value = targets;
  };
  requestAnimationFrame(tick);
}

let cleanupFns: Array<() => void> = [];

onMounted(() => {
  if (!aboutSectionEl.value) return;
  const prefersReduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduce) {
    aboutRevealed.value = true;
    animatedStats.value = stats.value.map((s) =>
      typeof s.target === "number" ? s.target : 0,
    );
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        aboutRevealed.value = true;
        animateStats();
        io.disconnect();
      }
    },
    { threshold: 0.18 },
  );
  io.observe(aboutSectionEl.value);
  cleanupFns.push(() => io.disconnect());
});

onBeforeUnmount(() => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
});
</script>

<style scoped>
.about-section {
  position: relative;
}
.about-stage {
  display: flex;
  flex-direction: column;
  gap: clamp(36px, 5.5vh, 64px);
  padding-top: clamp(72px, 10vh, 110px);
  padding-bottom: clamp(72px, 10vh, 110px);
}
.identity-row {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.7s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.about-section.is-revealed .identity-row {
  opacity: 1;
  transform: none;
}
.about-title-stack {
  position: relative;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  font-size: clamp(32px, 5.2vw, 64px);
  text-wrap: balance;
}
.about-title-stack .at-base {
  display: block;
  color: transparent;
}
.about-title-stack .at-reveal {
  position: absolute;
  inset: 0;
  color: var(--color-foreground);
  filter: url(#hero-ink);
  pointer-events: none;
  -webkit-mask-image: linear-gradient(115deg, #000 -30%, transparent -2%);
  mask-image: linear-gradient(115deg, #000 -30%, transparent -2%);
  transition:
    -webkit-mask-image 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s,
    mask-image 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s;
}
.about-section.is-revealed .at-reveal {
  -webkit-mask-image: linear-gradient(115deg, #000 100%, transparent 128%);
  mask-image: linear-gradient(115deg, #000 100%, transparent 128%);
}
.about-body {
  opacity: 0;
  transition: opacity 0.7s ease 0.6s;
}
.about-section.is-revealed .about-body {
  opacity: 1;
}
.stat-slab {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.85s;
}
.about-section.is-revealed .stat-slab {
  clip-path: inset(0 0% 0 0);
}

@media (prefers-reduced-motion: reduce) {
  .identity-row,
  .about-title-stack .at-reveal,
  .about-body,
  .stat-slab {
    transition: none !important;
  }
  .about-title-stack .at-reveal {
    -webkit-mask-image: none !important;
    mask-image: none !important;
    filter: none;
  }
}
</style>
