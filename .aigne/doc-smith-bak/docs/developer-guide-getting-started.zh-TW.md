# 快速入門

本指南提供設定開發環境並使用 AIGNE 框架執行您的第一個 AI agent 所需的步驟。整個過程設計在 30 分鐘內完成，為您提供一個實用、動手的入門體驗，以了解該框架的基本工作流程。

我們將涵蓋系統先決條件、必要套件的安裝，以及一個完整、可直接複製貼上的範例，該範例將示範如何定義、設定和執行一個基本的 AI agent。

## 先決條件

在繼續之前，請確保您的開發環境符合以下要求：

*   **Node.js**：需要 20.0 或更高版本。

您可以透過在終端機中執行以下指令來驗證您的 Node.js 版本：

```bash
node -v
```

## 安裝

首先，您需要安裝核心的 AIGNE 套件和一個模型提供者套件。在本指南中，我們將使用官方的 OpenAI 模型提供者。

請使用您偏好的套件管理器安裝必要的套件：

<x-cards data-columns="3">
  <x-card data-title="npm" data-icon="logos:npm-icon">
    ```bash
    npm install @aigne/core @aigne/openai
    ```
  </x-card>
  <x-card data-title="yarn" data-icon="logos:yarn">
    ```bash
    yarn add @aigne/core @aigne/openai
    ```
  </x-card>
  <x-card data-title="pnpm" data-icon="logos:pnpm">
    ```bash
    pnpm add @aigne/core @aigne/openai
    ```
  </x-card>
</x-cards>

此外，您還需要一個 OpenAI API 金鑰。請將其設定為名為 `OPENAI_API_KEY` 的環境變數。

```bash title=".env"
OPENAI_API_KEY="sk-..."
```

## 快速入門範例

此範例示範了建立並執行一個簡單的「助理」agent 的完整過程。

1.  建立一個名為 `index.ts` 的新 TypeScript 檔案。
2.  複製以下程式碼並貼到該檔案中。

```typescript index.ts icon=logos:typescript-icon
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. 實例化 AI 模型
// 這會使用指定的模型建立與 OpenAI API 的連線。
// API 金鑰會從 OPENAI_API_KEY 環境變數中讀取。
const model = new OpenAIChatModel({
  model: "gpt-4o-mini",
});

// 2. 定義 AI Agent
// Agent 是一個工作單元。此 AIAgent 透過
// 指令進行設定，這些指令定義了其個性和任務。
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful and friendly assistant.",
});

// 3. 實例化 AIGNE
// AIGNE 類別是管理和執行 agent 的中央協調器。
// 它會設定其 agent 將使用的模型。
const aigne = new AIGNE({ model });

async function main() {
  // 4. 叫用 Agent
  // invoke 方法會使用給定的輸入來執行 agent。
  // 該框架會處理與模型的互動。
  const response = await aigne.invoke(
    assistantAgent,
    "Why is the sky blue?"
  );

  // 5. 印出回應
  console.log(response);
}

main();
```

### 執行範例

從您的終端機執行此腳本。如果您正在使用 TypeScript，您可以使用像 `ts-node` 這樣的工具。

```bash
npx ts-node index.ts
```

### 預期輸出

輸出將是 agent 對問題的回應，格式為一個 JSON 物件。`message` 欄位的內容會有所不同，因為它是由 AI 模型產生的。

```json
{
  "message": "The sky appears blue because of a phenomenon called Rayleigh scattering..."
}
```

## 程式碼解析

此範例由四個主要步驟組成，代表了 AIGNE 框架的核心工作流程。

1.  **模型初始化**：建立一個 `OpenAIChatModel` 的實例。此物件作為與指定 OpenAI 模型（例如 `gpt-4o-mini`）的直接介面。它需要一個 API 金鑰進行驗證，該金鑰會自動從 `OPENAI_API_KEY` 環境變數中取得。

2.  **Agent 定義**：使用靜態的 `from` 方法定義一個 `AIAgent`。這是框架中的基本工作單元。其行為由 `instructions` 屬性定義，該屬性作為系統提示，引導 AI 模型的回應。

3.  **AIGNE 實例化**：`AIGNE` 類別被實例化。它作為所有 agent 的執行引擎和協調器。透過將 `model` 實例傳入其建構函式，我們為由此 AIGNE 實例管理的所有 agent 建立了一個預設模型。

4.  **Agent 叫用**：呼叫 `aigne.invoke()` 方法以執行 `assistantAgent`。第一個參數是要執行的 agent，第二個是輸入訊息。該框架管理請求的完整生命週期：將提示和指令傳送給模型、接收回應，並將其作為結構化輸出回傳。

這個簡單的範例說明了該框架的模組化和宣告式特性，其中模型、agent 和執行引擎被設定和組合，以建構強大的 AI 驅動應用程式。

## 總結

在本指南中，您已成功設定好您的環境、安裝了必要的 AIGNE 套件，並建立和執行了一個功能性的 AI agent。您已學會了基本的工作流程：定義模型、建立帶有特定指令的 agent，以及使用 AIGNE 透過使用者提示來叫用它。

有了這個基礎，您現在可以開始探索更進階的主題。

*   若要更詳細地了解框架的基本建構模組，請參閱 [核心概念](./developer-guide-core-concepts.md) 文件。
*   若要了解不同類型的特化 agent 及其使用案例，請參閱 [Agent 類型](./developer-guide-agents.md) 章節。