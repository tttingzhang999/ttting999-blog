<template>
  <section class="rsec">
    <ResumeSectionHead
      num="02"
      :kicker="$t('resume.heads.sideProjects.kicker')"
      :pre="$t('resume.heads.sideProjects.pre')"
      :accent="$t('resume.heads.sideProjects.accent')"
      :post="$t('resume.heads.sideProjects.post')"
    />
    <div class="sp-grid">
      <ResumeSideProjectCard
        v-for="(project, i) in projects"
        :key="i"
        :project="project"
        :idx="i"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SideProject } from "~/types/resume";

interface Props {
  projects: SideProject[];
}
defineProps<Props>();
</script>

<style scoped>
.rsec {
  margin: clamp(54px, 8vh, 86px) 0;
}
.sp-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
  margin-top: 8px;
}
@media (max-width: 900px) {
  .sp-grid {
    grid-template-columns: 1fr;
  }
}
</style>
