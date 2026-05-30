<template>
  <div
    class="resume-page bg-surface text-foreground transition-colors duration-300"
  >
    <!-- Hero -->
    <ResumeHero
      :personal-info="resumeData.personalInfo"
      :social-links="resumeData.socialLinks"
    />

    <!-- 01 · Work Experience — scroll-driven flip deck -->
    <section class="rsec-exp">
      <ResumeExperienceTimeline :experiences="resumeData.workExperience" />
    </section>

    <!-- 02 · Side Projects -->
    <ResumeSideProjects
      v-if="resumeData.sideProjects && resumeData.sideProjects.length"
      :projects="resumeData.sideProjects"
    />

    <!-- 03 · Technical Skills -->
    <ResumeSkillsGrid :skills="resumeData.technicalSkills" />

    <!-- 04 · Certifications -->
    <ResumeCertifications
      v-if="resumeData.certifications && resumeData.certifications.length"
      :certifications="resumeData.certifications"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const resumeData = useResumeData();

// SEO Meta tags
const fullTitle = computed(
  () => `張碩庭 Ting Zhang - ${t("seo.resume.title")}`,
);

const ogImageAbs = useAbsoluteUrl("/og-image.jpg");
const ogUrlAbs = useAbsoluteUrl(useRoute().path);

useSeoMeta({
  title: () => t("seo.resume.title"),
  description: () => t("seo.resume.description"),
  ogTitle: () => fullTitle.value,
  ogDescription: () => t("seo.resume.description"),
  ogImage: ogImageAbs,
  ogUrl: ogUrlAbs,
  ogType: "profile",
  ogSiteName: "張碩庭 Ting Zhang",
  twitterCard: "summary_large_image",
  twitterTitle: () => fullTitle.value,
  twitterDescription: () => t("seo.resume.description"),
  twitterImage: ogImageAbs,
});

// Structured Data for SEO
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Ting Zhang",
          alternateName: "張碩庭",
          jobTitle: resumeData.value.personalInfo.title,
          email: resumeData.value.personalInfo.email,
          description: resumeData.value.personalInfo.bio,
          url: "https://info.tttingzhang999.com/resume",
          sameAs: [
            resumeData.value.socialLinks?.github,
            resumeData.value.socialLinks?.linkedin,
          ].filter(Boolean),
          worksFor: resumeData.value.workExperience.map((exp) => ({
            "@type": "Organization",
            name: exp.company,
          })),
          knowsAbout: resumeData.value.technicalSkills.flatMap(
            (skill) => skill.skills,
          ),
        }),
      ),
    },
  ],
});
</script>

<style scoped>
.resume-page {
  --gutter: clamp(32px, 6vw, 80px);
  max-width: 1120px;
  margin: 0 auto;
  padding: clamp(40px, 6vh, 72px) var(--gutter) 24px;
}
.rsec-exp {
  margin-top: clamp(40px, 6vh, 64px);
}
</style>
