<template>
  <!-- Overlay (backdrop) -->
  <Transition name="fade">
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="closeSidebar"
    ></div>
  </Transition>

  <!-- Sidebar -->
  <Transition name="slide">
    <aside
      v-if="isSidebarOpen"
      class="fixed top-0 right-0 bottom-0 w-64 bg-surface shadow-2xl z-50 md:hidden overflow-y-auto"
    >
      <div class="flex flex-col h-full">
        <!-- Sidebar Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-border"
        >
          <span class="text-lg font-bold text-foreground">{{
            $t("nav.menu")
          }}</span>
          <button
            @click="closeSidebar"
            class="p-2 rounded-lg bg-surface-elevated text-foreground-muted hover:text-accent transition-all duration-200"
            :aria-label="$t('nav.closeMenu')"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 p-4 space-y-2">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            @click="closeSidebar"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-surface-elevated hover:text-accent transition-all duration-200"
          >
            <component :is="link.icon" class="w-5 h-5" />
            <span class="font-medium">{{ link.label }}</span>
          </NuxtLink>
        </nav>

        <!-- Theme Toggle & Language Switcher -->
        <div class="p-4 border-t border-border space-y-2">
          <LanguageSwitcher />

          <button
            @click="toggleTheme($event)"
            class="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-surface-elevated text-foreground-muted hover:text-accent transition-all duration-200"
          >
            <span class="font-medium">{{ $t("nav.toggleTheme") }}</span>
            <svg
              v-if="colorMode.value === 'dark'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import type { Component } from "vue";

const colorMode = useColorMode();
const { isSidebarOpen, closeSidebar } = useSidebarState();
const { t } = useI18n();
const localePath = useLocalePath();

const { toggleThemeWithTransition } = useThemeTransition();

const ResumeIcon = defineComponent({
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  `,
}) as Component;

const ProjectsIcon = defineComponent({
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  `,
}) as Component;

const BlogIcon = defineComponent({
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  `,
}) as Component;

const navLinks = computed(() => [
  { path: localePath("/resume"), label: t("nav.resume"), icon: ResumeIcon },
  {
    path: localePath("/projects"),
    label: t("nav.projects"),
    icon: ProjectsIcon,
  },
  { path: "/blog", label: t("nav.blog"), icon: BlogIcon },
]);

const toggleTheme = (event: MouseEvent) => {
  toggleThemeWithTransition(event, colorMode);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
