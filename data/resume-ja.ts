import type { Resume } from '~/types/resume'

export const resumeDataJa: Resume = {
  personalInfo: {
    name: 'Ting Zhang',
    title: 'シニアソフトウェアエンジニア @ Going Cloud',
    email: 'tttingzhang999@gmail.com',
    location: '台湾',
    bio: 'スケーラブルなWebアプリケーションとクラウドインフラストラクチャの構築に情熱を注ぐシニアソフトウェアエンジニアです。Python、TypeScript、最新Webフレームワークを専門としています。システムパフォーマンスの最適化、CI/CDパイプラインの実装、GCP上でのクラウドネイティブソリューションの設計において豊富な経験があります。',
    avatar: '/images/avatar.jpg'
  },

  workExperience: [
    {
      title: 'シニアソフトウェアエンジニア',
      company: 'Going Cloud',
      period: '2025/11 - 現在',
      startDate: '2025-11',
      endDate: 'present',
      description: [
        '台湾の大手金融持株グループ上位10社のうち2行向けに、エンタープライズ級の AI Agent 構築プラットフォームの設計と提供をリード。A2A・MCP などのエージェント間通信プロトコルに対応し、行内のセキュリティ・コンプライアンス要件を満たす。',
        'RAG、長期・短期記憶（ユーザー嗜好）、オーケストレーター方式とサブエージェント直結方式の両モードを備えた Multi-Agent AI Chatbot POC を Strands Agents で構築し、業務シナリオを高速に検証。',
        '行内業務向けに専用サブエージェントを開発（クレジットカード決済推奨 Agent、社内インフラ デバッグ補助 Agent など）し、業務部門と SRE の意思決定とトラブルシュートを高速化。',
        '社内 EKS プラットフォームの Ingress NGINX（EOL 対応）から Gateway API への移行を主導し、OAuth2 Proxy による統一 SSO 認証を導入してサービスガバナンスとセキュリティを強化。',
        '社内向けに Coding Agent 統合セットアップツールを開発。Claude Code・Cursor・Kiro などの設定をワンクリックで同期し、チームの AI 開発環境を標準化。',
        'ジュニアエンジニア2名のメンターを担当し、コードレビュー・ペアプロ・技術共有を通じて早期戦力化を支援。'
      ],
      technologies: ['AWS', 'EKS', 'Kubernetes', 'Strands Agents', 'MCP', 'A2A', 'Python', 'Gateway API', 'OAuth2 Proxy', 'RAG']
    },
    {
      title: 'シニアソフトウェアエンジニア',
      company: 'Smart Power System',
      period: '2025/6 - 2025/11',
      startDate: '2025-06',
      endDate: '2025-11',
      description: [
        'External Secret + Secret Managerを実装し、従来の環境変数デプロイ方法を置き換えることで、管理性とセキュリティを向上させました。',
        '単体テストとエンドツーエンドテストをCI/CDパイプラインに統合し、75%のテストカバレッジを達成して製品の安定性を向上させました。',
        'デザインパターンの実装、データベースクエリの最適化、クリーンコード原則の適用により、レガシーコードベースをリファクタリングし、MongoDBクエリパフォーマンスを60%向上させました。'
      ],
      technologies: ['Python', 'TypeScript', 'MongoDB', 'GCP', 'Kubernetes', 'CI/CD']
    },
    {
      title: 'ソフトウェアエンジニア',
      company: 'Smart Power System',
      period: '2024/1 - 2025/6',
      startDate: '2024-01',
      endDate: '2025-06',
      description: [
        '電力取引プラットフォームを独自に設計・開発し、フロントエンドとバックエンドを分離した電力取引Webサービスを構築しました。',
        '台湾電力の計算式を最適化し、Pandasベクトル化を実装することで、同等の精度を維持しながら電力ホイーリングシミュレーションアルゴリズムの速度を50倍向上させました。',
        'Cloud RunとCloud Tasksを実装することで、GCP上のVM リース費用を削減しました。',
        '台湾電力高圧サービスシステム用のWebクローラーを開発し、リアルタイムの電力消費データを提供。Pythonモジュール化により複数のプロジェクトで再利用可能にしました。',
        '太陽光発電監視システムの開発に貢献しました。',
        'PV-EMSプラットフォーム用のパラメータ化されたデータベース抽象レイヤーを設計し、200以上の分散したMongoDB操作を統一サービスレイヤーに統合することで、新機能のデータ統合時間を約50%短縮しました。',
        'Keycloakを活用した認証モジュールを開発し、機能チームの認証開発工数を約70%削減しました。'
      ],
      technologies: ['Python', 'TypeScript', 'Vue.js', 'FastAPI', 'MongoDB', 'PostgreSQL', 'GCP', 'Cloud Run', 'Pandas', 'Keycloak']
    },
    {
      title: 'エンジニアインターン',
      company: 'Smart Power System',
      period: '2022/1 - 2024/1',
      startDate: '2022-01',
      endDate: '2024-01',
      description: [
        '台湾市場における再生可能エネルギー取引アルゴリズムを研究・設計し、使いやすいMVP Webサービスを開発しました。',
        '家庭用エネルギー貯蔵制御システムのWebサービスを設計しました。'
      ],
      technologies: ['Python', 'Web Development', 'Algorithm Design']
    }
  ],

  sideProjects: [
    {
      title: 'Moniit',
      description: '多様な金融商品を追跡する資産管理アプリケーション',
      period: '2025/4 - 現在',
      startDate: '2025-04',
      endDate: 'present',
      highlights: [
        '株式、暗号通貨、貴金属、外国為替などの多様な金融商品にわたる資産管理APIを統合・統一しました。',
        'ファクトリーパターンとストラテジーパターンを適用して資産クラスを分離し、新しい金融商品のプラグアンドプレイを可能にしました。',
        'スケジューラーと並行処理を備えたリアルタイム価格エンジンを構築し、15,000以上のシンボルのリアルタイム価格を配信しています。'
      ],
      technologies: ['Python', 'TypeScript', 'Design Patterns', 'Real-time Systems', 'Financial APIs']
    }
  ],

  technicalSkills: [
    {
      category: 'プログラミング言語',
      skills: ['Python', 'TypeScript', 'JavaScript']
    },
    {
      category: 'Webフレームワーク',
      skills: ['Flask', 'FastAPI', 'Vue.js', 'Nuxt.js', 'Node.js']
    },
    {
      category: 'データベース',
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
