# SWE Trial（road-to-solution-architect）子站規則

本目錄是 learning-atlas monorepo 的子站（2026-11-19 從 `frobel0520/road-to-solution-architect` 連同歷史搬入，原 repo 已封存）。個資保護與共用規範見 repo 根目錄的 `AGENTS.md`；以下是本站額外的規則。

- 接手流程（人與所有 AI agent 都適用，不依賴任何工具的記憶、全域設定或本機檔案）：
  1. `git fetch`，讀預設分支 `main` 上的 `sites/road-to-solution-architect/progress.md`。這是本站唯一的交接來源。
  2. 依 `progress.md` 的「交接」切到進行中的分支繼續工作。
  3. 再讀相關文件（路徑都在本目錄下）：`docs/01-project-plan.md`（計畫與範圍）、`docs/03-system-design.md`（設計與 ADR）、`docs/curriculum.md`（課綱與內容規範，課程內容的唯一依據）。
  4. 收工或交接前更新 `progress.md`，並同步到 `main`（push 前依共用規範取得使用者確認）。
- 課程案例一律使用虛構企業 Example Retail（設定見 `docs/curriculum.md` 第 4 節），不得以任何真實雇主、客戶或內部系統當案例。
- 內容用繁體中文和台灣用語，技術名詞保留原文。
- AWS 服務的功能、限制與價格以官方文件為準，在單元的 `sources` 標註查證日期；沒查證的數字不寫。
- 課綱、單元格式或案例設定有變更時，先回寫 `docs/curriculum.md`，再改內容。
- 網站部署在共用的 `frobel0520.github.io` 來源（GitHub Pages），依部署手冊不能保存登入狀態。第二階段若要加登入同步，先重新決定部署位置（見 `docs/03-system-design.md` ADR-005），再改為產品級。
- 每頁的 CSP 寫在 `src/layouts/Base.astro` 的 meta；加外部來源時同步更新 CSP，並跑 E2E 確認沒有 CSP 違規。
