<template>
  <section
    v-if="reelTiles.length"
    ref="reelSectionEl"
    id="reel"
    class="reel-section"
  >
    <div ref="reelPinEl" class="reel-pin">
      <div ref="reelStageEl" class="reel-stage">
        <div
          class="reel-header px-8 sm:px-12 lg:px-20 flex items-end justify-between flex-wrap gap-y-6"
        >
          <div>
            <div
              class="gutter-label mb-2 flex items-center"
              :class="{ 'in-view': reelInView }"
            >
              <span class="h2-rule" />03 · Reel
            </div>
            <h2
              class="font-bold text-foreground"
              style="font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.03em"
            >
              {{ $t("home.reel.title") }}
            </h2>
          </div>
          <div
            class="reel-meta flex items-center gap-6 text-foreground-muted text-[13px]"
          >
            <div class="reel-counter" :class="{ 'is-on': reelCounterOn }">
              <span class="num-line">
                <span class="now">{{ String(reelIdx).padStart(2, "0") }}</span>
                <span class="sep">/</span>
                <span class="total">{{
                  String(reelTiles.length).padStart(2, "0")
                }}</span>
              </span>
              <span
                class="rail"
                :style="{ '--p': Math.max(8, reelProgress * 100) + '%' } as any"
              />
            </div>
          </div>
        </div>
        <div ref="reelTrackEl" class="reel-track">
          <NuxtLink
            v-for="(tile, i) in reelTiles"
            :key="tile.slug"
            :to="tile.to"
            class="reel-tile group"
            @pointermove="onTilePointerMove"
            @pointerleave="onTilePointerLeave"
          >
            <div class="tile-art" :class="{ 'placeholder-hatch': !tile.image }">
              <NuxtImg
                v-if="tile.image"
                :src="tile.image"
                :alt="tile.title"
                class="absolute inset-0 w-full h-full object-contain p-6"
                loading="lazy"
              />
              <div class="tile-label-tr">
                <span>{{ tile.slug }}</span>
                <span class="num">{{ String(i + 1).padStart(2, "0") }}</span>
              </div>
              <div
                v-if="!tile.image"
                class="absolute inset-0 grid place-items-center gutter-label !text-foreground-faint"
              >
                ◇ article preview
              </div>
            </div>
            <div class="tile-text pt-5">
              <h3
                class="tile-title font-semibold text-foreground tracking-tight line-clamp-2"
              >
                {{ tile.title }}
              </h3>
              <p
                class="tile-desc text-sm text-foreground-muted mt-1.5 leading-relaxed line-clamp-2"
              >
                {{ tile.desc }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const localePath = useLocalePath();

type ReelArticle = {
  path?: string;
  title?: string;
  description?: string;
  image?: string;
};

const { data: recentArticles } = await useAsyncData(
  "home-reel-articles",
  async () => {
    try {
      const rows = await queryCollection("blog")
        .where("draft", "<>", true)
        .order("date", "DESC")
        .limit(8)
        .all();
      return (rows ?? []) as ReelArticle[];
    } catch (err) {
      console.error("[home] failed to load recent articles:", err);
      return [] as ReelArticle[];
    }
  },
  { default: () => [] as ReelArticle[] },
);

const reelTiles = computed(() =>
  (recentArticles.value ?? []).map((a, i) => {
    const slug = a.path?.split("/").filter(Boolean).pop() ?? `article-${i + 1}`;
    return {
      slug,
      title: a.title ?? slug,
      desc: a.description ?? "",
      to: a.path ? localePath(a.path) : localePath("/blog"),
      image: a.image,
    };
  }),
);

const reelSectionEl = ref<HTMLElement | null>(null);
const reelPinEl = ref<HTMLElement | null>(null);
const reelStageEl = ref<HTMLElement | null>(null);
const reelTrackEl = ref<HTMLElement | null>(null);

const reelProgress = ref(0);
const reelIdx = ref(1);
const reelCounterOn = ref(false);
const reelInView = ref(false);

let prefersReduce = false;

function syncTrackPadding() {
  const track = reelTrackEl.value;
  if (!track) return;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  if (isMobile) {
    track.style.paddingInline = "";
    return;
  }
  const tile0 = track.children[0] as HTMLElement | undefined;
  if (!tile0) return;
  const tileW = tile0.offsetWidth;
  track.style.paddingInline = `calc(50% - ${tileW / 2}px)`;
}

function onScroll() {
  const pin = reelPinEl.value;
  const stage = reelStageEl.value;
  const track = reelTrackEl.value;
  const section = reelSectionEl.value;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  if (pin && stage && track && !isMobile && !prefersReduce) {
    const pRect = pin.getBoundingClientRect();
    const stageHeight = stage.offsetHeight;
    const distance = Math.max(1, pin.offsetHeight - stageHeight);
    const traveled = -pRect.top;
    const p = Math.max(0, Math.min(1, traveled / distance));
    const n = reelTiles.value.length;
    const tile0 = track.children[0] as HTMLElement | undefined;
    const tileW = tile0 ? tile0.offsetWidth : 0;
    const gap = 24;
    const step = tileW + gap;
    const activeFloat = p * Math.max(0, n - 1);
    track.style.transform = `translate3d(${-activeFloat * step}px, 0, 0)`;
    for (let i = 0; i < n; i++) {
      const child = track.children[i] as HTMLElement | undefined;
      if (child)
        child.style.setProperty("--dist", String(Math.abs(i - activeFloat)));
    }
    reelProgress.value = p;
    reelIdx.value = Math.min(n, Math.round(activeFloat) + 1);
    reelCounterOn.value = pRect.top <= 0 && pRect.bottom >= stageHeight;
  } else if (track) {
    track.style.transform = "";
    for (let i = 0; i < track.children.length; i++) {
      (track.children[i] as HTMLElement).style.removeProperty("--dist");
    }
    reelCounterOn.value = true;
  }
  if (!reelInView.value && section) {
    if (section.getBoundingClientRect().top < window.innerHeight * 0.85)
      reelInView.value = true;
  }
}

function onResize() {
  syncTrackPadding();
  onScroll();
}

function onTilePointerMove(e: PointerEvent) {
  if (prefersReduce) return;
  const el = e.currentTarget as HTMLElement | null;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const xN = (e.clientX - rect.left) / rect.width;
  const yN = (e.clientY - rect.top) / rect.height;
  el.style.setProperty("--mxN", String(xN));
  el.style.setProperty("--myN", String(yN));
  el.style.setProperty("--mx", `${xN * 100}%`);
  el.style.setProperty("--my", `${yN * 100}%`);
}

function onTilePointerLeave(_e: PointerEvent) {
  // Intentionally do not reset --mx/--my here.
  // Resetting causes the glow to snap to center while it is still fading out.
  // Letting the glow fade out at the cursor's last position feels natural,
  // and the next pointerenter will overwrite the variables before opacity ramps back up.
}

function onReelScrollMobile() {
  const track = reelTrackEl.value;
  if (!track) return;
  const max = track.scrollWidth - track.clientWidth;
  const p = max > 0 ? track.scrollLeft / max : 0;
  reelProgress.value = p;
  reelIdx.value = Math.min(
    reelTiles.value.length,
    Math.round(p * (reelTiles.value.length - 1)) + 1,
  );
}

onMounted(() => {
  prefersReduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  reelTrackEl.value?.addEventListener("scroll", onReelScrollMobile, {
    passive: true,
  });
  syncTrackPadding();
  onScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onResize);
  reelTrackEl.value?.removeEventListener("scroll", onReelScrollMobile);
});
</script>

<style scoped>
.reel-section {
  position: relative;
}
.reel-header {
  padding-top: clamp(36px, 6vh, 80px);
  padding-bottom: clamp(20px, 3vh, 32px);
  flex-shrink: 0;
}
.reel-pin {
  height: auto;
}
@media (min-width: 901px) {
  .reel-pin {
    --reel-extra: clamp(1500px, 280vh, 3600px);
    height: calc(100vh + var(--reel-extra));
  }
  .reel-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    min-height: 720px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
.reel-track {
  display: flex;
  gap: 24px;
  padding: 0 80px;
  will-change: transform;
  flex: 1;
  align-items: center;
}
.reel-tile {
  flex: 0 0 clamp(320px, 32vw, 420px);
  display: flex;
  flex-direction: column;
  position: relative;
  --mxN: 0.5;
  --myN: 0.5;
  --mx: 50%;
  --my: 50%;
  --d: clamp(0, var(--dist, 0), 2);
  opacity: calc(1 - var(--d) * 0.42);
  transform: translateY(0);
  transition:
    transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.reel-tile:hover {
  transform: translateY(-6px);
  opacity: 1;
}
.reel-tile .tile-art {
  transform: scale(calc(1 - var(--d) * 0.06));
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.reel-tile .tile-art {
  flex: 0 0 auto;
  width: 100%;
  aspect-ratio: 4 / 5;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-hairline);
}
.reel-tile .tile-text {
  flex: 0 0 auto;
}
.reel-tile .tile-title {
  font-size: 20px;
  line-height: 1.3;
  min-height: calc(20px * 1.3 * 2);
}
.reel-tile .tile-desc {
  min-height: calc(0.875rem * 1.625 * 2);
}
.reel-tile .tile-art::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--mx) var(--my),
    color-mix(in oklab, var(--color-accent) 22%, transparent),
    transparent 60%
  );
  opacity: 0;
  transition:
    opacity 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    background-position 0.15s linear;
  pointer-events: none;
}
.reel-tile:hover .tile-art::after {
  opacity: 1;
}
.reel-tile .tile-art img {
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}
.reel-tile:hover .tile-art img {
  transform: translate3d(
    calc((var(--mxN) - 0.5) * -8px),
    calc((var(--myN) - 0.5) * -8px),
    0
  );
}

@media (max-width: 900px) {
  .reel-stage {
    height: auto;
    min-height: 0;
    overflow: visible;
    position: static;
  }
  .reel-track {
    height: auto;
    padding: 0 11vw;
    gap: 14px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    transform: none !important;
  }
  .reel-track::-webkit-scrollbar {
    display: none;
  }
  .reel-tile {
    scroll-snap-align: center;
    flex: 0 0 78vw;
    height: 64vw;
    min-height: 280px;
    max-height: 360px;
    opacity: 1 !important;
  }
  .reel-tile .tile-art {
    transform: none;
  }
}

/* Inline reel counter */
.reel-counter {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  font-family: "JetBrains Mono", monospace;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}
.reel-counter.is-on {
  opacity: 1;
  transform: none;
}
.reel-counter .num-line {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.reel-counter .now {
  font-size: 40px;
  line-height: 1;
  font-weight: 500;
  color: var(--color-foreground);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
}
.reel-counter .sep,
.reel-counter .total {
  font-size: 13px;
  color: var(--color-foreground-muted);
  letter-spacing: 0.12em;
}
.reel-counter .rail {
  display: block;
  width: 88px;
  height: 1px;
  background: var(--color-hairline);
  margin-top: 4px;
  position: relative;
}
.reel-counter .rail::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--p, 16%);
  background: var(--color-accent);
  transition: width 0.1s linear;
}
@media (max-width: 900px) {
  .reel-counter {
    opacity: 1;
    transform: none;
  }
}

/* Tile label top-right */
.tile-label-tr {
  position: absolute;
  top: 14px;
  right: 14px;
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: lowercase;
  color: var(--color-foreground-muted);
  background: color-mix(in oklab, var(--color-surface) 75%, transparent);
  backdrop-filter: blur(6px);
  padding: 5px 9px;
  border: 1px solid var(--color-hairline);
  border-radius: 2px;
  z-index: 2;
}
.tile-label-tr .num {
  color: var(--color-accent);
  margin-left: 6px;
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .reel-tile,
  .reel-tile .tile-art,
  .reel-tile .tile-art img {
    transition: none;
    transform: none !important;
    opacity: 1 !important;
  }
  .reel-tile .tile-art::after {
    transition: opacity 0.3s ease;
  }
}
</style>
