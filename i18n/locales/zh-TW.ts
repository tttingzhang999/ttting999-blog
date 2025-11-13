export default {
  // Navigation
  nav: {
    home: '首頁',
    resume: '履歷',
    projects: '專案',
    blog: '部落格',
    menu: '選單',
    closeMenu: '關閉選單',
    toggleTheme: '切換主題',
    toggleMenu: '開啟選單',
    switchLanguage: '切換語言'
  },

  // Footer
  footer: {
    builtWith: '使用以下技術建構',
    allRightsReserved: '版權所有',
    tagline: 'Full Stack Engineer | 努力工作，享受生活',
    tech: 'Built with {nuxt} + {tailwind} | Deployed on {vercel}'
  },

  // Homepage
  home: {
    hero: {
      greeting: '嗨，我是',
      name: '張碩庭',
      title: '資深軟體工程師',
      techStack: 'Python • TypeScript • Vue.js • 雲端架構',
      viewResume: '查看履歷',
      viewProjects: '瀏覽專案'
    },
    motto: {
      title: '座右銘',
      quote: '努力工作，享受生活',
      quoteEn: 'Work hard, play hard'
    },
    about: {
      title: 'About Me',
      description1: '資深軟體工程師，熱衷於建構可擴展的網頁應用程式和雲端基礎設施。專精於 Python、TypeScript 和現代網頁框架，如 Vue.js 和 FastAPI。',
      description2: '擁有優化系統效能、實施 CI/CD 流程以及在 GCP 上架構雲原生解決方案的豐富經驗。熱愛乾淨的程式碼、設計模式，以及打造讓開發者生活更輕鬆的工具。',
      techStack: '技術棧',
      frontend: '前端開發',
      frontendTech: 'Vue.js、TypeScript、Nuxt',
      backend: '後端開發',
      backendTech: 'Python、FastAPI、Flask',
      database: '資料庫',
      databaseTech: 'MongoDB、PostgreSQL、Redis',
      devops: 'DevOps',
      devopsTech: 'GCP、Docker、Kubernetes'
    },
    quickNav: {
      title: 'Explore My Work',
      resume: {
        title: 'Resume',
        description: '查看我的專業經歷和技術技能'
      },
      projects: {
        title: 'Projects',
        description: '探索我的個人和專業專案作品集'
      },
      blog: {
        title: 'Articles',
        description: '閱讀我關於技術、見解和生活經驗的文章'
      },
      learnMore: 'Learn More'
    },
    contact: {
      title: '聯絡我',
      description: '歡迎透過以下方式與我聯繫'
    }
  },

  // Resume Page
  resume: {
    title: '履歷',
    hero: {
      name: 'Ting Zhang',
      title: '資深軟體工程師',
      location: '台灣',
      downloadPdf: '下載 PDF'
    },
    sections: {
      skills: '技術技能',
      languages: '語言能力',
      experience: '工作經歷',
      education: '教育背景'
    },
    skills: {
      frontend: '前端',
      backend: '後端',
      devops: 'DevOps / 工具',
      database: '資料庫'
    },
    languages: {
      chinese: '中文',
      chineseLevel: '母語',
      english: '英文',
      englishLevel: '專業工作能力'
    },
    experience: {
      present: '至今',
      responsibilities: '職責'
    },
    education: {
      degree: '學位',
      gpa: 'GPA',
      thesis: '論文'
    }
  },

  // Projects Page
  projects: {
    title: '專案作品',
    pageTitle: '參與計畫',
    allProjects: '所有專案',
    filterByTech: '依技術篩選',
    all: '全部',
    viewProject: '查看專案',
    viewDemo: '查看展示',
    viewSource: '查看原始碼',
    viewCode: '查看程式碼',
    link: '連結',
    noProjects: '目前沒有專案',
    close: '關閉',
    technicalTags: '技術標籤',
    projectHighlights: '專案亮點',
    projectInfo: '專案資訊',
    period: '期間',
    team: '團隊',
    role: '角色',
    moreCount: '+{count} 更多',
    comingSoon: '即將推出',
    appStoreComingSoon: 'App Store（即將推出）',
    googlePlayComingSoon: 'Google Play（即將推出）'
  },

  // Blog Page
  blog: {
    title: '文章',
    subtitle: '分享技術心得、生活記錄與個人見解',
    allPosts: '所有文章',
    categories: '分類',
    tags: '標籤',
    popularTags: '熱門標籤',
    filterByCategory: '依分類篩選',
    filterByTag: '依標籤篩選',
    all: '全部',
    readMore: '閱讀更多',
    readingTime: '閱讀時間',
    minutes: '分鐘',
    publishedOn: '發佈於',
    tableOfContents: '目錄',
    relatedPosts: '相關文章',
    noPosts: '沒有找到文章',
    articleCount: '共 {count} 篇文章',
    tryOtherFilters: '試試其他篩選條件',
    comingSoon: '文章即將推出',
    clearFilters: '清除篩選',
    backToBlog: '返回部落格',
    categoryTech: '技術',
    categoryLife: '生活',
    categoryInsight: 'Insight',
    categoryProject: '專案',
    categoryReflection: '心得',
    categoryOther: '其他',
    pagination: {
      previous: '上一頁',
      next: '下一頁',
      page: '第 {page} 頁',
      showing: '顯示 {start}-{end} 共 {total} 篇文章'
    }
  },

  // Common
  common: {
    loading: '載入中...',
    error: '發生錯誤',
    notFound: '找不到頁面',
    backHome: '返回首頁',
    search: '搜尋',
    filter: '篩選',
    sort: '排序',
    date: '日期',
    latest: '最新',
    oldest: '最舊'
  },

  // SEO
  seo: {
    home: {
      title: '張碩庭的個人作品集與技術部落格 | tingzhang999-blog | ttting999' ,
      description: '張碩庭的個人作品集與技術部落格，專注於 Python、TypeScript、Vue.js 和雲端技術的全端工程師。'
    },
    resume: {
      title: '履歴 | 張碩庭 | tingzhang999-blog | ttting999',
      description: '查看張碩庭的完整履歷，包括工作經歷、教育背景和技術技能。'
    },
    projects: {
      title: '專案作品 | 張碩庭 | tingzhang999-blog | ttting999',
      description: '探索張碩庭參與過的專案和技術作品。'
    },
    blog: {
      title: '技術部落格 | 張碩庭 | tingzhang999-blog | ttting999',
      description: '閱讀張碩庭的技術文章、學習筆記和開發心得。'
    }
  }
}
