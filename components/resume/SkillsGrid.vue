<template>
  <section class="rsec">
    <ResumeSectionHead
      num="03"
      :kicker="$t('resume.heads.skills.kicker')"
      :pre="$t('resume.heads.skills.pre')"
      :accent="$t('resume.heads.skills.accent')"
      :post="$t('resume.heads.skills.post')"
    />
    <div class="skills-list">
      <ResumeSkillRow
        v-for="(skill, i) in skills"
        :key="i"
        :skill="skill"
        :idx="i"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TechnicalSkill } from "~/types/resume";

interface Props {
  skills: TechnicalSkill[];
}
defineProps<Props>();
</script>

<style scoped>
.rsec {
  margin: clamp(54px, 8vh, 86px) 0;
}
.skills-list {
  margin-top: 8px;
}
</style>
