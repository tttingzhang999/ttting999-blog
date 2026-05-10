import type { Resume } from '~/types/resume'

export const resumeDataEn: Resume = {
  personalInfo: {
    name: 'Ting Zhang',
    title: 'Sr. Full Stack Engineer @ Going Cloud',
    email: 'tttingzhang999@gmail.com',
    location: 'Taiwan',
    bio: 'Software Engineer with a passion for building scalable web applications and cloud infrastructure. Specialized in Python, TypeScript, and modern web frameworks. Experienced in optimizing system performance, implementing CI/CD pipelines, and architecting cloud-native solutions.',
    avatar: '/images/avatar.jpg'
  },

  workExperience: [
    {
      title: 'Sr. Full Stack Engineer',
      company: 'Going Cloud',
      period: '2025/11 - present',
      startDate: '2025-11',
      endDate: 'present',
      description: [],
      technologies: ['AWS', 'Kubernetes']
    },
    {
      title: 'Sr. Software Engineer',
      company: 'Smart Power System',
      period: '2025/6 - 2025/11',
      startDate: '2025-06',
      endDate: '2025-11',
      description: [
        'Implement External Secret + Secret Manager to replace original environment variable deployment methods, improving manageability and security.',
        'Integrate unit tests and end-to-end tests into CI/CD pipelines, achieving 75% test coverage to enhance product stability.',
        'Refactor legacy codebase by implementing design patterns, optimizing database queries, and applying clean code principles, improving MongoDB query performance by 60%.'
      ],
      technologies: ['Python', 'TypeScript', 'MongoDB', 'GCP', 'Kubernetes', 'CI/CD']
    },
    {
      title: 'Software Engineer',
      company: 'Smart Power System',
      period: '2024/1 - 2025/6',
      startDate: '2024-01',
      endDate: '2025-06',
      description: [
        'Independently designed and developed Electricity Trading Platform, a decoupled frontend-backend web service for electricity trading.',
        'Optimized Taipower\'s calculation formulas and implemented Pandas vectorization, achieving a 50x speed improvement in the power wheeling simulation algorithm while maintaining equivalent accuracy.',
        'Reduced VM leasing costs on GCP by implementing Cloud Run and Cloud Tasks.',
        'Developed a web crawler for Taipower High-Voltage Service System to provide real-time electricity consumption data, Python modularized for reuse across multiple projects.',
        'Contributed to the development of a solar monitoring system.',
        'Architected a parameterized database abstraction layer for the PV-EMS platform, consolidating 200+ scattered MongoDB operations into a unified service layer, cutting new feature data-integration time by roughly 50%.',
        'Developed an authentication module powered by Keycloak, reducing feature-team development effort on auth by roughly 70%.'
      ],
      technologies: ['Python', 'TypeScript', 'Vue.js', 'FastAPI', 'MongoDB', 'PostgreSQL', 'GCP', 'Cloud Run', 'Pandas', 'Keycloak']
    },
    {
      title: 'Engineer Intern',
      company: 'Smart Power System',
      period: '2022/1 - 2024/1',
      startDate: '2022-01',
      endDate: '2024-01',
      description: [
        'Research and designed an algorithm for Renewable Electricity Trading in the Taiwan market, developed an easily used MVP web service.',
        'Design a web service for a house-used energy storage control system.'
      ],
      technologies: ['Python', 'Web Development', 'Algorithm Design']
    }
  ],

  sideProjects: [
    {
      title: 'Moniit',
      description: 'An assets management application for tracking diverse financial products',
      period: '2025/4 - present',
      startDate: '2025-04',
      endDate: 'present',
      highlights: [
        'Integrating and unifying asset management APIs across diverse financial products such as stocks, cryptos, precious metals, and forex.',
        'Applied Factory and Strategy patterns to decouple asset classes, enabling plug-and-play onboarding of new instruments.',
        'Engineered a real-time pricing engine with a scheduler and concurrency, streaming quotes for 15,000+ symbols.'
      ],
      technologies: ['Python', 'TypeScript', 'Design Patterns', 'Real-time Systems', 'Financial APIs']
    }
  ],

  technicalSkills: [
    {
      category: 'Programming Language',
      skills: ['Python', 'TypeScript', 'JavaScript']
    },
    {
      category: 'Web Framework',
      skills: ['Flask', 'FastAPI', 'Vue.js', 'Nuxt.js', 'Node.js']
    },
    {
      category: 'Database',
      skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis']
    },
    {
      category: 'DevOps',
      skills: ['Kubernetes', 'Helm', 'Docker', 'Linux', 'GCP', 'Git', 'Nginx', 'Shell']
    }
  ],

  socialLinks: {
    github: 'https://github.com/tttingzhang999',
    linkedin: 'https://www.linkedin.com/in/tingzhang98/',
    email: 'mailto:tttingzhang999@gmail.com'
  }
}
