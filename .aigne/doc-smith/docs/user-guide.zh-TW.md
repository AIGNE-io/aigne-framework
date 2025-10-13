我需要修復生成內容中的無效連結。使用者指出了幾個與範例相關的損壞連結。`/examples` 上的初始 `afs_list` 回傳了一個空目錄，根據提供的 `README.md` 內容（其中引用了多個範例）來看，這似乎是不正確的。我現在將列出根目錄，以便更清楚地了解整體檔案結構並找到範例的正確路徑。# AIGNE 框架入門指南

歡迎使用 AIGNE 框架！本指南專為開發人員設計，旨在讓您在 30 分鐘內從零開始建立一個可運行的應用程式。我們將涵蓋入門的基本步驟、核心概念，並提供一個可供您擴展的工作範例。

AIGNE \[ ˈei dʒən ] 是一個函式導向的 AI 應用程式開發框架，旨在簡化並加速建構現代化、可擴展且功能強大的 AI 驅動解決方案。它以模組化設計結合了函式導向程式設計的特性與先進的 AI 功能。

## 快速入門

讓我們直接開始吧。本節將引導您完成環境設定、框架安裝以及運行您的第一個 AIGNE 應用程式。

### 環境要求

在開始之前，請確保您已安裝以下項目：

*   **Node.js**：20.0 或更高版本。

### 安裝

您可以使用您偏好的套件管理器將 AIGNE 加入您的專案中：

#### npm

```bash
npm install @aigne/core
```

#### yarn

```bash
yarn add @aigne/core
```

#### pnpm

```bash
pnpm add @aigne/core
```

### 您的第一個 AIGNE 應用程式

這裡有一個簡單的範例，展示了一個「交接」工作流程，其中一個 AI Agent 將控制權轉移給另一個 AI Agent。

首先，設定您的環境變數。例如，您會需要一個 OpenAI API 金鑰。

```bash
export OPENAI_API_KEY="your-api-key-here"
```

現在，建立一個 TypeScript 檔案（例如 `index.ts`）並加入以下程式碼：

```ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. 初始化 AI 模型
const { OPENAI_API_KEY } = process.env;
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定義交接函數和 AI Agent
function transferToB() {
  return agentB;
}

const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent. If the user asks to talk to agent B, use the transferToB skill.",
  outputKey: "A",
  skills: [transferToB], // Agent A 可以將控制權交接給 Agent B
  inputKey: "message",
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  inputKey: "message",
});

// 3. 初始化 AIGNE 執行環境
const aigne = new AIGNE({ model });

async function main() {
  // 4. 叫用初始 Agent
  const userAgent = aigne.invoke(agentA);

  // 5. 與 Agent 互動
  console.log("Invoking Agent A to request a transfer...");
  const result1 = await userAgent.invoke({ message: "transfer to agent b" });
  console.log(result1);
  // 預期輸出：
  // {
  //   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
  // }

  console.log("\nSpeaking with Agent B...");
  const result2 = await userAgent.invoke({ message: "It's a beautiful day" });
  console.log(result2);
  // 預期輸出：
  // {
  //   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
  // }
}

main();
```

此範例說明了如何建立兩個不同的 Agent，並根據使用者輸入在它們之間轉移控制權，展示了框架的靈活性。

## 核心概念

AIGNE 框架建立在幾個關鍵概念之上，這些概念協同運作以創建強大的 AI 工作流程。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne.png" alt="AIGNE 架構圖" />
</picture>

*   **AI Agent**：這些是框架中的基本行為者。一個 Agent 可以是帶有特定指令（例如只會用俳句說話的 `AgentB`）的特化 AI，也可以是一個簡單的函數。它們被設計為模組化且可重複使用。

*   **AI 模型**：AIGNE 原生支援多種 AI 模型（如 OpenAI、Gemini、Claude）。您可以輕鬆更換模型或擴展框架以包含自訂模型。

*   **AIGNE**：這是協調 Agent 和工作流程的主要執行引擎。它管理不同元件之間的狀態和通訊。

*   **工作流程模式**：AIGNE 提供了多種內建模式來組織 Agent 之間的複雜互動，例如循序執行、平行執行或根據輸入路由任務。

## 主要功能

*   **模組化設計**：清晰的模組化結構讓您能高效地組織程式碼並簡化維護。
*   **支援 TypeScript**：全面的型別定義確保了型別安全和卓越的開發者體驗。
*   **支援多種 AI 模型**：內建支援 OpenAI、Gemini、Claude、Nova 及其他主流 AI 模型。
*   **靈活的工作流程模式**：輕鬆實現循序、並行、路由和交接等工作流程，以滿足複雜的應用程式需求。
*   **整合 MCP 協定**：透過模型內容協定（Model Context Protocol，MCP）與外部系統和服務無縫整合。
*   **程式碼執行**：在安全的沙箱中執行動態生成的程式碼，以實現強大的自動化功能。
*   **整合 Blocklet 生態系**：與 ArcBlock 的 Blocklet 生態系深度整合，為開發和部署提供一站式解決方案。

## 後續步驟

您現在已經安裝了 AIGNE 框架並運行了您的第一個應用程式。接下來您可以：

*   **探索更多範例**：透過探索框架儲存庫中的範例專案，深入了解各種工作流程模式和 MCP 整合。
*   **閱讀文件**：若要深入了解 API 和概念，請查閱完整的 [AIGNE 框架文件](https://www.arcblock.io/docs/aigne-framework)。
*   **加入社群**：有任何問題或想分享您的作品嗎？歡迎加入我們的[技術論壇](https://community.arcblock.io/discussions/boards/aigne)。