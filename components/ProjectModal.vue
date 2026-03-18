<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && project"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div
          class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-surface-card rounded-2xl shadow-2xl"
          @click.stop
        >
          <!-- Close Button -->
          <button
            @click="closeModal"
            class="sticky top-4 right-4 float-right z-10 p-2 rounded-full bg-surface-elevated hover:text-accent transition-colors"
            :aria-label="$t('projects.close')"
          >
            <svg
              class="w-6 h-6 text-foreground-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Modal Content -->
          <div class="p-8">
            <!-- Header -->
            <div class="mb-6">
              <!-- Title -->
              <h2 class="text-3xl font-bold text-foreground mb-3">
                {{ project.title }}
              </h2>

              <!-- Date -->
              <time
                :datetime="project.date"
                class="text-sm text-foreground-muted"
              >
                {{ formatDate(project.date) }}
              </time>
            </div>

            <!-- App Store Download Buttons -->
            <div v-if="isAppProject" class="mb-6 flex flex-wrap gap-3">
              <a
                v-if="project.appStore"
                :href="project.appStore"
                target="_blank"
                rel="noopener noreferrer"
                class="block hover:opacity-80 transition-opacity"
              >
                <img
                  src="/app_store.svg"
                  alt="Download on the App Store"
                  class="h-12 w-auto pt-2"
                >
              </a>
              <a
                v-if="project.googlePlay"
                :href="project.googlePlay"
                target="_blank"
                rel="noopener noreferrer"
                class="block hover:opacity-80 transition-opacity"
              >
                <img
                  src="/google_play.svg"
                  alt="Get it on Google Play"
                  class="h-14 w-auto"
                >
              </a>
              <!-- Placeholder buttons when links not available -->
              <template v-if="!project.appStore && !project.googlePlay">
                <div class="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-white rounded-lg opacity-60">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span class="text-sm">{{ $t('projects.appStoreComingSoon') }}</span>
                </div>
                <div class="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-white rounded-lg opacity-60">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <span class="text-sm">{{ $t('projects.googlePlayComingSoon') }}</span>
                </div>
              </template>
            </div>

            <!-- Description -->
            <div class="mb-6">
              <p class="text-foreground-muted leading-relaxed">
                {{ project.description }}
              </p>
            </div>

            <!-- Image Carousel -->
            <div v-if="project.images && project.images.length > 0" class="mb-8">
              <ImageCarousel :images="project.images" />
            </div>

            <!-- Tags -->
            <div v-if="project.tags?.length" class="mb-8">
              <h3 class="text-sm font-semibold text-foreground mb-3">
                {{ $t('projects.technicalTags') }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in project.tags"
                  :key="tag"
                  class="px-3 py-1 bg-surface-elevated text-accent rounded-full text-sm font-medium"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Highlights -->
            <div v-if="project.highlights?.length" class="mb-8">
              <h3 class="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {{ $t('projects.projectHighlights') }}
              </h3>
              <ul class="space-y-2">
                <li
                  v-for="(highlight, index) in project.highlights"
                  :key="index"
                  class="flex items-start gap-3 text-foreground-muted"
                >
                  <svg
                    class="w-5 h-5 text-accent mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{{ highlight }}</span>
                </li>
              </ul>
            </div>

            <!-- Project Info -->
            <div class="mb-8 p-4 bg-surface-elevated rounded-lg">
              <h3 class="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ $t('projects.projectInfo') }}
              </h3>
              <div class="space-y-2 text-sm">
                <div v-if="project.period" class="flex items-start gap-2">
                  <span class="font-medium text-foreground-muted w-20">{{ $t('projects.period') }}：</span>
                  <span class="text-foreground">{{ project.period }}</span>
                </div>
                <div v-if="project.teamSize" class="flex items-start gap-2">
                  <span class="font-medium text-foreground-muted w-20">{{ $t('projects.team') }}：</span>
                  <span class="text-foreground">{{ project.teamSize }}</span>
                </div>
                <div v-if="project.role" class="flex items-start gap-2">
                  <span class="font-medium text-foreground-muted w-20">{{ $t('projects.role') }}：</span>
                  <span class="text-foreground">{{ project.role }}</span>
                </div>
              </div>
            </div>

            <!-- Links -->
            <div v-if="project.github || project.demo" class="flex flex-wrap gap-4">
              <a
                v-if="project.github"
                :href="project.github"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-white rounded-lg hover:opacity-80 transition-opacity font-medium"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {{ $t('projects.viewCode') }}
              </a>
              <a
                v-if="project.demo"
                :href="project.demo"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {{ $t('projects.link') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

const props = defineProps<{
  project: Project | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// i18n
const { locale } = useI18n()

// Check if project is an app based on tags
const isAppProject = computed(() => {
  if (!props.project || !props.project.tags) return false
  const appTags = ['iOS', 'Android', 'Mobile App', 'Flutter', 'React Native', 'Swift', 'Kotlin']
  return props.project.tags.some(tag =>
    appTags.some(appTag => tag.toLowerCase().includes(appTag.toLowerCase()))
  )
})

const closeModal = () => {
  emit('close')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'long'
  })
}

// Close on ESC key
onMounted(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      closeModal()
    }
  }
  window.addEventListener('keydown', handleEsc)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleEsc)
  })
})

// Prevent body scroll when modal is open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
