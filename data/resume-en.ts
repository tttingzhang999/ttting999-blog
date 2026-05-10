import type { Resume } from '~/types/resume'

export const resumeDataEn: Resume = {
  personalInfo: {
    name: 'Ting Zhang',
    title: 'Sr. Software Engineer @ Going Cloud',
    email: 'tttingzhang999@gmail.com',
    location: 'Taiwan',
    bio: 'Software Engineer with a passion for building scalable web applications and cloud infrastructure. Specialized in Python, TypeScript, and modern web frameworks. Experienced in optimizing system performance, implementing CI/CD pipelines, and architecting cloud-native solutions.',
    avatar: '/images/avatar.jpg'
  },

  workExperience: [
    {
      title: 'Sr. Software Engineer',
      company: 'Going Cloud',
      period: '2025/11 - present',
      startDate: '2025-11',
      endDate: 'present',
      description: [
        'Led the design and delivery of an enterprise-grade AI Agent platform for two of Taiwan\'s top-10 financial holding groups, supporting A2A and MCP agent communication protocols while meeting the banks\' internal security and compliance requirements.',
        'Designed a Multi-Agent AI Chatbot POC with RAG, long/short-term memory (user preferences), and dual collaboration modes (orchestrator and direct subagent invocation), built on the Strands Agents framework to rapidly validate business scenarios.',
        'Developed domain-specific subagents for in-bank business needs, including a credit-card payment recommendation agent and an internal infrastructure debugging assistant, accelerating decision-making for business units and SRE.',
        'Drove the migration of company EKS workloads from Ingress NGINX (EOL) to Gateway API and rolled out OAuth2 Proxy as the unified SSO authentication layer, improving service governance and security posture.',
        'Built an internal one-click setup tool that synchronizes configurations across coding agents (Claude Code, Cursor, Kiro), standardizing the team\'s AI-assisted development environment.',
        'Mentored two junior software engineers through code review, pair programming, and tech sharing sessions to ramp them up effectively.'
      ],
      technologies: ['AWS', 'EKS', 'Kubernetes', 'Strands Agents', 'MCP', 'A2A', 'Python', 'Gateway API', 'OAuth2 Proxy', 'RAG']
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

  certifications: [
    {
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2026-04',
      credentialUrl: 'https://www.credly.com/badges/69bf9e34-7820-4c1a-b7c7-7129f0f936eb/linked_in_profile'
    },
    {
      name: 'AWS Certified AI Practitioner',
      issuer: 'Amazon Web Services',
      issueDate: '2026-05',
      credentialUrl: 'https://www.credly.com/badges/5cc2233e-7dc0-4608-8999-1c9ca210a904/linked_in_profile'
    }
  ],

  socialLinks: {
    github: 'https://github.com/tttingzhang999',
    linkedin: 'https://www.linkedin.com/in/tingzhang98/',
    email: 'mailto:tttingzhang999@gmail.com'
  }
}
