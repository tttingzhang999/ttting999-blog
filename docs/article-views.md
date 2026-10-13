# 文章點閱數

點閱數以 publisher 的 canonical `/blog/...` 路徑為鍵，支援巢狀與 Unicode。
`npm run generate` 重用 publisher 的 `articleRoute`，核對 manifest 與每篇產出的
HTML，產生 `.output/published-routes.json`，供 release 打包及 Worker 使用。
不接受額外 percent decoding、尾斜線或未知文章；改名會開始新計數，下架資料保留
在 D1，但 allowlist 不再允許讀寫。

`worker/article-views.mjs` 的 `articleViews(DB, routes, slug, increment)` 是儲存介面。
省略 `increment` 只讀取，已發表但尚無紀錄的文章回傳 0，不新增資料列。
寫入以參數化的單一 SQL upsert + RETURNING 原子累加，不先讀後寫。
`migrations/0001_article_views.sql` 是首版 schema；後續修改使用新增 migration，
部署不可清空資料庫。HTTP 驗證、限流、錯誤回應由 API 層負責。

執行 `npm run test:views` 驗證單元測試與真正的本機 D1 runtime：32 個並行寫入、
唯讀請求不新增列、migration 重跑、runtime 關閉重開後保留計數，以及 schema 約束。
Wrangler fixture 只有假 DB ID；`--local` 與 `remoteBindings:false` 不操作雲端。
D1 測試資料在臨時目錄，完成後清除。正式資源、bindings 與部署由 infra repo 管理。
