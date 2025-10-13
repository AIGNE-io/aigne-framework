本文件為 `@aigne/openai` 套件提供了一份全面的使用指南，該 SDK 旨在 AIGNE 框架內與 OpenAI 的 GPT 模型無縫整合。

<div align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE 標誌" width="400" />
  </picture>
</div>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/openai)](https://www.npmjs.com/package/@aigne/openai)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/openai)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

### 簡介

`@aigne/openai` 提供了 AIGNE 框架與 OpenAI 強大語言模型之間的無縫整合。此套件讓開發人員能夠在其 AIGNE 應用程式中輕鬆利用 OpenAI 的 GPT 模型，在整個框架中提供一致的介面，同時利用 OpenAI 的先進 AI 功能。

### 架構

`@aigne/openai` 套件作為一個連接器，允許 AIGNE 框架直接與 OpenAI API 進行通訊。這種整合使您能夠將 OpenAI 的先進模型無縫地整合到您的 AIGNE 應用程式中。
<diagram>
```d2
direction: down

Developer: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"

  AIGNE-Application: {
    label: "AIGNE 應用程式"
    shape: rectangle
  }

  aigne-openai: {
    label: "@aigne/openai\n（連接器）"
    shape: rectangle
  }
}

OpenAI-API: {
  label: "OpenAI API\n（GPT 模型）"
  shape: rectangle
}

Developer -> AIGNE-Framework.AIGNE-Application: "建構"
AIGNE-Framework.AIGNE-Application -> AIGNE-Framework.aigne-openai: "使用"
AIGNE-Framework.aigne-openai -> OpenAI-API: "API 呼叫"
```
</diagram>

## 功能

*   **OpenAI API 整合**：使用官方 SDK 直接連接到 OpenAI 的 API 服務。
*   **聊天完成**：支援 OpenAI 的聊天完成 API，包含所有可用模型。
*   **函式呼叫**：內建支援 OpenAI 的函式呼叫功能。
*   **串流回應**：支援串流回應，以實現反應更快的應用程式。
*   **類型安全**：為所有 API 和模型提供全面的 TypeScript 類型定義。
*   **一致的介面**：與 AIGNE 框架的模型介面相容。
*   **錯誤處理**：穩健的錯誤處理和重試機制。
*   **完整配置**：豐富的配置選項，用於微調行為。

## 安裝

使用您偏好的套件管理器安裝此套件及其核心依賴項：

### npm

```bash
npm install @aigne/openai @aigne/core
```

### yarn

```bash
yarn add @aigne/openai @aigne/core
```

### pnpm

```bash
pnpm add @aigne/openai @aigne/core
```

## API 參考

`@aigne/openai` 套件公開了兩個主要類別，用於與 OpenAI 的服務互動：`OpenAIChatModel` 和 `OpenAIImageModel`。

### OpenAIChatModel

`OpenAIChatModel` 類別提供了對 OpenAI 聊天完成功能的存取，包括文字生成、工具使用、JSON 結構化輸出和圖像理解。

#### 配置

您可以透過將 `OpenAIChatModelOptions` 物件傳遞給 `OpenAIChatModel` 的建構函式來進行配置。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="您的 OpenAI API 金鑰。如果未提供，將會使用 `OPENAI_API_KEY` 環境變數。"></x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="OpenAI API 的可選基礎 URL，對代理伺服器很有用。"></x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false" data-desc="用於聊天完成的 OpenAI 模型。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="用於控制模型行為的額外選項。">
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制隨機性。值越低，模型越具確定性。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心取樣參數。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="根據新詞元在文本中的現有頻率對其進行懲罰。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="根據新詞元是否已在目前文本中出現過對其進行懲罰。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="是否啟用並行函式呼叫。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="Partial<ClientOptions>" data-required="false" data-desc="用於底層 OpenAI SDK 的額外客戶端選項。"></x-field>
</x-field-group>

#### 基本用法

以下是如何實例化和使用 `OpenAIChatModel` 的基本範例。

```typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // 直接提供 API 金鑰或使用環境變數 OPENAI_API_KEY
  apiKey: "your-api-key", // 如果已在環境變數中設定，則為可選
  model: "gpt-4o", // 若未指定，則預設為 "gpt-4o-mini"
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
/* 輸出：
  {
    text: "Hello! How can I assist you today?",
    model: "gpt-4o",
    usage: {
      inputTokens: 10,
      outputTokens: 9
    }
  }
*/
```

#### 串流回應

對於即時應用程式，您可以從模型串流回應。

```typescript
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
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}

console.log(fullText); // 輸出："Hello! How can I assist you today?"
console.log(json); // { model: "gpt-4o", usage: { inputTokens: 10, outputTokens: 9 } }
```

### OpenAIImageModel

`OpenAIImageModel` 類別允許您使用 OpenAI 的 DALL-E 模型來生成和編輯圖像。

#### 配置

您可以透過將 `OpenAIImageModelOptions` 物件傳遞給 `OpenAIImageModel` 的建構函式來進行配置。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="您的 OpenAI API 金鑰。如果未提供，將會使用 `OPENAI_API_KEY` 環境變數。"></x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="OpenAI API 的可選基礎 URL，對代理伺服器很有用。"></x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false" data-desc="用於圖像生成的 OpenAI 模型（例如 'dall-e-2'、'dall-e-3'）。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="用於控制圖像生成行為的額外選項，例如尺寸、品質和風格。"></x-field>
  <x-field data-name="clientOptions" data-type="Partial<ClientOptions>" data-required="false" data-desc="用於底層 OpenAI SDK 的額外客戶端選項。"></x-field>
</x-field-group>

#### 使用範例

以下是如何生成圖像的範例。

```typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    size: "1024x1024",
    quality: "hd",
  },
});

const result = await imageModel.process({
  prompt: "A futuristic cityscape at sunset, with flying cars and neon lights.",
});

console.log(result.images);
/* 輸出：
[
  {
    type: 'url',
    url: 'https://...', // 生成圖像的 URL
    mimeType: 'image/png'
  }
]
*/
```

## 授權

此套件採用 [Elastic-2.0 授權](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)。