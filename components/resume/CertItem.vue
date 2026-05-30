<template>
  <component
    :is="cert.credentialUrl ? 'a' : 'div'"
    ref="el"
    class="cert-item"
    :class="{ 'is-in': revealed }"
    :style="{ '--rd': Math.min(idx * 0.07, 0.3) + 's' }"
    :href="cert.credentialUrl || undefined"
    :target="cert.credentialUrl ? '_blank' : undefined"
    :rel="cert.credentialUrl ? 'noopener noreferrer' : undefined"
  >
    <div class="cert-l">
      <span class="cert-idx">{{ String(idx + 1).padStart(2, "0") }}</span>
      <div>
        <div class="cert-name">{{ cert.name }}</div>
        <div class="cert-issuer">{{ cert.issuer }}</div>
      </div>
    </div>
    <div class="cert-r">
      <span class="gutter-label">{{ formatDate(cert.issueDate) }}</span>
      <svg
        v-if="cert.credentialUrl"
        class="cert-arrow w-4 h-4"
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
    </div>
  </component>
</template>

<script setup lang="ts">
import type { Certification } from "~/types/resume";

interface Props {
  cert: Certification;
  idx: number;
}
defineProps<Props>();

const { el, revealed } = useReveal({ threshold: 0.5 });

function formatDate(value: string): string {
  const [year, month] = value.split("-");
  if (!month) return year;
  return `${year}.${month}`;
}
</script>

<style scoped>
.cert-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid var(--color-hairline);
  opacity: 0;
  transform: translateY(16px);
  transition:
    padding-left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) var(--rd, 0s),
    transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) var(--rd, 0s);
}
.cert-item.is-in {
  opacity: 1;
  transform: none;
}
.cert-item:last-child {
  border-bottom: 1px solid var(--color-hairline);
}
.cert-item:hover {
  padding-left: 12px;
}
.cert-l {
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.cert-idx {
  font-family: "Fraunces", "Noto Serif TC", Georgia, serif;
  font-style: italic;
  font-weight: 300;
  font-size: 24px;
  line-height: 1;
  color: var(--color-accent);
  font-variant-numeric: tabular-nums;
}
.cert-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-foreground);
  transition: color 0.2s;
}
.cert-item:hover .cert-name {
  color: var(--color-accent);
}
.cert-issuer {
  font-size: 13px;
  color: var(--color-foreground-muted);
  margin-top: 3px;
}
.cert-r {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}
.cert-arrow {
  color: var(--color-foreground-faint);
  transition:
    transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
    color 0.2s;
}
.cert-item:hover .cert-arrow {
  transform: translateX(4px);
  color: var(--color-accent);
}

@media (prefers-reduced-motion: reduce) {
  .cert-item {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>
