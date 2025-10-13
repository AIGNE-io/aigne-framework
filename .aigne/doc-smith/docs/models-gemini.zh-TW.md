# @aigne/gemini

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/gemini)](https://www.npmjs.com/package/@aigne/gemini)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/gemini)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Gemini SDK，用於在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)中整合 Google 的 Gemini AI 模型。

## 簡介

`@aigne/gemini` 提供了 AIGNE 框架與 Google Gemini 語言模型和 API 之間的無縫整合。此套件使開發人員能夠在其 AIGNE 應用程式中輕鬆利用 Gemini 的進階 AI 功能，在整個框架中提供一致的介面，同時利用 Google 最先進的多模態模型。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini.png" alt="AIGNE Arch" />
</picture>

## 架構

下圖說明了 `@aigne/gemini` 套件如何融入 AIGNE 框架並與 Google Gemini API 互動。

```d2
direction: down

User-Application: {
  label: "您的 AIGNE 應用程式"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  shape: rectangle
  grid-columns: 2
  grid-gap: 100

  AIGNE-Core: {
    label: "@aigne/core"
    shape: rectangle
    
    Model-Interface: {
      label: "模型介面\n(invoke, stream)"
      shape: rectangle
      style: {
        stroke-dash: 2
      }
    }
  }

  AIGNE-Gemini: {
    label: "@aigne/gemini"
    shape: rectangle
    
    GeminiChatModel: {
      label: "GeminiChatModel"
    }
    
    GeminiImageModel: {
      label: "GeminiImageModel"
    }
  }
}

Google-Cloud: {
  label: "Google Cloud"
  shape: rectangle

  Google-Gemini-API: {
    label: "Google Gemini API"
    shape: cylinder
    grid-columns: 2
    
    Gemini-Models: {
      label: "Gemini 模型\n(例如 gemini-1.5-pro)"
    }
    
    Imagen-Models: {
      label: "Imagen 模型\n(例如 imagen-4.0)"
    }
  }
}

User-Application -> AIGNE-Framework.AIGNE-Core: "使用核心"
User-Application -> AIGNE-Framework.AIGNE-Gemini: "匯入並實例化"

AIGNE-Framework.AIGNE-Core.Model-Interface -> AIGNE-Framework.AIGNE-Gemini: {
  label: "實作"
  style: {
    stroke-dash: 4
  }
}

AIGNE-Framework.AIGNE-Gemini.GeminiChatModel -> Google-Cloud.Google-Gemini-API.Gemini-Models: "API 呼叫"
AIGNE-Framework.AIGNE-Gemini.GeminiImageModel -> Google-Cloud.Google-Gemini-API.Gemini-Models: "API 呼叫"
AIGNE-Framework.AIGNE-Gemini.GeminiImageModel -> Google-Cloud.Google-Gemini-API.Imagen-Models: "API 呼叫"

```

## 功能

*   **Google Gemini API 整合**：直接連接 Google 的 Gemini API 服務
*   **聊天完成**：支援 Gemini 的聊天完成 API，包含所有可用模型
*   **圖片生成**：支援 Imagen 和 Gemini 圖片生成模型
*   **多模態支援**：內建支援處理文字和圖片輸入
*   **函式呼叫**：支援函式呼叫功能
*   **串流回應**：支援串流回應，以實現更具響應性的應用程式
*   **型別安全**：為所有 API 和模型提供全面的 TypeScript 型別定義
*   **一致的介面**：與 AIGNE 框架的模型介面相容
*   **錯誤處理**：強大的錯誤處理和重試機制
*   **完整配置**：豐富的配置選項，用於微調行為

## 安裝

### 使用 npm

```bash
npm install @aigne/gemini @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/gemini @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/gemini @aigne/core
```

## 開始使用

### 環境變數

在使用 SDK 之前，您需要設定您的 Gemini API 金鑰。SDK 將會自動從以下環境變數中偵測金鑰：

```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

或者，您可以在實例化模型時直接傳遞 `apiKey`。

### 聊天模型用法

`GeminiChatModel` 提供了與 Gemini 聊天完成模型互動的介面。

```typescript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // 直接提供 API 金鑰或使用環境變數 GOOGLE_API_KEY
  apiKey: "your-api-key", // 如果已在環境變數中設定，則為可選
  // 指定 Gemini 模型版本（如果未指定，則預設為 'gemini-1.5-pro'）
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
/* 輸出:
  {
    text: "您好，我是 Gemini！我是 Google 的樂於助人的 AI 助理。今天我能如何協助您？",
    model: "gemini-1.5-flash"
  }
*/
```

### 圖片生成模型用法

`GeminiImageModel` 允許您使用 Imagen 或 Gemini 模型生成圖片。

```typescript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key", // 如果已在環境變數中設定，則為可選
  model: "imagen-4.0-generate-001", // 預設 Imagen 模型
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
/* 輸出:
  {
    images: [
      {
        base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      }
    ],
    usage: {
      inputTokens: 0,
      outputTokens: 0
    },
    model: "imagen-4.0-generate-001"
  }
*/
```

## 進階用法

### 串流回應

對於即時應用程式，您可以從聊天模型中串流回應。這讓您可以在輸出生成時即時處理。

```typescript
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

console.log(fullText); // 輸出："您好，我是 Gemini！我是 Google 的樂於助人的 AI 助理。今天我能如何協助您？"
console.log(json); // { model: "gemini-1.5-flash" }
```

### 圖片生成參數

`GeminiImageModel` 支援多種參數，這些參數根據底層模型系列（Imagen 或 Gemini）而有所不同。

#### Imagen 模型 (例如 `imagen-4.0-generate-001`)

-   **`prompt`** (string)：您想生成的圖片的文字描述。
-   **`n`** (number)：要生成的圖片數量（預設為 1）。
-   **`seed`** (number)：用於可重現生成的隨機種子。
-   **`safetyFilterLevel`** (string)：內容審核的安全過濾等級。
-   **`personGeneration`** (string)：人物生成設定。
-   **`outputMimeType`** (string)：輸出圖片格式（例如 "image/png"、"image/jpeg"）。
-   **`outputGcsUri`** (string)：用於輸出的 Google Cloud Storage URI。
-   **`outputCompressionQuality`** (number)：JPEG 壓縮品質（1-100）。
-   **`negativePrompt`** (string)：描述要從圖片中排除的內容。
-   **`language`** (string)：提示的語言。
-   **`includeSafetyAttributes`** (boolean)：在回應中包含安全屬性。
-   **`includeRaiReason`** (boolean)：在回應中包含 RAI 推理。
-   **`imageSize`** (string)：生成圖片的尺寸。
-   **`guidanceScale`** (number)：生成的引導比例。
-   **`aspectRatio`** (string)：圖片的長寬比。
-   **`addWatermark`** (boolean)：為生成的圖片添加浮水印。

#### Gemini 模型 (例如 `gemini-1.5-pro`)

-   **`prompt`** (string)：您想生成的圖片的文字描述。
-   **`n`** (number)：要生成的圖片數量（預設為 1）。
-   **`temperature`** (number)：控制生成中的隨機性（0.0 到 1.0）。
-   **`maxOutputTokens`** (number)：回應中的最大 token 數量。
-   **`topP`** (number)：核心取樣參數。
-   **`topK`** (number)：Top-k 取樣參數。
-   **`safetySettings`** (array)：內容生成的安全設定。
-   **`seed`** (number)：用於可重現生成的隨機種子。
-   **`stopSequences`** (array)：停止生成的序列。
-   **`systemInstruction`** (string)：系統級指令。

#### 進階圖片生成範例

此範例展示如何將多個進階參數與 Imagen 模型一起使用。

```typescript
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
  outputMimeType: "image/png"
});
```

### 預設模型選項

您可以在模型層級配置預設選項，這些選項將應用於所有後續的 `invoke` 呼叫。

```typescript
const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "imagen-4.0-generate-001",
  modelOptions: {
    safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
    includeSafetyAttributes: true,
    outputMimeType: "image/png"
  }
});
```

## API 參考

有關所有可用參數和進階功能的完整詳細列表，請參閱官方 Google GenAI 文件：

-   **Imagen 模型**：[Google GenAI Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages)
-   **Gemini 模型**：[Google GenAI Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent)

## 授權

本 SDK 採用 [Elastic-2.0 授權](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 授權。