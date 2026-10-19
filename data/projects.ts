export interface Project {
  id: string
  title: string
  description: string
  date: string
  tags: string[]
  github?: string
  demo?: string
  image?: string
  images?: string[]
  appStore?: string
  googlePlay?: string
  highlights: string[]
  period?: string
  teamSize?: string
  role?: string
}

export const projects: Project[] = [
  {
    id: 'wedding',
    title: 'Wedding - 互動婚禮網站',
    description:
      '為自己的婚禮打造的互動網站，將我們一路走來的照片與故事串成回顧，讓親友輕觸、長按慢慢瀏覽。從開場音樂到信封與紙飛機，把想分享的回憶做成一段可以親手探索的旅程。',
    highlights: [
      '資料驅動的回顧章節，結合 Vue、GSAP 與 WebGL 視覺呈現',
      '從開場音樂、輕觸／長按播放到信封設計，串接完整互動旅程',
      '可自訂信紙、封蠟與圖案，再編寫示範信件並試飛紙飛機',
      '公開展示版使用虛構信件與紙飛機；互動僅保留於本次頁面記憶體，不實際寄送',
    ],
    role: '負責互動設計與前端開發',
    date: '2026-06-15',
    period: '2026/06',
    tags: [
      'Vue 3',
      'TypeScript',
      'GSAP',
      'Three.js',
      'Vite',
      'Tailwind CSS',
    ],
    demo: 'https://wedding.tttingzhang999.com/',
    image: '/images/projects/wedding/recap.webp',
    images: [
      '/images/projects/wedding/recap.webp',
      '/images/projects/wedding/envelope.webp',
      '/images/projects/wedding/flight.webp',
    ]
  },
  {
    id: 'aws-diagram',
    title: 'AWS Diagram - 架構圖生成 Skill',
    description:
      '讓 Claude Code 或 Codex 從需求、原始碼與 Terraform 整理架構證據，產出使用 AWS 官方圖示的可編輯 draw.io 架構圖，並保留人工調整後的版面。',
    highlights: [
      '提供 connectivity、network、ha 三種範圍，涵蓋服務連線、網路配置與高可用性視角',
      '以 architecture JSON 記錄資源、關係及來源證據，區分已確認與推論的連線',
      '驗證 draw.io 結構、連線路徑與證據一致性，檢查重疊及穿越圖示的線段',
      '支援人工編輯後的局部修改與 PNG／PDF／SVG 匯出；範例取自 AWS 官方 ECS full-stack Terraform 專案',
    ],
    role: '負責 Skill 流程、驗證腳本與範例製作',
    date: '2026-10-15',
    period: '2026/10',
    tags: [
      'Agent Skill',
      'Python',
      'AWS',
      'Terraform',
      'draw.io',
      'Claude Code',
      'Codex',
    ],
    github: 'https://github.com/tttingzhang999/aws-diagram',
    image: '/images/projects/aws-diagram/network.webp',
    images: [
      '/images/projects/aws-diagram/network.webp',
      '/images/projects/aws-diagram/ha.webp',
    ]
  },
  {
    id: 'promptlingo',
    title: 'Promptlingo - Claude Code 英語學習 Skill',
    description: '啟發自 Krashen 的 Comprehensible Input 理論，將你每天與 Claude Code 的對話轉化為符合 CEFR 等級的英文學習素材，讓語言學習與真實開發情境緊密連結。',
    date: '2026-05-01',
    tags: ['Python', 'Claude Code', 'Agent Skill', 'CLI', 'LLM'],
    github: 'https://github.com/tttingzhang999/promptlingo',
    image: '/images/projects/promptlingo/demo.png',
    images: [
      '/images/projects/promptlingo/demo.png',
    ],
    highlights: [
      '自動讀取 ~/.claude/projects/*.jsonl 對話紀錄，過濾 code、路徑與 tool I/O 雜訊',
      '依設定的 CEFR 等級（A1–C2）產出每日學習報告：句型改寫、句型改善、單字、文法重點',
      '累積個人化詞彙庫（vocab.json）與易錯句型庫（patterns.json），逐日強化弱點',
      '以 Claude Code Agent Skill 形式提供 /promptlingo 指令，零額外 runtime',
    ],
    period: '2026/05',
    teamSize: '1人',
    role: '獨立開發（設計、實作、文件）',
  },
  {
    id: 'moniit-asset-management',
    title: 'Moniit - 多元資產管理應用',
    description: '整合股票、加密貨幣、貴金屬、外匯等多元資產的智能管理應用，提供即時報價、自動化資產追蹤與投資組合分析',
    date: '2025-04-01',
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'WebSocket', 'iOS', 'Android'],
    github: '',
    demo: 'https://moniit.com/',
    image: '/images/projects/moniit/moniit_logo.svg',
    images:[
      '/images/projects/moniit/moniit_1.png',
      '/images/projects/moniit/moniit_2.png',
      '/images/projects/moniit/moniit_3.png',
      '/images/projects/moniit/moniit_4.png',
      '/images/projects/moniit/moniit_5.png'
    ],
    appStore: 'https://apps.apple.com/us/app/moniit-unique-asset-partner/id6752471768',
    // googlePlay: 'https://play.google.com/store/apps/details?id=com.moniit.app',
    highlights: [
      '支援 15,000+ 個交易標的即時報價',
      '採用 Factory + Strategy 設計模式實現高擴展性',
      '即時報價引擎理論處理時間 < 10 秒',
      '整合股票、加密貨幣、貴金屬、外匯四大資產類別',
    ],
    period: '2025/04 - Present',
    teamSize: '程人頻道團隊、Yii chen',
    role: '負責後端開發、API 整合'
  },
]
