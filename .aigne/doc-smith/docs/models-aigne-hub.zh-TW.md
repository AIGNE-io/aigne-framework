# AIGNE Hub

AIGNE Hub 提供了一個統一的代理層，用於存取來自多個供應商的各種大型語言模型（LLM）和圖片生成服務。透過使用 `@aigne/aigne-hub` 套件，您可以在不更改客戶端應用程式邏輯的情況下，無縫切換不同的 AI 模型，將所有請求都導向一個單一、一致的 API 端點。

本指南涵蓋了 `AIGNEHubChatModel` 和 `AIGNEHubImageModel` 類別的安裝、設定和使用，以將您的應用程式連接到 AIGNE Hub。

## 總覽

AIGNE Hub 作為一個閘道，聚合了 OpenAI、Anthropic、Google 等主要 AI 供應商。這種架構透過抽象化每個供應商 API 的特定要求來簡化整合。您只需傳遞模型的唯一識別碼（包含供應商前綴，例如 `openai/gpt-4o-mini` 或 `anthropic/claude-3-sonnet`），即可與任何支援的模型進行互動。

### 架構圖

下圖說明了 AIGNE Hub 如何作為您的應用程式與各個 LLM 供應商之間的中介。您的應用程式向 Hub 發送統一的請求，然後 Hub 根據指定的模型將請求路由到相應的下游服務。

```d2
direction: down

Your-Application: {
  label: "您的應用程式"
  shape: rectangle
}

AIGNE-Hub: {
  label: "AIGNE Hub"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

LLM-Providers: {
  label: "LLM 供應商"
  shape: rectangle
  style.stroke-dash: 4

  OpenAI: {
    label: "OpenAI\n(GPT-4o, DALL-E 3)"
  }
  Anthropic: {
    label: "Anthropic\n(Claude)"
  }
  Google: {
    label: "Google\n(Gemini, Imagen)"
  }
}

Your-Application -> AIGNE-Hub: "統一 API 請求\n（例如：'openai/gpt-4o-mini'）"
AIGNE-Hub -> LLM-Providers.OpenAI: "路由請求"
AIGNE-Hub -> LLM-Providers.Anthropic: "路由請求"
AIGNE-Hub -> LLM-Providers.Google: "路由請求"
```

### 主要功能

-   **統一存取**：適用於所有 LLM 和圖片生成請求的單一端點。
-   **支援多個供應商**：存取來自 OpenAI、Anthropic、AWS Bedrock、Google、DeepSeek、Ollama、xAI 和 OpenRouter 的模型。
-   **安全驗證**：透過單一 API 金鑰（`accessKey`）管理存取。
-   **聊天與圖片模型**：同時支援聊天完成和圖片生成。
-   **串流**：為聊天回應提供即時、權杖級別的串流。
-   **無縫整合**：旨在與更廣泛的 AIGNE 框架完美協作。

### 支援的供應商

AIGNE Hub 透過其統一的 API 支援眾多 AI 供應商。

| 供應商      | 識別碼        |
| :---------- | :------------ |
| OpenAI      | `openai`      |
| Anthropic   | `anthropic`   |
| AWS Bedrock | `bedrock`     |
| DeepSeek    | `deepseek`    |
| Google      | `google`      |
| Ollama      | `ollama`      |
| OpenRouter  | `openRouter`  |
| xAI         | `xai`         |

## 安裝

若要開始，請在您的專案中安裝 `@aigne/aigne-hub` 和 `@aigne/core` 套件。

```bash npm install icon=logos:npm
npm install @aigne/aigne-hub @aigne/core
```

```bash yarn add icon=logos:yarn
yarn add @aigne/aigne-hub @aigne/core
```

```bash pnpm add icon=logos:pnpm
pnpm add @aigne/aigne-hub @aigne/core
```

## 設定

聊天和圖片模型都需要進行設定，才能連接到您的 AIGNE Hub 實例。主要選項包括 Hub 的 URL、存取金鑰和所需的模型識別碼。

### 聊天模型設定

`AIGNEHubChatModel` 使用以下選項進行設定。

<x-field-group>
  <x-field data-name="baseUrl" data-type="string" data-required="true">
    <x-field-desc markdown>您的 AIGNE Hub 實例的基礎 URL（例如：`https://your-aigne-hub-instance/ai-kit`）。</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="true">
    <x-field-desc markdown>用於向 AIGNE Hub 進行身份驗證的 API 存取金鑰。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="true">
    <x-field-desc markdown>模型識別碼，以供應商為前綴（例如：`openai/gpt-4o-mini`）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>可選的模型特定參數，將傳遞給供應商的 API。</x-field-desc>
  </x-field>
</x-field-group>

### 圖片模型設定

`AIGNEHubImageModel` 使用類似的設定結構。

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true">
    <x-field-desc markdown>您的 AIGNE Hub 實例的端點。</x-field-desc>
  </x-field>
  <x-field data-name="accessKey" data-type="string" data-required="true">
    <x-field-desc markdown>用於身份驗證的 API 存取金鑰。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="true">
    <x-field-desc markdown>模型識別碼，以供應商為前綴（例如：`openai/dall-e-3`）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>可選的模型特定參數，將傳遞給供應商的 API。</x-field-desc>
  </x-field>
</x-field-group>

## 使用方法

### 聊天完成

若要執行聊天完成，請使用您的設定實例化 `AIGNEHubChatModel`，並呼叫 `invoke` 方法。

```typescript Basic Chat Completion icon=logos:typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(result);
```

**回應範例**

```json
{
  "text": "Hello! How can I help you today?",
  "model": "openai/gpt-4o-mini",
  "usage": {
    "inputTokens": 8,
    "outputTokens": 9
  }
}
```

**模型範例：**

*   `openai/gpt-4o-mini`
*   `anthropic/claude-3-sonnet`
*   `google/gemini-pro`
*   `xai/grok-1`
*   `openRouter/mistralai/mistral-7b-instruct`
*   `ollama/llama3`

### 串流聊天回應

若要獲得即時回應，請在 `invoke` 呼叫中將 `streaming` 選項設為 `true`。這會回傳一個非同步迭代器，在回應區塊可用時產生它們。

```typescript Streaming Example icon=logos:typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AIGNEHubChatModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
  },
  { streaming: true },
);

let fullText = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
  }
}

console.log("\n--- Response Complete ---");
console.log(fullText);
```

### 圖片生成

AIGNE Hub 支援來自多個供應商的圖片生成。實例化 `AIGNEHubImageModel` 並提供提示和模型特定參數。

#### OpenAI DALL-E

```typescript Generate with DALL-E 3 icon=logos:typescript
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
  quality: "standard",
  style: "natural",
});

console.log(result.images[0].url);
```

-   **參考資料**：[OpenAI Images API Documentation](https://platform.openai.com/docs/guides/images)

#### Google Gemini Imagen

```typescript Generate with Imagen icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
  n: 1,
  aspectRatio: "1:1",
});

console.log(result.images[0].base64); // 注意：Gemini 模型回傳 base64 資料
```

-   **參考資料**：[Google AI Generative Models API](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html)

#### Ideogram

```typescript Generate with Ideogram icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes, cinematic style",
  aspectRatio: "1:1",
  styleType: "cinematic",
});

console.log(result.images[0].url);
```

-   **參考資料**：[Ideogram API Documentation](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

## 總結

`@aigne/aigne-hub` 套件透過為 AIGNE Hub 服務提供統一的用戶端，簡化了多供應商 LLM 的整合。透過抽象化特定於供應商的邏輯，它使開發人員能夠建構更具彈性且易於維護的 AI 驅動應用程式。

有關特定模型及其功能的更詳細資訊，請參閱各 AI 供應商提供的文件。若要探索其他模型整合，請參閱[模型總覽](./models-overview.md)。