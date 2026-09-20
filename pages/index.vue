<template>
  <HomeScenes
    :articles="homeArticles.latest"
    :timeline="homeArticles.timeline"
    :total="homeArticles.all.length"
    :failed="Boolean(error)"
  />
</template>

<script setup lang="ts">
import { getHomeArticles } from "~/utils/home/articles";

definePageMeta({ layout: "home" });

const { t, locale } = useI18n();
const { data: articles, error } = await useAsyncData("home-articles", () =>
  queryCollection("blog")
    .where("draft", "<>", true)
    .select("path", "title", "description", "date", "category")
    .order("date", "DESC")
    .all(),
);
const homeArticles = computed(() => getHomeArticles(articles.value ?? []));

const fullTitle = computed(() => `張碩庭 Ting Zhang - ${t("seo.home.title")}`);

const ogImageAbs = useAbsoluteUrl("/og-image.jpg");
const route = useRoute();
const siteUrl = useAbsoluteUrl();
const ogUrlAbs = computed(() => new URL(route.path, siteUrl).href);

useSeoMeta({
  title: () => t("seo.home.title"),
  description: () => t("seo.home.description"),
  ogTitle: () => fullTitle.value,
  ogDescription: () => t("seo.home.description"),
  ogImage: ogImageAbs,
  ogUrl: () => ogUrlAbs.value,
  ogType: "website",
  ogSiteName: "張碩庭 Ting Zhang",
  twitterCard: "summary_large_image",
  twitterTitle: () => fullTitle.value,
  twitterDescription: () => t("seo.home.description"),
  twitterImage: ogImageAbs,
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Ting Zhang",
        alternateName: "張碩庭",
        jobTitle: t("home.hero.title"),
        description: t("seo.home.description"),
        url: "https://info.tttingzhang999.com",
        sameAs: [
          "https://github.com/tttingzhang999",
          "https://www.linkedin.com/in/tingzhang98/",
        ],
        worksFor: [
          { "@type": "Organization", name: "Going Cloud" },
          {
            "@type": "Organization",
            name: "智電系統",
            alternateName: "Smart Power System",
          },
        ],
        knowsAbout: [
          "Python",
          "TypeScript",
          "Vue.js",
          "FastAPI",
          "Flask",
          "MongoDB",
          "PostgreSQL",
          "GCP",
          "Docker",
          "Kubernetes",
        ],
        email: "tttingzhang999@gmail.com",
      }),
    },
  ],
});
</script>
