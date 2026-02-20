<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          class="text-center max-w-4xl mx-auto"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 800 } }"
        >
          <!-- Avatar -->
          <div class="mb-8 flex justify-center">
            <div class="relative">
              <div class="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 p-1 shadow-2xl">
                <NuxtImg
                  src="/tuan_zmi.jpeg"
                  alt="Ting Zhang's cats"
                  class="w-full h-full rounded-full object-cover object-bottom-right"
                  loading="eager"
                  width="160"
                  height="160"
                />
              </div>
            </div>
          </div>

          <!-- Name & Title -->
          <h1 class="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-4">
            <span class="inline-block" v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 200, duration: 600 } }">
              {{ $t('home.hero.name') }}
            </span>
          </h1>

          <div
            class="space-y-4 mb-8"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1, transition: { delay: 600, duration: 600 } }"
          >
            <p class="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">
              {{ $t('home.hero.title') }}
            </p>
            <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
              {{ $t('home.hero.techStack') }}
            </p>
          </div>

          <!-- CTA Buttons -->
          <div
            class="flex justify-center items-center gap-6 mb-12"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{ opacity: 1, y: 0, transition: { delay: 200, duration: 600 } }"
          >
            <a
              v-for="(social, index) in socialLinks"
              :key="index"
              :href="social.url"
              :target="social.external ? '_blank' : undefined"
              :rel="social.external ? 'noopener noreferrer' : undefined"
              :aria-label="social.name"
              class="group w-14 h-14 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <component
                :is="social.icon"
                class="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
              />
            </a>
          </div>
        </div>

        <!-- Scroll Indicator -->
        <div
          class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 1200, duration: 600 } }"
        >
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="py-20 bg-gradient-to-br from-gray-50 to-primary-50/30 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-5xl mx-auto">
          <div
            class="text-center mb-16"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <h2 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {{ $t('home.about.title') }}
            </h2>
            <div class="w-24 h-1 bg-gradient-to-r from-primary-600 to-secondary-600 mx-auto"></div>
          </div>

          <div
            class="prose prose-lg dark:prose-dark mx-auto text-center mb-12"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{ opacity: 1, y: 0, transition: { delay: 200, duration: 600 } }"
          >
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed" v-html="$t('home.about.description1')"></p>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed" v-html="$t('home.about.description2')"></p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Navigation Cards -->
    <section class="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto">
          <div
            class="text-center mb-16"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <h2 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {{ $t('home.quickNav.title') }}
            </h2>
            <div class="w-24 h-1 bg-gradient-to-r from-primary-600 to-secondary-600 mx-auto"></div>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <NuxtLink
              v-for="(card, index) in navigationCards"
              :key="index"
              :to="card.link"
              class="group"
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{ opacity: 1, y: 0, transition: { delay: index * 150, duration: 600 } }"
            >
              <div class="relative h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <!-- Gradient Overlay -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>

                <!-- Icon -->
                <div class="relative mb-6">
                  <div :class="`w-16 h-16 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`">
                    <component :is="card.icon" class="w-8 h-8 text-white" />
                  </div>
                </div>

                <!-- Content -->
                <div class="relative">
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {{ card.title }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 mb-4">
                    {{ card.description }}
                  </p>
                  <div class="flex items-center text-primary-600 dark:text-primary-400 font-semibold">
                    <span>{{ $t('home.quickNav.learnMore') }}</span>
                    <svg class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()

// SEO Metadata
useSeoMeta({
  title: t('seo.home.title'),
  description: t('seo.home.description'),
  ogTitle: t('seo.home.title'),
  ogDescription: t('seo.home.description'),
  ogImage: '/og-image.jpg',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: t('seo.home.title'),
  twitterDescription: t('seo.home.description')
})

// Structured Data for SEO (Schema.org Person)
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Ting Zhang',
        alternateName: '張碩庭',
        jobTitle: t('home.hero.title'),
        description: t('seo.home.description'),
        url: 'https://ttting999-blog.vercel.app',
        sameAs: [
          'https://github.com/perplex0204',
          'https://www.linkedin.com/in/tingzhang98/'
        ],
        worksFor: [
          { '@type': 'Organization', name: 'Going Cloud' },
          { '@type': 'Organization', name: '智電系統', alternateName: 'Smart Power System' }
        ],
        knowsAbout: ['Python', 'TypeScript', 'Vue.js', 'FastAPI', 'Flask', 'MongoDB', 'PostgreSQL', 'GCP', 'Docker', 'Kubernetes'],
        email: 'tttingzhang999@gmail.com'
      })
    }
  ]
})

// SVG Icon Components
const ResumeIcon = h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  })
])

const ProjectIcon = h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
  })
])

const BlogIcon = h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
  })
])

const EmailIcon = h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  })
])

const LinkedInIcon = h('svg', {
  fill: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
  })
])

const GitHubIcon = h('svg', {
  fill: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    d: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'
  })
])

const GitlabIcon = h('svg', {
  fill: 'currentColor',
  viewBox: '0 0 24 24',
  xmlns: 'http://www.w3.org/2000/svg'
}, [
  h('path', {
    d: 'M23.6004 9.5927l-.0337-.0862L20.3.9814a.851.851 0 00-.3362-.405.8748.8748 0 00-.9997.0539.8748.8748 0 00-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 00-.29-.4412.8748.8748 0 00-.9997-.0537.8585.8585 0 00-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 002.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 001.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7476.0125-.01a6.0682 6.0682 0 002.0094-7.0117z'
  })
])

// Navigation Cards
const navigationCards = computed(() => [
  {
    title: t('home.quickNav.resume.title'),
    description: t('home.quickNav.resume.description'),
    link: localePath('/resume'),
    icon: ResumeIcon,
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    title: t('home.quickNav.projects.title'),
    description: t('home.quickNav.projects.description'),
    link: localePath('/projects'),
    icon: ProjectIcon,
    iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600'
  },
  {
    title: t('home.quickNav.blog.title'),
    description: t('home.quickNav.blog.description'),
    link: localePath('/blog'),
    icon: BlogIcon,
    iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600'
  }
])

// Social Links
const socialLinks = [
  {
    name: 'Email',
    url: 'mailto:tttingzhang999@gmail.com',
    icon: EmailIcon,
    external: false
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/tingzhang98/',
    icon: LinkedInIcon,
    external: true
  },
  {
    name: 'GitHub',
    url: 'https://github.com/perplex0204',
    icon: GitHubIcon,
    external: true
  },
  {
    name: 'Gitlab',
    url: 'https://gitlab.com/tttingzhang999',
    icon: GitlabIcon,
    external: true
  }
]
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
