# Learning Atlas 系統設計（精簡版）

| 文件項目 | 內容 |
|---|---|
| 文件版本 | 1.0 |
| 文件日期 | 2026-11-14 |
| 狀態 | 依現況盤點補齊 |
| 專案級別 | 公開級 |
| 依據 | Harbor `standards/DevelopmentStandards.md`、`standards/DeploymentHandbook.md` |

## 1. 設計限制

- **零建置、零月費**：專案無 `package.json` 或打包器，全站為原生 HTML5、CSS3 與 JavaScript，直接由 GitHub Pages 免費託管。
- **CSP 雜湊約束**：所有 HTML 檔案皆於 `<meta http-equiv="Content-Security-Policy">` 明列 inline `<script>` 的 SHA-256 雜湊；任何修改 inline script 的變更都必須同步更新對應 SHA-256 雜湊，否則瀏覽器將阻擋執行。
- **無 WebAssembly 依賴**：互動資料庫單元採用 `sql-asm.js`（asm.js），避免靜態託管環境受限於 WASM MIME 設定。

## 2. 架構總覽

```text
GitHub repo（main 根目錄）
  └─ GitHub Pages（無建置步驟，直接發布靜態檔案）
       ├─ index.html                     五條平行學習路線入口 + 站內教材目錄
       │    └─ 外部連結至 5 個獨立工作坊／練習站點
       └─ lessons/
            ├─ fsrs.html                 FSRS-6 記憶曲線公式與動態 SVG 植物模擬
            └─ request-journey.html      11 章 HTTPS 全端請求模擬（CDN 載入 React 18 + sql-asm.js）
```

## 3. 目錄與外部依賴

```text
index.html                  總入口頁，嵌入 Harbor 維護腳本（data-project="learning-hub"）
lessons/fsrs.html           FSRS 互動教材（純原生 JS + SVG）
lessons/request-journey.html HTTPS 請求全景互動教材（單檔 5,425 行）
README.md / AGENTS.md       專案說明與規範
```

- **外部靜態資源**：Google Fonts（`DM Mono`、`Newsreader`、`Noto Sans TC`、`Noto Serif TC`）、Harbor 維護檢查腳本（`https://harbor-1wk.pages.dev/embed/maintenance.js`，800ms fail-open 逾時）；`lessons/request-journey.html` 另自 cdnjs 載入 React 18.3.1、ReactDOM 18.3.1 與 sql.js 1.14.2（`sql-asm.js`），若 CDN 無法連線則顯示降級提示。

## 4. 部署與驗證現況

- **部署方式**：GitHub Pages 設定從 `main` 分支根目錄（`/`）直接發布至 `https://frobel0520.github.io/learning-atlas/`。
- **CI／自動化測試現況**：儲存庫目前沒有 `.github/workflows/` 或自動化測試套件（缺口：尚無 HTML/CSP 雜湊一致性檢查與瀏覽器煙霧測試）。

## 5. 零月費與效能邊界

| 項目 | 現況與邊界 |
|---|---|
| 託管與算力 | GitHub Pages 免費靜態託管，無伺服器端執行或資料庫費用 |
| 資源載入策略 | `fonts.googleapis.com` 與 `fonts.gstatic.com` 設 preconnect；`sql-asm.js` 採按需延遲載入 |
| 單檔體積注意 | `lessons/request-journey.html` 為 5,425 行單檔教材，首次開啟時需一次下載並解析 |
| 效能驗收狀態 | 尚未建立頁面載入分位數（p50/p95）或行動裝置實測紀錄（待補） |
