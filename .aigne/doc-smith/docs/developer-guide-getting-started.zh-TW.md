# 入門指南

本指南提供了您在幾分鐘內安裝並執行 AIGNE Framework 所需的一切。讀完本指南後，您將能夠建立並執行您的第一個由 AI 驅動的 Agent。

## 什麼是 AIGNE Framework？

AIGNE Framework \[ˈei dʒən] 是一個功能性 AI 應用程式開發框架，旨在簡化和加速建構現代 AI 驅動應用程式的過程。它結合了函數式程式設計、強大的 AI 功能和模組化設計，可協助您建立可擴展且可維護的解決方案。

**主要功能：**

*   **模組化設計**：清晰的結構，可提高開發效率並簡化維護。
*   **支援 TypeScript**：全面的型別定義，提供更好、更安全的開發體驗。
*   **支援多種 AI 模型**：內建支援 OpenAI、Gemini 和 Claude 等主要 AI 模型，並易於擴展。
*   **彈性的工作流程模式**：透過順序、並行、路由和交接等工作流程模式，簡化複雜操作。
*   **整合 MCP 協定**：透過模型內容協定（Model Context Protocol）與外部系統無縫整合。

## 1. 先決條件

在開始之前，請確保您的系統已安裝 Node.js。

*   **Node.js**：版本 20.0 或更高。

您可以在終端機中執行以下命令來驗證您的 Node.js 版本：

```bash
node -v
```

## 2. 安裝

您可以使用您偏好的套件管理器來安裝核心 AIGNE 套件。

### 使用 npm

```bash
npm install @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/core
```

## 3. 您的第一個 AIGNE 應用程式

讓我們用一個樂於助人的 assistant Agent 來建立一個簡單的「Hello, World!」風格的應用程式。

#### 步驟 1：設定您的專案檔案

建立一個名為 `index.ts` 的新檔案。

#### 步驟 2：新增程式碼

此範例展示了 AIGNE Framework 的三個核心元件：**模型 (Model)**、**Agent** 和 **AIGNE**。

*   **模型 (Model)**：一個 AI 模型（例如 `OpenAIChatModel`）的實例，它將為您的 Agent 提供動力。
*   **Agent**：定義您的 AI 的個性和指令（例如 `AIAgent`）。
*   **AIGNE**：運行 Agent 並處理通訊的主要執行器。

將以下程式碼複製並貼到您的 `index.ts` 檔案中：

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

async function main() {
  // 1. 建立一個 AI 模型實例
  // 這會連接到 AI 供應商（例如 OpenAI）。
  // 確保您已將 API 金鑰設定為環境變數。
  const model = new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
  });

  // 2. 建立一個 AI Agent
  // 這定義了 Agent 的身份和目的。
  const agent = AIAgent.from({
    name: "Assistant",
    instructions: "You are a helpful assistant.",
  });

  // 3. 初始化 AIGNE
  // 這是將所有部分組合在一起的主要執行引擎。
  const aigne = new AIGNE({ model });

  // 4. 與 Agent 啟動一個互動式會話
  const userAgent = aigne.invoke(agent);

  // 5. 向 Agent 發送訊息並取得回應
  const response = await userAgent.invoke(
    "Hello, can you help me write a short article?",
  );

  console.log(response);
}

main();
```

#### 步驟 3：設定您的 API 金鑰

在執行腳本之前，您需要提供您的 OpenAI API 金鑰。您可以透過在終端機中設定環境變數來完成此操作。

```bash
export OPENAI_API_KEY="your-api-key-here"
```

#### 步驟 4：執行應用程式

使用像 `ts-node` 這樣的 TypeScript 執行器來執行檔案。

```bash
npx ts-node index.ts
```

您應該會在主控台中看到您的 assistant Agent 輸出的有用回應！

## 運作原理：快速概覽

AIGNE Framework 的設計是模組化且可擴展的。`AIGNE` 負責協調使用者、Agents 和 AI 模型之間的互動。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne.png" alt="AIGNE Architecture Diagram" />
</picture>

## 後續步驟

您已成功建立並執行了您的第一個 AIGNE 應用程式。現在您可以開始探索更多進階功能。

*   **深入了解核心概念**：深入了解 [AIGNE、Agents 和模型](./developer-guide-core-concepts.md)。
*   **探索 Agent 類型**：在 [Agent 類型](./developer-guide-agents.md) 部分中，了解您可以建立的不同類型的專門 Agent。
*   **簡化工作流程**：透過檢視 [順序和平行](./developer-guide-agents-team-agent.md) 執行等模式，了解如何協調複雜的多 Agent 任務。
*   **瀏覽完整文件**：如需深入的指南和 API 參考，請造訪完整的 [AIGNE Framework 文件](https://www.arcblock.io/docs/aigne-framework)。