本文件為開發者提供了整合 `@aigne/open-router` 套件的綜合指南。您將學習如何安裝、設定和使用此套件，以透過統一的介面利用各種 AI 模型。

# @aigne/open-router

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)"/>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)"/>
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

`@aigne/open-router` 提供了 AIGNE 框架與 OpenRouter 統一 API 之間的無縫整合。這讓開發者可以透過單一、一致的介面，存取來自 OpenAI、Anthropic 和 Google 等供應商的大量 AI 模型，從而簡化模型選擇並實現穩健的備援設定。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter-dark.png" media="(prefers-color-scheme: dark)"/>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter.png" media="(prefers-color-scheme: light)"/>
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-openrouter.png" alt="AIGNE OpenRouter Architecture Diagram" />
</picture>

## 功能

*   **統一的 API**：透過單一、一致的介面存取數十家供應商的模型。
*   **模型備援**：當主要模型失敗時，自動切換至備用模型。
*   **串流支援**：透過串流回應，實現即時、反應靈敏的應用程式。
*   **AIGNE 框架相容性**：與 `@aigne/core` 模型介面完美整合。
*   **廣泛的設定**：透過多種選項微調模型行為。
*   **型別安全**：受益於所有 API 和模型的全面 TypeScript 型別定義。

## 安裝

若要開始使用，請使用您偏好的套件管理器安裝必要的套件：

### npm

```bash
npm install @aigne/open-router @aigne/core
```

### yarn

```bash
yarn add @aigne/open-router @aigne/core
```

### pnpm

```bash
pnpm add @aigne/open-router @aigne/core
```

## 設定與基本用法

此套件的主要匯出是 `OpenRouterChatModel`。它擴充了 `@aigne/openai` 套件的 `OpenAIChatModel`，因此接受相同的選項。

若要設定模型，您需要提供您的 OpenRouter API 金鑰。您可以直接將其傳遞給建構函式，或設定 `OPEN_ROUTER_API_KEY` 環境變數。

以下是如何實例化和使用模型的基本範例：

```typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // 直接提供 API 金鑰，或使用環境變數 OPEN_ROUTER_API_KEY
  apiKey: "your-api-key", // 若已在環境變數中設定，則為選用
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
/* 輸出:
  {
    text: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.",
    model: "anthropic/claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
*/
```

## 串流回應

對於需要即時互動的應用程式，您可以啟用串流以在回應區塊生成時接收它們。在 `invoke` 方法中設定 `streaming: true` 選項。

```typescript
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

console.log(fullText); // 輸出："I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic."
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## 使用多個模型與備援

`@aigne/open-router` 的主要功能之一是能夠設定備援模型。如果主要模型因任何原因（例如 API 錯誤、速率限制）而失敗，系統將自動嘗試指定列表中的下一個模型。

您可以使用 `fallbackModels` 選項定義備援順序。

```typescript
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
```

下圖說明了備援邏輯：

```d2
direction: down

Your-App: {
  label: "您的應用程式"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  aigne-open-router: {
    label: "@aigne/open-router"
  }
}

OpenRouter-API: {
  label: "OpenRouter API"
  shape: rectangle
}

Model-Providers: {
  label: "模型供應商"
  shape: rectangle
  grid-columns: 3

  OpenAI: {
    label: "OpenAI\n(gpt-4o)"
    shape: cylinder
  }
  Anthropic: {
    label: "Anthropic\n(claude-3-opus)"
    shape: cylinder
  }
  Google: {
    label: "Google\n(gemini-1.5-pro)"
    shape: cylinder
  }
}

Your-App -> AIGNE-Framework.aigne-open-router: "1. invoke()"

AIGNE-Framework.aigne-open-router -> OpenRouter-API: "2. 嘗試主要模型"
OpenRouter-API -> Model-Providers.OpenAI

Model-Providers.OpenAI -> AIGNE-Framework.aigne-open-router: {
  label: "3. 失敗"
  style: {
    stroke-dash: 2
  }
}
AIGNE-Framework.aigne-open-router -> OpenRouter-API: {
  label: "4. 嘗試備援 1"
  style: {
    stroke-dash: 2
  }
}
OpenRouter-API -> Model-Providers.Anthropic

Model-Providers.Anthropic -> AIGNE-Framework.aigne-open-router: {
  label: "5. 失敗"
  style: {
    stroke-dash: 2
  }
}
AIGNE-Framework.aigne-open-router -> OpenRouter-API: {
  label: "6. 嘗試備援 2"
  style: {
    stroke-dash: 2
  }
}
OpenRouter-API -> Model-Providers.Google

Model-Providers.Google -> AIGNE-Framework.aigne-open-router: "7. 成功"
AIGNE-Framework.aigne-open-router -> Your-App: "8. 回傳回應"

```