# @aigne/aigne-hub

`@aigne/aigne-hub` SDK 提供了一個統一的介面，用於存取各種用於聊天和圖像生成的 AI 模型。它作為 [AIGNE Hub](https://github.com/AIGNE-io/aigne-framework) 的客戶端，後者是一個強大的代理層，連接到多個大型語言模型 (LLM) 供應商。

本指南將引導您完成 SDK 的安裝、基本設定以及在聊天完成和圖像生成方面 的使用方法。

## 簡介

`@aigne/aigne-hub` 透過 AIGNE Hub 服務路由請求，簡化了與各種 AI 供應商的互動。這個閘道彙總了 OpenAI、Anthropic、AWS Bedrock、Google 等供應商，讓您只需更改模型識別碼即可在它們之間無縫切換。這種方法抽象化了處理不同 API 和驗證方法的複雜性，讓您能專注於建構您的應用程式。

### 運作方式

SDK 將請求從您的應用程式發送到一個集中的 AIGNE Hub 實例。然後，Hub 會根據指定的模型名稱將這些請求轉發給相應的下游 AI 供應商。這種架構為所有 AI 互動提供了一個單一的存取和控制點。

```d2
direction: down

Your-Application: {
  label: "您的應用程式"
  shape: rectangle

  aigne-aigne-hub: {
    label: "@aigne/aigne-hub SDK"
    shape: rectangle
  }
}

AIGNE-Hub: {
  label: "AIGNE Hub 服務"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

LLM-Providers: {
  label: "LLM 供應商"
  shape: rectangle
  grid-columns: 4

  OpenAI: {}
  Anthropic: {}
  Google: {}
  AWS-Bedrock: {
    label: "AWS Bedrock"
  }
  DeepSeek: {}
  Ollama: {}
  xAI: {}
  OpenRouter: {}
}

Your-Application.aigne-aigne-hub -> AIGNE-Hub: "API 請求"
AIGNE-Hub -> LLM-Providers: "彙總與路由"
```

## 功能

-   🔌 **統一的 LLM 存取**：透過單一、一致的端點路由所有請求。
-   🧠 **多供應商支援**：使用簡單的 `provider/model` 命名慣例，存取來自 OpenAI、Anthropic、Google 等的模型。
-   🔐 **安全驗證**：使用單一的 `accessKey` 安全地管理 API 存取。
-   💬 **聊天完成**：使用 `{ role, content }` 訊息格式，為聊天模型提供標準化介面。
-   🎨 **圖像生成**：使用來自 OpenAI (DALL-E)、Google (Imagen) 和 Ideogram 的模型生成圖像。
-   🌊 **串流支援**：透過啟用串流，為聊天模型獲取即時、權杖級別的回應。
-   🧱 **框架相容**：與更廣泛的 AIGNE 框架無縫整合。

## 安裝

若要開始，請使用您偏好的套件管理器安裝 `@aigne/aigne-hub` 和 `@aigne/core` 套件。

**npm**
```bash
npm install @aigne/aigne-hub @aigne/core
```

**yarn**
```bash
yarn add @aigne/aigne-hub @aigne/core
```

**pnpm**
```bash
pnpm add @aigne/aigne-hub @aigne/core
```

## 聊天模型

`AIGNEHubChatModel` 類別是您與基於文本的 AI 模型互動的主要工具。

### 基本用法

若要使用聊天模型，請使用您的 AIGNE Hub 端點、存取金鑰和所需的模型識別碼來實例化 `AIGNEHubChatModel`。

```typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(result);
/* 範例輸出：
  {
    text: "您好！今天我能為您提供什麼幫助？",
    model: "openai/gpt-4o-mini",
    usage: {
      inputTokens: 8,
      outputTokens: 9
    }
  }
*/
```

### 串流用法

對於互動式的即時應用程式，您可以串流來自模型的回應。在 `invoke` 呼叫中將 `streaming` 選項設為 `true`，並遍歷產生的串流以處理陸續到達的區塊。

```typescript
import { AIGNEHubChatModel, isAgentResponseDelta } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
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

console.log(fullText); // "我是一個 AI 助理，隨時準備協助您處理任何問題或任務。"
console.log(json); // { model: "openai/gpt-4o-mini", usage: { ... } }
```

### 設定

`AIGNEHubChatModel` 建構函式接受以下選項：

| Parameter | Type | Description |
|---|---|---|
| `url` | `string` | 您的 AIGNE Hub 實例的端點 URL。 |
| `accessKey` | `string` | 用於向 AIGNE Hub 進行驗證的秘密 API 金鑰。 |
| `model` | `string` | 模型識別碼，以供應商為前綴（例如 `openai/gpt-4o`）。 |
| `modelOptions` | `object` | 可選。傳遞給底層模型的額外參數。 |

## 圖像生成模型

`AIGNEHubImageModel` 類別讓您能使用各種 AI 模型生成圖像。

### 基本用法

使用您的 Hub 憑證和所需的圖像模型來實例化 `AIGNEHubImageModel`。然後，使用提示和其他模型特定參數呼叫 `invoke`。

```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/dall-e-3",
});

const result = await model.invoke({
  prompt: "A futuristic cityscape with flying cars and neon lights",
  n: 1,
  size: "1024x1024",
});

console.log(result);
/* 範例輸出：
  {
    images: [{ url: "https://..." }],
    usage: { inputTokens: 0, outputTokens: 0 },
    model: "openai/dall-e-3"
  }
*/
```

### 支援的供應商和參數

AIGNE Hub 支援來自多個供應商的圖像生成，每個供應商都有其自己的功能和參數集。

#### OpenAI DALL-E

-   **模型**：`dall-e-2`, `dall-e-3`
-   **關鍵參數**：`prompt`, `size`, `n`, `quality`, `style`。
-   **參考資料**：[OpenAI Images API Documentation](https://platform.openai.com/docs/guides/images)

```typescript
// DALL-E 3 範例
const result = await model.invoke({
  model: "openai/dall-e-3",
  prompt: "A photorealistic image of a cat wearing sunglasses",
  size: "1024x1024",
  quality: "hd",
  style: "vivid",
});
```

#### Google Gemini & Imagen

-   **模型**：`imagen-4.0`, `gemini-pro-vision` 等。
-   **關鍵參數**：`prompt`, `imageSize`, `aspectRatio`, `guidanceScale`, `negativePrompt`。
-   **注意**：Gemini 圖像模型目前以 `base64` 格式回傳圖像。
-   **參考資料**：[Google GenAI Models Documentation](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html)

```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
  n: 1,
  imageSize: "1024x1024",
  aspectRatio: "1:1",
});
```

#### Ideogram

-   **模型**：`ideogram-v3`
-   **關鍵參數**：`prompt`, `resolution`, `aspectRatio`, `renderingSpeed`, `styleType`。
-   **參考資料**：[Ideogram API Documentation](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes",
  resolution: "1024x1024",
  styleType: "cinematic",
});
```

### 設定

`AIGNEHubImageModel` 建構函式接受以下選項：

| Parameter | Type | Description |
|---|---|---|
| `url` | `string` | 您的 AIGNE Hub 實例的端點 URL。 |
| `accessKey` | `string` | 用於向 AIGNE Hub 進行驗證的秘密 API 金鑰。 |
| `model` | `string` | 模型識別碼，以供應商為前綴（例如 `openai/dall-e-3`）。 |
| `modelOptions` | `object` | 可選。傳遞給底層模型的額外參數。 |