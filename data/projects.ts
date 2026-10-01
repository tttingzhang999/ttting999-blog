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
