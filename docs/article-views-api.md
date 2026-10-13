# 文章點閱 API

點閱數是近似值，不代表獨立訪客。讀取文章不依賴這個服務；額度耗盡、限流或儲存故障時，前端隱藏計數、不重試寫入。

- `GET /api/views?slug=<encodeURIComponent(canonicalPath)>`：讀取。
- `POST /api/views`：`Content-Type: application/json`，body 僅有 `{ "slug": "/blog/…" }`，Origin 必須完全等於環境的 `SITE_ORIGIN`。
- slug 使用 publisher 的 canonical path（含巢狀 Unicode），UTF-8 最多 2 KiB。不接受再次編碼、未知文章、額外欄位或重複 query。POST body 依實際串流位元組限制 4 KiB，不信任 Content-Length。
- 成功：`{ "success": true, "data": { "slug": "/blog/…", "views": 3 }, "error": null }`。
- 失敗：`{ "success": false, "data": null, "error": { "code": "…" } }`。
- 所有應用程式回應皆為 JSON、`Cache-Control: no-store`，不提供跨來源 CORS。Cloudflare 自行拒絕請求時可能回傳 HTML，客戶端不能假設一定有上述 envelope。

| HTTP | code | 情況 |
| --- | --- | --- |
| 400 | INVALID_INPUT | schema、編碼、slug 或 JSON 錯誤 |
| 403 | ORIGIN_DENIED | POST Origin 不符或缺少 |
| 404 | NOT_FOUND / UNKNOWN_ARTICLE | 非 API 路徑／非已發布文章 |
| 405 | METHOD_NOT_ALLOWED | 非 GET/POST；Allow: GET, POST |
| 413 | BODY_TOO_LARGE | 實際 body 超過 4 KiB |
| 415 | UNSUPPORTED_MEDIA_TYPE | POST 非 application/json |
| 429 | RATE_LIMITED | limiter 拒絕；Retry-After: 60 |
| 503 | UNAVAILABLE | 缺少 binding／可信 edge metadata，或 limiter／D1 故障 |

## 執行契約

`worker/index.mjs` 在建置時匯入 `.output/published-routes.json`；先執行 `npm run generate`。allowlist 是 bundle 的一部分，不從請求或遠端取得。

infra repo 負責部署環境設定：`DB` D1 binding、`VIEW_LIMITER` rate-limit binding（30 次／60 秒）及 `SITE_ORIGIN`。靜態資產優先，只有 `/api/views` 交給 Worker，避免 Worker 免費額度耗盡影響文章讀取。此 repo 的 Wrangler 設定僅供本機測試，沒有正式帳號憑證。

GET 與 POST 共用 SHA-256 雜湊的 `CF-Connecting-IP` limiter key，且要求 Cloudflare 提供的 `request.cf` metadata。此 key 不寫入 D1 或 log；它仍是可推算的假名識別值，不保證匿名。限流是每個 Cloudflare location 的 best effort，共用 IP 可能少算，分散式流量仍可能用盡 Worker 配額。Origin 可被非瀏覽器偽造，並非認證。

D1 只存文章 slug 與總數。失敗 log 僅輸出固定 `VIEWS_UNAVAILABLE`，不記錄 headers、IP、body、SQL 或例外內容。Withdrawn 文章保留資料但 API 無法存取；改名視為新文章。

驗證：`npm run test:views` 涵蓋 HTTP 邊界、entry allowlist、D1 原子並行增加與重啟後資料保留。部署前還需確認 Free binding 能力及靜態路由隔離。

參考：[Cloudflare rate-limit binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)。
