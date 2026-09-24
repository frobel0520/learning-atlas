# 學習總入口

https://frobel0520.github.io/

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

## 部署

單一靜態 `index.html`，不需要建置。repo 名稱為 `frobel0520.github.io` 時，GitHub Pages 會把它發布在帳號的根網址；在 Settings → Pages 選 `main` 分支、`/` 根目錄即可。

新增路線：在 `index.html` 的 `.routes` 清單加一個 `<li class="route">`，並更新上表。同一條路線有多個網站時，比照「程式語言」卡片，在卡片裡用 `.labs` 清單列出。
