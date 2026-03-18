// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  // Global CSS
  css: ['~/assets/css/theme.css'],

  // Modules
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/motion/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/i18n'
  ],

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false // Disabled for faster builds, run `nuxt typecheck` separately
  },

  // Color mode configuration
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: ''
  },

  // SEO and meta tags
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Ting Zhang 張碩庭 | Software Engineer',
      meta: [
        { name: 'description', content: 'Ting Zhang (張碩庭) - 資深軟體工程師 | Software Engineer at Going Cloud, formerly 智電系統 (Smart Power System). Python, TypeScript, Vue.js, GCP. Creator of Moniit.' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'google-site-verification', content: 'VnxfwULSkIZXrgyXntU8p5Ylmxp29hFi4dxOdwFVoWQ' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap', media: 'print', onload: "this.media='all'" }
      ]
    }
  },

  // Static site generation (SSG) configuration
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml']
    }
  },

  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  // Sitemap configuration
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://ttting999.vercel.app'
  },

  sitemap: {
    // sitemap options
  },

  // i18n configuration
  i18n: {
    locales: [
      {
        code: 'zh-TW',
        iso: 'zh-TW',
        name: '繁體中文',
        file: 'zh-TW.ts'
      },
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.ts'
      },
      {
        code: 'ja',
        iso: 'ja-JP',
        name: '日本語',
        file: 'ja.ts'
      }
    ],
    lazy: true,
    defaultLocale: 'zh-TW',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }
})
