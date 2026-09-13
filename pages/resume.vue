<template>
  <div class="interior-page editorial-resume">
    <header class="identity-heading">
      <div><h1>{{ resumeData.personalInfo.name }}</h1><p class="interior-kicker identity-role">{{ resumeData.personalInfo.title }}</p><p class="identity-bio">{{ resumeData.personalInfo.bio }}</p><p class="identity-location">{{ resumeData.personalInfo.location }}</p>
        <div class="interior-links"><a href="/resume.pdf" target="_blank" rel="noopener">{{ $t('resume.hero.downloadPdf') }}</a><a v-if="resumeData.socialLinks?.github" :href="resumeData.socialLinks.github" target="_blank" rel="noopener noreferrer">GitHub</a><a v-if="resumeData.socialLinks?.linkedin" :href="resumeData.socialLinks.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a><a :href="'mailto:' + resumeData.personalInfo.email">Email</a></div>
      </div>
      <NuxtImg class="identity-photo" src="/personal_image.jpg" :alt="resumeData.personalInfo.name" width="220" height="280" />
    </header>
    <EditorialChapterNav :links="chapters" :label="$t('nav.resume')" />
    <section id="experience" class="resume-chapter"><h2>{{ $t('resume.sections.experience') }}</h2><div class="career-list">
      <article v-for="experience in resumeData.workExperience" :key="experience.company + experience.startDate" class="career-entry">
        <p class="career-period">{{ experience.period }}</p><div><p class="interior-kicker">{{ experience.company }}</p><h3>{{ experience.title }}</h3><ul class="interior-bullets"><li v-for="line in experience.description" :key="line">{{ line }}</li></ul><p class="interior-technologies">{{ experience.technologies?.join(' / ') }}</p></div>
      </article>
    </div></section>
    <section id="side-projects" v-if="resumeData.sideProjects.length" class="resume-chapter"><h2>{{ $t('nav.projects') }}</h2><article v-for="project in resumeData.sideProjects" :key="project.title" class="resume-project"><p class="career-period">{{ project.period }}</p><h3>{{ project.title }}</h3><p>{{ project.description }}</p><ul class="interior-bullets"><li v-for="line in project.highlights" :key="line">{{ line }}</li></ul><p class="interior-technologies">{{ project.technologies?.join(' / ') }}</p><div class="interior-links"><a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer">GitHub</a><a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener noreferrer">Demo</a></div></article><NuxtLink class="interior-all" :to="localePath('/projects')">{{ $t('nav.projects') }} ↗</NuxtLink></section>
    <section id="skills" class="resume-chapter"><h2>{{ $t('resume.sections.skills') }}</h2><dl class="skill-lines"><div v-for="skill in resumeData.technicalSkills" :key="skill.category"><dt>{{ skill.category }}</dt><dd>{{ skill.skills.join(' / ') }}</dd></div></dl></section>
    <section id="certifications" v-if="resumeData.certifications?.length" class="resume-chapter"><h2>{{ $t('resume.sections.certifications') }}</h2><div class="credential-lines"><article v-for="cert in resumeData.certifications" :key="cert.name"><img v-if="cert.badgeImage" :src="cert.badgeImage" :alt="cert.name" loading="lazy" /><div><p class="career-period">{{ cert.issuer }} / {{ cert.issueDate }}</p><h3>{{ cert.name }}</h3><a v-if="cert.credentialUrl" :href="cert.credentialUrl" target="_blank" rel="noopener noreferrer">{{ $t('resume.sections.viewCredential') }}</a></div></article></div></section>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'editorial' });
const { t } = useI18n();
const localePath = useLocalePath();
const resumeData = useResumeData();
const chapters = computed(() => [
  {id:'experience',label:t('resume.sections.experience')},
  ...(resumeData.value.sideProjects.length ? [{id:'side-projects',label:t('nav.projects')}] : []),
  {id:'skills',label:t('resume.sections.skills')},
  ...(resumeData.value.certifications?.length ? [{id:'certifications',label:t('resume.sections.certifications')}] : []),
]);

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
