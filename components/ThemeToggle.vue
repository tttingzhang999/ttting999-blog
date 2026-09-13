<script setup lang="ts">
const props = withDefaults(defineProps<{ language?: string }>(), { language: 'zh-TW' });
const colorMode = useColorMode();
const { busy } = useVisualTransition();
const { toggleThemeWithTransition } = useThemeTransition();
const label = computed(() => props.language === 'en' ? 'Switch light and dark appearance' : props.language === 'ja' ? 'ライト・ダークモードを切り替え' : '切換亮色與暗色模式');
</script>

<template>
  <button class="theme-toggle" data-theme-toggle type="button" :disabled="busy" :aria-label="label" :title="label" @click="toggleThemeWithTransition($event, colorMode)">
    <svg class="theme-toggle-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </svg>
    <svg class="theme-toggle-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
      <path d="M20.2 14.1A8.6 8.6 0 0 1 9.9 3.8a8.6 8.6 0 1 0 10.3 10.3Z" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle { width: 40px; height: 40px; flex: 0 0 40px; display: grid; place-items: center; color: var(--color-accent); border: 1px solid var(--color-border); border-radius: 50%; background: transparent; cursor: pointer; transition: border-color 180ms ease, background-color 180ms ease; }
.theme-toggle:hover { border-color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 8%, transparent); }
.theme-toggle:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }
.theme-toggle svg { width: 20px; height: 20px; grid-area: 1 / 1; }
.theme-toggle-sun { display: none; }
:global(html.dark .theme-toggle-sun) { display: block; }
:global(html.dark .theme-toggle-moon) { display: none; }
@media (prefers-reduced-motion: reduce) { .theme-toggle { transition: none; } }
</style>
