<template>
  <section class="py-16 bg-surface transition-colors duration-300">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Work Experience
          </h2>
        </div>

        <!-- Left-aligned Timeline -->
        <div class="relative pl-8 md:pl-12">
          <!-- Vertical Line -->
          <div class="absolute left-3 md:left-5 top-0 bottom-0 w-px bg-border"></div>

          <!-- Experience Items -->
          <div class="space-y-10">
            <div
              v-for="(experience, index) in experiences"
              :key="index"
              class="relative"
            >
              <!-- Timeline Dot -->
              <div class="absolute -left-5 md:-left-7 top-1 w-3 h-3 rounded-full bg-accent border-2 border-surface z-10"></div>

              <!-- Content Card -->
              <div class="bg-surface-card rounded-xl p-6 border border-border hover:border-accent transition-colors duration-300">
                <!-- Company & Period -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                  <div>
                    <h3 class="text-xl font-bold text-foreground">
                      {{ experience.title }}
                    </h3>
                    <p class="text-accent font-semibold">
                      {{ experience.company }}
                    </p>
                  </div>
                  <span class="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-elevated text-foreground-muted rounded-lg text-sm font-medium whitespace-nowrap">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ experience.period }}
                  </span>
                </div>

                <!-- Description -->
                <ul class="list-disc list-outside pl-5 space-y-2 mb-4 text-foreground-muted text-sm leading-relaxed marker:text-accent">
                  <li
                    v-for="(desc, descIndex) in experience.description"
                    :key="descIndex"
                  >
                    {{ desc }}
                  </li>
                </ul>

                <!-- Technologies -->
                <div v-if="experience.technologies && experience.technologies.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="(tech, techIndex) in experience.technologies"
                    :key="techIndex"
                    class="px-2.5 py-1 bg-surface-elevated text-foreground-muted rounded-md text-xs font-medium"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WorkExperience } from '~/types/resume'

interface Props {
  experiences: WorkExperience[]
}

defineProps<Props>()
</script>
