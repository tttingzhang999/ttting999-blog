export default {
  // Navigation
  nav: {
    home: 'ホーム',
    resume: '履歴書',
    projects: 'プロジェクト',
    blog: 'ブログ',
    menu: 'メニュー',
    closeMenu: 'メニューを閉じる',
    toggleTheme: 'テーマ切替',
    toggleMenu: 'メニューを開く',
    switchLanguage: '言語切替'
  },

  // Footer
  footer: {
    builtWith: '使用技術',
    allRightsReserved: '全著作権所有',
    tagline: 'フルスタックエンジニア | 努力して、楽しむ',
    tech: '{nuxt} + {tailwind} で構築 | {vercel} にデプロイ'
  },

  // Homepage
  home: {
    hero: {
      greeting: 'こんにちは、',
      name: 'Ting Zhang',
      title: 'シニアソフトウェアエンジニア',
      techStack: 'Python • TypeScript • Vue.js • クラウドアーキテクチャ',
      viewResume: '履歴書を見る',
      viewProjects: 'プロジェクトを見る'
    },
    motto: {
      title: '座右の銘',
      quote: '努力して、楽しむ',
      quoteEn: 'Work hard, play hard'
    },
    about: {
      title: 'About Me',
      description1: 'スケーラブルなWebアプリケーションとクラウドインフラストラクチャの構築に情熱を注ぐシニアソフトウェアエンジニアです。Python、TypeScript、Vue.jsやFastAPIなどの最新Webフレームワークを専門としています。',
      description2: 'システムパフォーマンスの最適化、CI/CDパイプラインの実装、GCP上でのクラウドネイティブソリューションの設計において豊富な経験があります。クリーンなコード、デザインパターン、開発者の生活を楽にするツールの構築に情熱を持っています。',
      techStack: '技術スタック',
      frontend: 'フロントエンド',
      frontendTech: 'Vue.js、TypeScript、Nuxt',
      backend: 'バックエンド',
      backendTech: 'Python、FastAPI、Flask',
      database: 'データベース',
      databaseTech: 'MongoDB、PostgreSQL、Redis',
      devops: 'DevOps',
      devopsTech: 'GCP、Docker、Kubernetes'
    },
    quickNav: {
      title: 'Explore My Work',
      resume: {
        title: 'Resume',
        description: '職務経歴と技術スキルを確認'
      },
      projects: {
        title: 'Projects',
        description: '個人および専門プロジェクトのポートフォリオを探索'
      },
      blog: {
        title: 'Articles',
        description: '技術、洞察、人生経験に関する記事を読む'
      },
      learnMore: 'Learn More'
    },
    contact: {
      title: 'お問い合わせ',
      description: '以下のチャネルからお気軽にお問い合わせください'
    }
  },

  // Resume Page
  resume: {
    title: '履歴書',
    hero: {
      name: 'Ting Zhang',
      title: 'シニアソフトウェアエンジニア',
      location: '台湾',
      downloadPdf: 'PDFダウンロード'
    },
    sections: {
      skills: '技術スキル',
      languages: '言語能力',
      experience: '職務経歴',
      education: '学歴'
    },
    skills: {
      frontend: 'フロントエンド',
      backend: 'バックエンド',
      devops: 'DevOps / ツール',
      database: 'データベース'
    },
    languages: {
      chinese: '中国語',
      chineseLevel: 'ネイティブ',
      english: '英語',
      englishLevel: 'ビジネスレベル'
    },
    experience: {
      present: '現在',
      responsibilities: '職務内容'
    },
    education: {
      degree: '学位',
      gpa: 'GPA',
      thesis: '論文'
    }
  },

  // Projects Page
  projects: {
    title: 'プロジェクト',
    pageTitle: 'プロジェクト',
    allProjects: '全プロジェクト',
    filterByTech: '技術でフィルター',
    all: '全て',
    viewProject: 'プロジェクトを見る',
    viewDemo: 'デモを見る',
    viewSource: 'ソースを見る',
    viewCode: 'コードを見る',
    link: 'リンク',
    noProjects: 'プロジェクトはありません',
    close: '閉じる',
    technicalTags: '技術タグ',
    projectHighlights: 'プロジェクトのハイライト',
    projectInfo: 'プロジェクト情報',
    period: '期間',
    team: 'チーム',
    role: '役割',
    moreCount: '+{count} 件',
    comingSoon: '近日公開',
    appStoreComingSoon: 'App Store（近日公開）',
    googlePlayComingSoon: 'Google Play（近日公開）'
  },

  // Blog Page
  blog: {
    title: '記事',
    subtitle: '技術的洞察、生活の記録、個人的な視点を共有',
    allPosts: '全記事',
    categories: 'カテゴリー',
    tags: 'タグ',
    popularTags: '人気タグ',
    filterByCategory: 'カテゴリーでフィルター',
    filterByTag: 'タグでフィルター',
    all: '全て',
    readMore: '続きを読む',
    readingTime: '読了時間',
    minutes: '分',
    publishedOn: '公開日',
    tableOfContents: '目次',
    relatedPosts: '関連記事',
    noPosts: '記事が見つかりません',
    articleCount: '合計 {count} 件の記事',
    tryOtherFilters: '他のフィルターを試す',
    comingSoon: '記事は近日公開',
    clearFilters: 'フィルターをクリア',
    backToBlog: 'ブログに戻る',
    categoryTech: '技術',
    categoryLife: '生活',
    categoryInsight: 'Insight',
    categoryProject: 'プロジェクト',
    categoryReflection: '感想',
    categoryOther: 'その他'
  },

  // Common
  common: {
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    notFound: 'ページが見つかりません',
    backHome: 'ホームに戻る',
    search: '検索',
    filter: 'フィルター',
    sort: '並び替え',
    date: '日付',
    latest: '最新',
    oldest: '古い順'
  },

  // SEO
  seo: {
    home: {
      title: 'tingzhang999-blog',
      description: 'Python、TypeScript、Vue.js、クラウド技術を専門とするフルスタックエンジニア、Ting Zhangの個人ポートフォリオと技術ブログ。'
    },
    resume: {
      title: '履歴書 | Ting Zhang',
      description: 'Ting Zhangの完全な履歴書、職務経歴、学歴、技術スキルを確認できます。'
    },
    projects: {
      title: 'プロジェクト | Ting Zhang',
      description: 'Ting Zhangのプロジェクトと技術成果を探索します。'
    },
    blog: {
      title: '技術ブログ | Ting Zhang',
      description: 'Ting Zhangの技術記事、学習ノート、開発知見を読む。'
    }
  }
}
