<template>
  <div>
    <LayoutHomeControls />

    <!-- Sticky scroll progress rail at the top of viewport -->
    <div class="scroll-rail">
      <div class="fill" :style="{ width: scrollPct + '%' }" />
    </div>

    <HomeHeroMotto />

    <div class="h-px border-t border-hairline mx-8 sm:mx-12 lg:mx-20" />

    <HomeAbout />

    <div class="h-px border-t border-hairline mx-8 sm:mx-12 lg:mx-20" />

    <HomeReel />

    <HomeQuickNav />

    <!-- Shared SVG turbulence filter — referenced by HomeHeroMotto + HomeAbout -->
    <svg
      style="position: fixed; width: 0; height: 0; overflow: hidden"
      aria-hidden="true"
    >
      <defs>
        <filter
          id="hero-ink"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          color-interpolation-filters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014"
            numOctaves="2"
            seed="4"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="18s"
              values="0.012;0.018;0.012"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

definePageMeta({ layout: "home" });

const { t } = useI18n();

useSeoMeta({
  title: t("seo.home.title"),
  description: t("seo.home.description"),
  ogTitle: t("seo.home.title"),
  ogDescription: t("seo.home.description"),
  ogImage: "/og-image.jpg",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: t("seo.home.title"),
  twitterDescription: t("seo.home.description"),
});

useHead({
  title: t("seo.home.title"),
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Ting Zhang",
        alternateName: "張碩庭",
        jobTitle: t("home.hero.title"),
        description: t("seo.home.description"),
        url: "https://info.tttingzhang999.com",
        sameAs: [
          "https://github.com/perplex0204",
          "https://www.linkedin.com/in/tingzhang98/",
        ],
        worksFor: [
          { "@type": "Organization", name: "Going Cloud" },
          {
            "@type": "Organization",
            name: "智電系統",
            alternateName: "Smart Power System",
          },
        ],
        knowsAbout: [
          "Python",
          "TypeScript",
          "Vue.js",
          "FastAPI",
          "Flask",
          "MongoDB",
          "PostgreSQL",
          "GCP",
          "Docker",
          "Kubernetes",
        ],
        email: "tttingzhang999@gmail.com",
      }),
    },
  ],
});

const scrollPct = ref(0);

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollPct.value = Math.min(100, (window.scrollY / Math.max(1, max)) * 100);
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
});
</script>
