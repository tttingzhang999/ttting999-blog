# Python 程式碼上色修正

## 問題與範圍

Nuxt Content 的預設 Shiki 語言不包含 Python，文章程式碼因此退回純文字。
沿用既有渲染器與亮暗主題，在 `content.build.markdown.highlight.langs` 加入 Python。
保留現有路徑設定與文章原稿，不新增套件。

## 實作與驗收

1. 先補 Playwright 回歸測試，在修正前確認 Python token 沒有不同顏色。
2. 加入 Python 語言設定；涵蓋原稿的 `python` 與 `Python` 標記。
3. 檢查亮暗模式、無 JavaScript 渲染、縮排、手機捲動與既有 Bash 上色。
4. 執行型別檢查、單元測試及靜態生成，驗證正式 HTML 的上色。

只有驗證發現樣式衝突才調整 CSS。

## 結果

- 加入 Python 語言，並以 remark plugin 將既有大寫 `Python` 標記正規化；不修改文章。
- 修正前亮暗模式的回歸測試均因缺少關鍵字 token 失敗；修正後兩項均通過。
- 單元測試 23 項通過，新增 plugin 的行、分支、函式覆蓋率皆為 100%；型別檢查通過。
- 靜態生成成功，產生 82 條路由。未需修改 CSS。
- 驗證使用 Node 24；本機 Homebrew 的 `node@24` 路徑實際指向 Node 26，因此改用 npm 暫存的 Node 24 執行。
