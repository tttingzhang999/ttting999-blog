<template>
  <section class="py-16 bg-surface-elevated transition-colors duration-300">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Side Projects
          </h2>
        </div>

        <!-- Projects Grid -->
        <div class="grid md:grid-cols-2 gap-6">
          <div
            v-for="(project, index) in projects"
            :key="index"
            class="group bg-surface-card rounded-xl p-6 border border-border hover:border-accent transition-colors duration-300"
          >
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-foreground group-hover:text-accent transition-colors mb-2">
                  {{ project.title }}
                </h3>
                <p class="text-foreground-muted text-sm mb-2">
                  {{ project.description }}
                </p>
                <span class="inline-flex items-center gap-2 text-foreground-muted text-xs">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ project.period }}
                </span>
              </div>
            </div>

            <!-- Highlights -->
            <ul class="list-disc list-outside pl-5 space-y-2 mb-4 text-foreground-muted text-sm leading-relaxed marker:text-accent-alt">
              <li
                v-for="(highlight, highlightIndex) in project.highlights"
                :key="highlightIndex"
              >
                {{ highlight }}
              </li>
            </ul>

            <!-- Technologies -->
            <div v-if="project.technologies && project.technologies.length > 0" class="mb-4">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(tech, techIndex) in project.technologies"
                  :key="techIndex"
                  class="px-2.5 py-1 bg-surface-elevated text-foreground-muted rounded-md text-xs font-medium"
                >
                  {{ tech }}
                </span>
              </div>
            </div>

            <!-- Links -->
            <div v-if="project.github || project.demo" class="flex gap-3 pt-4 border-t border-border-muted">
              <a
                v-if="project.github"
                :href="project.github"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2 bg-surface-elevated text-foreground-muted rounded-lg hover:text-accent transition-colors text-sm font-medium"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a
                v-if="project.demo"
                :href="project.demo"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2 bg-surface-elevated text-accent-alt rounded-lg hover:text-accent-alt-hover transition-colors text-sm font-medium"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Live Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SideProject } from '~/types/resume'

interface Props {
  projects: SideProject[]
}

defineProps<Props>()
</script>
