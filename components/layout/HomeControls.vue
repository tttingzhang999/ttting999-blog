<template>
  <div class="home-controls">
    <LanguageSwitcher class="lang-pill" />
    <button
      class="ctrl-pill"
      :aria-label="$t('nav.toggleTheme')"
      @click="onToggleTheme"
    >
      <ClientOnly>
        <svg
          v-if="colorMode.value === 'dark'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 3v1.5M12 19.5V21M5 12H3.5M20.5 12H19M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1" />
        </svg>
        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </ClientOnly>
    </button>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { toggleThemeWithTransition } = useThemeTransition()

function onToggleTheme(e: MouseEvent) {
  toggleThemeWithTransition(e, colorMode)
}
</script>

<style scoped>
.home-controls {
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 40;
}

.ctrl-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-surface) 75%, transparent);
  backdrop-filter: blur(8px);
  color: var(--color-foreground-muted);
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.ctrl-pill:hover {
  color: var(--color-foreground);
  border-color: var(--color-foreground-muted);
}

/* Tweak the global LanguageSwitcher to match the pill aesthetic on the homepage. */
.home-controls :deep(.lang-pill) {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--color-hairline);
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-surface) 75%, transparent);
  backdrop-filter: blur(8px);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
}

@media (max-width: 720px) {
  .home-controls {
    top: 16px;
    right: 16px;
  }
}
</style>
