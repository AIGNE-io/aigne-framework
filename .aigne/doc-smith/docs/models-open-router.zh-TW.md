# OpenRouter

OpenRouter 作為一個統一的閘道，可以存取來自各種供應商（包括 OpenAI、Anthropic 和 Google）的多樣化 AI 模型。`@aigne/open-router` 套件提供了一個標準化介面，可將這些模型整合到 AIGNE 框架中。這使得開發者能夠以最少的程式碼變更在不同模型之間切換，並實現穩健的備援機制。

本指南詳細介紹了安裝、設定和使用 `@aigne/open-router` 套件以利用多個 AI 模型的過程。

```d2
direction: down

Application: {
  label: "您的應用程式"
  shape: rectangle
}

aigne-open-router: {
  label: "@aigne/open-router"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

OpenRouter-Service: {
  label: "OpenRouter 服務"
  shape: rectangle
}

Providers: {
  label: "模型供應商"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  OpenAI: {
    shape: rectangle
    "GPT-4": {}
    "GPT-3.5": {}
  }

  Google: {
    shape: rectangle
    "Gemini Pro": {}
  }

  Anthropic: {
    shape: rectangle
    "Claude 3": {}
  }
}

Application -> aigne-open-router: "1. 使用 API 金鑰設定"
aigne-open-router -> OpenRouter-Service: "2. 使用模型 ID 發送 API 請求"
OpenRouter-Service -> Providers: "3. 路由至供應商"
Providers -> OpenRouter-Service: "4. 供應商回應"
OpenRouter-Service -> aigne-open-router: "5. 統一回應"
aigne-open-router -> Application: "6. 回傳結果"
```

## 安裝

首先，請安裝 `@aigne/open-router` 和 `@aigne/core` 套件。以下指令展示了如何使用 npm、yarn 和 pnpm 進行安裝。

```bash npm
npm install @aigne/open-router @aigne/core
```

```bash yarn
yarn add @aigne/open-router @aigne/core
```

```bash pnpm
pnpm add @aigne/open-router @aigne/core
```

## 設定與使用

`OpenRouterChatModel` 類別是與 OpenRouter API 互動的主要介面。若要使用它，您必須提供您的 OpenRouter API 金鑰。這可以直接在建構函式中透過 `apiKey` 選項提供，或透過設定 `OPEN_ROUTER_API_KEY` 環境變數來完成。

### 基本範例

以下是使用 `OpenRouterChatModel` 發送聊天請求的標準實作。此範例使用了 Anthropic 的 `claude-3-opus` 模型。

```typescript 基本用法 icon=logos:typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // 直接提供 API 金鑰，或使用環境變數 OPEN_ROUTER_API_KEY
  apiKey: "your-api-key", // 如果已在環境變數中設定，則為可選項目
  // 指定模型（預設為 'openai/gpt-4o'）
  model: "anthropic/claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

預期輸出將包含文字回應、模型識別碼和 token 使用指標。

```json 輸出 icon=mdi:code-json
{
  "text": "I am currently using the anthropic/claude-3-opus model, accessed through OpenRouter.",
  "model": "anthropic/claude-3-opus",
  "usage": {
    "inputTokens": 15,
    "outputTokens": 23
  }
}
```

### 建構函式選項

`OpenRouterChatModel` 擴充自 `@aigne/openai` 套件的 `OpenAIChatModel`，並接受相同的建構函式選項。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenRouter API 金鑰。若未提供，客戶端將檢查 `OPEN_ROUTER_API_KEY` 環境變數。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="openai/gpt-4o" data-required="false">
    <x-field-desc markdown>您希望使用的模型識別碼（例如：`anthropic/claude-3-opus`）。</x-field-desc>
  </x-field>
  <x-field data-name="fallbackModels" data-type="string[]" data-required="false">
    <x-field-desc markdown>一個模型識別碼陣列，用於在主要模型失敗時作為備援。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://openrouter.ai/api/v1" data-required="false">
    <x-field-desc markdown>OpenRouter API 的基礎 URL。可為測試或代理伺服器而覆寫。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>一個包含要傳遞給模型供應商參數的物件，例如 `temperature`、`max_tokens` 或 `top_p`。</x-field-desc>
  </x-field>
</x-field-group>

## 使用多個模型與備援機制

`@aigne/open-router` 套件的一個關鍵功能是能夠指定備援模型。如果主要模型的請求失敗，系統將自動使用 `fallbackModels` 列表中的下一個模型重試請求。這確保了更高的應用程式可靠性。

```typescript 模型備援 icon=logos:typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const modelWithFallbacks = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "openai/gpt-4o",
  fallbackModels: ["anthropic/claude-3-opus", "google/gemini-1.5-pro"], // 備援順序
  modelOptions: {
    temperature: 0.7,
  },
});

// 會先嘗試 gpt-4o，若失敗則嘗試 claude-3-opus，再失敗則嘗試 gemini-1.5-pro
const fallbackResult = await modelWithFallbacks.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(fallbackResult);
```

## 串流回應

對於需要即時互動的應用程式，您可以啟用串流功能，以便在回應區塊可用時立即處理。在 `invoke` 方法中設定 `streaming: true` 選項。

必須對回應串流進行迭代，以組合出完整的訊息。

```typescript 串流範例 icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Which model are you using?" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}

console.log(fullText);
console.log(json);
```

最終的 `fullText` 和 `json` 物件將包含匯總後的回應資料。

```text 輸出 icon=mdi:console
I am currently using the anthropic/claude-3-opus model, accessed through OpenRouter.
{ model: 'anthropic/claude-3-opus', usage: { inputTokens: 15, outputTokens: 23 } }
```

## 總結

`@aigne/open-router` 套件透過一個統一且具彈性的介面，簡化了對各種語言模型的存取。透過利用模型備援和串流等功能，您可以建構更穩健、回應更快的 AI 應用程式。

關於 AIGNE 框架中模型的基本概念的更多資訊，請參考[模型概覽](./models-overview.md)。