<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <ResumeHero
      :personal-info="resumeData.personalInfo"
      :social-links="resumeData.socialLinks"
    />

    <!-- Work Experience Timeline -->
    <ResumeExperienceTimeline :experiences="resumeData.workExperience" />

    <!-- Side Projects -->
    <ResumeSideProjects :projects="resumeData.sideProjects" />

    <!-- Technical Skills -->
    <ResumeSkillsGrid :skills="resumeData.technicalSkills" />

    <!-- Certifications -->
    <ResumeCertifications
      v-if="resumeData.certifications && resumeData.certifications.length"
      :certifications="resumeData.certifications"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const resumeData = useResumeData()

// SEO Meta tags
const fullTitle = computed(() => `張碩庭 Ting Zhang - ${t('seo.resume.title')}`)

useSeoMeta({
  title: () => t('seo.resume.title'),
  description: () => t('seo.resume.description'),
  ogTitle: () => fullTitle.value,
  ogDescription: () => t('seo.resume.description'),
  ogType: 'profile',
  twitterCard: 'summary',
  twitterTitle: () => fullTitle.value,
  twitterDescription: () => t('seo.resume.description')
})

// Structured Data for SEO
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Ting Zhang',
        alternateName: '張碩庭',
        jobTitle: resumeData.value.personalInfo.title,
        email: resumeData.value.personalInfo.email,
        description: resumeData.value.personalInfo.bio,
        url: 'https://info.tttingzhang999.com/resume',
        sameAs: [
          resumeData.value.socialLinks?.github,
          resumeData.value.socialLinks?.linkedin
        ].filter(Boolean),
        worksFor: resumeData.value.workExperience.map(exp => ({
          '@type': 'Organization',
          name: exp.company
        })),
        knowsAbout: resumeData.value.technicalSkills.flatMap(skill => skill.skills)
      }))
    }
  ]
})
</script>
