<template>
  <div
    class="group block bg-surface-card rounded-lg overflow-hidden border border-border hover:border-accent transition-colors duration-300 cursor-pointer"
    @click="$emit('click', project)"
  >
    <!-- Project Image -->
    <div
      v-if="project.image"
      class="relative h-48 overflow-hidden bg-surface-elevated flex items-center justify-center p-2"
    >
      <NuxtImg
        :src="project.image"
        :alt="project.title"
        class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
    <div
      v-else
      class="relative h-48 bg-surface-elevated flex items-center justify-center"
    >
      <svg
        class="w-16 h-16 text-foreground-muted opacity-30"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    </div>

    <!-- Project Content -->
    <div class="p-6">
      <!-- Title -->
      <h3 class="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
        {{ project.title }}
      </h3>

      <!-- Date -->
      <time
        :datetime="project.date"
        class="text-sm text-foreground-muted mb-3 block"
      >
        {{ formatDate(project.date) }}
      </time>

      <!-- Description -->
      <p class="text-foreground-muted text-sm mb-4 line-clamp-3">
        {{ project.description }}
      </p>

      <!-- Tags -->
      <div v-if="project.tags && project.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in project.tags.slice(0, 4)"
          :key="tag"
          class="px-2 py-1 bg-surface-elevated text-foreground-muted rounded text-xs font-medium"
        >
          {{ tag }}
        </span>
        <span
          v-if="project.tags.length > 4"
          class="px-2 py-1 text-foreground-muted text-xs"
        >
          {{ $t('projects.moreCount', { count: project.tags.length - 4 }) }}
        </span>
      </div>

      <!-- Links -->
      <div class="flex items-center gap-4 text-sm">
        <div class="flex gap-3">
          <a
            v-if="project.github"
            :href="project.github"
            target="_blank"
            rel="noopener noreferrer"
            class="text-foreground-muted hover:text-accent transition-colors"
            @click.stop
            :title="$t('projects.viewCode')"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

const props = defineProps<{
  project: Project
}>()

const { locale } = useI18n()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'long'
  })
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
