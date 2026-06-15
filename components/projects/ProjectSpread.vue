<template>
  <article class="pr-spread" :class="{ flip }">
    <button
      class="pr-media"
      :aria-label="`${$t('projects.viewProject')}: ${project.title}`"
      @click="$emit('open')"
    >
      <span v-if="shots.length" class="pr-shotwrap" data-tx="slide">
        <NuxtImg
          v-for="(s, i) in shots"
          :key="s"
          :src="s"
          :alt="project.title"
          class="pr-shot"
          :class="{ on: i === ci }"
          loading="lazy"
        />
      </span>
      <span v-else class="pr-blank placeholder-hatch">
        <NuxtImg
          v-if="project.image"
          :src="project.image"
          :alt="project.title"
          loading="lazy"
        />
        <span class="pr-blank-cap">screenshot — coming soon</span>
      </span>
      <span v-if="project.flagship" class="pr-flag">Flagship</span>
      <span v-if="shots.length > 1" class="pr-count" aria-hidden="true">
        <span class="pr-dotrow">
          <span
            v-for="(s, i) in shots"
            :key="s"
            class="pr-cdot"
            :class="{ on: i === ci }"
          />
        </span>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        {{ shots.length }}
      </span>
    </button>

    <div class="pr-col">
      <span class="pr-num" aria-hidden="true">{{ padded }}</span>
      <div class="pr-col-inner">
        <span class="pr-eyebrow">{{ eyebrow }}</span>
        <h2 class="pr-title">{{ project.title }}</h2>
        <p v-if="project.subtitle" class="pr-sub">{{ project.subtitle }}</p>
        <p class="pr-desc">{{ project.description }}</p>

        <dl v-if="project.stats?.length" class="pr-stats">
          <div v-for="(s, i) in project.stats" :key="i" class="pr-stat">
            <dt class="pr-stat-n">{{ s.n }}</dt>
            <dd class="pr-stat-l">{{ s.l }}</dd>
          </div>
        </dl>

        <div class="pr-foot">
          <div class="pr-tags">
            <span
              v-for="t in project.tags.slice(0, 4)"
              :key="t"
              class="pr-tag"
              >{{ t }}</span
            >
          </div>
          <button class="pr-open" @click="$emit('open')">
            {{ $t("projects.viewProject") }}
            <svg
              width="16"
              height="16"
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
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import type { Project } from "~/types/project";

const props = defineProps<{
  project: Project;
  idx: number;
  flip: boolean;
  isActive?: boolean;
  autoplay?: boolean;
}>();

defineEmits<{ open: [] }>();

const padded = computed(() => String(props.idx + 1).padStart(2, "0"));
const eyebrow = computed(() =>
  [props.project.period, props.project.kind].filter(Boolean).join(" · "),
);
const shots = computed<string[]>(() => props.project.images ?? []);

// Auto-cycle the active spread's gallery every 3.5s (slide transition).
const ci = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}
function start() {
  stop();
  if (props.isActive && props.autoplay && shots.value.length > 1) {
    timer = setInterval(() => {
      ci.value = (ci.value + 1) % shots.value.length;
    }, 3500);
  }
}

watch(
  () => [props.isActive, props.autoplay, shots.value.length, props.project.id],
  () => {
    if (props.isActive) ci.value = 0;
    start();
  },
  { immediate: true },
);

onBeforeUnmount(stop);
</script>

<style scoped>
.pr-spread {
  display: grid;
  grid-template-columns: 1.08fr 1fr;
  gap: clamp(36px, 5vw, 96px);
  align-items: center;
  width: 100%;
  max-width: 1280px;
  height: min(100%, clamp(420px, 70vh, 680px));
}
.pr-spread.flip .pr-media {
  order: 2;
}

.pr-media {
  position: relative;
  height: 100%;
  min-height: 280px;
  border-radius: 14px;
  overflow: hidden;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 0;
  display: block;
  transition: border-color 0.3s;
}
.pr-shotwrap {
  position: absolute;
  inset: 0;
}
.pr-shot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
}
.pr-shot.on {
  opacity: 1;
}
.pr-shotwrap[data-tx="slide"] .pr-shot {
  transform: translateX(6%);
  transition:
    opacity 0.55s ease,
    transform 0.65s var(--ease-out-expo);
}
.pr-shotwrap[data-tx="slide"] .pr-shot.on {
  transform: translateX(0);
}
.pr-blank {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 12%;
}
.pr-blank img {
  max-width: 52%;
  max-height: 44%;
  object-fit: contain;
  opacity: 0.82;
}
.pr-blank-cap {
  position: absolute;
  bottom: 18px;
  left: 20px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: lowercase;
  color: var(--color-foreground-faint);
}
.pr-flag {
  position: absolute;
  top: 18px;
  left: 20px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #fff;
  background: var(--color-accent);
  padding: 6px 11px;
  border-radius: 3px;
  z-index: 2;
}
.pr-count {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: #fff;
  background: color-mix(in oklab, var(--color-foreground) 55%, transparent);
  backdrop-filter: blur(4px);
  padding: 5px 9px;
  border-radius: 4px;
  z-index: 2;
}
.pr-count svg {
  opacity: 0.85;
}
.pr-dotrow {
  display: inline-flex;
  gap: 4px;
}
.pr-cdot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: color-mix(in oklab, #fff 45%, transparent);
  transition:
    background 0.3s,
    width 0.3s;
}
.pr-cdot.on {
  background: #fff;
  width: 12px;
}

.pr-col {
  position: relative;
}
.pr-num {
  position: absolute;
  top: -0.42em;
  left: -0.06em;
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(140px, 16vw, 260px);
  line-height: 0.8;
  color: var(--color-accent);
  opacity: 0.08;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  font-variant-numeric: tabular-nums;
}
.pr-col-inner {
  position: relative;
  z-index: 1;
  max-width: 540px;
}
.pr-eyebrow {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-foreground-faint);
}
.pr-title {
  font-size: clamp(40px, 4.6vw, 68px);
  font-weight: 700;
  letter-spacing: -0.038em;
  line-height: 0.98;
  margin-top: clamp(16px, 2.4vh, 26px);
  color: var(--color-foreground);
  text-wrap: balance;
}
.pr-sub {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  color: var(--color-accent);
  font-size: clamp(20px, 2vw, 29px);
  line-height: 1.15;
  margin-top: 12px;
}
.pr-desc {
  font-size: clamp(15px, 1.05vw, 17px);
  line-height: 1.72;
  color: var(--color-foreground-muted);
  max-width: 45ch;
  margin-top: clamp(20px, 2.8vh, 30px);
  text-wrap: pretty;
}
.pr-stats {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(26px, 3vw, 50px);
  margin: clamp(24px, 3.4vh, 38px) 0;
}
.pr-stat dt,
.pr-stat dd {
  margin: 0;
}
.pr-stat-n {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: clamp(30px, 2.8vw, 42px);
  line-height: 1;
  color: var(--color-accent-alt);
  font-variant-numeric: tabular-nums;
}
.pr-stat-l {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-foreground-faint);
  margin-top: 9px;
}
.pr-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.pr-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
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
.pr-open {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-foreground);
  border-bottom: 1.5px solid var(--color-foreground);
  padding-bottom: 4px;
  transition:
    color 0.25s,
    border-color 0.25s;
  white-space: nowrap;
}
.pr-open svg {
  transition: transform 0.3s var(--ease-out-expo);
}
.pr-open:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
.pr-open:hover svg {
  transform: translateX(5px);
}

@media (max-width: 900px) {
  .pr-spread {
    grid-template-columns: 1fr;
    gap: 28px;
    height: auto;
  }
  .pr-spread.flip .pr-media {
    order: 0;
  }
  .pr-media {
    min-height: 240px;
    height: 240px;
  }
  .pr-num {
    font-size: 120px;
  }
}
@media (max-width: 560px) {
  .pr-title {
    font-size: clamp(34px, 11vw, 46px);
  }
}
</style>
