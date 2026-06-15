<template>
  <div class="pr-page">
    <ProjectsProjectReel :list="orderedProjects" @open="openProject = $event" />
    <ProjectsProjectModal :project="openProject" @close="openProject = null" />
  </div>
</template>

<script setup lang="ts">
import type { Project } from "~/types/project";

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

const openProject = ref<Project | null>(null);

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

<style scoped>
/* The reel owns the whole scroll area; the page sits below the fixed 64px nav
   (the default layout already pads main with pt-16). */
.pr-page {
  position: relative;
}
</style>
