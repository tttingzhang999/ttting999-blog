<template>
  <div>
    <NuxtRouteAnnouncer />
    <SiteHeader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// i18n-aware head: produces <html lang>, hreflang alternates, og:locale, etc.
const i18nHead = useLocaleHead({ seo: true });

// Each blog article has one URL, independent of its content language. On those routes
// suppress the per-locale hreflang alternates and og:locale:alternate so the
// page only advertises its canonical URL instead of claiming en/ja versions.
const route = useRoute();
const isSingleLocale = computed(() => route.path.startsWith("/blog"));

useHead(() => ({
  htmlAttrs: isSingleLocale.value ? { lang: "zh-TW", dir: "ltr" } : i18nHead.value.htmlAttrs ?? {},
  link:
    (i18nHead.value.link ?? []).filter(
      (l) => !isSingleLocale.value || l.rel === "canonical",
    ),
  meta: [
    { name: "robots", content: "index, follow, max-image-preview:large" },
    ...(i18nHead.value.meta ?? []).filter(
      (m) =>
        !isSingleLocale.value ||
        !["og:locale:alternate", "og:locale"].includes((m as { property?: string }).property ?? ""),
    ),
  ],
  titleTemplate: (titleChunk?: string) =>
    titleChunk && titleChunk !== "張碩庭 Ting Zhang"
      ? isSingleLocale.value && route.path !== "/blog"
        ? `${titleChunk} | Ting Zhang`
        : `張碩庭 Ting Zhang - ${titleChunk}`
      : "張碩庭 Ting Zhang",
}));
</script>
