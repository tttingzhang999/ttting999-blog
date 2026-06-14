<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border transition-colors duration-300"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo / Brand -->
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-accent transition-colors duration-200"
        >
          <span class="text-accent">&lt;</span>
          <span>ttting999</span>
          <span class="text-accent">/&gt;</span>
        </NuxtLink>

        <!-- Desktop Navigation Links -->
        <div class="hidden md:flex items-center space-x-4">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="text-sm font-medium text-foreground-muted hover:text-accent transition-colors duration-200 relative group"
          >
            {{ link.label }}
            <!-- Underline animation -->
            <span
              class="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"
            ></span>
          </NuxtLink>

          <!-- Language Switcher -->
          <LanguageSwitcher />

          <!-- Theme Toggle Button -->
          <button
            @click="toggleTheme($event)"
            class="p-2 rounded-lg bg-surface-elevated text-foreground-muted hover:text-accent transition-all duration-200"
            :aria-label="$t('nav.toggleTheme')"
          >
            <ClientOnly>
              <!-- Sun Icon (Dark Mode) -->
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
              <!-- Moon Icon (Light Mode) -->
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
            </ClientOnly>
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2 rounded-lg bg-surface-elevated text-foreground-muted hover:text-accent transition-all duration-200"
          :aria-label="$t('nav.toggleMenu')"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const { t } = useI18n();
const localePath = useLocalePath();

const navLinks = computed(() => [
  { path: localePath("/resume"), label: t("nav.resume") },
  { path: localePath("/projects"), label: t("nav.projects") },
  { path: "/blog", label: t("nav.blog") },
]);

const { toggleThemeWithTransition } = useThemeTransition();

const toggleTheme = (event: MouseEvent) => {
  toggleThemeWithTransition(event, colorMode);
};

const { toggleSidebar } = useSidebarState();

const toggleMobileMenu = () => {
  toggleSidebar();
};
</script>
