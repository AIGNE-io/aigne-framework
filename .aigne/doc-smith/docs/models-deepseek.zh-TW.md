# @aigne/deepseek

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE 標誌" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/deepseek)](https://www.npmjs.com/package/@aigne/deepseek)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/deepseek)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Deepseek SDK，用於在 [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) 中整合 Deepseek AI 模型。

## 簡介

`@aigne/deepseek` 提供了 AIGNE Framework 與 Deepseek 強大語言模型之間的無縫整合。此套件讓開發者能輕易地在其 AIGNE 應用程式中利用 Deepseek 的 AI 模型，在整個框架中提供一致的介面，同時發揮 Deepseek 先進的 AI 功能。

```d2
direction: down

Your-Application: {
  label: "您的應用程式"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle
  grid-columns: 2
  grid-gap: 100

  aigne-core: {
    label: "@aigne/core"
    shape: rectangle
    AIGNE-Model-Interface: {
      label: "AIGNE 模型\n介面"
      shape: rectangle
    }
  }

  aigne-deepseek: {
    label: "@aigne/deepseek"
    shape: rectangle
    DeepSeekChatModel: {
      label: "DeepSeekChatModel"
      shape: rectangle
    }
  }
}

Deepseek-API: {
  label: "Deepseek API"
  shape: rectangle
}

Your-Application -> AIGNE-Framework.aigne-deepseek.DeepSeekChatModel: "呼叫"
AIGNE-Framework.aigne-deepseek.DeepSeekChatModel -> AIGNE-Framework.aigne-core.AIGNE-Model-Interface: "實作" {
  style.stroke-dash: 2
}
AIGNE-Framework.aigne-deepseek.DeepSeekChatModel -> Deepseek-API: "進行 API 呼叫"
```

## 功能

*   **Deepseek API 整合**：直接連接 Deepseek 的 API 服務。
*   **聊天補全**：支援 Deepseek 的聊天補全 API，涵蓋所有可用模型。
*   **函式呼叫**：內建對函式呼叫功能的支援。
*   **串流回應**：支援串流回應，讓應用程式反應更即時。
*   **型別安全**：為所有 API 和模型提供全面的 TypeScript 型別定義。
*   **一致的介面**：與 AIGNE Framework 的模型介面相容。
*   **錯誤處理**：穩健的錯誤處理與重試機制。
*   **完整配置**：豐富的配置選項，可用於微調行為。

## 安裝

使用您偏好的套件管理器安裝此套件：

### npm

```bash
npm install @aigne/deepseek @aigne/core
```

### yarn

```bash
yarn add @aigne/deepseek @aigne/core
```

### pnpm

```bash
pnpm add @aigne/deepseek @aigne/core
```

## API 參考

### `DeepSeekChatModel`

`DeepSeekChatModel` 類別是與 Deepseek Chat API 互動的主要介面。它擴充了來自 `@aigne/openai` 的 `OpenAIChatModel`，提供了一個熟悉的、與 OpenAI 相容的 API 格式。

#### 建構函式

若要開始，請建立一個 `DeepSeekChatModel` 的新執行個體。

```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key", // 或設定 DEEPSEEK_API_KEY 環境變數
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});
```

**參數**

<x-field-group>
    <x-field data-name="options" data-type="OpenAIChatModelOptions" data-required="false" data-desc="模型的組態選項。">
        <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="您的 Deepseek API 金鑰。如果未提供，將從 `DEEPSEEK_API_KEY` 環境變數中讀取。"></x-field>
        <x-field data-name="model" data-type="string" data-default="deepseek-chat" data-required="false" data-desc="用於聊天補全的模型（例如 'deepseek-chat'、'deepseek-coder'）。"></x-field>
        <x-field data-name="baseURL" data-type="string" data-default="https://api.deepseek.com" data-required="false" data-desc="Deepseek API 的基礎 URL。"></x-field>
        <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="傳遞給模型 API 的額外選項，例如 `temperature`、`top_p` 等。"></x-field>
    </x-field>
</x-field-group>

## 基本用法

若要向模型傳送簡單的請求，請使用 `invoke` 方法。

```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // 直接提供 API 金鑰或使用環境變數 DEEPSEEK_API_KEY
  apiKey: "your-api-key", // 若已在環境變數中設定，則為選填
  // 指定模型版本（預設為 'deepseek-chat'）
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
/* 輸出：
  {
    text: "您好！我是一個由 DeepSeek 語言模型驅動的 AI 助理。",
    model: "deepseek-chat",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
*/
```

## 串流回應

對於即時應用程式，您可以串流模型的應答。在 `invoke` 呼叫中設定 `streaming: true` 選項，以便在資料可用時接收資料區塊。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key",
  model: "deepseek-chat",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
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

console.log(fullText); // 輸出：「您好！我是一個由 DeepSeek 語言模型驅動的 AI 助理。」
console.log(json); // { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

## 授權條款

此套件根據 [Elastic-2.0 授權條款](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 授權。