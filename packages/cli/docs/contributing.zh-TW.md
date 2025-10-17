---
labels: ["Reference"]
---

# 貢獻

我們很高興您有興趣為 `@aigne/cli` 做出貢獻！您的幫助對於改善所有人的 AIGNE 開發體驗至關重要。無論是修復錯誤、提出新功能，還是改進文件，我們都歡迎您的貢獻。

本指南提供了設定開發環境、執行測試和提交變更的說明。

## 入門指南

`@aigne/cli` 套件是 `aigne-framework` monorepo 的一部分。若要開始，您需要克隆主儲存庫並安裝其依賴項目。

### 1. 克隆儲存庫

首先，將 `aigne-framework` 儲存庫從 GitHub 克隆到您的本機電腦：

```bash Git Clone icon=logos:git-icon
git clone https://github.com/AIGNE-io/aigne-framework.git
cd aigne-framework
```

### 2. 安裝依賴項目

我們使用 `bun` 作為專案的主要套件管理器。從 monorepo 的根目錄安裝所有必要的依賴項目：

```bash Bun Install icon=logos:bun
bun install
```

這將安裝 monorepo 中每個套件的所有依賴項目，包括 `@aigne/cli`。

## 開發工作流程

所有 CLI 的開發指令都應在其套件目錄 `packages/cli` 中執行。

### 建置程式碼

若要將 `src/` 中的 TypeScript 原始碼編譯為 `dist/` 目錄中的 JavaScript，請執行建置指令。此過程由 `tsconfig.build.json` 設定。

```bash Build Command icon=lucide:hammer
bun run build
```

### 程式碼檢查與類型檢查

我們使用 TypeScript 編譯器進行靜態分析並確保程式碼品質。若要在不產生 JavaScript 檔案的情況下檢查任何類型錯誤，請執行 lint 指令：

```bash Lint Command icon=lucide:check-circle
bun run lint
```

### 執行測試

我們有一套全面的測試套件，以確保 CLI 正常運作。以下是可用於測試的腳本：

| Command                 | Description                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `bun run test`            | 執行完整的測試套件，包括 CLI 原始碼 (`test:src`) 和專案範本 (`test:templates`) 的測試。   |
| `bun run test:src`        | 僅執行 CLI 核心功能的單元測試和整合測試。                                                      |
| `bun run test:templates`  | 專門執行由 `aigne create` 搭建的專案範本的測試。                                                   |
| `bun run test:coverage`   | 執行整個測試套件並產生程式碼覆蓋率報告。                                                                |

在提交 pull request 之前，確保所有測試都通過非常重要。

### 程式碼風格

我們使用 [Prettier](https://prettier.io/) 在整個專案中維持一致的程式碼風格。請在提交變更前確保您的程式碼已格式化。大多數編輯器都可以設定為在儲存時自動格式化檔案。

## 提交 Pull Request

一旦您完成變更並使用建置和測試腳本進行驗證後，就可以提交 pull request 了。

1.  在 GitHub 上 **Fork 儲存庫**。
2.  為您的功能或錯誤修復 **建立一個新分支**：`git checkout -b your-feature-name`。
3.  使用清晰且具描述性的提交訊息 **提交您的變更**。
4.  **將您的分支推送** 到您的 fork：`git push origin your-feature-name`。
5.  從您的 fork 向 `AIGNE-io/aigne-framework` 儲存庫的 `main` 分支 **開啟一個 pull request**。
6.  在 pull request 中 **提供您變更的詳細描述**，並引用 [issue tracker](https://github.com/AIGNE-io/aigne-framework/issues) 中的任何相關問題。

我們會盡快審核您的貢獻。感謝您幫助我們改進 AIGNE！
