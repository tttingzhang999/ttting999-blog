<template>
  <section class="rsec">
    <ResumeSectionHead
      num="04"
      :kicker="$t('resume.heads.certifications.kicker')"
      :pre="$t('resume.heads.certifications.pre')"
      :accent="$t('resume.heads.certifications.accent')"
      :post="$t('resume.heads.certifications.post')"
    />
    <div class="cert-list">
      <ResumeCertItem
        v-for="(cert, i) in certifications"
        :key="i"
        :cert="cert"
        :idx="i"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Certification } from "~/types/resume";

interface Props {
  certifications: Certification[];
}
defineProps<Props>();
</script>

<style scoped>
.rsec {
  margin: clamp(54px, 8vh, 86px) 0;
}
.cert-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
}
</style>
