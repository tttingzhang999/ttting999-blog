# 計劃一：多平台文章自動發布系統

> **狀態**：計劃中（已收斂）
> **位置**：`tools/publisher/`（同 blog repo）
> **技術棧**：Python + uv
> **Phase 1**：DEV.to（REST API，全自動）
> **Phase 2**：Hashnode（GraphQL API，全自動）
> **Phase 3**：Medium / Vocus 方格子（半自動化，Playwright）

---

## 平台 API 調查結果

### Tier 1：全自動可行（Phase 1-2 目標）

| 平台 | API 類型 | Markdown | Draft | Canonical URL | Tags | 更新文章 | 認證方式 |
|------|----------|----------|-------|---------------|------|----------|----------|
| **DEV.to** | REST | `body_markdown` | `published: false` | `canonical_url` | 支援 | **可以** `PUT /api/articles/{id}` | API Key（設定頁取得） |
| **Hashnode** | GraphQL | `contentMarkdown` | `createDraft` mutation | `originalArticleURL` | name + slug | **可以** | Personal Access Token |

### Tier 2：半自動化（Phase 3 挑戰）

| 平台 | 現況 | 半自動方案 |
|------|------|-----------|
| **Medium** | API deprecated，2025/1 停發新 token | Playwright：persistent session + Import Story by URL |
| **Vocus 方格子** | 無公開 API | Playwright：登入 → 富文本編輯器貼上 → 存草稿 |

---

## 一、工作流程

```
撰寫 Markdown 文章
    ↓
本地執行 `uv run publish`（互動式 CLI）
    ↓
┌─ 1. 掃描 content/blog/，列出可發布的文章
│     （排除 draft: true 和已發布到目標平台的文章）
│
├─ 2. 使用者選擇文章（checkbox 多選）
│
├─ 3. 使用者選擇目標平台（checkbox 多選）
│
├─ 4. Preview：CLI 印出轉換後的 Markdown 內容
│
├─ 5. 最終確認（checkbox，可反悔取消某幾篇）
│
└─ 6. 發布 → 更新 frontmatter 狀態 → 印出結果 URL
```

### CLI 互動範例

所有選擇步驟統一使用 `questionary.checkbox` 互動模式：
- `↑↓` 上下移動游標
- `Space` 勾選/取消勾選
- `Enter` 確認，進入下一步

```
$ uv run publish

📝 Scanning content/blog/ ...

? Select articles to publish: (↑↓ move, Space select, Enter confirm)
  ◯ 如何降低 Coding Agent 的幻覺？ (2026-01-20)
❯ ◉ Python 並發處理方法 (2025-10-24)
  ◉ 2026 Q1 洞察 (2026-02-15)
  ◯ Python GIL 介紹 (2025-09-10)
  ◯ uv 和 ruff：Python 工具鏈新選擇 (2025-08-05)

? Select target platforms: (↑↓ move, Space select, Enter confirm)
❯ ◉ DEV.to
  ◉ Hashnode
  ◯ Medium (半自動)
  ◯ Vocus 方格子 (半自動)

── Preview: Python 並發處理方法 ──────────────────────────────

  Platforms: DEV.to, Hashnode
  Title:     Python 並發處理方法
  Tags:      python, concurrency, asyncio
  Canonical: https://ttting999.vercel.app/blog/concurrency

  --- Transformed Markdown (first 50 lines) ---
  ## 這篇文章的用處？
  ...

── Preview: 2026 Q1 洞察 ───────────────────────────────────

  Platforms: DEV.to, Hashnode
  Title:     2026 Q1 洞察
  Tags:      career, insights
  Canonical: https://ttting999.vercel.app/blog/2026q1-insights
  ...

? Confirm publish as DRAFT: (↑↓ move, Space select, Enter confirm)
❯ ◉ Python 並發處理方法 → DEV.to, Hashnode
  ◉ 2026 Q1 洞察 → DEV.to, Hashnode

✅ Python 並發處理方法
   DEV.to   → https://dev.to/ttting999/python-concurrency-xxxx
   Hashnode → https://ttting999.hashnode.dev/python-concurrency
   Updated: content/blog/concurrency.md

✅ 2026 Q1 洞察
   DEV.to   → https://dev.to/ttting999/2026q1-insights-xxxx
   Hashnode → https://ttting999.hashnode.dev/2026q1-insights
   Updated: content/blog/2026q1-insights.md

Done. 2 articles × 2 platforms = 4 drafts published.
```

> **最後確認步驟也是 checkbox**：preview 後使用者可以取消勾選某幾篇，只發布部分文章。

---

## 二、關鍵技術決策

### 1. 發布狀態追蹤：frontmatter 欄位

**選擇 frontmatter 而非外部 JSON/SQLite 的理由**：
- 狀態與文章共存，git 版控即歷史，不需要額外同步機制
- 一目了然哪些文章已發布到哪些平台
- 不需要維護額外的資料檔案

```yaml
---
title: '如何降低 Coding Agent 的幻覺？'
# ... 現有欄位 ...
crosspost:
  devto:
    url: 'https://dev.to/ttting999/xxx'
    published_at: '2026-02-25'
  hashnode:
    url: 'https://ttting999.hashnode.dev/xxx'
    published_at: '2026-02-25'
---
```

> `crosspost.<platform>` 存在 = 已發布。有 URL 就代表已發布，不需要額外的布林值。

### 2. 圖片策略

- 相對路徑 `/images/blog/xxx.png` 自動轉換為 `https://ttting999.vercel.app/images/blog/xxx.png`
- 外部 URL（`https://...`）保持不變
- 發布前可選驗證圖片是否可達（HTTP HEAD）

### 3. Adapter 介面設計

用 Protocol 定義統一介面，Tier 1（API）和 Tier 2（Playwright）都實作同一介面：

```python
from typing import Protocol

class PlatformAdapter(Protocol):
    @property
    def name(self) -> str: ...

    def transform(self, body: str, metadata: ArticleMetadata) -> str:
        """平台專屬 Markdown 轉換"""
        ...

    def publish(self, title: str, content: str, metadata: ArticleMetadata) -> PublishResult:
        """發布到平台，回傳 URL"""
        ...

    def validate_config(self) -> None:
        """驗證環境變數/token 是否設定，失敗拋例外"""
        ...
```

> Phase 3 的 Playwright adapter 也實作同一介面，CLI 不需要知道背後是 API 還是瀏覽器自動化。

---

## 三、系統架構

### 資料夾結構

```
ttting999-blog/
├── content/blog/                    # 現有文章（不動）
├── tools/
│   └── publisher/
│       ├── pyproject.toml           # uv 專案配置 + ruff
│       ├── uv.lock
│       ├── .env.example             # DEVTO_API_KEY=xxx / HASHNODE_TOKEN=xxx
│       ├── src/
│       │   └── publisher/
│       │       ├── __init__.py
│       │       ├── cli.py           # 互動式 CLI 入口（typer + rich + questionary）
│       │       ├── config.py        # 環境變數 & 路徑設定
│       │       ├── models.py        # 資料模型（dataclass）
│       │       ├── scanner.py       # 掃描 content/blog/，解析 frontmatter
│       │       ├── state.py         # frontmatter 狀態讀寫
│       │       ├── transforms/
│       │       │   ├── __init__.py
│       │       │   ├── base.py      # 共用轉換（圖片 URL 等）
│       │       │   ├── devto.py     # DEV.to 專屬轉換
│       │       │   └── hashnode.py  # Hashnode 專屬轉換
│       │       └── adapters/
│       │           ├── __init__.py
│       │           ├── devto.py     # DEV.to REST API adapter
│       │           └── hashnode.py  # Hashnode GraphQL adapter
│       └── tests/
│           ├── test_scanner.py
│           ├── test_transforms.py
│           ├── test_state.py
│           ├── test_devto_adapter.py
│           └── test_hashnode_adapter.py
```

### 資料模型

```python
# models.py
from dataclasses import dataclass

@dataclass(frozen=True)
class ArticleMetadata:
    title: str
    description: str
    date: str
    tags: list[str]
    category: str
    author: str
    image: str | None
    draft: bool
    crosspost: dict[str, CrosspostEntry] | None

@dataclass(frozen=True)
class CrosspostEntry:
    url: str
    published_at: str

@dataclass(frozen=True)
class ParsedArticle:
    file_path: str
    slug: str                    # 從檔名推導
    metadata: ArticleMetadata
    body: str                    # frontmatter 以外的 Markdown

@dataclass(frozen=True)
class PublishResult:
    success: bool
    platform: str
    url: str | None
    error: str | None
```

---

## 四、核心模組設計

### Scanner（掃描 + 過濾）

```python
# scanner.py
def scan_articles(content_dir: Path) -> list[ParsedArticle]:
    """讀取所有 .md，解析 frontmatter，排除 draft"""

def filter_unpublished(articles: list[ParsedArticle], platform: str) -> list[ParsedArticle]:
    """過濾出尚未發布到指定平台的文章"""
```

### Transforms（Markdown 轉換）

```python
# transforms/base.py
def resolve_image_urls(body: str, site_base_url: str) -> str:
    """相對圖片路徑 → 絕對 URL"""

def remove_duplicate_h1(body: str, title: str) -> str:
    """移除與 frontmatter title 重複的 H1 標題"""

# transforms/devto.py
def transform_for_devto(body: str, metadata: ArticleMetadata, site_base_url: str) -> str:
    """
    DEV.to 轉換（相對簡單，DEV.to 對 Markdown 支援好）：
    1. 圖片路徑轉絕對 URL
    2. 移除重複 H1
    """

# transforms/hashnode.py
def transform_for_hashnode(body: str, metadata: ArticleMetadata, site_base_url: str) -> str:
    """
    Hashnode 轉換：
    1. 圖片路徑轉絕對 URL
    2. 移除重複 H1
    """
```

### DEV.to Adapter

```python
# adapters/devto.py
DEVTO_API_BASE = "https://dev.to/api"

class DevtoAdapter:
    def __init__(self, api_key: str):
        self._api_key = api_key

    @property
    def name(self) -> str:
        return "devto"

    def validate_config(self) -> None:
        # GET /api/users/me 驗證 API Key
        ...

    def transform(self, body: str, metadata: ArticleMetadata) -> str:
        return transform_for_devto(body, metadata, SITE_BASE_URL)

    def publish(self, title: str, content: str, metadata: ArticleMetadata) -> PublishResult:
        # POST /api/articles
        # body: {
        #   article: {
        #     title, body_markdown, published: false,
        #     tags: metadata.tags[:4],  # DEV.to 限制 4 個 tags
        #     canonical_url: 部落格原文 URL
        #   }
        # }
        # Headers: api-key, Content-Type, Accept: application/vnd.forem.api-v1+json
        ...
```

### Hashnode Adapter

```python
# adapters/hashnode.py
HASHNODE_API = "https://gql.hashnode.com"

class HashnodeAdapter:
    def __init__(self, token: str, publication_id: str):
        self._token = token
        self._publication_id = publication_id

    @property
    def name(self) -> str:
        return "hashnode"

    def validate_config(self) -> None:
        # Query me {} 驗證 token
        ...

    def transform(self, body: str, metadata: ArticleMetadata) -> str:
        return transform_for_hashnode(body, metadata, SITE_BASE_URL)

    def publish(self, title: str, content: str, metadata: ArticleMetadata) -> PublishResult:
        # mutation publishPost(input: {
        #   title, contentMarkdown, publicationId,
        #   tags: [{ name, slug }],
        #   originalArticleURL: canonical URL
        # })
        # 或 createDraft mutation（先存草稿）
        ...
```

### State（frontmatter 更新）

```python
# state.py
def update_crosspost_state(file_path: Path, platform: str, url: str) -> None:
    """
    讀取 .md → 解析 frontmatter → 新增/更新 crosspost 欄位 → 寫回檔案
    使用 python-frontmatter 保持原有格式不被破壞
    """
```

### CLI（互動式入口）

```python
# cli.py - 使用 typer + rich + questionary
@app.command()
def publish(content_dir: Path = Option(default_content_dir)):
    """互動式發布流程"""
    # 1. 載入所有已註冊的 adapters
    # 2. 掃描 & 列出文章
    # 3. questionary.checkbox 選擇文章
    # 4. questionary.checkbox 選擇平台（只顯示已設定 token 的平台）
    # 5. 驗證所選平台的 adapter config
    # 6. 對每篇文章 × 每個平台做 transform + preview（rich panel）
    # 7. questionary.checkbox 最終確認
    # 8. 逐篇逐平台 publish
    # 9. 更新 frontmatter
    # 10. rich table 印出結果摘要

@app.command()
def status(content_dir: Path = Option(default_content_dir)):
    """列出所有文章的跨平台發布狀態（rich table）"""
```

---

## 五、依賴清單

```toml
[project]
name = "publisher"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "httpx>=0.28.0",              # HTTP client（REST + GraphQL 都用）
    "python-frontmatter>=1.1.0",  # frontmatter 解析 + 寫回
    "typer>=0.15.0",              # CLI framework
    "rich>=13.0.0",               # 終端美化輸出
    "questionary>=2.1.0",         # 互動式 checkbox 選擇
    "pydantic-settings>=2.7.0",   # 環境變數管理
]

[project.optional-dependencies]
dev = [
    "ruff>=0.8.0",
    "pytest>=8.0.0",
    "pytest-cov>=5.0.0",
    "respx>=0.22.0",             # httpx mock（測試 API 呼叫）
]
# Phase 3 半自動化平台
browser = [
    "playwright>=1.49.0",
]

[project.scripts]
publish = "publisher.cli:app"
```

---

## 六、分階段實施計劃

### Phase 1：DEV.to 全自動（核心功能）

| 步驟 | 任務 | 複雜度 | 風險 |
|------|------|--------|------|
| 1.1 | `uv init` 初始化專案，設定 ruff + pytest | Low | Low |
| 1.2 | 實作 `models.py` 資料模型 | Low | Low |
| 1.3 | 實作 `scanner.py`（frontmatter 解析 + 過濾） | Low | Low |
| 1.4 | 實作 `transforms/base.py`（圖片 URL、H1 清理） | Low | Low |
| 1.5 | 實作 `transforms/devto.py` | Low | Low |
| 1.6 | 實作 `adapters/devto.py`（REST API） | Medium | Low |
| 1.7 | 實作 `state.py`（frontmatter 狀態寫回） | Medium | Medium |
| 1.8 | 實作 `cli.py`（互動式流程） | Medium | Low |
| 1.9 | 單元測試（scanner, transforms, state） | Medium | Low |
| 1.10 | 端對端測試：實際發布一篇到 DEV.to draft | Low | Low |

### Phase 2：Hashnode 全自動

| 步驟 | 任務 | 複雜度 | 風險 |
|------|------|--------|------|
| 2.1 | 實作 `transforms/hashnode.py` | Low | Low |
| 2.2 | 實作 `adapters/hashnode.py`（GraphQL） | Medium | Low |
| 2.3 | `status` 命令：rich table 顯示跨平台發布狀態 | Low | Low |
| 2.4 | 重試機制（指數退避，最多 3 次） | Low | Low |
| 2.5 | 測試 + 端對端驗證 | Low | Low |

### Phase 3：半自動化平台（Medium / Vocus）

| 步驟 | 任務 | 複雜度 | 風險 |
|------|------|--------|------|
| 3.1 | Playwright 基礎建設：persistent session 管理（cookie 登入） | High | High |
| 3.2 | Medium adapter：Import Story by URL 自動化 | High | High |
| 3.3 | Vocus adapter：登入 → 編輯器貼上 → 存草稿 | High | High |
| 3.4 | CLI 整合：半自動平台在選擇時標示 `(半自動)` | Low | Low |
| 3.5 | Fallback：Playwright 失敗時提供手動指引（印出 URL + 操作步驟） | Low | Low |

> **Phase 3 設計原則**：Playwright adapter 實作同一個 `PlatformAdapter` Protocol，CLI 不需要區分 API 和瀏覽器自動化。失敗時 graceful fallback 到手動指引，不中斷整個 pipeline。

---

## 七、驗收標準

### Phase 1（DEV.to）
- [ ] `uv run publish` 啟動互動式 CLI
- [ ] 掃描 `content/blog/` 並以 checkbox 列出可發布文章
- [ ] checkbox 選擇平台（目前顯示 DEV.to）
- [ ] 選擇文章後 preview 轉換後的 Markdown
- [ ] 最終確認（checkbox 可反悔）後發布到 DEV.to draft
- [ ] 發布後自動更新 frontmatter `crosspost.devto` 欄位
- [ ] 再次執行時已發布文章不出現在選擇列表
- [ ] 單元測試覆蓋率 80%+

### Phase 2（Hashnode）
- [ ] 平台選擇 checkbox 新增 Hashnode 選項
- [ ] 可同時選擇 DEV.to + Hashnode 一次發布
- [ ] `uv run publish status` 顯示跨平台發布狀態 rich table
- [ ] API 失敗自動重試

### Phase 3（Medium / Vocus）
- [ ] Playwright persistent session 可保持登入狀態
- [ ] Medium Import Story 自動化成功率 > 80%
- [ ] Playwright 失敗時印出手動操作步驟作為 fallback
- [ ] 半自動平台在 CLI 中標示 `(半自動)`

---

## 八、風險與緩解

| 風險 | 嚴重度 | 緩解方案 |
|------|--------|----------|
| DEV.to API 變更 | Low | 官方維護的 Forem API，穩定度高 |
| Hashnode GraphQL schema 變更 | Low | 官方有版本化文件 |
| frontmatter 寫回破壞格式 | Medium | 使用 `python-frontmatter` 保持格式；測試覆蓋寫回邏輯 |
| 圖片連結失效 | Medium | Phase 2 加入 HTTP HEAD 驗證 |
| Token 洩漏 | High | `.env` + `.gitignore`；`.env.example` 只放 key 名稱 |
| Playwright 被反自動化偵測 | High（Phase 3） | persistent session 避免頻繁登入；headed 模式；失敗時 fallback 到手動 |
| Medium/Vocus UI 改版 | High（Phase 3） | selector 集中管理；改版時只需更新 selector，不影響其他模組 |

---

## 九、與現有部落格整合

**需確認**：`content.config.ts` 的 Zod schema 是否接受未定義的 `crosspost` 欄位。若 Nuxt Content v3 做 strict parse，需加入：

```typescript
crosspost: z.record(z.any()).optional()
```

**需修改**：
- `.gitignore`：加入 `tools/publisher/.env`

**不需修改**：`nuxt.config.ts`、任何 Vue 元件、`package.json`（根目錄）

---

## 十、各平台 API 速查

### DEV.to

```
認證：Header `api-key: YOUR_KEY`
     Header `Accept: application/vnd.forem.api-v1+json`
取得 Key：https://dev.to/settings/extensions → Generate API Key

POST /api/articles         建立文章
PUT  /api/articles/{id}    更新文章
GET  /api/articles/me      列出自己的文章

Rate Limit: 10 req/30s (create), 30 req/30s (update)
Tags 限制: 最多 4 個
```

### Hashnode

```
認證：Header `Authorization: YOUR_TOKEN`
取得 Token：https://hashnode.com/settings/developer
取得 Publication ID：query me { publications { edges { node { id } } } }
Endpoint：POST https://gql.hashnode.com

mutation publishPost     發布文章
mutation createDraft     建立草稿
mutation updatePost      更新文章

Tags 格式: [{ name: "Python", slug: "python" }]
Canonical URL 欄位: originalArticleURL
```
