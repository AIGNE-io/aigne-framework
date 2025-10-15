# Google Gemini

本文件為在 AIGNE 框架內設定和使用 Google Gemini 模型的綜合指南。內容涵蓋 API 金鑰的設定、模型選擇，以及透過 `@aigne/gemini` 套件可用的聊天和圖片生成功能的具體特性。

`@aigne/gemini` 套件提供了與 Google Gemini 和 Imagen API 的直接整合，讓開發者能透過一致且可預測的介面，在其 AIGNE 應用程式中利用這些先進的多模態模型。

## 功能

- **直接整合 Google API**：直接連接到 Google 的 Gemini 和 Imagen API 服務。
- **聊天補全**：完全支援 Gemini 聊天模型，包括 `gemini-1.5-pro` 和 `gemini-1.5-flash`。
- **圖片生成**：支援 Imagen（例如 `imagen-4.0-generate-001`）和 Gemini 模型進行圖片生成。
- **多模態能力**：原生處理文字和圖片輸入，適用於多模態應用。
- **函式呼叫**：與 Gemini 的函式呼叫功能整合。
- **串流回應**：透過支援串流回應，實現即時、反應迅速的應用程式。
- **類型安全**：為所有 API 互動和模型設定提供全面的 TypeScript 類型定義。

## 安裝

首先，請使用您偏好的套件管理器安裝必要的套件。

<tabs>
<tab title="npm">
```bash
npm install @aigne/gemini @aigne/core
```
</tab>
<tab title="yarn">
```bash
yarn add @aigne/gemini @aigne/core
```
</tab>
<tab title="pnpm">
```bash
pnpm add @aigne/gemini @aigne/core
```
</tab>
</tabs>

## 設定

Gemini 模型需要 API 金鑰進行驗證。金鑰可以直接在模型建構函式中提供，或者為了更好的安全性與彈性，透過環境變數提供。

設定以下環境變數，讓框架能自動偵測您的 API 金鑰：

```bash title="環境變數"
export GEMINI_API_KEY="your-google-api-key"
```

## 聊天模型

`GeminiChatModel` 類別提供了一個與 Google 聊天模型互動的介面。

### 基本用法

以下是實例化 `GeminiChatModel` 並呼叫它以取得回應的標準範例。

```typescript "聊天模型範例" icon=logos:javascript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // 如果已設定 GEMINI_API_KEY 環境變數，則 API 金鑰為選用。
  apiKey: "your-google-api-key",

  // 指定模型版本。若未提供，預設為 'gemini-1.5-pro'。
  model: "gemini-1.5-flash",

  // 可設定額外的模型選項。
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

預期輸出將是一個包含模型回應的物件。

```json "範例回應"
{
  "text": "Gemini 向您問好！我是 Google 的 AI 助理。今天能為您提供什麼協助？",
  "model": "gemini-1.5-flash"
}
```

### 串流回應

對於需要即時互動的應用程式，您可以啟用串流功能，以便在回應區塊可用時立即處理。

```typescript "串流範例" icon=logos:javascript
import { isAgentResponseDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-google-api-key",
  model: "gemini-1.5-flash",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
  },
  { streaming: true }
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log(fullText);
// 預期輸出："Gemini 向您問好！我是 Google 的 AI 助理。今天能為您提供什麼協助？"

console.log(json);
// 預期輸出：{ model: "gemini-1.5-flash" }
```

## 圖片生成模型

`GeminiImageModel` 類別用於生成圖片。它支援兩種不同類型的底層模型：專門用於圖片生成的 **Imagen** 模型，以及同樣能生成圖片的多模態 **Gemini** 模型。

### 基本用法

以下是使用預設 Imagen 模型生成圖片的基本範例。

```typescript "圖片生成範例" icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-google-api-key",
  // 預設為 "imagen-4.0-generate-001"
  model: "imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

結果將包含 Base64 格式的生成圖片資料。

```json "範例回應"
{
  "images": [
    {
      "type": "file",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "imagen-4.0-generate-001"
}
```

### 圖片生成參數

可用的圖片生成參數會因您使用的是 Imagen 模型還是 Gemini 模型而有所不同。

#### Imagen 模型（例如 `imagen-4.0-generate-001`）

這些參數專屬於為圖片生成而最佳化的模型。

| 參數 | 類型 | 說明 |
| :--- | :--- | :--- |
| `prompt` | `string` | **必要。** 欲生成圖片的文字描述。 |
| `n` | `number` | 要生成的圖片數量。預設為 `1`。 |
| `negativePrompt` | `string` | 描述要從圖片中排除的元素。 |
| `seed` | `number` | 用於確保可重現圖片生成的隨機種子。 |
| `aspectRatio` | `string` | 生成圖片的長寬比（例如 "1:1"、"16:9"）。 |
| `imageSize` | `string` | 生成圖片的尺寸（例如 "1024x1024"）。 |
| `guidanceScale` | `number` | 控制生成圖片與提示的貼近程度。 |
| `outputMimeType` | `string` | 圖片的輸出格式（例如 "image/png"、"image/jpeg"）。 |
| `addWatermark` | `boolean` | 若為 `true`，則在生成的圖片上加上浮水印。 |
| `safetyFilterLevel` | `string` | 內容審核的安全過濾等級。 |
| `personGeneration` | `string` | 與圖片中人物生成相關的設定。 |
| `outputGcsUri` | `string` | 用於儲存輸出的 Google Cloud Storage URI。 |
| `outputCompressionQuality` | `number` | JPEG 壓縮品質，範圍從 1 到 100。 |
| `language` | `string` | 提示的語言。 |
| `includeSafetyAttributes` | `boolean` | 若為 `true`，則在回應中包含安全屬性。 |
| `includeRaiReason` | `boolean` | 若為 `true`，則在回應中包含 RAI（負責任 AI）的理由。 |

#### Gemini 模型（例如 `gemini-1.5-pro`）

當使用多模態 Gemini 模型進行圖片生成時，適用這些參數。

| 參數 | 類型 | 說明 |
| :--- | :--- | :--- |
| `prompt` | `string` | **必要。** 欲生成圖片的文字描述。 |
| `n` | `number` | 要生成的圖片數量。預設為 `1`。 |
| `temperature` | `number` | 控制隨機性（0.0 至 1.0）。較高的值會產生更具創意的輸出。 |
| `maxOutputTokens` | `number` | 回應中的最大 token 數。 |
| `topP` | `number` | 核心取樣參數。 |
| `topK` | `number` | top-k 取樣參數。 |
| `seed` | `number` | 用於確保可重現生成的隨機種子。 |
| `stopSequences` | `array` | 將停止生成過程的序列列表。 |
| `safetySettings` | `array` | 內容生成的自訂安全設定。 |
| `systemInstruction` | `string` | 指導模型行為的系統級指令。 |

### 進階圖片生成

此範例展示如何使用多個參數來微調 Imagen 模型的輸出。

```typescript "進階圖片生成" icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({ apiKey: "your-google-api-key" });

const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  model: "imagen-4.0-generate-001",
  n: 2,
  imageSize: "1024x1024",
  aspectRatio: "1:1",
  guidanceScale: 7.5,
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345,
  includeSafetyAttributes: true,
  outputMimeType: "image/png",
});

console.log(result);
```

## 延伸閱讀

有關參數的完整列表和更多進階功能，請參閱 Google AI 官方文件。

- **Imagen 模型**：[Google GenAI Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages)
- **Gemini 模型**：[Google GenAI Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent)