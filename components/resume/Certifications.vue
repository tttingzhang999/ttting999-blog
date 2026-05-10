<template>
  <section class="py-16 bg-surface transition-colors duration-300">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {{ $t('resume.sections.certifications') }}
          </h2>
        </div>

        <!-- Certifications Grid -->
        <div class="grid sm:grid-cols-2 gap-6">
          <a
            v-for="(cert, index) in certifications"
            :key="index"
            :href="cert.credentialUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="group bg-surface-card rounded-xl p-6 border border-border hover:border-accent transition-colors flex flex-col"
          >
            <div class="flex items-start justify-between gap-4 mb-3">
              <h3 class="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                {{ cert.name }}
              </h3>
              <svg
                v-if="cert.credentialUrl"
                class="w-5 h-5 text-foreground-muted group-hover:text-accent transition-colors flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div class="text-sm text-foreground-muted mb-3">
              {{ cert.issuer }}
            </div>
            <div class="text-xs text-foreground-muted mt-auto">
              {{ formatDate(cert.issueDate) }}
            </div>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Certification } from '~/types/resume'

interface Props {
  certifications: Certification[]
}

defineProps<Props>()

function formatDate(value: string): string {
  const [year, month] = value.split('-')
  if (!month) return year
  return `${year}.${month}`
}
</script>
