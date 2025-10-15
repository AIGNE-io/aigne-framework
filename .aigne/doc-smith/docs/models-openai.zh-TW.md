# OpenAI

`@aigne/openai` 套件提供了與 OpenAI 模型套件的直接且強大的整合，包括用於對話補全的強大 GPT 系列和用於圖像生成的 DALL-E。本指南詳細介紹了在 AIGNE 框架內安裝、設定和使用這些模型的必要步驟。

有關其他模型提供商的資訊，請參閱主要的 [模型](./models.md) 概覽。

## 功能

與 OpenAI 的整合設計得非常全面，提供以下功能：

*   **直接 API 整合**：利用官方 OpenAI SDK 進行可靠的通訊。
*   **對話補全**：完全支援 OpenAI 的對話補全模型，例如 `gpt-4o` 和 `gpt-4o-mini`。
*   **函式呼叫**：原生支援 OpenAI 的函式呼叫和工具使用功能。
*   **結構化輸出**：能夠請求和解析來自模型的 JSON 格式回應。
*   **圖像生成**：可存取 DALL-E 2 和 DALL-E 3，從文字提示創建圖像。
*   **串流回應**：支援處理即時、分塊的回應，以實現更具互動性的應用程式。
*   **類型安全**：為所有模型選項和 API 回應提供完整的 TypeScript 類型定義。

## 安裝

首先，安裝 `@aigne/openai` 套件以及 `@aigne/core` 框架。選擇與您的套件管理器對應的指令。

```bash icon=npm install @aigne/openai @aigne/core
npm install @aigne/openai @aigne/core
```

```bash icon=yarn add @aigne/openai @aigne/core
yarn add @aigne/openai @aigne/core
```

```bash icon=pnpm add @aigne/openai @aigne/core
pnpm add @aigne/openai @aigne/core
```

## 對話模型 (`OpenAIChatModel`)

`OpenAIChatModel` 類別是與 OpenAI 語言模型（如 GPT-4o）互動的主要介面。

### 設定

要實例化模型，您必須提供您的 OpenAI API 金鑰。這可以直接在建構函式中完成，或透過設定 `OPENAI_API_KEY` 環境變數來完成。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 金鑰。如果未提供，系統將會檢查 `OPENAI_API_KEY` 環境變數。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>可選的 OpenAI API 基礎 URL。這對於代理請求或使用相容的替代端點很有用。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false">
    <x-field-desc markdown>用於對話補全的特定模型，例如 `gpt-4o`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>控制模型行為的其他選項。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制隨機性。值越低，模型就越具確定性。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心取樣參數。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="根據新 token 的現有頻率對其進行懲罰。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="根據新 token 是否已在文本中出現過對其進行懲罰。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="決定模型是否可以並行呼叫多個工具。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接傳遞給底層 OpenAI SDK 客戶端的進階選項。</x-field-desc>
  </x-field>
</x-field-group>

### 基本用法

以下範例示範如何建立一個 `OpenAIChatModel` 實例，並用一個簡單的使用者訊息來呼叫它。

```typescript Basic Chat Completion icon=logos:typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // 建議使用 OPENAI_API_KEY 環境變數。
  apiKey: "your-api-key", 
  model: "gpt-4o",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

`invoke` 方法會傳回一個 promise，該 promise 會解析為一個包含模型回應和使用指標的物件。

**回應範例**
```json
{
  "text": "I am a large language model, trained by Google.",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 10,
    "outputTokens": 9
  }
}
```

### 串流回應

對於需要即時回饋的應用程式，您可以在 `invoke` 方法中設定 `streaming: true` 選項來啟用串流。這會傳回一個非同步迭代器，在回應區塊可用時產生它們。

```typescript Streaming Chat Response icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story." }],
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

console.log("\n\n--- End of Story ---");
console.log("Full text:", fullText);
```

這種方法允許您逐步處理回應，這對於聊天介面或其他互動式使用案例非常理想。

## 圖像模型 (`OpenAIImageModel`)

`OpenAIImageModel` 類別為 OpenAI 的圖像生成功能（如 DALL-E 2 和 DALL-E 3）提供了一個介面。

### 設定

圖像模型的設定與對話模型類似，需要一個 API 金鑰並允許選擇模型。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 金鑰。如果未提供，系統將會檢查 `OPENAI_API_KEY` 環境變數。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>可選的 OpenAI API 基礎 URL。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false">
    <x-field-desc markdown>要使用的圖像模型，例如 `dall-e-3`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>控制圖像生成的其他選項。可用參數取決於所選模型。</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false" data-desc="生成圖像的所需尺寸（例如 `1024x1024`）。"></x-field>
    <x-field data-name="quality" data-type="string" data-required="false" data-desc="圖像品質，`standard` 或 `hd`（僅適用於 DALL-E 3）。"></x-field>
    <x-field data-name="style" data-type="string" data-required="false" data-desc="生成圖像的風格，`vivid` 或 `natural`（僅適用於 DALL-E 3）。"></x-field>
    <x-field data-name="n" data-type="number" data-required="false" data-desc="要生成的圖像數量。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接傳遞給底層 OpenAI SDK 客戶端的進階選項。</x-field-desc>
  </x-field>
</x-field-group>

### 基本用法

要生成圖像，請建立一個 `OpenAIImageModel` 的實例，並用一個提示來呼叫它。

```typescript Image Generation icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";
import fs from "fs/promises";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    quality: "hd",
    style: "vivid",
  },
});

const result = await imageModel.invoke({
  prompt: "A futuristic cityscape with flying cars, synthwave style",
});

// 結果包含圖像資料。它可以是 URL 或 base64 編碼的字串。
const firstImage = result.images[0];

if (firstImage.type === "url") {
  console.log("Image URL:", firstImage.url);
} else if (firstImage.type === "file") {
  await fs.writeFile("cityscape.png", firstImage.data, "base64");
  console.log("Image saved as cityscape.png");
}
```

**回應範例**
```json
{
  "images": [
    {
      "type": "url",
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "mimeType": "image/png"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "dall-e-3"
}
```

回應物件包含一個生成圖像的陣列。每個圖像可以是指向託管圖像的 URL，也可以是 base64 編碼的檔案，具體取決於 API 請求的回應格式。

## 總結

本指南提供了在 AIGNE 框架內安裝、設定和使用 OpenAI 對話和圖像模型所需的資訊。透過利用 `@aigne/openai` 套件，您可以將 OpenAI 的進階功能無縫整合到您的 Agent 應用程式中。

若需更進階的設定或疑難排解，請參閱官方 [OpenAI API 文件](https://platform.openai.com/docs/api-reference)。要探索其他可用模型，請參閱 [模型概覽](./models-overview.md)。