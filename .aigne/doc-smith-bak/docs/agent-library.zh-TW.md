# Agent 函式庫

Agent 函式庫提供一系列預先建置、可重複使用的 Agent，旨在加速複雜 AI 應用程式的開發。透過整合這些現成的元件，您可以輕鬆協調複雜的工作流程、管理並行任務，並自動化多步驟流程，而無需從頭開始建構一切。

## 簡介

`@aigne/agent-library` 是 AIGNE 框架的官方套件，提供強大、預先建置的 Agent 實作。此函式庫建構於 `@aigne/core` 之上，擴充了框架的基本功能，以簡化複雜的 Agentic 工作流程協調，讓開發者能專注於高層次的邏輯，而非底層的實作細節。

此函式庫的主要功能包括：

*   **進階 Agent 模式**：提供高階的 Agent 實作，例如 `OrchestratorAgent`，用於管理複雜的任務執行流程。
*   **並行任務執行**：支援多個任務的平行執行，顯著提升高負載工作量的處理效率。
*   **自動化規劃**：能夠根據高層次的目標，自動產生逐步的執行計畫。
*   **結果綜合**：智慧地匯總和綜合來自不同任務和步驟的結果，以產生連貫的最終輸出。
*   **完整的 TypeScript 支援**：包含全面的類型定義，確保穩健且類型安全的開發體驗。

## 安裝

首先，使用您偏好的套件管理器安裝必要的套件。您將需要 `@aigne/agent-library` 及其核心依賴套件 `@aigne/core`。

```sh 使用 npm 安裝 icon=lucide:terminal
npm install @aigne/agent-library @aigne/core
```

```sh 使用 yarn 安裝 icon=lucide:terminal
yarn add @aigne/agent-library @aigne/core
```

```sh 使用 pnpm 安裝 icon=lucide:terminal
pnpm add @aigne/agent-library @aigne/core
```

## 可用的 Agent

此函式庫包含專為進階使用案例設計的特化 Agent。每個 Agent 都有其專屬的章節提供詳細指引。

下圖說明了 `OrchestratorAgent` 的高層架構：

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Agent Library](assets/diagram/agent-library-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

<x-cards data-columns="2">
  <x-card data-title="Orchestrator Agent" data-href="/agent-library/orchestrator" data-icon="lucide:workflow">
    一個進階的 Agent，能為複雜目標自主規劃、執行並綜合結果。它使用「規劃者 → 工作者 → 完成者」架構來協調多步驟工作流程。
  </x-card>
</x-cards>

## 總結

對於任何希望使用 AIGNE 框架建構複雜的多 Agent 系統的開發者來說，Agent 函式庫是個至關重要的工具組。它提供了自動化複雜流程和高效協調工作流程的基礎元件。若要深入了解此函式庫的主要元件，請繼續閱讀 [Orchestrator](./agent-library-orchestrator.md) 文件。