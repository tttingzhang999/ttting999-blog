<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-6xl mx-auto">
      <!-- Page Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-foreground mb-4">
          {{ $t('projects.pageTitle') }}
        </h1>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          @click="openModal(project)"
        />
      </div>
    </div>

    <!-- Project Modal -->
    <ProjectModal
      :project="selectedProject"
      :is-open="isModalOpen"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

// Get projects data based on current locale
const projects = useProjectsData()

// i18n
const { t } = useI18n()

// Modal state management
const selectedProject = ref<Project | null>(null)
const isModalOpen = computed(() => selectedProject.value !== null)

const openModal = (project: Project) => {
  selectedProject.value = project
}

const closeModal = () => {
  selectedProject.value = null
}

// SEO Meta tags with i18n
const fullTitle = computed(() => `張碩庭 Ting Zhang - ${t('seo.projects.title')}`)

useSeoMeta({
  title: () => t('seo.projects.title'),
  description: () => t('seo.projects.description'),
  ogTitle: () => fullTitle.value,
  ogDescription: () => t('seo.projects.description'),
  ogType: 'website'
})
</script>
