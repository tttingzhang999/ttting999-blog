<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-7xl mx-auto">
      <!-- Back Button -->
      <NuxtLink
        :to="localePath('/blog')"
        class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>返回文章列表</span>
      </NuxtLink>

      <!-- Article Header -->
      <header class="mb-8">
        <!-- Category Badge -->
        <div class="mb-4">
          <span class="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
            {{ article.category }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          {{ article.title }}
        </h1>

        <!-- Meta Information -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <!-- Author -->
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{{ article.author || 'Ting Zhang' }}</span>
          </div>

          <!-- Date -->
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time :datetime="article.date">
              {{ formatDate(article.date) }}
            </time>
          </div>

          <!-- Reading Time -->
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ readingTime }} min read</span>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="article.tags && article.tags.length > 0" class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in article.tags"
            :key="tag"
            class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
          >
            #{{ tag }}
          </span>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Content -->
        <article class="lg:col-span-8">

          <!-- Cover Image -->
          <div v-if="article.image" class="mb-8 rounded-xl overflow-hidden">
            <NuxtImg
              :src="article.image"
              :alt="article.title"
              class="w-full h-auto"
              loading="lazy"
            />
          </div>

          <!-- Article Description -->
          <div v-if="article.description" class="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-primary-500">
            <p class="text-lg text-gray-700 dark:text-gray-300 italic">
              {{ article.description }}
            </p>
          </div>

          <!-- Article Content -->
          <div class="prose prose-lg dark:prose-dark max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
            prose-img:rounded-lg
            prose-blockquote:border-l-primary-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800 prose-blockquote:py-1 prose-blockquote:px-4
          ">
            <ContentRenderer :value="article" />
          </div>

          <!-- Share Buttons (Optional) -->
          <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              分享這篇文章
            </h3>
            <div class="flex gap-4">
              <!-- Twitter -->
              <a
                :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Share on Twitter"
              >
                <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <!-- LinkedIn -->
              <a
                :href="`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </article>

        <!-- Sidebar - Table of Contents -->
        <aside class="hidden lg:block lg:col-span-4">
          <div class="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-custom">
            <!-- Table of Contents -->
            <div v-if="toc && toc.links && toc.links.length > 0" class="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                目錄
              </h3>
              <nav>
                <ul class="space-y-2 text-sm">
                  <li v-for="link in toc.links" :key="link.id">
                    <a
                      :href="`#${link.id}`"
                      class="block py-1 px-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {{ link.text }}
                    </a>
                    <!-- Nested headings -->
                    <ul v-if="link.children && link.children.length > 0" class="ml-4 mt-1 space-y-1">
                      <li v-for="child in link.children" :key="child.id">
                        <a
                          :href="`#${child.id}`"
                          class="block py-1 px-3 text-sm text-gray-500 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {{ child.text }}
                        </a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </aside>
      </div>

      <!-- Related Articles -->
      <div v-if="relatedArticles && relatedArticles.length > 0" class="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          相關文章
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCard
            v-for="relatedArticle in relatedArticles"
            :key="relatedArticle.path"
            :article="relatedArticle"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const localePath = useLocalePath()

// Fetch the article by slug
const { data: article } = await useAsyncData(`blog-${slug}`, () =>
  queryCollection('blog').path(`/blog/${slug}`).first()
)

// If article not found, show 404
if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article Not Found' })
}

// Get Table of Contents
const toc = computed(() => article.value?.body?.toc)

// Calculate reading time using the shared composable
// Supports mixed Chinese (500 chars/min) and English (200 words/min) content
const readingTime = useArticleReadingTime(article)

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Share URL
const shareUrl = computed(() => {
  if (import.meta.client) {
    return window.location.href
  }
  return `https://ttting999-blog.vercel.app/blog/${slug}`
})

// Fetch related articles (same category or shared tags)
const { data: relatedArticles } = await useAsyncData(`related-${slug}`, async () => {
  // Fetch all non-draft articles
  const allArticles = await queryCollection('blog')
    .where('draft', '!=', true)
    .all()

  // Filter out current article
  const articles = allArticles.filter(a => a.path !== `/blog/${slug}`)

  // Score articles based on category match and tag overlap
  const scored = articles.map(a => {
    let score = 0
    if (a.category === article.value?.category) score += 3
    const sharedTags = article.value?.tags?.filter((tag: string) => a.tags?.includes(tag)) || []
    score += sharedTags.length
    return { article: a, score }
  })

  // Sort by score and return top 3
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.article)
})

// SEO Meta tags
useSeoMeta({
  title: `${article.value.title} - Ting Zhang`,
  description: article.value.description,
  ogTitle: article.value.title,
  ogDescription: article.value.description,
  ogImage: article.value.image || '/og-image.jpg',
  ogType: 'article',
  articlePublishedTime: article.value.date,
  articleAuthor: article.value.author || 'Ting Zhang',
  articleTag: article.value.tags,
  twitterCard: 'summary_large_image',
  twitterTitle: article.value.title,
  twitterDescription: article.value.description,
  twitterImage: article.value.image || '/og-image.jpg'
})

// Structured Data for SEO (Schema.org Article)
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.value.title,
        description: article.value.description,
        image: article.value.image || 'https://ttting999-blog.vercel.app/og-image.jpg',
        datePublished: article.value.date,
        author: {
          '@type': 'Person',
          name: article.value.author || 'Ting Zhang',
          url: 'https://ttting999-blog.vercel.app'
        },
        publisher: {
          '@type': 'Person',
          name: 'Ting Zhang',
          url: 'https://ttting999-blog.vercel.app'
        },
        keywords: article.value.tags?.join(', '),
        articleSection: article.value.category
      })
    }
  ]
})
</script>

<style>
/* Smooth scroll behavior for anchor links */
html {
  scroll-behavior: smooth;
}

/* Offset for fixed header when jumping to anchors */
:target {
  scroll-margin-top: 5rem;
}

/* Custom scrollbar for TOC */
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: rgb(203 213 225) transparent; /* slate-300 for light mode */
}

/* Dark mode scrollbar */
.dark .scrollbar-custom {
  scrollbar-color: rgb(71 85 105) transparent; /* slate-600 for dark mode */
}

/* Webkit browsers (Chrome, Safari, Edge) */
.scrollbar-custom::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: rgb(203 213 225); /* slate-300 */
  border-radius: 3px;
  transition: background-color 0.2s;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background-color: rgb(148 163 184); /* slate-400 */
}

/* Dark mode webkit scrollbar */
.dark .scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: rgb(71 85 105); /* slate-600 */
}

.dark .scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background-color: rgb(100 116 139); /* slate-500 */
}
</style>
