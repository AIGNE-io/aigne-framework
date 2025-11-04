# OpenAI

`@aigne/openai` 套件提供了與 OpenAI 模型套件的無縫整合，讓開發者可以直接在 AIGNE 框架內利用 GPT 等服務進行聊天完成、DALL-E 進行圖片生成，以及 Sora 進行影片創作。本文件提供了安裝、設定和使用這些模型的全面指南。

關於可用模型供應商的更廣泛概述，請參閱 [模型](./models.md) 部分。

## 功能

OpenAI 整合的設計旨在穩健且對開發者友善，提供一系列功能：

*   **全面的模型支援**：完全整合 OpenAI 的聊天、圖片和影片生成 API。
*   **官方 SDK**：建立在官方 OpenAI SDK 之上，以獲得最高的可靠性和相容性。
*   **進階功能**：包含支援函式呼叫、串流回應和結構化 JSON 輸出。
*   **型別安全**：為所有模型設定和 API 回應提供完整的 TypeScript 型別，確保程式碼品質和自動完成功能。
*   **一致的介面**：遵循 AIGNE 框架的模型介面，以在不同供應商之間實現統一的實作。
*   **廣泛的設定**：提供詳細的選項來微調模型行為，以滿足特定的應用需求。

## 安裝

要將 OpenAI 模型整合到您的專案中，請將 `@aigne/openai` 套件與 `@aigne/core` 框架一起安裝。請使用適合您套件管理工具的指令：

```bash npm
npm install @aigne/openai @aigne/core
```

```bash yarn
yarn add @aigne/openai @aigne/core
```

```bash pnpm
pnpm add @aigne/openai @aigne/core
```

## 聊天模型 (`OpenAIChatModel`)

`OpenAIChatModel` 類別是與 OpenAI 的文字型語言模型（如 GPT-4o 和 GPT-4o-mini）互動的主要介面。

### 設定

在建立 `OpenAIChatModel` 的實例時，您必須提供您的 OpenAI API 金鑰。這可以直接在建構函式中傳遞，或設定為名為 `OPENAI_API_KEY` 的環境變數。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 金鑰。若省略，系統將會尋找 `OPENAI_API_KEY` 環境變數。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API 的選用基礎 URL，可用於透過代理伺服器或替代端點進行連線。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false">
    <x-field-desc markdown>用於聊天完成的模型識別碼（例如 "gpt-4o"）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>一組用於控制生成過程的參數。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制輸出的隨機性。較低的值會產生更具確定性的結果。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="溫度取樣的替代方案，稱為核心取樣 (nucleus sampling)。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="降低重複詞元 (token) 的可能性。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="降低重複主題的可能性。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="使模型能夠同時執行多個函式呼叫。"></x-field>
    <x-field data-name="reasoningEffort" data-type="string | number" data-required="false" data-desc="對於推理模型 (o1/o3)，設定推理的努力程度（'minimal'、'low'、'medium'、'high' 或一個詞元數量）。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接傳遞給底層 OpenAI SDK 客戶端的額外選項，用於進階自訂。</x-field-desc>
  </x-field>
</x-field-group>

### 基本用法

以下範例展示如何實例化 `OpenAIChatModel` 並使用 `invoke` 方法來取得回應。

```typescript 基本聊天完成 icon=logos:typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // 建議使用環境變數來設定 API 金鑰。
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

**範例回應**

```json
{
  "text": "Hello! How can I assist you today?",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 10,
    "outputTokens": 9
  }
}
```

### 串流回應

對於即時應用程式，您可以透過將 `{ streaming: true }` 傳遞給 `invoke` 方法來啟用串流。這會回傳一個非同步迭代器，它會在回應區塊生成時逐一產出。

```typescript 串流聊天回應 icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
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
```

## 圖片模型 (`OpenAIImageModel`)

`OpenAIImageModel` 類別提供了與 OpenAI 圖片生成和編輯模型（如 DALL-E 2、DALL-E 3 和 gpt-image-1）互動的介面。

### 設定

圖片模型的設定與聊天模型相似，需要一個 API 金鑰，並允許設定模型特定的選項。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 金鑰。若未提供，則預設使用 `OPENAI_API_KEY` 環境變數。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API 的選用基礎 URL。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false">
    <x-field-desc markdown>要使用的圖片模型（例如 "dall-e-3", "gpt-image-1"）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>控制圖片生成過程的參數。可用選項因模型而異。</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false" data-desc="生成圖片的尺寸（例如 '1024x1024'）。"></x-field>
    <x-field data-name="quality" data-type="string" data-required="false" data-desc="圖片品質，可為 'standard' 或 'hd'（僅限 DALL-E 3）。"></x-field>
    <x-field data-name="style" data-type="string" data-required="false" data-desc="藝術風格，可為 'vivid' 或 'natural'（僅限 DALL-E 3）。"></x-field>
    <x-field data-name="n" data-type="number" data-required="false" data-desc="要生成的圖片數量。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接傳遞給底層 OpenAI SDK 客戶端的進階選項。</x-field-desc>
  </x-field>
</x-field-group>

### 圖片生成

若要生成圖片，請建立一個 `OpenAIImageModel` 的實例，並用文字提示來呼叫它。

```typescript 圖片生成 icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  },
});

const result = await imageModel.invoke({
  prompt: "A futuristic city at sunset with flying cars",
});

console.log(result);
```

**範例回應**

```json
{
  "images": [
    {
      "type": "url",
      "url": "https://...",
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

### 圖片編輯

圖片編輯功能由特定模型（如 `gpt-image-1`）支援。若要編輯圖片，請同時提供提示和參考圖片。

```typescript 圖片編輯 icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "gpt-image-1",
});

const result = await imageModel.invoke({
  prompt: "Add a rainbow to the sky",
  image: [
    {
      type: "url",
      url: "https://example.com/original-image.png",
    },
  ],
});

console.log(result.images); // 編輯後的圖片陣列
```

## 影片模型 (`OpenAIVideoModel`)

`OpenAIVideoModel` 類別能夠使用 OpenAI 的 Sora 模型生成影片。

### 設定

影片模型需要一個 API 金鑰，並允許指定模型、解析度和時長。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 金鑰。若未提供，則預設使用 `OPENAI_API_KEY` 環境變數。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="sora-2" data-required="false">
    <x-field-desc markdown>要使用的影片模型，可以是 "sora-2"（標準）或 "sora-2-pro"（更高品質）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>控制影片生成過程的參數。</x-field-desc>
    <x-field data-name="size" data-type="string" data-default="1280x720" data-required="false" data-desc="影片解析度（例如 '1280x720' 為橫向，'720x1280' 為縱向）。"></x-field>
    <x-field data-name="seconds" data-type="string" data-default="4" data-required="false" data-desc="影片時長（秒）。可接受的值為 '4'、'8' 或 '12'。"></x-field>
  </x-field>
</x-field-group>

### 影片生成

以下範例示範如何從文字提示生成短片。

```typescript 影片生成 icon=logos:typescript
import { OpenAIVideoModel } from "@aigne/openai";

const videoModel = new OpenAIVideoModel({
  apiKey: "your-api-key",
  model: "sora-2",
  modelOptions: {
    size: "1280x720",
    seconds: "4",
  },
});

const result = await videoModel.invoke({
  prompt: "A serene lake with mountains in the background, gentle waves rippling",
});

console.log(result);
```

**範例回應**

```json
{
  "videos": [
    {
      "type": "file",
      "data": "base64-encoded-video-data...",
      "mimeType": "video/mp4",
      "filename": "video-id.mp4"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "sora-2",
  "seconds": 4
}
```

### 圖片轉影片生成

您也可以透過將靜態圖片動畫化來生成影片。

```typescript 圖片轉影片 icon=logos:typescript
import { OpenAIVideoModel } from "@aigne/openai";

const videoModel = new OpenAIVideoModel({
  apiKey: "your-api-key",
  model: "sora-2",
});

const result = await videoModel.invoke({
  prompt: "Animate this image with gentle movement",
  image: {
    type: "url",
    url: "https://example.com/input-image.png",
  },
  size: "1280x720",
  seconds: "8",
});

console.log(result.videos);
```

## 總結

本指南已涵蓋將 OpenAI 的聊天、圖片和影片模型整合到您的 AIGNE 應用程式中的基本要素。透過使用 `@aigne/openai` 套件，您可以輕鬆地利用這些進階 AI 功能的強大威力。

如需更多詳細資訊，請參閱官方 [OpenAI API 文件](https://platform.openai.com/docs/api-reference)。若要探索其他支援的模型供應商，請造訪 [模型總覽](./models-overview.md)。