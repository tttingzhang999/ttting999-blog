<template>
  <section class="py-16 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div
        class="max-w-5xl mx-auto"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 800 } }"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
            <!-- Avatar -->
            <div
              class="flex-shrink-0"
              v-motion
              :initial="{ opacity: 0, scale: 0.8 }"
              :enter="{ opacity: 1, scale: 1, transition: { delay: 200, duration: 600 } }"
            >
              <div class="relative">
                <div class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 p-1 shadow-2xl">
                  <NuxtImg
                    src="/personal_image.jpg"
                    alt="Ting Zhang"
                    class="w-full h-full rounded-full object-cover object-top-right"
                    style="object-position: center 100%"
                    loading="eager"
                    width="160"
                    height="160"
                  />
                </div>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 text-center md:text-left">
              <div
                v-motion
                :initial="{ opacity: 0, x: -20 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 400, duration: 600 } }"
              >
                <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ personalInfo.name }}
                </h1>
                <p class="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 mb-4">
                  {{ personalInfo.title }}
                </p>
              </div>

              <div
                v-motion
                :initial="{ opacity: 0, x: -20 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 600, duration: 600 } }"
              >
                <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {{ personalInfo.bio }}
                </p>
              </div>

              <!-- Social Links -->
              <div
                v-if="socialLinks"
                class="flex justify-center md:justify-start gap-4 mt-6"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 600 } }"
              >
                <a
                  v-if="socialLinks.linkedin"
                  :href="socialLinks.linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-all transform hover:-translate-y-1"
                  aria-label="LinkedIn"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  personalInfo: {
    name: string
    title: string
    email: string
    location?: string
    bio: string
    avatar?: string
  }
  socialLinks?: {
    github?: string
    linkedin?: string
    email?: string
  }
}

defineProps<Props>()
</script>
