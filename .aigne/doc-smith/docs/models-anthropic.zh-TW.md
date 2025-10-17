# Anthropic

本指南提供透過 `@aigne/anthropic` 套件在 AIGNE 框架內設定和使用 Anthropic 的 Claude 模型的說明。內容涵蓋 API 金鑰設定、模型實例化，以及呼叫模型以獲得標準和串流回應。

關於模型在 AIGNE 框架中如何運作的一般性概述，請參閱 [模型核心概念](./developer-guide-core-concepts-models.md) 文件。

## 簡介

`@aigne/anthropic` 套件提供了 AIGNE 框架與 Anthropic 強大的 Claude 語言模型之間直接且無縫的整合。這讓開發者可以透過標準化的 `ChatModel` 介面，利用像 Claude 3.5 Sonnet 和 Claude 3 Opus 這類模型的先進功能，確保您的 Agent 應用程式在各方面保持一致性。

此整合的主要功能包括：

*   **直接 API 整合**：利用官方 Anthropic SDK 進行可靠的通訊。
*   **聊天完成**：完全支援 Anthropic 的聊天完成 API。
*   **工具呼叫**：原生支援 Claude 的工具呼叫功能。
*   **串流回應**：透過處理串流輸出，實現即時、反應迅速的應用程式。
*   **型別安全**：附有全面的 TypeScript 型別定義，以利穩健的開發。

## 安裝

首先，請使用您偏好的套件管理器安裝 `@aigne/anthropic` 套件以及核心的 AIGNE 套件。

<tabs>
<tab-item title="npm">

```bash
npm install @aigne/anthropic @aigne/core
```

</tab-item>
<tab-item title="yarn">

```bash
yarn add @aigne/anthropic @aigne/core
```

</tab-item>
<tab-item title="pnpm">

```bash
pnpm add @aigne/anthropic @aigne/core
```

</tab-item>
</tabs>

## 設定

`AnthropicChatModel` 類別是與 Claude 模型互動的主要進入點。要將其實例化，您需要提供您的 Anthropic API 金鑰，並可選擇性地指定模型和其他設定。

### API 金鑰

您的 Anthropic API 金鑰可以透過以下三種方式之一進行設定，順序依優先級排列：

1.  **直接在建構函式中**：透過 `apiKey` 屬性傳入金鑰。
2.  **`ANTHROPIC_API_KEY` 環境變數**：模型會自動偵測並使用此變數。
3.  **`CLAUDE_API_KEY` 環境變數**：同樣支援的替代環境變數。

```typescript 實例化模型 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // 選項 1：直接提供 API 金鑰
  apiKey: "your-anthropic-api-key", 
  
  // 如果您的環境中設定了 ANTHROPIC_API_KEY 或 CLAUDE_API_KEY
  // 且未提供 apiKey，模型將會自動使用它們。
});
```

### 模型選擇

您可以使用 `model` 屬性指定要使用的 Claude 模型。若未指定，預設為 `claude-3-7-sonnet-latest`。其他常見的模型參數如 `temperature` 可在 `modelOptions` 物件中設定。

常用模型列表包括：
*   `claude-3-5-sonnet-20240620`
*   `claude-3-opus-20240229`
*   `claude-3-sonnet-20240229`
*   `claude-3-haiku-20240307`

```typescript 模型設定 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  
  // 指定模型版本
  model: "claude-3-haiku-20240307",

  // 設定其他模型行為
  modelOptions: {
    temperature: 0.7, // 控制隨機性 (0.0 至 1.0)
  },
});
```

## 基本用法

要產生回應，請使用 `invoke` 方法。將訊息列表傳遞給模型以開始對話。該方法會回傳一個 promise，其解析結果為模型的輸出，包含文字回應和 token 使用統計資料。

```typescript 基本聊天完成 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  model: "claude-3-haiku-20240307",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

`result` 物件包含產生的文字以及來自 API 的其他元資料。

**回應範例**

```json
{
  "text": "I am Claude, a large language model trained by Anthropic.",
  "model": "claude-3-haiku-20240307",
  "usage": {
    "inputTokens": 8,
    "outputTokens": 12
  }
}
```

## 串流回應

對於需要即時互動的應用程式，您可以在 `invoke` 方法中將 `streaming` 選項設為 `true` 來啟用串流。這會回傳一個非同步迭代器，在回應區塊可用時立即產生它們。

`isAgentResponseDelta` 公用程式可用於檢查一個區塊是否包含新資料。

```typescript 串流範例 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  model: "claude-3-haiku-20240307",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story about a robot." }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      process.stdout.write(text); // 當文字送達時，將其印在主控台
      fullText += text;
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n\n--- Final Response ---");
console.log(fullText);
console.log(json);
```

此程式碼處理串流，立即將文字區塊印在主控台上，並累積完整的​​回應和元資料。

## 總結

您現在已具備在您的 AIGNE 應用程式中安裝、設定和使用 Anthropic 的 Claude 模型所需的資訊。您可以執行基本呼叫來處理簡單任務，或使用串流功能來打造更具互動性的體驗。

要了解更多關於編排多個模型和 Agent 的資訊，請參閱 [Team Agent](./developer-guide-agents-team-agent.md) 文件。有關其他可用模型的詳細資訊，請造訪主要的 [模型](./models.md) 區塊。