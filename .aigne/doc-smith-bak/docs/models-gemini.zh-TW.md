# Google Gemini

本指南提供透過 `@aigne/gemini` 套件在 AIGNE 框架中設定和使用 Google Gemini 模型的說明。內容涵蓋 API 金鑰設定、模型選擇，以及可用於聊天、圖片和影片生成的特定功能。

`@aigne/gemini` 套件提供了與 Google 先進 AI 功能的無縫整合，包括 Gemini 多模態模型和 Imagen 文字轉圖片模型，在 AIGNE 生態系統中提供了一致的介面。

## 功能

- **Google API 整合**：提供與 Google Gemini、Imagen 和 Veo API 服務的直接介面。
- **聊天補完**：支援所有可用的 Gemini 聊天模型，用於對話式 AI。
- **圖片生成**：與 Imagen 和 Gemini 模型整合，用於圖片生成和編輯。
- **影片生成**：利用 Google 的 Veo 模型執行文字轉影片、圖片轉影片和影格內插任務。
- **多模態支援**：原生處理結合文字、圖片、音訊和影片的輸入。
- **函式呼叫**：支援 Gemini 的函式呼叫功能，以便與外部工具互動。
- **串流回應**：啟用即時資料處理，以實現更具回應性的應用程式。
- **型別安全**：包含所有 API 和模型設定的完整 TypeScript 型別定義。

## 安裝

使用您偏好的套件管理器安裝所需套件。

```bash
npm install @aigne/gemini @aigne/core
```

## 設定

若要驗證請求，您必須提供一個 Google API 金鑰。這可以透過設定一個環境變數來完成，框架會自動偵測到該變數。

```bash 環境變數
export GEMINI_API_KEY="your-google-api-key"
```

或者，您也可以在模型的建構函式中直接傳入 `apiKey`。

## 聊天補完

`GeminiChatModel` 類別用於對話式互動。

### 基本用法

以下範例示範如何實例化和呼叫 `GeminiChatModel`。

```typescript 聊天模型用法 icon=logos:javascript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // 如果設定了 GEMINI_API_KEY 環境變數，則 API 金鑰為選用。
  apiKey: "your-api-key",
  // 指定模型。預設為 'gemini-2.0-flash'。
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

**回應範例**

```json
{
  "text": "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
  "model": "gemini-1.5-flash",
  "usage": {
    "inputTokens": 12,
    "outputTokens": 18
  }
}
```

### 串流回應

對於即時應用程式，您可以透過啟用串流來處理陸續收到的回應區塊。

```typescript 串流範例 icon=logos:javascript
import { isAgentResponseDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-api-key",
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
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}

console.log(fullText);
// Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"

console.log(json);
// Output: { model: "gemini-1.5-flash" }
```

### 聊天模型參數

<x-field-group>
  <x-field data-name="messages" data-type="array" data-required="true" data-desc="對話歷史記錄。每個訊息物件包含一個 'role' 和 'content'。"></x-field>
  <x-field data-name="tools" data-type="array" data-required="false" data-desc="供模型呼叫的可用函式工具列表。"></x-field>
  <x-field data-name="toolChoice" data-type="string | object" data-required="false" data-desc="控制模型如何使用工具。可以是 'auto'、'required'、'none' 或特定工具。"></x-field>
  <x-field data-name="responseFormat" data-type="object" data-required="false" data-desc="指定所需的輸出格式，例如結構化 JSON。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="要使用的模型（例如 'gemini-1.5-pro'、'gemini-1.5-flash'）。"></x-field>
  <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制隨機性（0-1）。值越高，回應越具創意。"></x-field>
  <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心取樣參數（0-1）。"></x-field>
  <x-field data-name="topK" data-type="number" data-required="false" data-desc="Top-k 取樣參數。"></x-field>
  <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="降低重複詞元的可能性。"></x-field>
  <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="鼓勵模型引入新主題。"></x-field>
  <x-field data-name="reasoningEffort" data-type="string | number" data-required="false" data-desc="對於思考模型（例如 Gemini 2.5），設定用於推理的詞元預算。可以是 'minimal'、'low'、'medium'、'high' 或特定的詞元數量。"></x-field>
  <x-field data-name="modalities" data-type="array" data-required="false" data-desc="指定所需的回應模態，例如 ['TEXT']、['IMAGE'] 或 ['TEXT', 'IMAGE']。"></x-field>
</x-field-group>

## 圖片生成

`GeminiImageModel` 類別支援使用專業的 Imagen 模型和多模態的 Gemini 模型來生成和編輯圖片。

### 基本圖片生成

此範例使用 Imagen 模型生成一張圖片。

```typescript 圖片生成 icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "imagen-4.0-generate-001", // 預設 Imagen 模型
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

**回應範例**

```json
{
  "images": [
    {
      "type": "file",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    }
  ],
  "usage": { "inputTokens": 0, "outputTokens": 0 },
  "model": "imagen-4.0-generate-001"
}
```

### 使用 Gemini 模型編輯圖片

多模態 Gemini 模型可以根據文字提示編輯現有圖片。

```typescript 圖片編輯 icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "gemini-2.0-flash-exp", // 用於編輯的 Gemini 模型
});

const result = await model.invoke({
  prompt: "Add vibrant flowers in the foreground",
  image: [
    {
      type: "url",
      url: "https://example.com/original-image.png",
    },
  ],
  n: 1,
});

console.log(result.images); // 編輯後圖片的陣列
```

### 圖片模型參數

參數會根據所使用的模型系列而有所不同。

#### 通用參數

| 參數 | 型別 | 說明 |
| :--- | :--- | :--- |
| `prompt` | `string` | **必要。** 所需圖片的文字描述。 |
| `model` | `string` | 要使用的模型。預設為 `imagen-4.0-generate-001`。 |
| `n` | `number` | 要生成的圖片數量。預設為 `1`。 |
| `image` | `array` | 對於 Gemini 模型，用於編輯的參考圖片陣列。 |

#### Imagen 模型參數

| 參數 | 型別 | 說明 |
| :--- | :--- | :--- |
| `seed` | `number` | 用於可重現結果的隨機種子。 |
| `safetyFilterLevel` | `string` | 內容審核安全過濾器等級。 |
| `personGeneration` | `string` | 控制生成人物圖片的設定。 |
| `outputMimeType` | `string` | 輸出圖片格式（例如 `image/png`）。 |
| `negativePrompt` | `string` | 描述要從圖片中排除的內容。 |
| `imageSize` | `string` | 生成圖片的尺寸（例如「1024x1024」）。 |
| `aspectRatio` | `string` | 圖片的長寬比（例如「16:9」）。 |

#### Gemini 模型參數

| 參數 | 型別 | 說明 |
| :--- | :--- | :--- |
| `temperature` | `number` | 控制隨機性（0.0 到 1.0）。 |
| `maxOutputTokens` | `number` | 回應中的最大詞元數。 |
| `topP` | `number` | 核心取樣參數。 |
| `topK` | `number` | Top-k 取樣參數。 |
| `safetySettings` | `array` | 用於內容生成的自訂安全設定。 |
| `seed` | `number` | 用於可重現結果的隨機種子。 |
| `systemInstruction` | `string` | 指導模型的系統級指令。 |

## 影片生成

`GeminiVideoModel` 類別使用 Google 的 Veo 模型從文字或圖片生成影片。

### 基本影片生成

```typescript 文字轉影片 icon=logos:javascript
import { GeminiVideoModel } from "@aigne/gemini";

const videoModel = new GeminiVideoModel({
  apiKey: "your-api-key",
  model: "veo-3.1-generate-preview",
});

const result = await videoModel.invoke({
  prompt: "A serene lake with mountains in the background, gentle waves rippling",
  aspectRatio: "16:9",
  size: "720p",
  seconds: "8",
});

console.log(result);
```

**回應範例**

```json
{
  "videos": [
    {
      "type": "file",
      "data": "base64-encoded-video-data...",
      "mimeType": "video/mp4",
      "filename": "timestamp.mp4"
    }
  ],
  "usage": { "inputTokens": 0, "outputTokens": 0 },
  "model": "veo-3.1-generate-preview",
  "seconds": 8
}
```

### 進階影片生成

Veo 模型也支援圖片轉影片和影格內插。

-   **圖片轉影片**：提供一個 `prompt` 和一個來源 `image`，讓靜態圖片動起來。
-   **影格內插**：提供一個 `prompt`、一個起始 `image` 和一個結束 `lastFrame`，以在兩者之間生成平滑的過渡。

```typescript 圖片轉影片 icon=logos:javascript
const result = await videoModel.invoke({
  prompt: "Animate this image with gentle movement, clouds drifting slowly",
  image: {
    type: "url",
    url: "https://example.com/input-image.png",
  },
  seconds: "8",
});
```

### 影片模型參數

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="所需影片內容的文字描述。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="要使用的 Veo 模型。預設為 'veo-3.1-generate-preview'。"></x-field>
  <x-field data-name="aspectRatio" data-type="string" data-required="false" data-desc="影片長寬比，可為 '16:9'（預設）或 '9:16'。"></x-field>
  <x-field data-name="size" data-type="string" data-required="false" data-desc="影片解析度，可為 '720p'（預設）或 '1080p'。"></x-field>
  <x-field data-name="seconds" data-type="string" data-required="false" data-desc="影片長度（秒）：'4'、'6' 或 '8'（預設）。"></x-field>
  <x-field data-name="image" data-type="object" data-required="false" data-desc="用於圖片轉影片的參考圖片，或用於內插的第一個影格。"></x-field>
  <x-field data-name="lastFrame" data-type="object" data-required="false" data-desc="用於影格內插的最後一個影格。"></x-field>
  <x-field data-name="referenceImages" data-type="array" data-required="false" data-desc="用於影片生成的額外參考圖片（僅限 Veo 3.1）。"></x-field>
  <x-field data-name="negativePrompt" data-type="string" data-required="false" data-desc="描述影片中應避免的內容。"></x-field>
</x-field-group>

## 延伸閱讀

如需完整的 API 詳細資訊，請參閱官方文件。

- [AIGNE 框架文件](https://aigne.io/docs)
- [Google GenAI API 參考](https://googleapis.github.io/js-genai/release_docs/)