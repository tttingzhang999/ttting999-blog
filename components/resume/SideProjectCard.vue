<template>
  <div
    ref="el"
    class="sp-card"
    :class="{ 'is-in': revealed }"
    :style="{ '--rd': Math.min(idx * 0.08, 0.3) + 's' }"
  >
    <div class="sp-top">
      <h3 class="sp-title">{{ project.title }}</h3>
      <span class="sp-period gutter-label">{{ project.period }}</span>
    </div>
    <p class="sp-desc font-fraunces italic">{{ project.description }}</p>

    <ul class="sp-highlights">
      <li v-for="(h, i) in project.highlights" :key="i">{{ h }}</li>
    </ul>

    <div
      v-if="project.technologies && project.technologies.length"
      class="sp-tags"
    >
      <span v-for="(tech, i) in project.technologies" :key="i" class="tz-tag">
        {{ tech }}
      </span>
    </div>

    <div v-if="project.github || project.demo" class="sp-links">
      <a
        v-if="project.github"
        :href="project.github"
        target="_blank"
        rel="noopener noreferrer"
        class="sp-link"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.72-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.6-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.19.69.8.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
        GitHub
      </a>
      <a
        v-if="project.demo"
        :href="project.demo"
        target="_blank"
        rel="noopener noreferrer"
        class="sp-link sp-link-alt"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          viewBox="0 0 24 24"
        >
          <path
            d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
          />
        </svg>
        {{ $t("projects.viewDemo") }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SideProject } from "~/types/resume";

interface Props {
  project: SideProject;
  idx: number;
}
defineProps<Props>();

const { el, revealed } = useReveal({ threshold: 0.25 });
</script>

<style scoped>
.sp-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  opacity: 0;
  transform: translateY(22px);
  transition:
    opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) var(--rd, 0s),
    transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) var(--rd, 0s),
    border-color 0.3s;
}
.sp-card.is-in {
  opacity: 1;
  transform: none;
}
.sp-card:hover {
  border-color: var(--color-accent);
}
.sp-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}
.sp-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
  transition: color 0.2s;
}
.sp-card:hover .sp-title {
  color: var(--color-accent);
}
.sp-period {
  white-space: nowrap;
}
.sp-desc {
  font-size: 15px;
  color: var(--color-accent-alt);
  margin-bottom: 16px;
}
.sp-highlights {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 0 18px;
  padding: 0;
}
.sp-highlights li {
  position: relative;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-foreground-muted);
}
.sp-highlights li::before {
  content: "—";
  position: absolute;
  left: 0;
  color: var(--color-accent);
}
.sp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}
.tz-tag {
  font-size: 12px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 4px;
  background: var(--color-surface-elevated);
  color: var(--color-foreground-muted);
  white-space: nowrap;
}
.sp-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-muted);
}
.sp-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: var(--color-surface-elevated);
  color: var(--color-foreground-muted);
  transition: color 0.2s;
}
.sp-link:hover {
  color: var(--color-accent);
}
.sp-link-alt {
  color: var(--color-accent-alt);
}
.sp-link-alt:hover {
  color: var(--color-accent-alt-hover);
}
</style>
