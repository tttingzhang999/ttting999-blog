<template>
  <NuxtLink
    :to="localePath(`/blog/${article.path?.split('/').pop()}`)"
    class="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >
    <!-- Article Image -->
    <div
      v-if="article.image"
      class="relative h-48 overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500"
    >
      <NuxtImg
        :src="article.image"
        :alt="article.title"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        loading="lazy"
      />
      <!-- Category Badge Overlay -->
      <div class="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-sm">
        {{ getCategoryLabel(article.category) }}
      </div>
    </div>
    <div
      v-else
      class="relative h-48 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center"
    >
      <svg
        class="w-16 h-16 text-white opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <!-- Category Badge Overlay -->
      <div class="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-sm">
        {{ getCategoryLabel(article.category) }}
      </div>
    </div>

    <!-- Article Content -->
    <div class="p-6">
      <!-- Title -->
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
        {{ article.title }}
      </h3>

      <!-- Date & Reading Time -->
      <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <time :datetime="article.date">
          {{ formatDate(article.date) }}
        </time>
        <span>•</span>
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ readingTime }} min read
        </span>
      </div>

      <!-- Description -->
      <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
        {{ article.description }}
      </p>

      <!-- Tags -->
      <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="tag in article.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium"
        >
          #{{ tag }}
        </span>
        <span
          v-if="article.tags.length > 3"
          class="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs"
        >
          +{{ article.tags.length - 3 }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

interface Article {
  path?: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  image?: string
  author?: string
  draft?: boolean
  body?: any // Nuxt Content body (AST)
}

const props = defineProps<{
  article: Article
}>()

// Format date to readable string
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get category label with i18n
const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    '心得': t('blog.categoryReflection'),
    '技術': t('blog.categoryTech'),
    '生活': t('blog.categoryLife'),
    'Insight': t('blog.categoryInsight'),
    '專案': t('blog.categoryProject')
  }
  return categoryMap[category] || category
}

// Calculate reading time using the shared composable
// Supports mixed Chinese (500 chars/min) and English (200 words/min) content
const readingTime = computed(() => {
  if (!props.article.body) return 1
  return useReadingTime(props.article.body)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
