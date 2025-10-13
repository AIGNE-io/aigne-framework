# @aigne/xai

`@aigne/xai` 套件提供了 AIGNE 框架與 XAI 語言模型（例如 Grok）之間的無縫整合。它提供了一個標準化介面，讓您可以在 AIGNE 應用程式中利用 XAI 先進的 AI 功能，確保一致的開發體驗。

此 SDK 建構於 X.AI 提供的與 OpenAI 相容的 API 格式之上，可以輕鬆地與 `grok-2-latest` 等模型進行互動。

## 架構概觀

`@aigne/xai` 套件作為核心 AIGNE 框架與 XAI API 之間的連接器，讓您能以一致的介面將 XAI 模型整合到您的應用程式中。

```d2
direction: down

AIGNE-Application: {
  label: "AIGNE 應用程式"
  shape: rectangle

  aigne-xai: {
    label: "@aigne/xai SDK"
    shape: rectangle
  }
}

XAI-API: {
  label: "XAI API"
  shape: rectangle

  XAI-Models: {
    label: "XAI 模型\n（例如 Grok）"
    shape: cylinder
  }
}

AIGNE-Application.aigne-xai -> XAI-API: "透過\n與 OpenAI 相容的 API 進行通訊"
XAI-API -> XAI-API.XAI-Models: "提供存取"
```

## 功能

*   **XAI API 整合**：直接連接 XAI 的 API 服務。
*   **聊天補完**：支援 XAI 的聊天補完 API 與所有可用模型。
*   **函式呼叫**：內建對函式呼叫功能的支援。
*   **串流式回應**：能夠處理串流式回應，以實現更具響應性的應用程式。
*   **型別安全**：為所有 API 和模型提供全面的 TypeScript 型別定義。
*   **一致的介面**：完全相容於 AIGNE 框架的模型介面。
*   **錯誤處理**：包含穩健的錯誤處理和重試機制。
*   **完整的設定選項**：提供廣泛的設定選項以微調模型行為。

## 安裝

您可以使用 npm、yarn 或 pnpm 安裝此套件。

### npm

```bash
npm install @aigne/xai @aigne/core
```

### yarn

```bash
yarn add @aigne/xai @aigne/core
```

### pnpm

```bash
pnpm add @aigne/xai @aigne/core
```

## 設定

首先，您需要設定 `XAIChatModel`。此模型可以使用各種選項進行初始化，以自訂其行為。

```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // 直接提供 API 金鑰，或使用 XAI_API_KEY 環境變數
  apiKey: "your-xai-api-key", // 如果已設定環境變數，此項為可選

  // 指定要使用的模型。預設為 'grok-2-latest'
  model: "grok-2-latest",

  // 傳遞給模型的額外選項
  modelOptions: {
    temperature: 0.7,
    max_tokens: 1024,
  },
});
```

`apiKey` 可以直接傳遞給建構函式，或設定為名為 `XAI_API_KEY` 的環境變數。SDK 將會自動讀取它。

## 基本用法

以下範例示範如何使用 `invoke` 方法向 XAI 模型傳送簡單的請求並接收回應。

```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // 直接提供 API 金鑰，或使用環境變數 XAI_API_KEY
  apiKey: "your-api-key", // 如果已在環境變數中設定，此項為可選
  // 指定模型（預設為 'grok-2-latest'）
  model: "grok-2-latest",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
/* 輸出：
  {
    text: "我是 Grok，一個來自 X.AI 的 AI 助理。我會用一點幽默和智慧來協助你！",
    model: "grok-2-latest",
    usage: {
      inputTokens: 6,
      outputTokens: 17
    }
  }
  */
```

## 串流式回應

對於需要即時互動的應用程式，您可以從模型中串流回應。這對於建立對話式介面很有用，使用者可以看到回應在生成過程中的樣子。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  apiKey: "your-api-key",
  model: "grok-2-latest",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me about yourself" }],
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

console.log(fullText); // 輸出：「我是 Grok，一個來自 X.AI 的 AI 助理。我會用一點幽默和智慧來協助你！」
console.log(json); // { model: "grok-2-latest", usage: { inputTokens: 6, outputTokens: 17 } }
```

## 授權

此套件以 Elastic-2.0 授權條款釋出。