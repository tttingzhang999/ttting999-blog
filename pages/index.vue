<template>
  <div>
    <!-- Floating language + theme toggles (homepage chrome) -->
    <LayoutHomeControls />

    <!-- Sticky scroll progress rail at the top of viewport -->
    <div class="scroll-rail"><div class="fill" :style="{ width: scrollPct + '%' }" /></div>

    <!-- =========================================================== -->
    <!-- HERO — "Plan and execute." motto with cursor-driven mask     -->
    <!-- =========================================================== -->
    <section
      id="hero"
      class="hero relative min-h-screen flex flex-col"
    >
      <div class="absolute top-6 left-8 sm:left-12 lg:left-20 gutter-label flex items-center in-view">
        <span class="h2-rule" />01 · Motto
      </div>

      <div
        ref="heroStageEl"
        class="hero-stage flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-20"
      >
        <h1 ref="mottoStackEl" class="motto-stack" :aria-label="mottoAria">
          <span class="motto-base" aria-hidden="true">
            <span class="motto-line">{{ $t('home.motto.verb') }}</span>
            <span class="motto-line motto-and">{{ $t('home.motto.and') }}</span>
            <span class="motto-line">{{ $t('home.motto.execute') }}<span class="motto-dot">.</span></span>
          </span>
          <span class="motto-reveal" aria-hidden="true">
            <span class="motto-line">{{ $t('home.motto.verb') }}</span>
            <span class="motto-line motto-and">{{ $t('home.motto.and') }}</span>
            <span class="motto-line">{{ $t('home.motto.execute') }}<span class="motto-dot">.</span></span>
          </span>
        </h1>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground-faint pointer-events-none">
        <span class="gutter-label">scroll</span>
        <span class="block w-px h-10 bg-current" />
      </div>
    </section>

    <div class="h-px border-t border-hairline mx-8 sm:mx-12 lg:mx-20" />

    <!-- =========================================================== -->
    <!-- ABOUT — one-shot reveal via IntersectionObserver             -->
    <!-- =========================================================== -->
    <section
      ref="aboutSectionEl"
      id="about"
      class="about-section"
      :class="{ 'is-revealed': aboutRevealed }"
    >
      <div class="about-stage px-8 sm:px-12 lg:px-20">
        <div class="gutter-label flex items-center" :class="{ 'in-view': aboutRevealed }">
          <span class="h2-rule" />02 · About
        </div>

        <div class="identity-row flex items-center gap-5">
          <div
            class="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-hairline shrink-0"
            aria-hidden="true"
          >
            <NuxtImg
              src="/tuan_zmi.jpeg"
              alt=""
              class="w-full h-full object-cover object-bottom-right"
              width="64"
              height="64"
            />
          </div>
          <div class="min-w-0">
            <div class="text-foreground text-[18px] sm:text-[20px] font-medium leading-tight tracking-tight">
              {{ $t('home.about.dateline') }}
            </div>
            <div class="gutter-label mt-2">{{ $t('home.about.role') }}</div>
          </div>
        </div>

        <div class="grid md:grid-cols-[1.5fr_1fr] gap-12 lg:gap-20 items-start">
          <div>
            <h2 class="about-title-stack">
              <span class="at-base" aria-hidden="true">
                {{ $t('home.about.titlePre') }}<span class="font-fraunces italic font-normal text-accent">{{ $t('home.about.titleAccent') }}</span>{{ $t('home.about.titlePost') }}
              </span>
              <span class="at-reveal">
                {{ $t('home.about.titlePre') }}<span class="font-fraunces italic font-normal text-accent">{{ $t('home.about.titleAccent') }}</span>{{ $t('home.about.titlePost') }}
              </span>
            </h2>
            <p class="about-body mt-6 sm:mt-8 text-[16px] sm:text-[17px] leading-[1.7] text-foreground-muted max-w-[600px]">
              {{ $t('home.about.body') }}
            </p>
          </div>

          <div class="stat-slab grid grid-cols-2 gap-px bg-hairline border border-hairline">
            <div v-for="(stat, i) in stats" :key="i" class="bg-surface p-5 sm:p-7">
              <div
                class="font-fraunces font-light stat-num leading-none text-foreground"
                style="font-size: clamp(48px, 6vw, 76px)"
              >
                {{ stat.target === null ? '∞' : displayStat(i) }}
              </div>
              <div class="gutter-label mt-2">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="h-px border-t border-hairline mx-8 sm:mx-12 lg:mx-20" />

    <!-- =========================================================== -->
    <!-- REEL — pinned horizontal scrub on desktop, real blog data    -->
    <!-- =========================================================== -->
    <section
      v-if="reelTiles.length"
      ref="reelSectionEl"
      id="reel"
      class="reel-section"
    >
      <div ref="reelPinEl" class="reel-pin">
      <div ref="reelStageEl" class="reel-stage">
        <div class="reel-header px-8 sm:px-12 lg:px-20 flex items-end justify-between flex-wrap gap-y-6">
          <div>
            <div class="gutter-label mb-2 flex items-center" :class="{ 'in-view': reelInView }">
              <span class="h2-rule" />03 · Reel
            </div>
            <h2
              class="font-bold text-foreground"
              style="font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.03em;"
            >
              {{ $t('home.reel.title') }}
            </h2>
          </div>
          <div class="reel-meta flex items-center gap-6 text-foreground-muted text-[13px]">
            <div class="reel-counter" :class="{ 'is-on': reelCounterOn }">
              <span class="num-line">
                <span class="now">{{ String(reelIdx).padStart(2, '0') }}</span>
                <span class="sep">/</span>
                <span class="total">{{ String(reelTiles.length).padStart(2, '0') }}</span>
              </span>
              <span class="rail" :style="{ '--p': Math.max(8, reelProgress * 100) + '%' } as any" />
            </div>
          </div>
        </div>
        <div ref="reelTrackEl" class="reel-track">
          <NuxtLink
            v-for="(tile, i) in reelTiles"
            :key="tile.slug"
            :to="tile.to"
            class="reel-tile group"
          >
            <div class="tile-art" :class="{ 'placeholder-hatch': !tile.image }">
              <NuxtImg
                v-if="tile.image"
                :src="tile.image"
                :alt="tile.title"
                class="absolute inset-0 w-full h-full object-contain p-6"
                loading="lazy"
              />
              <div class="tile-label-tr">
                <span>{{ tile.slug }}</span>
                <span class="num">{{ String(i + 1).padStart(2, '0') }}</span>
              </div>
              <div
                v-if="!tile.image"
                class="absolute inset-0 grid place-items-center gutter-label !text-foreground-faint"
              >
                ◇ article preview
              </div>
            </div>
            <div class="tile-text pt-5">
              <h3 class="tile-title font-semibold text-foreground tracking-tight line-clamp-2">
                {{ tile.title }}
              </h3>
              <p class="tile-desc text-sm text-foreground-muted mt-1.5 leading-relaxed line-clamp-2">{{ tile.desc }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
      </div>
    </section>

    <!-- =========================================================== -->
    <!-- QUICK NAV + inline footer strip (replaces global Footer)     -->
    <!-- =========================================================== -->
    <div class="px-8 sm:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-3">
      <NuxtLink
        v-for="(q, i) in quickNav"
        :key="i"
        :to="q.to"
        class="quick-nav-cell px-6 py-7 border-t border-hairline flex items-center justify-between group"
        :class="{ 'md:border-r': i < quickNav.length - 1 }"
      >
        <div>
          <div class="text-[20px] text-foreground font-medium">
            <span class="ink-link">{{ q.title }}</span>
          </div>
          <div class="gutter-label mt-1">{{ q.sub }}</div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          class="text-foreground"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </NuxtLink>
    </div>

    <div
      class="px-8 sm:px-12 lg:px-20 border-t border-hairline pt-6 pb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div class="gutter-label">© {{ currentYear }} · Ting Zhang</div>
      <div class="flex items-center gap-5 text-foreground-muted">
        <a
          v-for="link in socialLinks"
          :key="link.label"
          :href="link.href"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
          :aria-label="link.label"
          class="hover:text-accent transition-colors"
        >
          <svg
            v-if="link.icon === 'mail'"
            class="w-[18px] h-[18px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <svg v-else-if="link.icon === 'linkedin'" class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <svg v-else-if="link.icon === 'github'" class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <svg v-else-if="link.icon === 'gitlab'" class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M23.6004 9.5927l-.0337-.0862L20.3.9814a.851.851 0 00-.3362-.405.8748.8748 0 00-.9997.0539.8748.8748 0 00-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 00-.29-.4412.8748.8748 0 00-.9997-.0537.8585.8585 0 00-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 002.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 001.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7476.0125-.01a6.0682 6.0682 0 002.0094-7.0117z"
            />
          </svg>
        </a>
      </div>
    </div>

    <!-- SVG turbulence filter for hero motto + about title ink-bleed -->
    <svg style="position: fixed; width: 0; height: 0; overflow: hidden" aria-hidden="true">
      <defs>
        <filter
          id="hero-ink"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          color-interpolation-filters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="4" result="noise">
            <animate attributeName="baseFrequency" dur="18s" values="0.012;0.018;0.012" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

definePageMeta({ layout: 'home' })

const { t } = useI18n()
const localePath = useLocalePath()
const { years, projectCount } = useSiteStats()

// Inline footer strip data (replaces <LayoutFooter /> on this page)
const currentYear = new Date().getFullYear()
const socialLinks = [
  { icon: 'mail', label: 'Email', href: 'mailto:tttingzhang999@gmail.com', external: false },
  { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/tingzhang98/', external: true },
  { icon: 'github', label: 'GitHub', href: 'https://github.com/perplex0204', external: true },
  { icon: 'gitlab', label: 'GitLab', href: 'https://gitlab.com/perplex0204', external: true }
]

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

useHead({
  title: t('seo.home.title'),
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
        url: 'https://info.tttingzhang999.com',
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

const mottoAria = computed(
  () => `${t('home.motto.verb')} ${t('home.motto.and')} ${t('home.motto.execute')}.`
)

// ───────── Blog data ─────────
type ReelArticle = {
  path?: string
  title?: string
  description?: string
  image?: string
}

const { data: recentArticles } = await useAsyncData(
  'home-reel-articles',
  async () => {
    try {
      const rows = await queryCollection('blog')
        .where('draft', '<>', true)
        .order('date', 'DESC')
        .limit(8)
        .all()
      return (rows ?? []) as ReelArticle[]
    } catch (err) {
      console.error('[home] failed to load recent articles:', err)
      return [] as ReelArticle[]
    }
  },
  { default: () => [] as ReelArticle[] }
)

const { data: blogTotal } = await useAsyncData(
  'home-blog-total',
  async () => {
    try {
      const all = await queryCollection('blog').where('draft', '<>', true).all()
      return Array.isArray(all) ? all.length : 0
    } catch (err) {
      console.error('[home] failed to count blog total:', err)
      return 0
    }
  },
  { default: () => 0 }
)

const reelTiles = computed(() =>
  (recentArticles.value ?? []).map((a, i) => {
    const slug = a.path?.split('/').filter(Boolean).pop() ?? `article-${i + 1}`
    return {
      slug,
      title: a.title ?? slug,
      desc: a.description ?? '',
      to: a.path ? localePath(a.path) : localePath('/blog'),
      image: a.image
    }
  })
)

// ───────── Stats ─────────
const stats = computed<Array<{ target: number | null; label: string }>>(() => [
  { target: years.value, label: t('home.about.stats.years') },
  { target: projectCount.value, label: t('home.about.stats.projects') },
  { target: blogTotal.value ?? 0, label: t('home.about.stats.notes') },
  { target: null, label: t('home.about.stats.coffee') }
])

// Stat count-up: locked to one-shot animated values once About reveals.
const animatedStats = ref<number[]>([0, 0, 0, 0])
function displayStat(i: number) {
  return animatedStats.value[i] ?? 0
}

function animateStats() {
  const targets = stats.value.map((s) => (typeof s.target === 'number' ? s.target : 0))
  const duration = 1100
  const start = performance.now()
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    const e = easeOut(t)
    animatedStats.value = targets.map((target) => Math.round(target * e))
    if (t < 1) requestAnimationFrame(tick)
    else animatedStats.value = targets // lock to final
  }
  requestAnimationFrame(tick)
}

// ───────── Quick nav ─────────
const quickNav = computed(() => [
  { title: 'Resume', sub: t('home.quickNav.resumeSub'), to: localePath('/resume') },
  { title: 'All projects', sub: t('home.quickNav.projectsSub'), to: localePath('/projects') },
  { title: 'Blog archive', sub: t('home.quickNav.blogSub'), to: localePath('/blog') }
])

// ───────── refs ─────────
const heroStageEl = ref<HTMLElement | null>(null)
const mottoStackEl = ref<HTMLElement | null>(null)
const aboutSectionEl = ref<HTMLElement | null>(null)
const reelSectionEl = ref<HTMLElement | null>(null)
const reelPinEl = ref<HTMLElement | null>(null)
const reelStageEl = ref<HTMLElement | null>(null)
const reelTrackEl = ref<HTMLElement | null>(null)

const scrollPct = ref(0)
const aboutRevealed = ref(false)
const reelInView = ref(false)

const reelProgress = ref(0)
const reelIdx = ref(1)
const reelCounterOn = ref(false)

let prefersReduce = false
let cleanupFns: Array<() => void> = []

// Hero motto cursor — drives the radial mask reveal of the giant text.
function applyMottoCursor(e: MouseEvent) {
  const stack = mottoStackEl.value
  if (!stack) return
  const r = stack.getBoundingClientRect()
  stack.style.setProperty('--x', `${e.clientX - r.left}px`)
  stack.style.setProperty('--y', `${e.clientY - r.top}px`)
  ;(stack as any).__lastMove = performance.now()
}

function setupHeroMottoCursor() {
  const stage = heroStageEl.value
  const stack = mottoStackEl.value
  if (!stage || !stack || prefersReduce) return
  stage.addEventListener('mousemove', applyMottoCursor)
  stage.addEventListener('mouseenter', applyMottoCursor)

  let raf = 0
  let inView = true
  let running = false

  const drift = (now: number) => {
    const last = (stack as any).__lastMove ?? 0
    if (performance.now() - last > 1400) {
      const r = stack.getBoundingClientRect()
      const cx = r.width / 2
      const cy = r.height / 2
      const ax = Math.sin(now * 0.0006) * r.width * 0.34
      const ay = Math.cos(now * 0.00085) * r.height * 0.3
      stack.style.setProperty('--x', `${cx + ax}px`)
      stack.style.setProperty('--y', `${cy + ay}px`)
    }
    raf = requestAnimationFrame(drift)
  }

  const start = () => {
    if (running) return
    running = true
    raf = requestAnimationFrame(drift)
  }
  const stop = () => {
    if (!running) return
    running = false
    cancelAnimationFrame(raf)
  }
  const sync = () => {
    if (inView && !document.hidden) start()
    else stop()
  }

  const io = new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting)
      sync()
    },
    { threshold: 0 }
  )
  io.observe(stage)

  const onVis = () => sync()
  document.addEventListener('visibilitychange', onVis)

  sync()

  cleanupFns.push(() => {
    stage.removeEventListener('mousemove', applyMottoCursor)
    stage.removeEventListener('mouseenter', applyMottoCursor)
    document.removeEventListener('visibilitychange', onVis)
    io.disconnect()
    stop()
  })
}

// ───────── scroll progress + reel scrub ─────────
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  scrollPct.value = Math.min(100, (window.scrollY / Math.max(1, max)) * 100)

  // Reel pinned horizontal scrub on desktop. Progress is driven by the
  // dedicated pin container — its rect.top runs from 0 → -distance as
  // the user scrolls through the pinned range.
  const pin = reelPinEl.value
  const stage = reelStageEl.value
  const track = reelTrackEl.value
  const section = reelSectionEl.value
  const isMobile = window.matchMedia('(max-width: 900px)').matches
  if (pin && stage && track && !isMobile && !prefersReduce) {
    const pRect = pin.getBoundingClientRect()
    const stageHeight = stage.offsetHeight
    const distance = Math.max(1, pin.offsetHeight - stageHeight)
    const traveled = -pRect.top
    const p = Math.max(0, Math.min(1, traveled / distance))
    const totalShift = track.scrollWidth - stage.clientWidth + 80
    track.style.transform = `translate3d(${-totalShift * p}px, 0, 0)`
    reelProgress.value = p
    reelIdx.value = Math.min(reelTiles.value.length, Math.round(p * (reelTiles.value.length - 1)) + 1)
    reelCounterOn.value = pRect.top <= 0 && pRect.bottom >= stageHeight
  } else if (track) {
    track.style.transform = ''
    reelCounterOn.value = true
  }
  if (!reelInView.value && section) {
    if (section.getBoundingClientRect().top < window.innerHeight * 0.85) reelInView.value = true
  }
}

function onReelScrollMobile() {
  const track = reelTrackEl.value
  if (!track) return
  const max = track.scrollWidth - track.clientWidth
  const p = max > 0 ? track.scrollLeft / max : 0
  reelProgress.value = p
  reelIdx.value = Math.min(reelTiles.value.length, Math.round(p * (reelTiles.value.length - 1)) + 1)
}

onMounted(() => {
  prefersReduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  setupHeroMottoCursor()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  reelTrackEl.value?.addEventListener('scroll', onReelScrollMobile, { passive: true })
  onScroll()

  // One-shot About reveal
  if (aboutSectionEl.value) {
    if (prefersReduce) {
      aboutRevealed.value = true
      animatedStats.value = stats.value.map((s) =>
        typeof s.target === 'number' ? s.target : 0
      )
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            aboutRevealed.value = true
            animateStats()
            io.disconnect()
          }
        },
        { threshold: 0.18 }
      )
      io.observe(aboutSectionEl.value)
      cleanupFns.push(() => io.disconnect())
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  reelTrackEl.value?.removeEventListener('scroll', onReelScrollMobile)
  cleanupFns.forEach((fn) => fn())
})
</script>

<style scoped>
/* ===== Gutter labels & hairlines ===== */
.gutter-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-foreground-faint);
}

/* ===== Sticky scroll progress rail at the top of the viewport ===== */
.scroll-rail {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  z-index: 49;
  background: var(--color-hairline);
}
.scroll-rail .fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--color-accent);
  transition: width 0.1s linear;
}

/* ===== Hairline draw under section labels ===== */
.h2-rule {
  display: inline-block;
  height: 1px;
  background: currentColor;
  width: 56px;
  vertical-align: middle;
  margin-right: 16px;
  transform-origin: left center;
  transform: scaleX(0);
  transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.in-view .h2-rule {
  transform: scaleX(1);
}

/* ===== HERO motto — liquid mask reveal ===== */
@property --r {
  syntax: '<length>';
  inherits: false;
  initial-value: 0px;
}

.hero-stage {
  position: relative;
  --x: 50%;
  --y: 50%;
}

.motto-stack {
  position: relative;
  font-weight: 800;
  letter-spacing: -0.06em;
  line-height: 0.86;
  font-size: clamp(72px, 17vw, 260px);
  text-align: center;
  user-select: none;
  font-family: 'Inter', 'Noto Sans TC', system-ui, sans-serif;
}
.motto-stack .motto-line {
  display: block;
}
.motto-stack .motto-and {
  font-family: 'Fraunces', 'Noto Serif TC', serif;
  font-weight: 300;
  font-style: italic;
  font-size: 0.42em;
  letter-spacing: -0.01em;
  margin: 0.1em 0;
  color: var(--color-accent);
}
.motto-stack .motto-and::before,
.motto-stack .motto-and::after {
  content: '';
  display: inline-block;
  width: 0.9em;
  height: 1px;
  background: var(--color-foreground-faint);
  vertical-align: middle;
  margin: 0 0.55em 0.18em;
}
.motto-stack .motto-dot {
  color: var(--color-accent);
}
.motto-base {
  display: block;
  position: relative;
  color: transparent;
  -webkit-text-stroke: 1.4px color-mix(in oklab, var(--color-foreground) 22%, transparent);
}
.motto-reveal {
  position: absolute;
  inset: 0;
  display: block;
  color: var(--color-foreground);
  pointer-events: none;
  --r: 0px;
  -webkit-mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), #000 55%, transparent 100%);
  mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), #000 55%, transparent 100%);
  filter: url(#hero-ink);
  animation: mottoEntry 1.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0.25s both;
}
@keyframes mottoEntry {
  0% {
    --r: 0px;
  }
  100% {
    --r: 560px;
  }
}

@media (max-width: 720px) {
  .motto-stack {
    font-size: clamp(58px, 22vw, 120px);
  }
  .motto-stack .motto-and::before,
  .motto-stack .motto-and::after {
    width: 0.6em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .motto-reveal {
    -webkit-mask-image: none;
    mask-image: none;
    filter: none;
    animation: none;
  }
  .motto-base {
    -webkit-text-stroke: 0;
    color: var(--color-foreground);
  }
}

/* ===== ABOUT — one-shot CSS-only reveal driven by .is-revealed ===== */
.about-section {
  position: relative;
}
.about-stage {
  display: flex;
  flex-direction: column;
  gap: clamp(36px, 5.5vh, 64px);
  padding-top: clamp(72px, 10vh, 110px);
  padding-bottom: clamp(72px, 10vh, 110px);
}
.identity-row {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.7s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.about-section.is-revealed .identity-row {
  opacity: 1;
  transform: none;
}
.about-title-stack {
  position: relative;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  font-size: clamp(32px, 5.2vw, 64px);
  text-wrap: balance;
}
.about-title-stack .at-base {
  display: block;
  color: transparent;
}
.about-title-stack .at-reveal {
  position: absolute;
  inset: 0;
  color: var(--color-foreground);
  filter: url(#hero-ink);
  pointer-events: none;
  -webkit-mask-image: linear-gradient(115deg, #000 -30%, transparent -2%);
  mask-image: linear-gradient(115deg, #000 -30%, transparent -2%);
  transition: -webkit-mask-image 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s,
    mask-image 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s;
}
.about-section.is-revealed .at-reveal {
  -webkit-mask-image: linear-gradient(115deg, #000 100%, transparent 128%);
  mask-image: linear-gradient(115deg, #000 100%, transparent 128%);
}
.about-body {
  opacity: 0;
  transition: opacity 0.7s ease 0.6s;
}
.about-section.is-revealed .about-body {
  opacity: 1;
}
.stat-slab {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.85s;
}
.about-section.is-revealed .stat-slab {
  clip-path: inset(0 0% 0 0);
}
.stat-num {
  font-feature-settings: 'tnum';
}

@media (prefers-reduced-motion: reduce) {
  .identity-row,
  .about-title-stack .at-reveal,
  .about-body,
  .stat-slab {
    transition: none !important;
  }
  .about-title-stack .at-reveal {
    -webkit-mask-image: none !important;
    mask-image: none !important;
    filter: none;
  }
}

/* ===== REEL ===== */
.reel-section {
  position: relative;
}
.reel-header {
  padding-top: clamp(36px, 6vh, 80px);
  padding-bottom: clamp(20px, 3vh, 32px);
  flex-shrink: 0;
}
.reel-pin {
  /* Mobile default — height collapses; sticky disabled below. */
  height: auto;
}
@media (min-width: 901px) {
  .reel-pin {
    /* Vertical scroll distance reserved for the horizontal scrub. */
    --reel-extra: clamp(540px, 110vh, 1500px);
    height: calc(100vh + var(--reel-extra));
  }
  .reel-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    min-height: 720px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
.reel-track {
  display: flex;
  gap: 24px;
  padding: 0 80px;
  will-change: transform;
  flex: 1;
  align-items: center;
}
.reel-tile {
  flex: 0 0 clamp(320px, 32vw, 420px);
  display: flex;
  flex-direction: column;
  position: relative;
  transform: translateY(0);
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.reel-tile:hover {
  transform: translateY(-6px);
}
.reel-tile .tile-art {
  flex: 0 0 auto;
  width: 100%;
  aspect-ratio: 4 / 5;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-hairline);
}
.reel-tile .tile-text {
  flex: 0 0 auto;
}
.reel-tile .tile-title {
  font-size: 20px;
  line-height: 1.3;
  min-height: calc(20px * 1.3 * 2);
}
.reel-tile .tile-desc {
  min-height: calc(0.875rem * 1.625 * 2);
}
.reel-tile .tile-art::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 80% at 30% 20%, rgba(196, 101, 42, 0), rgba(196, 101, 42, 0));
  transition: background 0.4s;
  pointer-events: none;
}
.reel-tile:hover .tile-art::after {
  background: radial-gradient(80% 100% at 30% 20%, color-mix(in oklab, var(--color-accent) 18%, transparent), transparent);
}

.placeholder-hatch {
  background-image: repeating-linear-gradient(
      135deg,
      color-mix(in oklab, var(--color-foreground) 5%, transparent) 0 1px,
      transparent 1px 9px
    ),
    linear-gradient(180deg, var(--color-surface-elevated), var(--color-surface));
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 900px) {
  .reel-stage {
    height: auto;
    min-height: 0;
    overflow: visible;
    position: static;
  }
  .reel-track {
    height: auto;
    padding: 0 20px;
    gap: 14px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    transform: none !important;
  }
  .reel-track::-webkit-scrollbar {
    display: none;
  }
  .reel-tile {
    scroll-snap-align: start;
    flex: 0 0 78vw;
    height: 64vw;
    min-height: 280px;
    max-height: 360px;
  }
}

/* Inline reel counter inside the header */
.reel-counter {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.reel-counter.is-on {
  opacity: 1;
  transform: none;
}
.reel-counter .label {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-foreground-faint);
}
.reel-counter .num-line {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.reel-counter .now {
  font-size: 40px;
  line-height: 1;
  font-weight: 500;
  color: var(--color-foreground);
  font-feature-settings: 'tnum';
  letter-spacing: -0.04em;
}
.reel-counter .sep,
.reel-counter .total {
  font-size: 13px;
  color: var(--color-foreground-muted);
  letter-spacing: 0.12em;
}
.reel-counter .rail {
  display: block;
  width: 88px;
  height: 1px;
  background: var(--color-hairline);
  margin-top: 4px;
  position: relative;
}
.reel-counter .rail::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--p, 16%);
  background: var(--color-accent);
  transition: width 0.1s linear;
}
@media (max-width: 900px) {
  .reel-counter {
    opacity: 1;
    transform: none;
  }
}

/* Tile label top-right */
.tile-label-tr {
  position: absolute;
  top: 14px;
  right: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: lowercase;
  color: var(--color-foreground-muted);
  background: color-mix(in oklab, var(--color-surface) 75%, transparent);
  backdrop-filter: blur(6px);
  padding: 5px 9px;
  border: 1px solid var(--color-hairline);
  border-radius: 2px;
  z-index: 2;
}
.tile-label-tr .num {
  color: var(--color-accent);
  margin-left: 6px;
  font-feature-settings: 'tnum';
}

/* Ink-bleed link under quick nav */
.ink-link {
  position: relative;
  display: inline-block;
  cursor: pointer;
  color: inherit;
  text-decoration: none;
}
.ink-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 1px;
  background: currentColor;
  opacity: 0.35;
  transform-origin: 50% 50%;
  transform: scaleX(0.32);
  transition: transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s;
}
.ink-link::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -3px;
  height: 4px;
  background: var(--color-accent);
  filter: blur(4px);
  transform-origin: 50% 50%;
  transform: scaleX(0);
  opacity: 0;
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s;
  pointer-events: none;
}
.ink-link:hover::after,
.ink-link:focus-visible::after {
  transform: scaleX(1);
  opacity: 0.9;
}
.ink-link:hover::before,
.ink-link:focus-visible::before {
  transform: scaleX(1);
  opacity: 0.55;
}

.quick-nav-cell {
  border-color: var(--color-hairline);
}
</style>
