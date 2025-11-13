# Ting Zhang's Portfolio & Blog

個人作品集與技術部落格網站，使用 **Nuxt 3** 建構，部署於 **Vercel**。

🌐 **Live Site**: [https://ttting999-blog.vercel.app/](https://ttting999-blog.vercel.app/)

## 專案特色

- 🎨 **現代化設計**: 採用 "Digital Artisan's Studio" 設計主題，支援深色/淺色模式切換
- 🌍 **多語言支援**: 繁體中文、英文、日文三語切換 (i18n)
- 📱 **響應式設計**: 完整支援桌面、平板、手機裝置
- 📝 **內容管理**: 使用 Nuxt Content v3，支援 Markdown 撰寫文章與專案介紹
- ⚡ **效能優化**: 靜態網站生成 (SSG)，Lighthouse 分數 90+
- 🎭 **動畫效果**: 使用 @vueuse/motion 實作流暢的滾動動畫
- 🔍 **SEO 優化**: 完整的 meta tags、Open Graph、Schema.org 結構化資料

## 技術棧

- **框架**: [Nuxt 3](https://nuxt.com/)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **內容**: Nuxt Content v3
- **國際化**: @nuxtjs/i18n
- **圖片優化**: @nuxt/image
- **動畫**: @vueuse/motion
- **部署**: Vercel

## 專案結構

```
/
├── app.vue                 # 根元件
├── components/
│   ├── layout/            # TopBar, Footer, Sidebar
│   ├── resume/            # 履歷相關元件
│   ├── ArticleCard.vue    # 文章卡片
│   ├── ProjectCard.vue    # 專案卡片
│   └── ProjectModal.vue   # 專案詳情彈窗
├── pages/
│   ├── index.vue          # 首頁
│   ├── resume.vue         # 履歷頁面
│   ├── blog/              # 部落格
│   │   ├── index.vue      # 文章列表
│   │   └── [slug].vue     # 文章內容
│   └── projects/
│       └── index.vue      # 專案列表
├── content/
│   ├── blog/              # 部落格文章 (.md)
│   └── projects/          # 專案介紹 (.md)
├── i18n/
│   └── locales/           # 翻譯檔案
├── data/                  # 資料檔案
│   └── resume-*.ts        # 各語言履歷資料
├── types/                 # TypeScript 型別定義
└── public/                # 靜態資源
```

## 開發指南

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

在瀏覽器開啟 `http://localhost:3000`

### 建置生產版本

```bash
# 標準建置
npm run build

# 靜態網站生成 (用於 Vercel 部署)
npm run generate
```

### 預覽生產版本

```bash
npm run preview
```

## 內容管理

### 撰寫部落格文章

在 `content/blog/` 目錄建立 `.md` 檔案：

```yaml
---
title: '文章標題'
description: '文章摘要'
date: '2025-01-15'
tags: ['nuxt', 'vue', 'typescript']
category: 'frontend'
author: 'Ting Zhang'
image: '/images/blog/cover.jpg'
draft: false
---

文章內容使用 Markdown 撰寫...
```

### 新增專案

在 `content/projects/` 目錄建立 `.md` 檔案：

```yaml
---
title: '專案名稱'
description: '專案說明'
date: '2025-01-15'
tags: ['vue', 'node', 'postgresql']
github: 'https://github.com/...'
demo: 'https://demo.example.com'
image: '/images/projects/cover.jpg'
featured: false
---

專案詳細介紹...
```

## 部署

### Vercel 部署設定

- **Build Command**: `npm run generate`
- **Output Directory**: `.output/public`
- **Framework Preset**: Nuxt.js

專案已設定自動部署，推送到 `main` 分支即會自動觸發建置與部署。

## 多語言支援

專案支援三種語言：
- 🇹🇼 繁體中文 (預設，無 URL 前綴)
- 🇺🇸 英文 (`/en` 前綴)
- 🇯🇵 日文 (`/ja` 前綴)

語言偏好會儲存在 cookie 中，自動記憶使用者選擇。

## 開發規範

詳細的開發規範、設計系統、常見問題解決方案，請參閱：
- `CLAUDE.md` - 專案概覽與開發指南
- `NUXT3_MIGRATION_GUIDE.md` - 詳細實作指南
- `TODO.md` - 任務追蹤與進度

## 授權

此專案為個人作品集，保留所有權利。

---

Built with ❤️ using Nuxt 3
