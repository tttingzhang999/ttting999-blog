<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center justify-center gap-2 mt-8"
    aria-label="Blog pagination"
  >
    <!-- Previous Button -->
    <button
      :disabled="currentPage === 1"
      :aria-label="$t('blog.pagination.previous')"
      class="px-4 py-2 rounded-lg font-medium transition-all duration-200
             disabled:opacity-50 disabled:cursor-not-allowed
             enabled:hover:bg-primary-50 enabled:dark:hover:bg-gray-700
             enabled:hover:text-primary-600 enabled:dark:hover:text-primary-400
             text-gray-700 dark:text-gray-300"
      @click="goToPage(currentPage - 1)"
    >
      <span class="hidden sm:inline">{{ $t('blog.pagination.previous') }}</span>
      <span class="sm:hidden" aria-hidden="true">‹</span>
    </button>

    <!-- Page Numbers -->
    <div class="flex items-center gap-1 sm:gap-2">
      <button
        v-for="page in visiblePages"
        :key="page"
        :aria-label="$t('blog.pagination.page', { page })"
        :aria-current="page === currentPage ? 'page' : undefined"
        :class="[
          'min-w-[2.5rem] h-10 rounded-lg font-medium transition-all duration-200',
          page === currentPage
            ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
            : page === '...'
            ? 'cursor-default text-gray-500 dark:text-gray-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
        ]"
        :disabled="page === '...'"
        @click="page !== '...' && goToPage(page as number)"
      >
        {{ page }}
      </button>
    </div>

    <!-- Next Button -->
    <button
      :disabled="currentPage === totalPages"
      :aria-label="$t('blog.pagination.next')"
      class="px-4 py-2 rounded-lg font-medium transition-all duration-200
             disabled:opacity-50 disabled:cursor-not-allowed
             enabled:hover:bg-primary-50 enabled:dark:hover:bg-gray-700
             enabled:hover:text-primary-600 enabled:dark:hover:text-primary-400
             text-gray-700 dark:text-gray-300"
      @click="goToPage(currentPage + 1)"
    >
      <span class="hidden sm:inline">{{ $t('blog.pagination.next') }}</span>
      <span class="sm:hidden" aria-hidden="true">›</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Props {
  currentPage: number
  totalPages: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

/**
 * Calculate visible page numbers with ellipsis for large page counts
 *
 * Logic:
 * - Total pages ≤ 7: Show all pages [1] [2] [3] [4] [5] [6] [7]
 * - Total pages > 7: Show with ellipsis
 *   - Near start: [1] [2] [3] [4] [5] ... [10]
 *   - In middle: [1] ... [4] [5] [6] ... [10]
 *   - Near end: [1] ... [6] [7] [8] [9] [10]
 */
const visiblePages = computed<(number | string)[]>(() => {
  const { currentPage, totalPages } = props
  const pages: (number | string)[] = []

  // If 7 or fewer pages, show all
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  // Always show first page
  pages.push(1)

  // Calculate range around current page
  let startPage = Math.max(2, currentPage - 1)
  let endPage = Math.min(totalPages - 1, currentPage + 1)

  // Adjust range if near start or end
  if (currentPage <= 3) {
    endPage = 5
  } else if (currentPage >= totalPages - 2) {
    startPage = totalPages - 4
  }

  // Add ellipsis before start if needed
  if (startPage > 2) {
    pages.push('...')
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  // Add ellipsis after end if needed
  if (endPage < totalPages - 1) {
    pages.push('...')
  }

  // Always show last page
  pages.push(totalPages)

  return pages
})

/**
 * Navigate to specific page
 */
const goToPage = (page: number) => {
  if (page < 1 || page > props.totalPages || page === props.currentPage) {
    return
  }

  emit('update:currentPage', page)

  // Scroll to top of page smoothly
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<style scoped>
/* Ensure consistent button sizing */
button {
  @apply select-none;
}

/* Improve touch targets for mobile */
@media (max-width: 640px) {
  button {
    @apply min-w-[2.5rem] h-10;
  }
}
</style>
