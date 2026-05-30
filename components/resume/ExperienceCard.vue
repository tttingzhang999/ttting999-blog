<template>
  <div class="exp-card-top">
    <div>
      <div class="exp-card-co">{{ experience.company }}</div>
      <h3 class="exp-card-title">{{ experience.title }}</h3>
    </div>
    <span class="exp-card-period">
      {{ experience.period }}
      <span v-if="isCurrent" class="now-dot" />
    </span>
  </div>

  <ul class="exp-card-bullets">
    <li v-for="(b, i) in experience.description" :key="i">{{ b }}</li>
  </ul>

  <div
    v-if="experience.technologies && experience.technologies.length"
    class="exp-card-tags"
  >
    <span v-for="(tech, i) in experience.technologies" :key="i" class="tz-tag">
      {{ tech }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { WorkExperience } from "~/types/resume";

interface Props {
  experience: WorkExperience;
  presentLabel?: string;
}
const props = defineProps<Props>();

const isCurrent = computed(() => props.experience.endDate === "present");
</script>

<style scoped>
.exp-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 22px;
}
.exp-card-co {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent-alt);
  margin-bottom: 6px;
}
.exp-card-title {
  font-size: clamp(22px, 2.6vw, 32px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--color-foreground);
}
.exp-card-period {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--color-foreground-muted);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.now-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: nowBlink 2s ease-in-out infinite;
}
@keyframes nowBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
.exp-card-bullets {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 auto;
  padding: 0;
  overflow-y: auto;
}
.exp-card-bullets li {
  position: relative;
  padding-left: 22px;
  font-size: clamp(13.5px, 1.5vw, 15.5px);
  line-height: 1.6;
  color: var(--color-foreground-muted);
}
.exp-card-bullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  width: 9px;
  height: 1px;
  background: var(--color-accent);
}
.exp-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 22px;
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
</style>
