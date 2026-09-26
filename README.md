# Learning Atlas

https://frobel0520.github.io/learning-atlas/

串連五條平行學習路線的入口頁。每個網站都是獨立的 repo 與 GitHub Pages 網站，這裡只放連結，不收納任何網站的內容。

| 路線 | 網站 | Repo |
| --- | --- | --- |
| 軟體工程 | [Software Engineering Workshop](https://frobel0520.github.io/software-engineering-workshop/) | [software-engineering-workshop](https://github.com/frobel0520/software-engineering-workshop) |
| AI 安全 | [Guardrail Workshop](https://frobel0520.github.io/guardrail-workshop/) | [guardrail-workshop](https://github.com/frobel0520/guardrail-workshop) |
| AI Agent | [AI Agent Tutorial](https://frobel0520.github.io/AI-Agent-Tutorial/) | [AI-Agent-Tutorial](https://github.com/frobel0520/AI-Agent-Tutorial) |
| 雲端 · AWS | [AWS Lab](https://frobel0520.github.io/aws-lab/) | [aws-lab](https://github.com/frobel0520/aws-lab) |
| 程式語言 | [TypeScript Lab](https://frobel0520.github.io/typescript-lab/) | [typescript-lab](https://github.com/frobel0520/typescript-lab) |
| 程式語言 | [Go Lab](https://frobel0520.github.io/golang-lab/) | [golang-lab](https://github.com/frobel0520/golang-lab) |
| 程式語言 | [FastAPI Learning Lab](https://frobel0520.github.io/fastapi-learning-lab/) | [fastapi-learning-lab](https://github.com/frobel0520/fastapi-learning-lab) |

## 主站與子站導覽

- Learning Atlas 是學習網站的總入口；各課程維持自己的 repository、網址與部署流程。
- 子站在現有導覽中提供返回 Learning Atlas 的連結；其他課程由總入口選擇，不複製課程內容。
- 新增或停用子站時，同時更新上表、`index.html` 的路線卡片與可用狀態文字，並檢查雙向連結。

## Harbor 整合

`index.html` 載入 Harbor 維護腳本（2026-09-24 起）。Harbor 裡的專案代號沿用改名前的 `learning-hub`（`data-project="learning-hub"`），改 repo 名稱時不要跟著改，否則會和 Harbor 的設定對不上。Harbor 連不上或逾時 800 ms 時頁面照常顯示。

## 部署

單一靜態 `index.html`，不需要建置。GitHub Pages 以專案站台發布在 `https://frobel0520.github.io/learning-atlas/`；在 Settings → Pages 選 `main` 分支、`/` 根目錄即可。頁面裡的連結都是完整網址，改 repo 名稱不影響各路線網站。

新增路線：在 `index.html` 的 `.routes` 清單加一個 `<li class="route">`，並更新上表。同一條路線有多個網站時，比照「程式語言」卡片，在卡片裡用 `.labs` 清單列出。
