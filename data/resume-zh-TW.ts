import type { Resume } from '~/types/resume'

export const resumeDataZhTW: Resume = {
  personalInfo: {
    name: '張碩庭',
    title: '資深軟體工程師 @ Going Cloud',
    email: 'tttingzhang999@gmail.com',
    location: '台灣',
    bio: '熱衷於建構可擴展的網頁應用程式和雲端基礎設施。專精於 Python、TypeScript 和現代網頁框架。擁有優化系統效能、實施 CI/CD 流程以及在 GCP, AWS 上建置雲原生解決方案的豐富經驗。',
    avatar: '/images/avatar.jpg'
  },

  workExperience: [
    {
      title: '資深軟體工程師',
      company: 'Going Cloud',
      period: '2025/11 - 至今',
      startDate: '2025-11',
      endDate: 'present',
      description: [
        '主導為台灣前十大金控業者中兩家銀行設計並交付企業級 AI Agent 建置平台，支援 A2A、MCP 等 Agent 通訊協定，並符合金融業行內資安與合規規範。',
        '設計多代理（Multi-Agent）AI Chatbot POC，整合 RAG、長短期記憶（使用者偏好）與雙模式協作（Orchestrator 與 Subagent 直連），以 Strands Agents 框架快速驗證業務情境。',
        '為銀行行內業務開發專屬 Subagents，包含信用卡支付建議 Agent 與內部 Infra 除錯輔助 Agent，協助業務單位與 SRE 提升決策與排查效率。',
        '主導公司 EKS 平台自 Ingress NGINX 遷移至 Gateway API（因應 EOL），並導入 OAuth2 Proxy 統一 SSO 驗證流程，提升服務治理與安全性。',
        '開發跨 Coding Agent 開發環境同步工具，一鍵安裝並持續同步 Claude Code、Cursor、Kiro 等工具設定，標準化團隊 AI 開發體驗。',
        '擔任兩位 Junior 軟體工程師的 Mentor，透過 Code Review、結對程式設計與技術分享協助其快速進入狀況。'
      ],
      technologies: ['AWS', 'EKS', 'Kubernetes', 'Strands Agents', 'MCP', 'A2A', 'Python', 'Gateway API', 'OAuth2 Proxy', 'RAG']
    },
    {
      title: '資深軟體工程師',
      company: '智電系統',
      period: '2025/6 - 2025/11',
      startDate: '2025-06',
      endDate: '2025-11',
      description: [
        '實作 External Secret + Secret Manager 取代原有環境變數部署方式，提升可管理性與安全性。',
        '整合單元測試與端對端測試至 CI/CD 流程，達成 75% 測試覆蓋率以提升產品穩定性。',
        '透過實作設計模式、優化資料庫查詢重構舊有程式碼，將 MongoDB 查詢效能提升 60%。'
      ],
      technologies: ['Python', 'TypeScript', 'MongoDB', 'GCP', 'Kubernetes', 'CI/CD']
    },
    {
      title: '軟體工程師',
      company: '智電系統',
      period: '2024/1 - 2025/6',
      startDate: '2024-01',
      endDate: '2025-06',
      description: [
        '獨立設計並開發電力轉供管理平台，為前後端分離的電力轉供管理網頁服務。',
        '優化台電計算公式並透過 Pandas 向量化，在維持相同精確度下，將電力轉供模擬演算法效能提升 50 倍。',
        '透過實作 Cloud Run 與 Cloud Tasks 降低雲端虛擬機租賃成本。',
        '開發台電高壓用戶服務系統網路爬蟲以提供即時用電資料，並將其模組化以供其他專案重複使用。',
        '為太陽能監控系統建置資料庫抽象層，將 200+ 個分散的 MongoDB 操作整合至統一服務層，將新功能資料整合時間縮短約 50%。',
        '開發由 Keycloak 驅動的身份驗證模組，並將其模組化以供其他專案重複使用。'
      ],
      technologies: ['Python', 'TypeScript', 'Vue.js', 'MongoDB', 'PostgreSQL', 'GCP', 'Cloud Run', 'Pandas', 'Keycloak']
    },
    {
      title: '實習',
      company: '智電系統',
      period: '2022/1 - 2024/1',
      startDate: '2022-01',
      endDate: '2024-01',
      description: [
        '研究台灣市場再生能源電力轉供演算法，開發易用的 MVP 網頁服務。',
        '設計並開發家用儲能控制系統網頁服務。'
      ],
      technologies: ['Python', 'Vue.js']
    }
  ],

  sideProjects: [
    {
      title: 'Moniit',
      description: '追蹤多元金融產品的資產管理應用程式',
      period: '2025/4 - 至今',
      startDate: '2025-04',
      endDate: 'present',
      highlights: [
        '整合並統一跨多元金融產品（如股票、加密貨幣、貴金屬和外匯）的資產管理 API。',
        '應用工廠模式與策略模式解耦資產類別，實現API Plug and Play。',
        '打造具排程器與併發處理的即時報價引擎，串流 15,000+ 個商品代碼的即時報價。'
      ],
      technologies: ['Python', 'Design Patterns', 'Real-time Systems', 'Financial APIs']
    }
  ],

  technicalSkills: [
    {
      category: '程式語言',
      skills: ['Python', 'TypeScript', 'JavaScript']
    },
    {
      category: '網頁框架',
      skills: ['Flask', 'FastAPI', 'Vue.js', 'Nuxt.js', 'Node.js']
    },
    {
      category: '資料庫',
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
