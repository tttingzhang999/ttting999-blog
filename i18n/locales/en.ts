export default {
  // Navigation
  nav: {
    home: 'Home',
    resume: 'Resume',
    projects: 'Projects',
    blog: 'Blog',
    menu: 'Menu',
    closeMenu: 'Close Menu',
    toggleTheme: 'Toggle Theme',
    toggleMenu: 'Toggle Menu',
    switchLanguage: 'Switch Language'
  },

  // Footer
  footer: {
    builtWith: 'Built with',
    allRightsReserved: 'All rights reserved',
    tagline: 'Full Stack Engineer | Work hard, play hard',
    tech: 'Built with {nuxt} + {tailwind} | Deployed on {vercel}'
  },

  // Homepage
  home: {
    hero: {
      greeting: 'Hi, I\'m',
      name: 'Ting Zhang',
      title: 'Sr. Software Engineer',
      techStack: 'Python • TypeScript • Vue.js • Cloud Architecture',
      viewResume: 'View Resume',
      viewProjects: 'View Projects'
    },
    motto: {
      title: 'Motto',
      quote: 'Work hard, play hard',
      quoteEn: 'Work hard, play hard'
    },
    about: {
      title: 'About Me',
      description1: 'Software Engineer with a passion for building scalable web applications and cloud infrastructure. Specialized in Python, TypeScript, and modern web frameworks like Vue.js and FastAPI.',
      description2: 'Experienced in optimizing system performance, implementing CI/CD pipelines, and architecting cloud-native solutions on GCP. Passionate about clean code, design patterns, and building tools that make developers\' lives easier.',
      techStack: 'Tech Stack',
      frontend: 'Frontend',
      frontendTech: 'Vue.js, TypeScript, Nuxt',
      backend: 'Backend',
      backendTech: 'Python, FastAPI, Flask',
      database: 'Database',
      databaseTech: 'MongoDB, PostgreSQL, Redis',
      devops: 'DevOps',
      devopsTech: 'GCP, Docker, Kubernetes'
    },
    quickNav: {
      title: 'Explore My Work',
      resume: {
        title: 'Resume',
        description: 'View my professional experience, and technical skills'
      },
      projects: {
        title: 'Projects',
        description: 'Explore my portfolio of personal and professional projects'
      },
      blog: {
        title: 'Articles',
        description: 'Read my articles on technology, insights, and life experiences'
      },
      learnMore: 'Learn More'
    },
    contact: {
      title: 'Contact Me',
      description: 'Feel free to reach out through the following channels'
    }
  },

  // Resume Page
  resume: {
    title: 'Resume',
    hero: {
      name: 'Ting Zhang',
      title: 'Senior Software Engineer',
      location: 'Taiwan',
      downloadPdf: 'Download PDF'
    },
    sections: {
      skills: 'Technical Skills',
      languages: 'Languages',
      experience: 'Work Experience',
      education: 'Education'
    },
    skills: {
      frontend: 'Frontend',
      backend: 'Backend',
      devops: 'DevOps / Tools',
      database: 'Database'
    },
    languages: {
      chinese: 'Chinese',
      chineseLevel: 'Native',
      english: 'English',
      englishLevel: 'Professional Working Proficiency'
    },
    experience: {
      present: 'Present',
      responsibilities: 'Responsibilities'
    },
    education: {
      degree: 'Degree',
      gpa: 'GPA',
      thesis: 'Thesis'
    }
  },

  // Projects Page
  projects: {
    title: 'Projects',
    pageTitle: 'Projects',
    allProjects: 'All Projects',
    featured: 'Featured Projects',
    filterByTech: 'Filter by Tech',
    all: 'All',
    viewProject: 'View Project',
    viewDemo: 'View Demo',
    viewSource: 'View Source',
    viewCode: 'View Code',
    link: 'Link',
    noProjects: 'No projects available',
    close: 'Close',
    technicalTags: 'Technical Tags',
    projectHighlights: 'Project Highlights',
    projectInfo: 'Project Information',
    period: 'Period',
    team: 'Team',
    role: 'Role',
    moreCount: '+{count} more',
    comingSoon: 'Coming Soon',
    appStoreComingSoon: 'App Store (Coming Soon)',
    googlePlayComingSoon: 'Google Play (Coming Soon)'
  },

  // Blog Page
  blog: {
    title: 'Articles',
    subtitle: 'Sharing technical insights, life records, and personal perspectives',
    allPosts: 'All Posts',
    categories: 'Categories',
    tags: 'Tags',
    popularTags: 'Popular Tags',
    filterByCategory: 'Filter by Category',
    filterByTag: 'Filter by Tag',
    all: 'All',
    readMore: 'Read More',
    readingTime: 'Reading Time',
    minutes: 'min',
    publishedOn: 'Published on',
    tableOfContents: 'Table of Contents',
    relatedPosts: 'Related Posts',
    noPosts: 'No articles found',
    articleCount: '{count} articles total',
    tryOtherFilters: 'Try other filters',
    comingSoon: 'Articles coming soon',
    clearFilters: 'Clear Filters',
    backToBlog: 'Back to Blog',
    categoryTech: 'Tech',
    categoryLife: 'Life',
    categoryInsight: 'Insight',
    categoryProject: 'Project',
    categoryReflection: 'Reflection',
    categoryOther: 'Other',
    pagination: {
      previous: 'Previous',
      next: 'Next',
      page: 'Page {page}',
      showing: 'Showing {start}-{end} of {total} articles'
    }
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    notFound: 'Page not found',
    backHome: 'Back to Home',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    date: 'Date',
    latest: 'Latest',
    oldest: 'Oldest'
  },

  // SEO
  seo: {
    home: {
      title: 'Ting Zhang (張碩庭) | Sr. Software Engineer | Going Cloud',
      description: 'Personal portfolio and technical blog of Ting Zhang (張碩庭), a Sr. Software Engineer at Going Cloud, formerly at Smart Power System (智電系統). Specializing in Python, TypeScript, Vue.js, and GCP cloud architecture. Creator of Moniit.'
    },
    resume: {
      title: 'Resume | Ting Zhang (張碩庭) | Software Engineer | Going Cloud',
      description: 'Resume of Ting Zhang (張碩庭), Sr. Software Engineer. Experience at Going Cloud, Smart Power System (智電系統). Skills: Python, TypeScript, Vue.js, MongoDB, GCP, Kubernetes. Side Project: Moniit.'
    },
    projects: {
      title: 'Projects | Ting Zhang (張碩庭) | Moniit',
      description: 'Explore projects by Ting Zhang (張碩庭), including Moniit asset management app and electricity trading platform at Smart Power System.'
    },
    blog: {
      title: 'Technical Blog | Ting Zhang (張碩庭) | Software Engineer',
      description: 'Technical blog by Ting Zhang (張碩庭), covering software engineering, Python, TypeScript, Vue.js, and career insights.'
    }
  }
}
