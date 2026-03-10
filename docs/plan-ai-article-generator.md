# 計劃二：RAG 形式 AI 文章產生器

> **狀態**：計劃中
> **獨立 Repo**：是（`blog-article-generator`，獨立於部落格 repo）
> **核心功能**：餵入歷史文章 → RAG 學習寫作風格 → 根據條列式要點生成完整文章

---

## 一、作者寫作風格分析（從現有 7 篇文章萃取）

在設計 system prompt 之前，先歸納出關鍵風格特徵：

### 語言與用詞

- **繁體中文為主，中英混用頻繁**：技術名詞保留英文（GIL, Asyncio, MCP, OA, BQ, JD）
- **口語化語氣**：「哈」「加油勒！」「被洗臉」「越級打怪」「一坨沒辦法跑的 Code」
- **第一人稱視角**：「我認為」「我的底層邏輯」「我覺得」，帶有強烈個人觀點
- **偶爾使用 emoji**（🥲）和網路用語

### 結構模式

- **技術文章**：「前言/這篇文章的用處？」→ 分節介紹 → 比較表 → 程式碼範例 → 實際應用場景 → 參考資料
- **心得文章**：直接切入主題 → blockquote 標記重點語句 → 條列式優缺點/建議 → 個人反思結尾
- **標題風格**：H2（##）為主要章節，H3（###）為子項目，極少使用 H4+
- **段落長度**：偏短，每段 2-4 句話，不超過 150 字

### 內容特色

- **實務導向**：每個技術點都連結到真實工作場景
- **坦率直白**：不迴避負面經驗（「被洗臉」「無聲卡」）
- **Blockquote 使用頻繁**：用於強調核心觀點或金句
- **程式碼範例完整可執行**：包含完整 import 和 main block
- **文末附上參考資料列表**

---

## 二、技術棧選擇與理由

### 程式語言：Python

- RAG/LLM 生態系成熟度遠高於 TypeScript（LlamaIndex, LangChain, ChromaDB 皆 Python-first）
- 使用 `uv` 作為套件管理（與作者推薦工具一致）

### RAG Framework：直接使用 Anthropic SDK + 輕量組件（不用 LangChain/LlamaIndex）

| 框架 | 評估 |
|------|------|
| **直接實作（推薦）** | 完全透明可控，程式碼量更少，無 framework 版本升級風險 |
| LangChain | 抽象層過重，API 變動頻繁，維護成本高 |
| LlamaIndex | 比 LangChain 輕量，但對 7 篇文章的規模仍是 overkill |

### Vector DB：ChromaDB（Local）

- 完全本地運行，零成本、零延遲、零配置
- 7 篇文章的規模不需要 Pinecone/Qdrant
- Python-native，API 簡潔，支援 persistent storage

### Embedding Model：`text-embedding-3-small`（OpenAI）

- 性價比最高：$0.02/1M tokens，7 篇文章成本趨近於零
- 1536 維度，對繁體中文支援良好
- ChromaDB 原生支援 OpenAI embedding function

> **備選**：如果希望完全免費/離線，可改用 `nomic-embed-text`（開源，Ollama 本地跑）

### UI：CLI 優先，Streamlit 作為 Phase 2 加值

---

## 三、RAG 系統架構

```
┌─────────────────────────────────────────────────────────────────┐
│                     Article Generator Agent                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────────┐  │
│  │  Ingestion    │    │  Retrieval     │    │  Generation       │  │
│  │  Pipeline     │    │  Engine        │    │  Engine           │  │
│  │              │    │               │    │                   │  │
│  │ 1. Read .md  │    │ 1. Embed query│    │ 1. Build prompt   │  │
│  │ 2. Parse FM  │    │ 2. Search     │    │ 2. Inject context │  │
│  │ 3. Chunk     │    │    ChromaDB   │    │ 3. Call Claude    │  │
│  │ 4. Embed     │    │ 3. MMR Rerank │    │ 4. Post-process   │  │
│  │ 5. Store     │    │ 4. Top-5 ctx  │    │ 5. Output .md     │  │
│  └──────┬───────┘    └───────┬───────┘    └────────┬──────────┘  │
│         ▼                    ▼                      ▼             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ChromaDB (Local)                       │   │
│  │  Collection: "blog_articles"                              │   │
│  │  Metadata: {source, category, tags, date, chunk_type}    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

使用者輸入流程：
  條列式要點 + 文章類型 + 標籤
      → 檢索風格相似的文章片段
          → 組合 system prompt + context + 要點
              → Claude 生成完整 .md（含 frontmatter）
```

---

## 四、Document Ingestion Pipeline

### Chunking 策略：混合式（三層）

針對作者文章特性，採用三層 chunking：

| 層級 | 邊界 | 目的 | chunk_type |
|------|------|------|-----------|
| Full Article | 整篇文章 | 保留完整結構和語氣流暢度 | `"full"` |
| Section | H2 標題為邊界 | 保留段落級別的寫作模式（開頭、轉折、結尾） | `"section"` |
| Semantic | 400-600 tokens，重疊 100 tokens | 精確匹配具體技術描述的寫法 | `"semantic"` |

> 為什麼不只用語義切割？單純的語義切割會破壞作者的段落結構模式（例如 blockquote 後接解釋句的習慣）。

### Metadata 設計

```python
{
    "source": "concurrency.md",
    "title": "Python 並發處理方法",
    "category": "技術",           # 技術 / 心得 / 生活
    "tags": ["Python", "Concurrency"],
    "date": "2025-10-24",
    "chunk_type": "full" | "section" | "semantic",
    "section_title": "各方式介紹",
    "has_code": True,
    "has_blockquote": True,
}
```

### Retrieval 策略：兩階段

1. **Phase 1 - Category Filter + Similarity Search**
   - 先根據文章類型過濾
   - 在 subset 中做 cosine similarity search，取 top-10

2. **Phase 2 - MMR Re-ranking**
   - 使用 Maximal Marginal Relevance 確保 chunks 多樣性
   - 避免 top-K 全部來自同一篇文章
   - 最終取 top-5 作為 context

---

## 五、System Prompt 設計

### Static System Prompt（固定部分）

```
你是一位技術部落格的代筆 AI，你的任務是模仿特定作者的寫作風格來產生文章。

## 作者風格特徵

### 語言與用詞
- 繁體中文為主，技術名詞保留英文原文（例：GIL, Asyncio, MCP, OA, BQ, FastAPI）
- 口語化但不失專業，帶有個人色彩（例：「加油勒！」「被洗臉」「越級打怪」）
- 第一人稱視角，頻繁使用「我認為」「我覺得」「我的底層邏輯」
- 偶爾夾帶自嘲或幽默

### 段落結構
- 段落偏短，每段 2-4 句話，不超過 150 字
- 大量使用 Markdown blockquote（> ）來標記核心觀點或金句
- 技術文章：開頭說明「這篇文章的用處」→ 分節介紹 → 比較表 → 程式碼範例 → 實際應用場景 → 參考資料
- 心得文章：直接切入主題 → blockquote → 條列式分析 → 個人反思結尾
- 標題使用 H2（##）為主要章節，H3（###）為子項目

### 內容特色
- 實務導向：每個技術點必須連結到真實工作或專案場景
- 坦率直白：不迴避負面經驗，敢於表達真實感受
- 程式碼範例完整可執行，不只是片段
- 文末附上參考資料連結

## 你不應該做的事情
- 不要使用「本文」「筆者」等書面語
- 不要寫出過於正式或教科書式的語氣
- 不要每段都以相同句式開頭
- 不要省略個人觀點或經驗連結
- 不要生成過長的段落（超過 150 字）
```

### Dynamic Prompt Template（每次生成時動態組合）

```
## 參考風格樣本

以下是作者過去文章的片段，請仔細學習其語氣、結構和用詞習慣：

{retrieved_chunks}

## 使用者要求

### 文章類型
{article_type}  （技術 / 心得 / 生活）

### 文章要點
{user_bullet_points}

### 目標標籤
{tags}

## 任務

根據上述要點，以作者的風格產生一篇完整的繁體中文文章。
- 必須包含完整的 YAML frontmatter
- 段落結構需符合作者的寫作習慣
- 技術名詞保留英文
- 適當加入個人觀點和實務經驗連結
```

### 使用者輸入格式（YAML）

```yaml
# input.yaml
type: 技術
title_hint: "FastAPI vs Flask 比較"
tags: [Python, FastAPI, Flask, Backend]
points:
  - Flask 是同步框架，FastAPI 是異步框架
  - FastAPI 內建 Pydantic 驗證，Flask 需要額外安裝
  - 效能比較：FastAPI 在高並發場景下優勢明顯
  - 遷移經驗：從公司專案的 Flask 遷移到 FastAPI 的過程
  - 什麼時候不需要遷移
additional: "帶入我在 GC 工作的經驗"
```

---

## 六、Agent 設計

### 工作流程：兩輪生成 + 人工 Review

```
Round 1: 初稿生成
  使用者要點 + Retrieved context + System prompt
  → 完整文章初稿（.md），自動儲存到 output/

Round 2: 使用者 Review + 修改（可選）
  使用者回饋 → 修改後的文章

最終: 使用者確認 → 輸出到部落格 repo 的 content/blog/
```

### CLI 設計

```bash
# 從 YAML 輸入生成
blog-gen generate --input input.yaml

# 互動模式
blog-gen generate --interactive

# 重新 ingest 所有文章（重建 vector DB）
blog-gen ingest --source /path/to/blog/content/blog/ --rebuild

# 新增單篇文章到 corpus
blog-gen ingest --file /path/to/new-article.md

# 查看目前 corpus 狀態
blog-gen status

# 搜尋相似文章（debug 用）
blog-gen search --query "Python 效能優化"
```

### 輸出格式

直接產生符合部落格 frontmatter 的 Markdown：

```markdown
---
title: "FastAPI vs Flask：什麼時候該遷移？"
date: "2026-02-25"
description: "從實務角度比較 FastAPI 與 Flask，以及遷移經驗分享"
tags: ['Python', 'FastAPI', 'Flask', 'Backend']
category: "技術"
author: "Ting Zhang"
image: ""
draft: true    # 預設草稿，使用者確認後改為 false
---

## 這篇文章的用處？
...
```

---

## 七、資料夾結構

```
blog-article-generator/
├── pyproject.toml              # uv 專案配置 + ruff 設定
├── uv.lock
├── README.md
├── .env.example
├── .gitignore
│
├── src/
│   ├── __init__.py
│   ├── cli.py                  # CLI 入口（typer）
│   ├── config.py
│   │
│   ├── ingestion/
│   │   ├── reader.py           # Markdown 讀取 + frontmatter 解析
│   │   ├── chunker.py          # 混合式 chunking 策略
│   │   └── pipeline.py
│   │
│   ├── retrieval/
│   │   ├── store.py            # ChromaDB 操作封裝
│   │   └── search.py           # 檢索 + MMR re-ranking
│   │
│   ├── generation/
│   │   ├── prompt_builder.py   # System prompt + dynamic prompt 組合
│   │   ├── generator.py        # Claude API 呼叫
│   │   └── post_processor.py   # 輸出格式化（frontmatter 注入）
│   │
│   └── style/
│       └── analyzer.py         # 風格特徵靜態分析（可選）
│
├── prompts/
│   ├── system.md               # Static system prompt
│   └── templates/
│       ├── tech_article.md
│       └── reflection.md
│
├── data/
│   ├── chroma_db/              # ChromaDB persistent storage（.gitignore）
│   └── style_profile.json
│
├── input/                      # 使用者輸入 YAML
│   └── example.yaml
│
├── output/                     # 生成文章輸出
│   └── .gitkeep
│
└── tests/
    ├── test_reader.py
    ├── test_chunker.py
    ├── test_search.py
    └── test_prompt_builder.py
```

---

## 八、依賴清單

```toml
[project]
name = "blog-article-generator"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "anthropic>=0.40.0",
    "chromadb>=0.5.0",
    "openai>=1.50.0",      # for ChromaDB embedding function
    "typer>=0.12.0",
    "pyyaml>=6.0",
    "numpy>=1.26.0",
    "rich>=13.0.0",
]

[project.optional-dependencies]
dev = [
    "ruff>=0.8.0",
    "pytest>=8.0.0",
    "pytest-cov>=5.0.0",
]
ui = [
    "streamlit>=1.40.0",
]

[project.scripts]
blog-gen = "src.cli:app"
```

---

## 九、分階段實施計劃

### Phase 1：核心 RAG Pipeline（估計 2-3 天）

| 步驟 | 任務 | 複雜度 | 風險 |
|------|------|--------|------|
| 1.1 | 初始化專案（uv init, pyproject.toml, ruff 設定） | Low | Low |
| 1.2 | 實作 Markdown reader + frontmatter parser | Low | Low |
| 1.3 | 實作混合式 chunker（full + section + semantic） | Medium | Medium |
| 1.4 | 整合 ChromaDB + OpenAI embedding | Low | Low |
| 1.5 | 實作 ingestion pipeline | Low | Low |
| 1.6 | 實作 similarity search + MMR re-ranking | Medium | Medium |
| 1.7 | 撰寫 system prompt | Medium | Low |
| 1.8 | 實作 generator（Anthropic SDK 呼叫） | Low | Low |
| 1.9 | 實作 CLI（ingest + generate + status） | Low | Low |
| 1.10 | 端對端測試：用真實輸入生成文章，評估風格擬真度 | Medium | Medium |

**Phase 1 交付物**：可以從 CLI 輸入 YAML 要點，生成一篇帶 frontmatter 的 Markdown 文章。

---

### Phase 2：品質提升 + Refinement Loop（估計 2-3 天）

| 步驟 | 任務 | 複雜度 | 風險 |
|------|------|--------|------|
| 2.1 | 加入 iterative refinement（使用者回饋 → 修改） | Medium | Low |
| 2.2 | 風格分析工具（統計段落長度、blockquote 頻率等） | Medium | Low |
| 2.3 | Prompt 迭代優化（根據生成結果調整） | High | Medium |
| 2.4 | 加入 interactive CLI 模式 | Low | Low |
| 2.5 | 單篇文章增量 ingest | Low | Low |
| 2.6 | 撰寫 unit tests（80%+ 覆蓋率） | Medium | Low |

---

### Phase 3：UI + 自動化（估計 3-5 天，可選）

| 步驟 | 任務 | 複雜度 | 風險 |
|------|------|--------|------|
| 3.1 | Streamlit Web UI（輸入要點 → 預覽 → 下載） | Medium | Low |
| 3.2 | 一鍵部署到部落格 repo（copy 到 content/blog/） | Low | Low |
| 3.3 | File watcher：偵測部落格 repo 新增 .md → 自動 ingest | Medium | Medium |
| 3.4 | 風格評分系統（生成文章 vs 歷史文章 embedding 距離） | High | Medium |

---

## 十、關鍵技術決策與取捨

| 決策 | 取捨 | 收穫 |
|------|------|------|
| 不用 LangChain/LlamaIndex | 需自行實作 chunking 和 retrieval | 完全透明可控，程式碼更少，無版本升級風險 |
| ChromaDB 而非雲端 DB | 無法跨機器共享（需手動複製 data/chroma_db/） | 零成本、零延遲、零配置 |
| 混合式 Chunking | Chunk 數量較多（每篇 ~10-20 chunks） | 保留段落級別風格模式，生成品質更高 |
| Claude Sonnet（非 Opus） | 極端複雜風格模仿略遜 | 速度更快、成本更低，Sonnet 對此任務已足夠 |
| CLI 優先（非 Web UI） | 非技術使用者較不方便 | 開發速度快，可腳本化，符合開發者工作流 |

---

## 十一、風險與緩解措施

| 風險 | 嚴重度 | 緩解措施 |
|------|--------|----------|
| 生成文章風格不像作者 | High | 迭代調整 system prompt；增加 retrieved chunks 數量；加入 few-shot examples |
| 繁中 embedding 品質不佳 | Medium | OpenAI text-embedding-3-small 對繁中支援已不錯；備選：multilingual-e5-large |
| Corpus 太小導致 retrieval 效果差 | Medium | 混合式 chunking 增加 chunk 數量；隨新文章加入持續改善 |
| API 成本累積 | Low | 7 篇文章 embedding < $0.01；每次生成約 $0.01-0.03 |
| ChromaDB 資料損壞 | Low | 提供 `--rebuild` 從 source Markdown 全量重建 |

---

## 十二、更新與維護策略

### 新文章加入 corpus

```bash
# 手動觸發（推薦）
blog-gen ingest --file /path/to/new-article.md

# 全量重建
blog-gen ingest --source /path/to/blog/content/blog/ --rebuild
```

### Vector DB 版本控制

- `data/chroma_db/` 加入 `.gitignore`（binary 不適合 git tracking）
- 版本控制 Markdown 原始文章（即 ingestion source）
- 任何人 clone repo 後執行一次 `blog-gen ingest --rebuild` 即可重建

---

## 十三、Success Criteria

- [ ] `blog-gen ingest` 成功讀取 7 篇文章，產生 chunks 並存入 ChromaDB
- [ ] `blog-gen search` 可以根據 query 返回相關文章片段
- [ ] `blog-gen generate` 根據 YAML 輸入產生帶完整 frontmatter 的 Markdown
- [ ] 生成文章使用繁體中文，技術名詞保留英文
- [ ] 生成文章段落長度、blockquote 使用頻率與原文相近
- [ ] 生成文章包含個人觀點語氣（「我認為」「我覺得」）
- [ ] 新增文章可透過 CLI 增量加入 corpus
- [ ] 使用者可透過回饋迭代修改生成結果
