<template>
  <section class="py-16 bg-surface transition-colors duration-300">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Technical Skills
          </h2>
        </div>

        <!-- Skills Grid -->
        <div class="grid md:grid-cols-2 gap-6">
          <div
            v-for="(skillCategory, index) in skills"
            :key="index"
            class="bg-surface-card rounded-xl p-6 border border-border"
          >
            <!-- Category Header -->
            <h3 class="text-lg font-bold text-foreground mb-4">
              {{ skillCategory.category }}
            </h3>

            <!-- Skills Tags -->
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(skill, skillIndex) in skillCategory.skills"
                :key="skillIndex"
                class="px-3 py-1.5 bg-surface-elevated text-foreground-muted rounded-lg text-sm font-medium hover:text-accent transition-colors"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TechnicalSkill } from '~/types/resume'

interface Props {
  skills: TechnicalSkill[]
}

defineProps<Props>()
</script>
