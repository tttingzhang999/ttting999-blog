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
`status --verify` 要求最新成功 Production 紀錄的 manifest 符合本機內容，且正式網域
`/release.json` 的 `sourceSha` 等於該部署的 blog commit、`contentManifestDigest` 等於
該 commit 中 `.blog-sync/manifest.json` 原始 bytes 的 SHA-256；公開文章須回應 200、
下架網址須回應 404，全部通過才是已驗證上線。只更新程式、文章未變時仍會檢查 source SHA。
Preview 不算 Production；最新部署失敗會保留失敗狀態與前次成功的 `productionSha`，
不宣稱新版本已上線。未加 `--verify` 的狀態僅反映 GitHub 紀錄與內容比對。
目前 Vercel 若沒有 release.json，驗證會明確失敗；產物建置完成不表示 Cloudflare 遷移完成。

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
npm run test:blog-build
npm run test:static
npx playwright test tests/blog-nested.spec.ts tests/blog-experience.spec.ts
```

`test:static` 使用 Node 24 與本機 Chrome，在本機 Workers runtime 讀取完整的
`.output/public`；執行前須先 `npm run generate`。測試會拒絕動態內容／圖片請求，
並驗證無 JavaScript 閱讀、文章導覽與篩選。`tests/fixtures/static-runtime` 僅為本機
測試設定，不含正式帳號、綁定或部署設定；正式部署由 infra repo 管理。

文章與圖片的 SHA-256、路徑、下架網址存於 `.blog-sync/manifest.json`。
不保存校稿狀態或部署成功時間；Production 狀態從 GitHub 部署紀錄讀取。

## Agent 設定

`CLAUDE.md` 原稿在 Vault `.claude/project-configs/ttting999-blog/CLAUDE.md`；
兩個寫作／發布 skills 原稿在 Vault `.claude/skills/`。
修改後於 Vault 執行 `DRY_RUN=1 ./install.sh`、`DRY_RUN=0 ./install.sh`，
同步 Claude、Codex 與本 repo 的設定副本。runtime cache 不遷入 Vault。

`docs/plan-cross-platform-publisher.md` 是歷史規劃，並非已安裝工具。

## Cloudflare 靜態路由（遷移準備）

過渡期間 `vercel.json` 是兩個平台共用的 headers／redirects 政策來源。
`npm run generate` 在 SSG 完成後產生 `.output/public/_headers` 與 `_redirects`，
保留全部 22 個 308 永久轉址、安全 headers 與 `/_nuxt/*` 的一年 immutable 快取。
不要另行維護生成檔；不支援的 Vercel pattern 會讓轉換失敗，避免默默改變行為。
Vercel 仍讀原設定，新增輸出不會自行切換目前的正式部署。

Cloudflare 部署須採 `assets.html_handling = "drop-trailing-slash"` 與
`assets.not_found_handling = "404-page"`（本機 fixture 已採用），保持無尾斜線
canonical URL。Cloudflare 對尾斜線／index.html 正規化回傳 307；既有 legacy
aliases 則保留 308。找不到的文章使用生成的 `404.html` 回傳真正 404，不能啟用 SPA
fallback。`_headers`／`_redirects` 僅適用靜態資產回應；API 自行管理 headers。
`test:static` 在實際本機 Workers runtime 驗證轉址、路由及 headers；正式設定在 infra。

### Cloudflare release bundle

`npm run release:build` (Node 24, clean committed checkout) rebuilds the exact
current Git commit and creates `.output/release/` for the infra repository.
It only performs local SSG and Wrangler dry-run bundling; it does not deploy.
See [artifact v1 contract](docs/release-artifact.md) for identity, hashes and
binding requirements. Run `npm run test:release` for artifact validation tests.

### GitHub Actions 雙 repo 交付

`.github/workflows/ci.yml` 在 PR／main push 使用標準 `ubuntu-24.04`、Node 24
執行測試、型別檢查、SSG、SEO／文章與靜態閱讀測試。沒有 Cloudflare 憑證、cache、
排程或付費 runner。PR 不上傳產物；過期分支 CI 會取消，單次上限 25 分鐘。

`INFRA_HANDOFF_ENABLED` 未設定時，交付預設關閉。PW-003 完成 receiver、憑證和
帳單檢查後才可設為 `true`：GitHub 個人帳號的 Actions 預算必須為 **$0**，且
**Stop usage when budget limit is reached = Yes**。此設定由帳號管理，workflow
不能替代；公開 runner 免費不代表 artifact storage 無限制。額度阻擋只影響新交付，
不會移除 Cloudflare 已發布的網站。

啟用後，main push 從乾淨 commit 建置 `.output/release/`，只上傳一個
`blog-release` artifact，內容是 `blog-release.tar.gz`（根目錄為 artifact v1
檔案）。壓縮包最多 100 MiB 減 1 KiB，預留外層 ZIP metadata 空間；通知再確認
GitHub 回報的 artifact 大小不超過 100 MiB。保留 **1 天**，不永久保留回滾檔。
`artifact_digest` 是 GitHub 回報的外層 artifact ZIP `sha256:` digest，不是 tar.gz
或 release-manifest 的 digest。infra 下載時須驗證 ZIP digest，再驗證內部 manifest。

producer 完成成功後，獨立 `workflow_run` 才會驗證 API run／artifact 對應並通知
`tttingzhang999/ttting999-cloudflare-infra` 的 `repository_dispatch`，event type
為 `blog-release`。固定 payload：`source_repository`、完整 `source_sha`、`run_id`、
`artifact_id`、`artifact_digest`。通知不 checkout、不下載／執行產物、不自動重試，
也不代表已部署成功。過期產物須重建明確指定的受信任 commit，不得替換為 latest main。

PW-003 設定下列 blog repository variables／secret（此票不建立或啟用）：

- Variable `INFRA_HANDOFF_ENABLED`: 啟用時才設 `true`。
- Variable `INFRA_DISPATCH_APP_ID`: 專用 GitHub App ID。
- Secret `INFRA_DISPATCH_APP_PRIVATE_KEY`: 該 App private key。

App 僅安裝至 infra repo，僅授予 **Contents: write**（repository_dispatch API
所需）及 GitHub 隱含的 Metadata: read；不授予 Actions／Workflows 寫入權限。
這仍是 repo Contents 寫權，非 dispatch-only 權限。短效 installation token 明確限制
目標 repo／Contents 權限，action 結束會撤銷。Cloudflare／R2 憑證只留 infra，
不得提供給 blog CI。receiver 必須再獨立驗證來源與產物，不直接信任 dispatch payload。

本機：`npm run test:handoff`；workflow 語法另以 `actionlint` 驗證。
官方參考：[workflow_run](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run)、
[repository dispatch](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event)。
