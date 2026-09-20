<template>
  <div v-if="article" class="reader-page">
    <div class="reading-progress" role="progressbar" aria-label="閱讀進度" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100"><span :style="{transform: 'scaleX(' + progress / 100 + ')'}" /></div>
    <NuxtLink :to="archiveReturn" class="reader-back">返回文章列表</NuxtLink>
    <header class="reader-heading">
      <p class="reader-category">{{ article.category }}</p>
      <h1>{{ article.title }}</h1>
      <div class="reader-meta"><span>{{ article.author || 'Ting Zhang' }}</span><time :datetime="article.date">{{ formatDate(article.date) }}</time><span>{{ readingTime }} min read</span></div>
      <p v-if="article.description" class="reader-description">{{ article.description }}</p>
      <div class="reader-tags"><NuxtLink v-for="tag in article.tags" :key="tag" :to="{path:'/blog',query:{q:tag}}">#{{ tag }}</NuxtLink></div>
    </header>
    <div class="reader-grid">
      <aside v-if="toc?.links?.length" class="reader-toc">
        <details class="reader-toc-disclosure" ref="mobileToc"><summary>文章目錄</summary><nav aria-label="文章目錄"><ol><li v-for="link in toc.links" :key="link.id"><NuxtLink :to="'#' + link.id" :aria-current="activeHeading === link.id ? 'location' : undefined" @click="closeToc">{{ link.text }}</NuxtLink><ol v-if="link.children?.length"><li v-for="child in link.children" :key="child.id"><NuxtLink :to="'#' + child.id" :aria-current="activeHeading === child.id ? 'location' : undefined" @click="closeToc">{{ child.text }}</NuxtLink></li></ol></li></ol></nav></details>
      </aside>
      <article ref="readingBody" class="reading-content">
        <NuxtImg v-if="article.image" :src="article.image" :alt="article.title" class="reader-cover" width="1200" height="675" fit="contain" />
        <div class="prose prose-lg"><ContentRenderer :value="article" /></div>
        <div class="reader-share"><span>分享文章</span><a :href="'https://twitter.com/intent/tweet?text=' + encodeURIComponent(article.title) + '&url=' + encodeURIComponent(shareUrl)" target="_blank" rel="noopener noreferrer">X / Twitter</a><a :href="'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl)" target="_blank" rel="noopener noreferrer">LinkedIn</a></div>
      </article>
    </div>
    <section v-if="relatedArticles?.length" class="reader-related"><h2>繼續閱讀</h2><NuxtLink v-for="related in relatedArticles" :key="related.path" :to="related.path"><span>{{ related.category }}</span><h3>{{ related.title }}</h3></NuxtLink></section>
  </div>
</template>
<script setup lang="ts">
import { articleStructuredData } from "~/utils/seo/article";

// Opt this route out of i18n so each article has a
// single /blog/<slug> URL instead of untranslated /en + /ja duplicates.
defineI18nRoute(false);
definePageMeta({ layout: 'editorial' });
const archiveReturn = useState('archive-return', () => '/blog');
const progress = ref(0);
const readingBody = ref<HTMLElement | null>(null);
onMounted(() => {
  const update = () => {
    const body = readingBody.value;
    if (!body) return;
    const rect = body.getBoundingClientRect();
    progress.value = Math.min(100, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight) * 100));
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  const observer = new ResizeObserver(update);
  if (readingBody.value) observer.observe(readingBody.value);
  update();
  onBeforeUnmountCleanup = () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
    observer.disconnect();
  };
});
let onBeforeUnmountCleanup = () => {};
onBeforeUnmount(() => onBeforeUnmountCleanup());

const route = useRoute();
const slug = route.params.slug as string;

// Enable smooth anchor scrolling only while this article page is mounted.
// Nuxt removes this head entry on unmount, so the class (and its global
// `scroll-behavior: smooth`) does not leak to other routes.
useHead({ htmlAttrs: { class: "smooth-scroll" } });

// Fetch the article by slug
const { data: article } = await useAsyncData(`blog-${slug}`, () =>
  queryCollection("blog").path(`/blog/${slug}`).first(),
);

// If article not found, show 404
if (!article.value || article.value.draft) {
  throw createError({ statusCode: 404, statusMessage: "Article Not Found" });
}

// Get Table of Contents
const toc = computed(() => article.value?.body?.toc);
const activeHeading = useChapterPosition(() => (toc.value?.links ?? []).flatMap(link=>[link.id,...(link.children ?? []).map(child=>child.id)]));
const mobileToc = ref<HTMLDetailsElement | null>(null);
const closeToc = () => { if (mobileToc.value && matchMedia('(max-width: 850px)').matches) mobileToc.value.open = false; };

// Calculate reading time using the shared composable
// Supports mixed Chinese (500 chars/min) and English (200 words/min) content
const readingTime = useArticleReadingTime(article);

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Share URL
const shareUrl = computed(() => {
  if (import.meta.client) {
    return window.location.href;
  }
  return `https://info.tttingzhang999.com/blog/${slug}`;
});

// Fetch related articles (same category or shared tags)
const { data: relatedArticles } = await useAsyncData(
  `related-${slug}`,
  async () => {
    // Fetch all non-draft articles
    const allArticles = await queryCollection("blog")
      .where("draft", "<>", true)
      .all();

    // Filter out current article
    const articles = allArticles.filter((a) => a.path !== `/blog/${slug}`);

    // Score articles based on category match and tag overlap
    const scored = articles.map((a) => {
      let score = 0;
      if (a.category === article.value?.category) score += 3;
      const sharedTags =
        article.value?.tags?.filter((tag: string) => a.tags?.includes(tag)) ||
        [];
      score += sharedTags.length;
      return { article: a, score };
    });

    // Sort by score and return top 3
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.article);
  },
);

// SEO Meta tags
const articleLanguage = article.value.language || "zh-TW";
const fullTitle = `${article.value.title} | Ting Zhang`;

const ogImageAbs = useAbsoluteUrl(article.value.image || "/og-image.jpg");
const ogUrlAbs = useAbsoluteUrl(useRoute().path);

useSeoMeta({
  title: article.value.title,
  description: article.value.description,
  ogTitle: fullTitle,
  ogDescription: article.value.description,
  ogImage: ogImageAbs,
  ogUrl: ogUrlAbs,
  ogType: "article",
  ogSiteName: "張碩庭 Ting Zhang",
  articlePublishedTime: article.value.date,
  articleModifiedTime: article.value.updatedAt || undefined,
  ogLocale: articleLanguage.replace("-", "_"),
  articleAuthor: [article.value.author || "Ting Zhang"],
  articleTag: article.value.tags,
  twitterCard: "summary_large_image",
  twitterTitle: fullTitle,
  twitterDescription: article.value.description,
  twitterImage: ogImageAbs,
});

// Content language stays independent of the navigation language preference.
useHead({
  htmlAttrs: { lang: articleLanguage },
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify(articleStructuredData({ ...article.value, language: articleLanguage }, useAbsoluteUrl())).replace(/</g, "\\u003c"),
    },
  ],
});
</script>
