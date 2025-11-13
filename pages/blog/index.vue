<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-6xl mx-auto">
      <!-- Page Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ $t('blog.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          {{ $t('blog.subtitle') }}
        </p>
      </div>

      <!-- Category Filter -->
      <div class="mb-8">
        <div class="flex flex-wrap gap-3">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="selectedCategory = cat.value"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all duration-200',
              selectedCategory === cat.value
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            {{ cat.label }}
            <span class="ml-2 text-sm opacity-75">({{ cat.count }})</span>
          </button>
        </div>
      </div>

      <!-- Tag Filter (if any tags are selected or available) -->
      <div v-if="allTags.length > 0" class="mb-8">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {{ $t('blog.popularTags') }}
        </h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in allTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium transition-all duration-200',
              selectedTags.includes(tag)
                ? 'bg-secondary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            #{{ tag }}
          </button>
        </div>
      </div>

      <!-- Article Count -->
      <div class="mb-6 text-sm text-gray-600 dark:text-gray-400">
        {{ $t('blog.articleCount', { count: filteredArticles.length }) }}
      </div>

      <!-- Articles Grid -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Loading skeleton -->
        <div
          v-for="i in 6"
          :key="i"
          class="bg-gray-100 dark:bg-gray-800 rounded-lg h-96 animate-pulse"
        ></div>
      </div>

      <div
        v-else-if="filteredArticles.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ArticleCard
          v-for="article in filteredArticles"
          :key="article.path"
          :article="article"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <svg
          class="w-16 h-16 mx-auto mb-4 text-gray-400"
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
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('blog.noPosts') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          {{ selectedCategory !== 'all' || selectedTags.length > 0 ? $t('blog.tryOtherFilters') : $t('blog.comingSoon') }}
        </p>
        <button
          v-if="selectedCategory !== 'all' || selectedTags.length > 0"
          @click="resetFilters"
          class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {{ $t('blog.clearFilters') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// SEO Meta tags
useSeoMeta({
  title: t('seo.blog.title'),
  description: t('seo.blog.description'),
  ogTitle: t('seo.blog.title'),
  ogDescription: t('seo.blog.description'),
  ogType: 'website'
})

// Fetch all blog articles
const { data: articles, pending } = await useAsyncData('blog-articles', () =>
  queryCollection('blog')
    .where('draft', '!=', true) // Exclude draft articles
    .order('date', 'DESC') // Sort by date, newest first
    .all()
)

// Filter state
const selectedCategory = ref<string>('all')
const selectedTags = ref<string[]>([])

// Compute all available tags from articles
const allTags = computed(() => {
  if (!articles.value) return []
  const tagsSet = new Set<string>()
  articles.value.forEach(article => {
    article.tags?.forEach((tag: string) => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
})

// Compute categories with counts
const categories = computed(() => {
  if (!articles.value) return [{ label: t('blog.all'), value: 'all', count: 0 }]

  const counts: Record<string, number> = {}
  articles.value.forEach(article => {
    const cat = article.category || t('blog.categoryOther')
    counts[cat] = (counts[cat] || 0) + 1
  })

  return [
    { label: t('blog.all'), value: 'all', count: articles.value.length },
    { label: t('blog.categoryReflection'), value: '心得', count: counts['心得'] || 0 },
    { label: t('blog.categoryTech'), value: '技術', count: counts['技術'] || 0 },
    { label: t('blog.categoryLife'), value: '生活', count: counts['生活'] || 0 }
  ].filter(cat => cat.count > 0 || cat.value === 'all')
})

// Filter articles by category and tags
const filteredArticles = computed(() => {
  if (!articles.value) return []

  let filtered = articles.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(article => article.category === selectedCategory.value)
  }

  // Filter by tags (AND logic: article must have all selected tags)
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(article =>
      selectedTags.value.every(tag => article.tags?.includes(tag))
    )
  }

  return filtered
})

// Toggle tag selection
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// Reset all filters
const resetFilters = () => {
  selectedCategory.value = 'all'
  selectedTags.value = []
}
</script>
