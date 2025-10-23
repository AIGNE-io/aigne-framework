# 總覽

AIGNE 框架是一個功能性 AI 應用程式開發框架，旨在簡化並加速建構可擴展、Agent 式 AI 應用程式的過程。它結合了函式程式設計概念、強大的人工智慧功能和模組化設計，為開發者提供一個結構化的環境。

本文件提供了 AIGNE 框架的架構、核心元件和主要功能的高階概覽。它同時也作為一份導航指南，根據您的技術背景和目標，引導您至合適的文件路徑。

## 核心架構

此框架的架構設計圍繞著一個稱為 `AIGNE` 的中央協調器，它負責管理稱為 `Agents` 的各種專用元件的生命週期和互動。`Agents` 是工作的基本單位，旨在執行特定任務。它們可以組成團隊來處理複雜的工作流程。

```d2
direction: down
style: {
  font-size: 14
}

AIGNE: {
  label: "AIGNE"
  tooltip: "協調 Agent 和工作流程的中央執行引擎。"
  shape: hexagon
  style: {
    fill: "#F0F4EB"
    stroke: "#C2D7A7"
    stroke-width: 2
  }
}

Models: {
  label: "AI 模型"
  tooltip: "與外部語言和圖像模型（例如 OpenAI、Anthropic）的介面。"
  shape: cylinder
  style: {
    fill: "#FEF7E8"
    stroke: "#F7D8A3"
    stroke-width: 2
  }
}

Agents: {
  shape: package
  label: "Agents"
  tooltip: "執行任務的專用工作單位。"
  style: {
    fill: "#EBF5FB"
    stroke: "#AED6F1"
    stroke-width: 2
  }

  AIAgent: {
    label: "AI Agent"
    tooltip: "與語言模型互動。"
  }
  TeamAgent: {
    label: "Team Agent"
    tooltip: "協調多個 Agent。"
  }
  FunctionAgent: {
    label: "Function Agent"
    tooltip: "包裝自訂程式碼。"
  }
  OtherAgents: {
    label: "..."
    tooltip: "其他專用 Agent，如 ImageAgent、MCPAgent 等。"
  }
}

Skills: {
  label: "技能與工具"
  tooltip: "可供 Agent 使用的可重用函式或外部工具。"
  shape: rectangle
  style: {
    fill: "#F4ECF7"
    stroke: "#D7BDE2"
    stroke-width: 2
  }
}

AIGNE -> Agents: 管理與叫用
Agents -> Models: 利用
Agents -> Skills: 使用
```

-   **AIGNE**：中央執行引擎，負責管理 Agent 的生命週期、協調其互動並處理整體執行流程。它透過一個可包含模型、Agent 和技能的組態進行實例化。
-   **Agents**：框架的基本建構組塊。一個 Agent 是一個執行特定任務的自主單位。框架提供了幾種專門的 Agent 類型，包括用於與語言模型互動的 `AIAgent`、用於協調多個 Agent 的 `TeamAgent`，以及用於執行自訂程式碼的 `FunctionAgent`。
-   **Models**：與 OpenAI、Anthropic 和 Google 等外部 AI 模型供應商介接的抽象層。Agent 使用這些模型來利用大型語言模型（LLM）和圖像生成模型的能力。
-   **Skills**：可重用的功能，通常以函式或其他 Agent 的形式呈現，可以附加到 Agent 上以擴展其功能。

## 主要功能

AIGNE 框架具備一套全面的功能，以支援開發複雜的 AI 應用程式。

<x-cards data-columns="2">
  <x-card data-title="模組化設計" data-icon="lucide:blocks">
    清晰的模組化結構讓開發者能有效組織程式碼，從而提高開發效率並簡化維護。
  </x-card>
  <x-card data-title="支援多種 AI 模型" data-icon="lucide:bot">
    內建支援多種主流 AI 模型，包括 OpenAI、Google 和 Anthropic 的模型，並採用可擴展的設計以支援其他模型。
  </x-card>
  <x-card data-title="彈性的工作流程模式" data-icon="lucide:git-merge">
    原生支援循序、並行和路由等多種工作流程模式，以滿足複雜的應用程式需求。
  </x-card>
  <x-card data-title="支援 TypeScript" data-icon="lucide:file-type">
    提供全面的 TypeScript 型別定義，確保型別安全並提升整體開發者體驗。
  </x-card>
  <x-card data-title="程式碼執行" data-icon="lucide:terminal-square">
    支援在安全的沙箱環境中執行動態產生的程式碼，實現強大的自動化功能。
  </x-card>
  <x-card data-title="整合 MCP 協定" data-icon="lucide:plug-zap">
    透過模型內容協定（MCP）無縫整合外部系統和服務。
  </x-card>
</x-cards>

## 如何使用本文件

為滿足不同需求，本文件分為兩條主要路徑。請選擇最符合您角色和目標的路徑。

<x-cards data-columns="2">
  <x-card data-title="開發者指南" data-icon="lucide:code" data-href="/developer-guide/getting-started" data-cta="開始建構">
    適用於工程師和開發者。本指南提供技術深入探討、程式碼優先的範例、API 參考資料，以及使用 AIGNE 框架建構、測試和部署 Agent 式應用程式所需的一切。
  </x-card>
  <x-card data-title="使用者指南" data-icon="lucide:user" data-href="/user-guide" data-cta="學習概念">
    適用於非技術使用者、產品經理和業務相關人員。本指南以淺顯的語言解釋 AI Agent 和工作流程的核心概念，著重於潛在應用和業務成果，不涉及技術術語。
  </x-card>
</x-cards>

## 總結

本總覽介紹了 AIGNE 框架、其核心架構及主要功能。該框架是一套用於建構現代、基於 Agent 的 AI 應用程式的綜合工具集。

關於下一步，我們建議如下：
-   **開發者**：請前往 [開始使用](./developer-guide-getting-started.md) 指南，進行動手實作教學。
-   **非技術使用者**：請從 [什麼是 AIGNE？](./user-guide-what-is-aigne.md) 開始，進行概念性介紹。