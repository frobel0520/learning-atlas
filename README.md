# Learning Atlas

> 整合五條平行學習路線與 8 座互動教材站的 monorepo，統一部署在 GitHub Pages（`https://frobel0520.github.io/learning-atlas/`）；另外有一區「HTML 教學」，放一頁讀完的小教材（`lessons/`），直接由本站提供。

## 概覽

https://frobel0520.github.io/learning-atlas/

| 路線 | 網站 | 目錄 |
| --- | --- | --- |
| 軟體工程 | [Software Engineering Workshop](https://frobel0520.github.io/learning-atlas/software-engineering-workshop/) | `sites/software-engineering-workshop/` |
| 軟體工程 | [SWE Trial（技術導覽）](https://frobel0520.github.io/learning-atlas/road-to-solution-architect/) | `sites/road-to-solution-architect/` |
| AI 安全 | [Guardrail Workshop](https://frobel0520.github.io/learning-atlas/guardrail-workshop/) | `sites/guardrail-workshop/` |
| AI Agent | [AI Agent Tutorial](https://frobel0520.github.io/learning-atlas/AI-Agent-Tutorial/) | `sites/AI-Agent-Tutorial/` |
| 雲端 · AWS | [AWS Lab](https://frobel0520.github.io/learning-atlas/aws-lab/) | `sites/aws-lab/` |
| 程式語言 | [TypeScript Lab](https://frobel0520.github.io/learning-atlas/typescript-lab/) | `sites/typescript-lab/` |
| 程式語言 | [Go Lab](https://frobel0520.github.io/learning-atlas/golang-lab/) | `sites/golang-lab/` |
| 程式語言 | [FastAPI Learning Lab](https://frobel0520.github.io/learning-atlas/fastapi-learning-lab/) | `sites/fastapi-learning-lab/` |

## HTML 教學

| 教學 | 網址 | 檔案 |
| --- | --- | --- |
| FSRS：聰明的澆花小幫手（ELI5，約 5 分鐘） | [lessons/fsrs.html](https://frobel0520.github.io/learning-atlas/lessons/fsrs.html) | `lessons/fsrs.html` |
| 請求的一生：一個 HTTPS 請求的全程（11 章，約 2.5 小時） | [lessons/request-journey.html](https://frobel0520.github.io/learning-atlas/lessons/request-journey.html) | `lessons/request-journey.html` |

每份教學是一個獨立的 HTML 檔（樣式、互動都寫在同一個檔案裡，不需要建置），沿用本站的配色與字型；比喻與插圖自行撰寫、繪製。

「請求的一生」另外從 cdnjs 載入 React 18.3.1 與 sql.js 1.14.2（SQLite 的 asm.js 版本，不需要 WebAssembly）；連不到 cdnjs 時，React 與資料庫實驗會顯示提示，其他章節照常。頁面裡的 FastAPI 模擬器和真實 FastAPI 0.142.2 / Pydantic 2.13.5 / Python 3.14 比對過 73 個請求；Nginx 的 location 比對、proxy_pass 改寫與負載平衡依官方文件與原始碼實作，沒有接真的 Nginx 執行。新增教學時，在 `index.html` 的「HTML 教學」區塊加一張卡片，並更新上表與頁首的 LESSON 數。

## 主要功能／內容

串連並收納軟體工程、AI 安全、AI Agent、AWS 與程式語言共 8 座互動學習網站（以 `git subtree` 保留完整歷史合併至 `sites/`）；「HTML 教學」區塊收錄單頁教材。

## 現況與已知限制

各子站保留各自獨立的 `package.json` / 建置工具與 README，細部開發與本機後端執行方式請參閱對應 `sites/<name>/README.md`。

## 授權與來源

Repository 根目錄未見授權檔；此 README 不另行宣告使用或再散布權利（部分子目錄含有個別 `LICENSE`）。

---

## 主站與子站導覽

- Learning Atlas 是學習網站的總入口與 monorepo 主體；8 座子站統一部署在 `/learning-atlas/<site>/`。
- 新增或停用子站時，同時更新上表、`index.html` 的路線卡片與 `.github/workflows/pages-deploy.yml`。

## Harbor 整合

`index.html` 載入 Harbor 維護腳本（2026-09-24 起）。Harbor 裡的專案代號沿用改名前的 `learning-hub`（`data-project="learning-hub"`），改 repo 名稱時不要跟著改，否則會和 Harbor 的設定對不上。Harbor 連不上或逾時 800 ms 時頁面照常顯示。

## 部署

透過 `.github/workflows/pages-deploy.yml` 並行建置 8 座子站並與根目錄入口頁組裝為 `_site/`，統一發布至 GitHub Pages（`https://frobel0520.github.io/learning-atlas/`）。

> 若需啟用 `AI-Agent-Tutorial` 的線上 Supabase 連線，請於本 repo Settings → Secrets and variables → Actions → Variables 設定 `SUPABASE_FUNCTION_URL`、`SUPABASE_PROJECT_URL`、`SUPABASE_PUBLISHABLE_KEY`。

每個 HTML 的 `<head>` 有 meta CSP（Harbor 部署手冊 2.2）。inline `<script>` 以 SHA-256 雜湊放行，**改動 inline script 後要重算雜湊並更新該頁的 CSP**，否則腳本會被瀏覽器擋下；新增外部腳本或字型來源時也要加進 CSP。

新增路線：在 `index.html` 的 `.routes` 清單加一個 `<li class="route">`（左邊 `.route-head`、右邊 `.route-body`），並更新上表與側欄 `#route-nav` 的連結。同一條路線有多個網站時，比照「程式語言」卡片，在卡片裡用 `.labs` 清單列出。

## 視覺設計

版面、色票與字體對照 [Software Engineering Workshop](https://github.com/frobel0520/software-engineering-workshop) 的 Engineering Field Manual 方向（見該 repo 的 `design-direction.md`）：米色紙底 `#f1ecde`、深青主色 `#1b4b5a`、Newsreader + Noto Serif TC 標題、Noto Sans TC 介面、DM Mono 標籤，方角、細線分隔，沒有深色主題。所有 token 都寫在 `index.html` 開頭的 `:root`。
