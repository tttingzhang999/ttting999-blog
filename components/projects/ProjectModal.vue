<template>
  <Teleport to="body">
    <div v-if="project" class="wi-scrim" @click="$emit('close')">
      <div
        class="wi-modal wi-split"
        role="dialog"
        aria-modal="true"
        :aria-label="project.title"
        @click.stop
      >
        <button
          class="wi-close"
          :aria-label="$t('projects.close')"
          @click="$emit('close')"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class="wi-body">
          <span class="pr-eyebrow">{{ eyebrow }}</span>
          <h2 class="wi-title">{{ project.title }}</h2>
          <div v-if="project.subtitle" class="wi-sub">
            {{ project.subtitle }}
          </div>
          <p class="wi-desc">{{ project.description }}</p>

          <dl v-if="project.stats?.length" class="wi-stats">
            <div v-for="(s, i) in project.stats" :key="i" class="wi-stat">
              <dt class="wi-stat-n">{{ s.n }}</dt>
              <dd class="wi-stat-l">{{ s.l }}</dd>
            </div>
          </dl>

          <template v-if="project.highlights?.length">
            <span class="pr-eyebrow wi-hl-head">{{
              $t("projects.projectHighlights")
            }}</span>
            <ul class="wi-hl">
              <li v-for="(h, i) in project.highlights" :key="i">{{ h }}</li>
            </ul>
          </template>

          <div v-if="project.teamSize || project.role" class="wi-info">
            <div v-if="project.teamSize">
              <span class="pr-eyebrow">{{ $t("projects.team") }}</span>
              <div class="wi-info-v">{{ project.teamSize }}</div>
            </div>
            <div v-if="project.role">
              <span class="pr-eyebrow">{{ $t("projects.role") }}</span>
              <div class="wi-info-v">{{ project.role }}</div>
            </div>
          </div>

          <div class="wi-tags">
            <span v-for="t in project.tags" :key="t" class="pr-tag">{{
              t
            }}</span>
          </div>

          <div v-if="hasLinks" class="wi-links">
            <a
              v-if="project.appStore"
              :href="project.appStore"
              target="_blank"
              rel="noopener noreferrer"
              class="wi-btn wi-btn--primary"
            >
              App Store
              <svg v-bind="extIcon" aria-hidden="true">
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <a
              v-if="project.demo"
              :href="project.demo"
              target="_blank"
              rel="noopener noreferrer"
              class="wi-btn wi-btn--alt"
            >
              {{ $t("projects.viewDemo") }}
              <svg v-bind="extIcon" aria-hidden="true">
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <a
              v-if="project.github"
              :href="project.github"
              target="_blank"
              rel="noopener noreferrer"
              class="wi-btn wi-btn--outline"
            >
              {{ $t("projects.viewCode") }}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.2c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.24-3.24-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.24a11.5 11.5 0 0 1 6 0c2.29-1.56 3.3-1.24 3.3-1.24.66 1.65.25 2.87.12 3.17.77.84 1.24 1.92 1.24 3.24 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z"
                />
              </svg>
            </a>
          </div>
        </div>

        <div class="wi-gallery" data-fit="contain">
          <div class="wi-gmain">
            <NuxtImg
              v-if="shots.length"
              :key="galleryIndex"
              :src="shots[galleryIndex]"
              :alt="`${project.title} — ${galleryIndex + 1}`"
              class="wi-gimg"
              loading="lazy"
            />
            <span v-else class="wi-hero-blank placeholder-hatch">
              <NuxtImg
                v-if="project.image"
                :src="project.image"
                :alt="project.title"
                loading="lazy"
              />
              <span class="wi-blank-tag">screenshot — coming soon</span>
            </span>

            <template v-if="multi">
              <button
                class="wi-gnav prev"
                :disabled="galleryIndex === 0"
                aria-label="Previous image"
                @click="prev"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="transform: rotate(180deg)"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button
                class="wi-gnav next"
                :disabled="galleryIndex === shots.length - 1"
                aria-label="Next image"
                @click="next"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <span class="wi-gcount">
                {{ pad(galleryIndex + 1) }}
                <span class="wi-gcount-sep">/</span>
                {{ pad(shots.length) }}
              </span>
            </template>
          </div>

          <div
            v-if="multi"
            class="wi-thumbs"
            role="tablist"
            aria-label="Screenshots"
          >
            <button
              v-for="(s, i) in shots"
              :key="s"
              class="wi-thumb"
              :class="{ on: i === galleryIndex }"
              :aria-label="`Image ${i + 1}`"
              :aria-selected="i === galleryIndex"
              @click="galleryIndex = i"
            >
              <NuxtImg :src="s" alt="" loading="lazy" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import type { Project } from "~/types/project";

const props = defineProps<{ project: Project | null }>();
const emit = defineEmits<{ close: [] }>();

const eyebrow = computed(() =>
  props.project
    ? [props.project.period, props.project.kind].filter(Boolean).join(" · ")
    : "",
);

// Image gallery state: index resets to 0 each time a new project opens.
const galleryIndex = ref(0);
const shots = computed<string[]>(() => props.project?.images ?? []);
const multi = computed(() => shots.value.length > 1);
const pad = (n: number) => String(n).padStart(2, "0");

function prev() {
  galleryIndex.value = Math.max(0, galleryIndex.value - 1);
}
function next() {
  galleryIndex.value = Math.min(shots.value.length - 1, galleryIndex.value + 1);
}
const hasLinks = computed(
  () =>
    !!(props.project?.appStore || props.project?.demo || props.project?.github),
);

const extIcon = {
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.8",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
  else if (multi.value && e.key === "ArrowRight") next();
  else if (multi.value && e.key === "ArrowLeft") prev();
}

// Open/close side effects: reset gallery + Esc/arrow keys + body scroll lock.
watch(
  () => props.project,
  (p) => {
    if (typeof document === "undefined") return;
    galleryIndex.value = 0;
    if (p) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    }
  },
);

onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  document.removeEventListener("keydown", onKey);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.wi-scrim {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: color-mix(in oklab, var(--color-foreground) 48%, transparent);
  backdrop-filter: blur(5px);
  display: grid;
  place-items: center;
  padding: 28px;
  animation: wiFade 0.25s ease;
}
.wi-modal {
  position: relative;
  background: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  animation: wiRise 0.4s var(--ease-out-expo);
  overflow: hidden;
}
/* split: text left, gallery right */
.wi-modal.wi-split {
  width: min(1240px, 92vw);
  height: min(90vh, 840px);
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) 1.16fr;
}
.wi-split .wi-body {
  overflow-y: auto;
  max-height: 100%;
}
.wi-split .wi-gallery {
  height: 100%;
  min-height: 0;
}
.wi-body::-webkit-scrollbar,
.wi-modal::-webkit-scrollbar {
  width: 8px;
}
.wi-body::-webkit-scrollbar-thumb,
.wi-modal::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}
.wi-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-surface) 80%, transparent);
  border: 1px solid var(--color-hairline);
  backdrop-filter: blur(6px);
  color: var(--color-foreground-muted);
  transition:
    color 0.2s,
    border-color 0.2s;
}
.wi-close:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
.wi-gallery {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-elevated);
  min-height: 0;
}
.wi-gmain {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.wi-gimg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: wiImgFade 0.35s var(--ease-out-expo);
}
.wi-gallery[data-fit="contain"] .wi-gimg {
  object-fit: contain;
  padding: clamp(20px, 3vw, 44px);
}
.wi-gallery[data-fit="cover"] .wi-gimg {
  object-fit: cover;
}
@keyframes wiImgFade {
  from {
    opacity: 0;
  }
}
.wi-hero-blank {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 10%;
}
.wi-hero-blank img {
  max-width: 46%;
  max-height: 48%;
  object-fit: contain;
  opacity: 0.85;
}
.wi-blank-tag {
  position: absolute;
  bottom: 16px;
  left: 18px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: lowercase;
  color: var(--color-foreground-faint);
}
.wi-gnav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-surface) 82%, transparent);
  border: 1px solid var(--color-hairline);
  backdrop-filter: blur(6px);
  color: var(--color-foreground);
  transition:
    color 0.2s,
    border-color 0.2s,
    opacity 0.2s;
  z-index: 2;
}
.wi-gnav.prev {
  left: 16px;
}
.wi-gnav.next {
  right: 16px;
}
.wi-gnav:hover:not(:disabled) {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
.wi-gnav:disabled {
  opacity: 0;
  pointer-events: none;
}
.wi-gcount {
  position: absolute;
  bottom: 14px;
  right: 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #fff;
  background: color-mix(in oklab, var(--color-foreground) 58%, transparent);
  backdrop-filter: blur(4px);
  padding: 5px 10px;
  border-radius: 4px;
  font-variant-numeric: tabular-nums;
  z-index: 2;
}
.wi-gcount-sep {
  opacity: 0.6;
}
.wi-thumbs {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  overflow-x: auto;
  scrollbar-width: none;
  background: var(--color-surface-elevated);
  border-top: 1px solid var(--color-hairline);
  flex: 0 0 auto;
}
.wi-thumbs::-webkit-scrollbar {
  display: none;
}
.wi-thumb {
  flex: 0 0 auto;
  width: 66px;
  height: 46px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  opacity: 0.55;
  transition:
    opacity 0.25s,
    border-color 0.25s;
  padding: 0;
}
.wi-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.wi-thumb:hover {
  opacity: 0.85;
}
.wi-thumb.on {
  opacity: 1;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}
.wi-body {
  padding: clamp(26px, 3.4vw, 40px);
}
.pr-eyebrow {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-foreground-faint);
}
.wi-title {
  font-size: clamp(28px, 3vw, 38px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 14px 0 4px;
  color: var(--color-foreground);
}
.wi-sub {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  color: var(--color-accent);
  font-size: 20px;
  margin-bottom: 18px;
}
.wi-desc {
  font-size: 15px;
  line-height: 1.75;
  color: var(--color-foreground-muted);
  margin-bottom: 24px;
}
.wi-stats {
  display: flex;
  gap: 1px;
  background: var(--color-hairline);
  border: 1px solid var(--color-hairline);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 28px;
}
.wi-stat {
  background: var(--color-surface-card);
  padding: 16px 18px;
  flex: 1;
}
.wi-stat dt,
.wi-stat dd {
  margin: 0;
}
.wi-stat-n {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: 30px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--color-accent-alt);
}
.wi-stat-l {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-foreground-faint);
  margin-top: 8px;
  display: block;
}
.wi-hl-head {
  margin-bottom: 14px;
}
.wi-hl {
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.wi-hl li {
  position: relative;
  padding-left: 22px;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--color-foreground-muted);
}
.wi-hl li::before {
  content: "—";
  position: absolute;
  left: 0;
  color: var(--color-accent);
}
.wi-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid var(--color-hairline);
  border-bottom: 1px solid var(--color-hairline);
  margin-bottom: 22px;
}
.wi-info-v {
  font-size: 14px;
  margin-top: 7px;
  color: var(--color-foreground);
  line-height: 1.5;
}
.wi-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 26px;
}
.pr-tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  padding: 5px 9px;
  border: 1px solid var(--color-hairline);
  border-radius: 3px;
  color: var(--color-foreground-muted);
  white-space: nowrap;
}
.wi-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.wi-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  padding: 11px 18px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s,
    transform 0.1s;
}
.wi-btn:active {
  transform: scale(0.97);
}
.wi-btn--primary {
  background: var(--color-accent);
  color: #fff;
}
.wi-btn--primary:hover {
  background: var(--color-accent-hover);
}
.wi-btn--alt {
  background: var(--color-accent-alt);
  color: #fff;
}
.wi-btn--alt:hover {
  background: var(--color-accent-alt-hover);
}
.wi-btn--outline {
  border-color: var(--color-border);
  color: var(--color-foreground);
}
.wi-btn--outline:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

@keyframes wiFade {
  from {
    opacity: 0;
  }
}
@keyframes wiRise {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
}

/* ≤900px: force stacked — gallery on top, text below */
@media (max-width: 900px) {
  .wi-modal.wi-split {
    display: grid;
    grid-template-columns: 1fr;
    width: min(560px, 100%);
    height: auto;
    max-height: 90vh;
    overflow-y: auto;
  }
  .wi-split .wi-gallery {
    order: -1;
    height: auto;
  }
  .wi-split .wi-gmain {
    height: 280px;
  }
  .wi-split .wi-body {
    overflow: visible;
    max-height: none;
  }
}
@media (max-width: 560px) {
  .wi-info {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .wi-stats {
    flex-wrap: wrap;
  }
}
@media (prefers-reduced-motion: reduce) {
  .wi-modal,
  .wi-scrim,
  .wi-gimg {
    animation: none;
  }
}
</style>
