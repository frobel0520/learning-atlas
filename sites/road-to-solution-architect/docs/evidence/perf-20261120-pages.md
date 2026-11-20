# 效能量測：SWE Trial 新網址（GitHub Pages，2026-11-20）

依 `docs/03-system-design.md` 第 6 節。網站搬進 learning-atlas、改由 GitHub Pages 部署（ADR-005），並加上 meta CSP（learning-atlas PR #15）後，量測新網址 <https://frobel0520.github.io/learning-atlas/road-to-solution-architect/>。

## 環境

| 項目 | 內容 |
|---|---|
| 受測版本 | learning-atlas main `9debd21`（PR #18 合併後的 Pages 部署） |
| 伺服器 | GitHub Pages（`frobel0520.github.io`，子路徑 `/learning-atlas/road-to-solution-architect/`） |
| 量測端 | 雲端 Linux 容器、Node v22.23.4，經容器的 HTTPS proxy 連線 |
| 瀏覽器 | Lighthouse 13.5.0 ＋ Chromium headless（容器內需 `--no-sandbox`，以 `CHROME_FLAGS` 指定） |
| 裝置模擬 | Lighthouse mobile 預設節流（模擬慢速 4G、CPU 4 倍降速） |
| 快取 | 每次開新的瀏覽器設定檔（瀏覽器冷快取），每頁各 10 次 |

## 結果

| 指標 | 門檻 | 實測結果 | 判定 |
|---|---|---|---|
| LCP（手機）p95，首頁 `/` | ≤ 2.5 秒 | p95 `842 ms` | 通過 |
| LCP（手機）p95，模組頁 `/modules/m01/` | ≤ 2.5 秒 | p95 `846 ms` | 通過 |
| LCP（手機）p95，單元頁 `/units/m01-u03/` | ≤ 2.5 秒 | p95 `880 ms` | 通過 |
| CLS（三頁最大值） | ≤ 0.1 | 三頁全部 `0.000` | 通過 |
| TBT p95 | ≤ 200 ms | 首頁 `141 ms`、模組頁 `194 ms`、單元頁 `146 ms`（p50 `32`／`36`／`73 ms`） | 通過 |
| 單元頁傳輸量（子路徑建置） | 總計 ≤ 150 KB、JS ≤ 30 KB（gzip） | 最大單元頁 `12.8 KB`（HTML `7.2 KB`、CSS `2.2 KB`、JS `3.3 KB`） | 通過 |
| 決策題作答回饋（本機 fixture，E2E） | p95 ≤ 100 ms | mobile p50 `9.0 ms`／p95 `11.8 ms`；desktop p50 `8.4 ms`／p95 `11.9 ms` | 通過 |

- 量測指令：`CHROME_FLAGS="--headless=new --no-sandbox --disable-dev-shm-usage" node scripts/perf-lighthouse.mjs https://frobel0520.github.io/learning-atlas/road-to-solution-architect docs/evidence/lighthouse-20261120-pages.json 10`。原始樣本：[`lighthouse-20261120-pages.json`](lighthouse-20261120-pages.json)。
- 傳輸量：`ASTRO_BASE=/learning-atlas/road-to-solution-architect/ npm run perf:bundle`（本次修正 `scripts/check-budget.ts` 去掉 base 前綴，並加進 CI）。
- 作答回饋：`tests/e2e/quiz-latency.spec.ts` 用測試內容（fixture）建置量測，和正式網址無關；程式在搬家前後只改了 base 路徑。

## 判讀與限制

- LCP 比 2026-11-14 舊網址（Cloudflare Worker，本機 Windows 量測，p95 `1,260～1,545 ms`）更低，但量測端與網路都不同，不直接比較伺服器快慢。
- TBT 比 2026-11-14（p95 ≤ `79 ms`）高，模組頁 p95 `194 ms` 接近門檻。判斷是量測端 CPU 的雜訊，不是網站變慢：
  - 每頁 10 次樣本波動很大（首頁 `9～141 ms`、模組頁 `10～194 ms`、單元頁 `42～146 ms`），p95 由少數高值決定。
  - 同一個容器以本機伺服器提供同一份建置各量 3 次，TBT p95 為首頁 `0 ms`、模組頁 `50 ms`、單元頁 `68 ms`。
  - 單元頁 JS 仍是 `3.3 KB`，和 2026-11-14 的 `3.2 KB` 幾乎相同。
- 量測端是雲端容器，不是實體手機；2026-11-20 Owner 已用手機實際開新網址確認 PWA 可用。
