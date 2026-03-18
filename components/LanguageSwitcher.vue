<template>
  <button
    @click="cycleLanguage"
    class="flex items-center space-x-2 px-3 py-2 rounded-lg bg-surface-elevated text-foreground-muted hover:text-accent transition-all duration-200 group"
    :aria-label="$t('nav.switchLanguage')"
  >
    <!-- Globe Icon -->
    <svg
      class="w-5 h-5 transition-transform duration-300 group-hover:rotate-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
      />
    </svg>

    <!-- Language Label -->
    <span class="text-sm font-medium min-w-[2rem] text-center">{{ currentLanguageLabel }}</span>

    <!-- Cycle Arrow -->
    <svg
      class="w-4 h-4 transition-transform duration-300 group-hover:rotate-90"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 5l7 7-7 7M5 5l7 7-7 7"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// Language cycle order: zh-TW -> en -> ja -> zh-TW
const languageCycle = ['zh-TW', 'en', 'ja']

// Language labels for display
const languageLabels: Record<string, string> = {
  'zh-TW': '中',
  'en': 'EN',
  'ja': '日'
}

// Get current language label
const currentLanguageLabel = computed(() => {
  return languageLabels[locale.value] || '中'
})

// Cycle to next language
const cycleLanguage = async () => {
  const currentIndex = languageCycle.indexOf(locale.value)
  const nextIndex = (currentIndex + 1) % languageCycle.length
  const nextLocale = languageCycle[nextIndex]

  // Navigate to the same page in the new locale
  // This triggers Nuxt's page transition, ensuring smooth fade-out/fade-in animation
  await navigateTo(switchLocalePath(nextLocale))
}
</script>
