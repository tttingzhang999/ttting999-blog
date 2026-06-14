<template>
  <div>
    <div class="px-8 sm:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-3">
      <NuxtLink
        v-for="(q, i) in quickNav"
        :key="i"
        :to="q.to"
        class="px-6 py-7 border-t border-hairline flex items-center justify-between group"
        :class="{ 'md:border-r': i < quickNav.length - 1 }"
      >
        <div>
          <div class="text-[20px] text-foreground font-medium">
            <span class="ink-link">{{ q.title }}</span>
          </div>
          <div class="gutter-label mt-1">{{ q.sub }}</div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          class="text-foreground"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </NuxtLink>
    </div>

    <div
      class="px-8 sm:px-12 lg:px-20 border-t border-hairline pt-6 pb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div class="gutter-label">© {{ currentYear }} · Ting Zhang</div>
      <div class="flex items-center gap-5 text-foreground-muted">
        <a
          v-for="link in socialLinks"
          :key="link.label"
          :href="link.href"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
          :aria-label="link.label"
          class="hover:text-accent transition-colors"
        >
          <svg
            v-if="link.icon === 'mail'"
            class="w-[18px] h-[18px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <svg
            v-else-if="link.icon === 'linkedin'"
            class="w-[18px] h-[18px]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </svg>
          <svg
            v-else-if="link.icon === 'github'"
            class="w-[18px] h-[18px]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          <svg
            v-else-if="link.icon === 'gitlab'"
            class="w-[18px] h-[18px]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M23.6004 9.5927l-.0337-.0862L20.3.9814a.851.851 0 00-.3362-.405.8748.8748 0 00-.9997.0539.8748.8748 0 00-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 00-.29-.4412.8748.8748 0 00-.9997-.0537.8585.8585 0 00-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 002.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 001.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7476.0125-.01a6.0682 6.0682 0 002.0094-7.0117z"
            />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { t } = useI18n();
const localePath = useLocalePath();

const currentYear = new Date().getFullYear();

const quickNav = computed(() => [
  {
    title: "Resume",
    sub: t("home.quickNav.resumeSub"),
    to: localePath("/resume"),
  },
  {
    title: "All projects",
    sub: t("home.quickNav.projectsSub"),
    to: localePath("/projects"),
  },
  {
    title: "Blog archive",
    sub: t("home.quickNav.blogSub"),
    to: "/blog",
  },
]);

const socialLinks = [
  {
    icon: "mail",
    label: "Email",
    href: "mailto:tttingzhang999@gmail.com",
    external: false,
  },
  {
    icon: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/tingzhang98/",
    external: true,
  },
  {
    icon: "github",
    label: "GitHub",
    href: "https://github.com/tttingzhang999",
    external: true,
  },
  {
    icon: "gitlab",
    label: "GitLab",
    href: "https://gitlab.com/tttingzhang999",
    external: true,
  },
];
</script>
