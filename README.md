# Ting's Portfolio & Blog

Nuxt 4 + Nuxt Content 3，靜態部署於 [Vercel](https://info.tttingzhang999.com/)。
使用 Node 24（`.nvmrc`）與 `npm ci`。

## 寫作與發布

Obsidian 是文章、圖片與 agent 設定的唯一來源。

- `03 Writing/drafts/**`：撰寫中，不上網站。
- `03 Writing/blog/**`：已發布原稿；每次完整同步，保留子目錄與檔名。
- 文章移回 drafts、刪除或改名：同步會移除舊輸出與不再使用的管理圖片。
- 不使用 `draft` frontmatter。校稿使用 `write-article`，發布使用 `cook-blog-publish`。
- 不直接修改 `content/blog/**`、管理圖片或 `.blog-sync/manifest.json`。

```sh
npm run blog:status
npm run blog:plan
npm run blog:sync
npm run blog:status -- --verify
```

預設透過已安裝的 Codex skill symlink 定位 Vault；其他環境傳 `--vault /path/to/vault`
或設定 `BLOG_VAULT_ROOT`。plan/status 只讀，sync 只同步本機，不自動 commit/push。
部署狀態需要已登入的 `gh`。`status --verify` 非對齊或驗證失敗時回傳非零。
全部清空只能在確定下架所有文章時使用 `--allow-empty`；來源不可讀永遠停止。

Skill 的「同步部落格」會串起 plan → sync → 測試／建置 → commit/push → 部署驗證。
Production 的 manifest 必須符合本機輸出，公開網址回應 200、下架網址回應 404，
才是已驗證上線。Preview 與本機同步不代表正式網站已更新。

## 內容格式

必要欄位：title、description、YYYY-MM-DD 字串 date、字串陣列 tags、category。
可選 author、image、language、updatedAt。日期必須有來源；不以 mtime 推測。

支援 Markdown 圖片、reference 圖片、HTML img、Obsidian 圖片／寬度、wikilink
轉文字與 callout。程式碼區塊不轉換；筆記全文嵌入會明確報錯。原圖留在 Vault，
不強制重新命名。圖片需能在文章相對路徑或 `_assets/` 唯一定位。

網址沿用 Content 的大小寫／空白處理，額外保留中文字元；`Leetcode Contest/post.md`
對應 `/blog/leetcode-contest/post`。改名預設舊網址 404，不猜測 redirect。
URL 衝突會在寫入前停止，既有根目錄網址保持不變。

輸出被手動修改時會報 conflict。先比較並將要保留的變更回填 Vault，再把 repo
輸出還原到上次已知版本後重跑；不要修改 manifest hash 來繞過檢查。
同步先驗證完整集合，再套用；寫入失敗會回復原內容，回復失敗會明確報錯。

## 驗證

```sh
npm test
npm run typecheck
npm run generate
npm run test:seo-build
npx playwright test tests/blog-nested.spec.ts tests/blog-experience.spec.ts
```

文章與圖片的 SHA-256、路徑、下架網址存於 `.blog-sync/manifest.json`。
不保存校稿狀態或部署成功時間；Production 狀態從 GitHub 部署紀錄讀取。

## Agent 設定

`CLAUDE.md` 原稿在 Vault `.claude/project-configs/ttting999-blog/CLAUDE.md`；
兩個寫作／發布 skills 原稿在 Vault `.claude/skills/`。
修改後於 Vault 執行 `DRY_RUN=1 ./install.sh`、`DRY_RUN=0 ./install.sh`，
同步 Claude、Codex 與本 repo 的設定副本。runtime cache 不遷入 Vault。

`docs/plan-cross-platform-publisher.md` 是歷史規劃，並非已安裝工具。
