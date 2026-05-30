<template>
  <div ref="el" class="skill-row" :class="{ 'is-in': revealed }">
    <div class="skill-head">
      <span class="skill-num">{{ String(idx + 1).padStart(2, "0") }}</span>
      <span class="skill-cat">{{ skill.category }}</span>
    </div>
    <div class="skill-tags">
      <span
        v-for="(item, i) in skill.skills"
        :key="i"
        class="tz-tag"
        :style="{ '--td': i * 0.05 + 's' }"
      >
        {{ item }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TechnicalSkill } from "~/types/resume";

interface Props {
  skill: TechnicalSkill;
  idx: number;
}
defineProps<Props>();

const { el, revealed } = useReveal({ threshold: 0.3 });
</script>

<style scoped>
.skill-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: clamp(16px, 3vw, 40px);
  align-items: baseline;
  padding: 26px 0;
  border-top: 1px solid var(--color-hairline);
}
.skill-row:last-child {
  border-bottom: 1px solid var(--color-hairline);
}
.skill-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.skill-num {
  font-family: "Fraunces", "Noto Serif TC", Georgia, serif;
  font-weight: 300;
  font-style: italic;
  font-size: 38px;
  line-height: 0.8;
  color: var(--color-accent);
  font-variant-numeric: tabular-nums;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.skill-row.is-in .skill-num {
  opacity: 1;
  transform: none;
}
.skill-cat {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-foreground);
}
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.skill-tags .tz-tag {
  font-size: 14px;
  font-weight: 500;
  padding: 7px 13px;
  border-radius: 4px;
  background: var(--color-surface-elevated);
  color: var(--color-foreground-muted);
  white-space: nowrap;
  opacity: 0;
  transform: translateY(10px) scale(0.96);
  transition:
    opacity 0.5s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1),
    color 0.2s,
    background 0.2s;
  transition-delay: var(--td, 0s);
}
.skill-row.is-in .skill-tags .tz-tag {
  opacity: 1;
  transform: none;
}
.skill-tags .tz-tag:hover {
  color: var(--color-accent);
  background: color-mix(
    in oklab,
    var(--color-accent) 12%,
    var(--color-surface-elevated)
  );
}

@media (prefers-reduced-motion: reduce) {
  .skill-num,
  .skill-tags .tz-tag {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
@media (max-width: 900px) {
  .skill-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
