# @aigne/anthropic

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/anthropic)](https://www.npmjs.com/package/@aigne/anthropic)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/anthropic)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Anthropic SDK，用於在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)內與 Claude AI 模型整合。

## 簡介

`@aigne/anthropic` 提供了 AIGNE 框架與 Anthropic 的 Claude 語言模型之間的無縫整合。此套件使開發人員能夠在其 AIGNE 應用程式中輕鬆利用 Anthropic 強大的模型，提供一致的介面，同時利用 Claude 的進階 AI 功能。

此圖示說明了 `@aigne/anthropic` 套件如何將您的 AIGNE 應用程式連接到 Anthropic API 及其底層的 Claude 模型。

```d2
direction: down

AIGNE-Application: {
  label: "AIGNE 應用程式"
  shape: rectangle

  AIGNE-Framework: {
    label: "AIGNE 框架"
    icon: "https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg"
    shape: rectangle

    aigne-anthropic: {
      label: "@aigne/anthropic"
      shape: rectangle
    }
  }
}

Anthropic-Service: {
  label: "Anthropic 服務"
  shape: rectangle

  Anthropic-API: {
    label: "Anthropic API"
  }

  Claude-Models: {
    label: "Claude 模型"
    claude-3-haiku: "claude-3-haiku"
    claude-3-sonnet: "claude-3-sonnet"
  }
}

AIGNE-Application.AIGNE-Framework.aigne-anthropic -> Anthropic-Service.Anthropic-API: "透過 SDK 整合"
Anthropic-Service.Anthropic-API -> Anthropic-Service.Claude-Models: "存取"
```

## 功能

*   **Anthropic API 整合**：使用官方 SDK 直接連接到 Anthropic 的 API 服務。
*   **聊天補全**：完全支援 Claude 的聊天補全 API，涵蓋所有可用模型。
*   **工具呼叫**：內建支援 Claude 強大的工具呼叫功能。
*   **串流回應**：啟用串流功能，以實現更具響應性和即時性的應用程式。
*   **類型安全**：為所有 API、模型和選項提供全面的 TypeScript 類型定義。
*   **一致的介面**：遵循 AIGNE 框架的統一模型介面，以實現跨供應商的相容性。
*   **穩健的錯誤處理**：包含內建的錯誤處理和重試機制。
*   **完整的組態設定**：提供廣泛的選項，用於微調模型行為和客戶端設定。

## 安裝

若要開始使用，請使用您偏好的套件管理器安裝 `@aigne/anthropic` 和 `@aigne/core` 套件。

### npm

```bash
npm install @aigne/anthropic @aigne/core
```

### yarn

```bash
yarn add @aigne/anthropic @aigne/core
```

### pnpm

```bash
pnpm add @aigne/anthropic @aigne/core
```

## 組態設定

`AnthropicChatModel` 可在實例化期間進行組態設定。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // 如果您的環境中設定了 ANTHROPIC_API_KEY 或 CLAUDE_API_KEY，則 API 金鑰是選填的
  apiKey: "your-anthropic-api-key",

  // 指定模型 ID。預設為 'claude-3-7-sonnet-latest'
  model: "claude-3-haiku-20240307",

  // 設定預設模型參數
  modelOptions: {
    temperature: 0.7,
    topP: 1.0,
  },
  
  // 將自訂選項傳遞給底層的 Anthropic SDK 客戶端
  clientOptions: {
    timeout: 600000, // 10 分鐘
  }
});
```

### 組態選項

<x-field-group>
    <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="您的 Anthropic API 金鑰。如果未提供，SDK 將會檢查 `ANTHROPIC_API_KEY` 或 `CLAUDE_API_KEY` 環境變數。"></x-field>
    <x-field data-name="model" data-type="string" data-required="false" data-desc="用於請求的預設模型 ID。預設為 `claude-3-7-sonnet-latest`。"></x-field>
    <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="模型的預設參數。">
        <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制隨機性。值越低，模型越具確定性。"></x-field>
        <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心取樣閾值。"></x-field>
        <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="是否允許模型並行呼叫多個工具。"></x-field>
    </x-field>
    <x-field data-name="clientOptions" data-type="object" data-required="false" data-desc="直接傳遞給 Anthropic SDK 客戶端的進階選項，例如 `timeout` 或 `baseURL`。"></x--field>
</x-field-group>

## 基本用法

以下是如何呼叫模型以取得聊天補全的基本範例。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-api-key", // 或在環境中設定 ANTHROPIC_API_KEY
  model: "claude-3-haiku-20240307",
});

async function getGreeting() {
  const result = await model.invoke({
    messages: [{ role: "user", content: "Write a short, friendly greeting." }],
  });

  console.log(result.text);
}

getGreeting();
/* Output:
Hello there! It's a pleasure to meet you. How can I help you today?
*/
```

## 串流回應

對於需要即時輸出的應用程式，您可以串流模型的回應。當設定 `streaming: true` 時，`invoke` 方法會回傳一個 `AsyncGenerator`。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-haiku-20240307",
});

async function streamStory() {
  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Tell me a short story about a robot." }],
    },
    { streaming: true },
  );

  let fullText = "";
  process.stdout.write("Story: ");
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) {
        fullText += text;
        process.stdout.write(text);
      }
    }
  }
  console.log("\n\nFull story received.");
}

streamStory();
```

## 工具呼叫

`AnthropicChatModel` 支援工具呼叫，允許模型請求執行您定義的函式。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { z } from "zod";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-opus-20240229", // 建議使用 Opus 處理複雜的工具使用
});

async function callWeatherTool() {
  const result = await model.invoke({
    messages: [{ role: "user", content: "What's the weather like in San Francisco?" }],
    tools: [
      {
        type: "function",
        function: {
          name: "getCurrentWeather",
          description: "Get the current weather for a specific location",
          parameters: z.object({
            location: z.string().describe("The city and state, e.g., San Francisco, CA"),
          }),
        },
      },
    ],
    toolChoice: "auto", // 可以是 "auto"、"required"、"none" 或特定工具
  });

  if (result.toolCalls && result.toolCalls.length > 0) {
    const toolCall = result.toolCalls[0];
    console.log("Tool call requested:", toolCall.function.name);
    console.log("Arguments:", toolCall.function.arguments);
    // 在實際應用程式中，您會在此處執行該工具
  } else {
    console.log("No tool call was made.");
    console.log("Response:", result.text);
  }
}

callWeatherTool();
/* Output:
Tool call requested: getCurrentWeather
Arguments: { location: 'San Francisco, CA' }
*/
```

## 授權

本專案採用 [Elastic-2.0 授權](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 進行授權。