# AIGNE 框架入門指南

歡迎使用 AIGNE 框架！本指南旨在協助您在 30 分鐘內啟動並執行您的第一個 AI 應用程式。我們將逐步引導您設定環境、安裝必要的套件，並建立一個簡單的 AI Agent。

本指南專為希望將 AIGNE 整合到其專案中的開發人員所設計。我們將著重於可直接複製貼上的程式碼優先範例，幫助您盡快上手。

## 先決條件

在開始之前，請確保您的系統上已安裝以下軟體：

*   **Node.js**：AIGNE 框架需要 Node.js 20.0 或更高版本。

您可以在終端機中執行以下指令來驗證您的 Node.js 版本：

```bash
node -v
```

## 1. 安裝

首先，建立一個新的專案目錄並初始化一個 Node.js 專案：

```bash
mkdir aigne-quickstart
cd aigne-quickstart
npm init -y
```

現在，您可以使用您偏好的套件管理器（npm、yarn 或 pnpm）來安裝 AIGNE 核心套件和 OpenAI 模型提供者。

<tabs>
<tab-item label="npm">

```bash
npm install @aigne/core @aigne/openai dotenv
```

</tab-item>
<tab-item label="yarn">

```bash
yarn add @aigne/core @aigne/openai dotenv
```

</tab-item>
<tab-item label="pnpm">

```bash
pnpm add @aigne/core @aigne/openai dotenv
```

</tab-item>
</tabs>

## 2. 設定您的第一個 AI Agent

框架安裝完成後，讓我們來建立您的第一個 AI 應用程式。此範例將使用 OpenAI API 來驅動我們的 Agent，因此您需要一個 OpenAI API 金鑰。

### a. 設定環境變數

使用環境變數來管理 API 金鑰是最佳實踐。在您的專案根目錄中建立一個名為 `.env` 的檔案，並將您的 OpenAI API 金鑰加入其中：

```bash
# .env
OPENAI_API_KEY="your_openai_api_key_here"
```

我們已經安裝了 `dotenv` 套件，它會將此變數載入到我們應用程式的環境中。

### b. 建立應用程式檔案

建立一個名為 `index.js` 的檔案並加入以下程式碼。此腳本將初始化框架、定義一個簡單的 Agent，並向其傳送一個提示。

```javascript
// index.js
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import "dotenv/config";

// 1. 建立一個 AI 模型實例
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. 建立一個帶有指令的 AI Agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant who is an expert in creative writing.",
});

// 3. 初始化 AIGNE 執行引擎
const aigne = new AIGNE({ model });

// 4. 定義一個非同步函式來執行 Agent
async function main() {
  // 使用 AIGNE 引擎來叫用 Agent
  const userAgent = await aigne.invoke(agent);

  // 向 Agent 傳送訊息並取得回應
  const response = await userAgent.invoke(
    "Hello, can you help me write a short poem about the sunrise?",
  );
  
  console.log(response);
}

// 5. 執行應用程式
main();
```

### c. 程式碼解析

讓我們一步步解析 `index.js` 檔案：

1.  **模型初始化**：我們建立一個 `OpenAIChatModel` 的實例，並從環境變數中傳入我們的 API 金鑰。此物件負責與 OpenAI API 進行通訊。
2.  **Agent 建立**：我們定義一個 `AIAgent`。該 Agent 具有 `name` 和 `instructions`，用來告知 AI 模型如何行動。在此範例中，它是一個專精於創意寫作的實用助理。
3.  **引擎初始化**：`AIGNE` 類別是主要的執行引擎。它將 `model` 作為參數，並管理不同元件之間的通訊。
4.  **Agent 叫用**：我們使用 `aigne.invoke(agent)` 來準備 Agent 進行互動。然後，`userAgent.invoke(...)` 會將我們的提示傳送給 Agent 並等待回應。
5.  **執行**：呼叫 `main` 函式來執行整個流程。

### d. 執行應用程式

從您的終端機執行該檔案。請確保您的 `package.json` 包含 `"type": "module"` 以使用 ES 模組語法。

```bash
node index.js
```

您應該會在主控台中看到由 AI Agent 產生的一首關於日出的創意詩作。

## 核心概念互動

這個「入門」範例展示了 AIGNE 框架的基本工作流程。使用者的提示會透過 AIGNE 處理，AIGNE 會利用已定義的 Agent 和底層的 AI 模型來產生最終的回應。

<d2>
direction: down

User-Prompt: {
  label: "使用者提示\n'寫一首詩...'"
  shape: rectangle
}

AIGNE-Engine: {
  label: "AIGNE"
  shape: rectangle
}

AIAgent: {
  label: "AIAgent\n(指令)"
  shape: rectangle
}

AI-Model: {
  label: "AI 模型\n(例如 OpenAIChatModel)"
  shape: rectangle
}

OpenAI-API: {
  label: "外部 LLM API\n(例如 OpenAI)"
  shape: cylinder
}

Final-Response: {
  label: "最終回應\n(產生的詩作)"
  shape: rectangle
}

User-Prompt -> AIGNE-Engine: "1. 輸入"
AIAgent -> AIGNE-Engine: "2. 結合"
AIGNE-Engine -> AI-Model: "3. 傳遞組合後的提示"
AI-Model -> OpenAI-API: "4. 進行 API 呼叫"
OpenAI-API -> AI-Model: "5. 接收結果"
AI-Model -> AIGNE-Engine: "6. 回傳結果"
AIGNE-Engine -> Final-Response: "7. 輸出"

</d2>