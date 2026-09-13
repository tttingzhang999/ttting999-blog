<template>
  <div class="interior-page editorial-projects">
    <header class="work-heading"><h1>{{ $t('nav.projects') }}<span>.</span></h1></header>
    <EditorialChapterNav :links="orderedProjects.map(project=>({id:project.id,label:project.shortName || project.title.split(' - ')[0] || project.title}))" :label="$t('nav.projects')" />
    <article v-for="project in orderedProjects" :id="project.id" :key="project.id" class="case-study">
      <div class="case-context"><p>{{ project.period || project.date }}</p><p v-if="project.kind">{{ project.kind }}</p></div>
      <div class="case-body"><h2>{{ project.title }}</h2><p v-if="project.subtitle" class="case-subtitle">{{ project.subtitle }}</p><p class="case-description">{{ project.description }}</p><p v-if="project.role" class="case-role">{{ project.role }}</p><p v-if="project.teamSize" class="case-team">{{ project.teamSize }}</p>
        <dl v-if="project.stats?.length" class="case-stats"><div v-for="stat in project.stats" :key="stat.l"><dt>{{ stat.n }}</dt><dd>{{ stat.l }}</dd></div></dl>
        <p class="interior-technologies">{{ project.tags.join(' / ') }}</p>
        <div class="interior-links"><a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer">GitHub</a><a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener noreferrer">Demo</a><a v-if="project.appStore" :href="project.appStore" target="_blank" rel="noopener noreferrer">App Store</a><a v-if="project.googlePlay" :href="project.googlePlay" target="_blank" rel="noopener noreferrer">Google Play</a></div>
        <details><summary>{{ $t('projects.viewProject') }}</summary><ul class="interior-bullets case-highlights"><li v-for="line in project.highlights" :key="line">{{ line }}</li></ul><EditorialGallery :images="project.images?.length ? project.images : project.image ? [project.image] : []" :title="project.title" /></details>
      </div>
    </article>
  </div>
</template>
<script setup lang="ts">
import type { Project } from "~/types/project";
definePageMeta({ layout: "editorial" });

// "Selected Work" display order: products first, then power-grid platforms.
const REEL_ORDER = [
  "moniit-asset-management",
  "eatswiper",
  "promptlingo",
  "solar-pv-monitoring-system",
  "ev-charging-management-system",
  "power-transfer-management-system",
];

const projects = useProjectsData();

const orderedProjects = computed<Project[]>(() => {
  const byId = new Map(projects.value.map((p) => [p.id, p]));
  const ordered = REEL_ORDER.map((id) => byId.get(id)).filter(
    (p): p is Project => Boolean(p),
  );
  // Append any project not covered by REEL_ORDER so none silently disappears.
  const extras = projects.value.filter((p) => !REEL_ORDER.includes(p.id));
  return [...ordered, ...extras];
});



// i18n + SEO
const { t } = useI18n();
const fullTitle = computed(
  () => `張碩庭 Ting Zhang - ${t("seo.projects.title")}`,
);
const ogImageAbs = useAbsoluteUrl("/og-image.jpg");
const ogUrlAbs = useAbsoluteUrl(useRoute().path);

useSeoMeta({
  title: () => t("seo.projects.title"),
  description: () => t("seo.projects.description"),
  ogTitle: () => fullTitle.value,
  ogDescription: () => t("seo.projects.description"),
  ogImage: ogImageAbs,
  ogUrl: ogUrlAbs,
  ogType: "website",
  ogSiteName: "張碩庭 Ting Zhang",
  twitterCard: "summary_large_image",
  twitterTitle: () => fullTitle.value,
  twitterDescription: () => t("seo.projects.description"),
  twitterImage: ogImageAbs,
});
</script>
