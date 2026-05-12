<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global custom cursor — visible in both light & dark modes via difference blend -->
    <div
      ref="siteCursorEl"
      class="site-cursor"
      :class="{ 'is-hovering': hovering, 'is-visible': visible }"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const siteCursorEl = ref<HTMLElement | null>(null);
const { hovering, visible } = useSiteCursor(siteCursorEl);

// i18n-aware head: produces <html lang>, hreflang alternates, og:locale, etc.
const i18nHead = useLocaleHead({ seo: true });

useHead({
  htmlAttrs: () => i18nHead.value.htmlAttrs ?? {},
  link: () => i18nHead.value.link ?? [],
  meta: () => [
    { name: "robots", content: "index, follow, max-image-preview:large" },
    ...(i18nHead.value.meta ?? []),
  ],
  titleTemplate: (titleChunk?: string) =>
    titleChunk && titleChunk !== "張碩庭 Ting Zhang"
      ? `張碩庭 Ting Zhang - ${titleChunk}`
      : "張碩庭 Ting Zhang",
});
</script>
