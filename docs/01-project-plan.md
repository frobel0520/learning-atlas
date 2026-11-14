# Learning Atlas 專案計畫

| 文件項目 | 內容 |
|---|---|
| 文件版本 | 1.0 |
| 文件日期 | 2026-11-14 |
| 狀態 | 依現況盤點補齊（已上線公開級學習入口網站） |
| 產品類型 | 跨主題技術學習路線入口頁與互動單頁教材 |
| 專案級別 | 公開級 |
| 每月預算上限 | NT$0（零月費硬性規則） |
| 版控／部署 | GitHub `frobel0520/learning-atlas`／GitHub Pages（`main` 根目錄直接發布） |
| SDLC | Planning → SA → SD／ADR → Task DAG → 開發測試 → CI／Release Gate |

## 1. 摘要

Learning Atlas 是串連五條平行學習路線的總入口頁（Portal），同時在 `lessons/` 目錄下直接託管獨立的單頁互動 HTML 教材，讓學習者在無需安裝環境的情況下，從概念地圖進入各專業工作坊或直接在瀏覽器中操作演算法與網路請求模擬。

## 2. 目標學習者

- 想建立軟體工程、AI 安全、AI Agent、AWS 雲端與程式語言全貌的工程師與學習者。
- 偏好以互動模擬而非純文字閱讀理解底層機制（如 FSRS 記憶曲線、HTTPS 請求生命週期）的開發者。

## 3. 目標與成功標準

| 目標 | 成功標準 |
|---|---|
| 串連五條學習路線 | 首頁完整呈現軟體工程、AI 安全、AI Agent、雲端 AWS、程式語言五條路線卡片與外部網站連結 |
| 互動單頁教材可用 | `lessons/fsrs.html` 與 `lessons/request-journey.html` 皆可純瀏覽器離線邏輯互動操作 |
| 零建置、零月費 | 不依賴後端伺服器或付費託管，直接透過 GitHub Pages 根目錄提供靜態 HTML |
| 安全標頭防護 | 各 HTML 頁面皆以 `<meta http-equiv="Content-Security-Policy">` 搭配 inline script SHA-256 雜湊控管 |

## 4. 範圍

### 4.1 已實作範圍（現況）

- **入口首頁（`index.html`）**：側邊欄導覽（含手機版漢堡選單與 `IntersectionObserver` 捲動高亮）、五條學習路線卡片（對應各獨立 repo 與 GitHub Pages）、以及站內 HTML 互動教材連結。
- **教材一：`lessons/fsrs.html`**：FSRS-6 間隔重複排程演算法圖解課，含澆花隱喻、天數滑桿（0–30 天）與穩定度選擇器、即時 SVG 植物狀態動畫及數學公式說明。
- **教材二：`lessons/request-journey.html`**：《請求的一生：一個 HTTPS 請求的全程》11 章單檔互動教材，涵蓋瀏覽器／DNS、TCP/IP、TLS 1.3、HTTP/1.1 vs HTTP/2、Nginx 反向代理、FastAPI + Pydantic 模擬、瀏覽器端 SQLite（`sql-asm.js`）、React 18 渲染、全端模擬與除錯練習。

### 4.2 明確排除

- 帳號登入、學習進度雲端同步或後端 API。
- 各平行路線工作坊的教材本體（各自維護於對應獨立 repo）。
- 自動化建置工具鏈或套件打包流程（現況採零建置原生 HTML/CSS/JS）。
