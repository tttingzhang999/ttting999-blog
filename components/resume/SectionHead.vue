<template>
  <div
    ref="el"
    class="rs-head"
    :class="{ 'is-in': revealed, 'in-view': revealed }"
  >
    <span class="gutter-label inline-flex items-center">
      <span class="h2-rule" />{{ num }} · {{ kicker }}
    </span>
    <h2 class="rs-h2">
      {{ pre
      }}<span class="font-fraunces italic font-normal text-accent">{{
        accent
      }}</span
      >{{ post }}
    </h2>
  </div>
</template>

<script setup lang="ts">
interface Props {
  num: string;
  kicker: string;
  pre: string;
  accent: string;
  post?: string;
}

withDefaults(defineProps<Props>(), { post: "." });

const { el, revealed } = useReveal({ threshold: 0.4 });
</script>

<style scoped>
.rs-head {
  margin-bottom: 30px;
}
.rs-h2 {
  font-family: "Inter", "Noto Sans TC", system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(26px, 3.6vw, 40px);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-top: 12px;
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.12s,
    transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.12s;
}
.rs-head.is-in .rs-h2 {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .rs-h2 {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>
