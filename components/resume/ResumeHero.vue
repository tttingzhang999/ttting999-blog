<template>
  <section class="py-16 bg-surface transition-colors duration-300">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div
        class="max-w-5xl mx-auto"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 600 } }"
      >
        <div class="bg-surface-card rounded-2xl p-8 md:p-12 border border-border">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div class="w-32 h-32 md:w-40 md:h-40 rounded-full ring-2 ring-accent ring-offset-4 overflow-hidden" style="--tw-ring-offset-color: var(--color-surface)">
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

            <!-- Info -->
            <div class="flex-1 text-center md:text-left">
              <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {{ personalInfo.name }}
              </h1>
              <p class="text-2xl font-semibold text-accent mb-4">
                {{ personalInfo.title }}
              </p>
              <p class="text-foreground-muted mb-6 leading-relaxed">
                {{ personalInfo.bio }}
              </p>

              <!-- Social Links -->
              <div
                v-if="socialLinks"
                class="flex justify-center md:justify-start gap-4 mt-6"
              >
                <a
                  v-if="socialLinks.linkedin"
                  :href="socialLinks.linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-foreground-muted hover:text-accent transition-colors duration-200"
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
