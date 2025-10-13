本文件提供 `@aigne/doubao` SDK 的完整使用指南，此 SDK 將豆包 AI 模型整合至 AIGNE 框架中。您將學習如何安裝、設定及使用此 SDK，以在您的應用程式中利用豆包的聊天和圖片生成功能。

為說明此 SDK 的作用，以下是高階架構概覽：

```d2
direction: down

User-Application: {
  label: "您的應用程式"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  aigne-doubao-SDK: {
    label: "@aigne/doubao SDK"
    shape: rectangle
  }
}

Doubao-AI-Service: {
  label: "豆包 AI 服務"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-dash: 4
  }

  Chat-Models: {
    label: "聊天模型"
  }
  Image-Models: {
    label: "圖片生成模型"
  }
}

User-Application -> AIGNE-Framework.aigne-doubao-SDK: "使用 SDK"
AIGNE-Framework.aigne-doubao-SDK -> Doubao-AI-Service: "API 呼叫"
```

## 1. 簡介

`@aigne/doubao` 提供了 AIGNE 框架與豆包強大語言模型之間的無縫整合。此套件讓開發者能輕易地在 AIGNE 應用程式中利用豆包的 AI 功能，在運用豆包進階特性的同時，也提供了一致的介面。

### 功能

*   **直接整合豆包 API**：直接連接至豆包的 API 服務。
*   **聊天完成功能**：支援所有可用的豆包聊天模型。
*   **函式呼叫**：內建對函式呼叫的支援。
*   **串流回應**：啟用串流功能，以實現更具回應性的應用程式。
*   **型別安全**：為所有 API 提供全面的 TypeScript 型別定義。
*   **一致的介面**：與 AIGNE 框架的模型介面對齊，以實現互通性。
*   **穩健的錯誤處理**：具備內建的錯誤處理和重試機制。
*   **完整的設定選項**：提供廣泛的選項以微調模型行為。

## 2. 安裝

首先，請使用您偏好的套件管理器安裝 `@aigne/doubao` 和 `@aigne/core` 套件。

### 使用 npm

```bash
npm install @aigne/doubao @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/doubao @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/doubao @aigne/core
```

## 3. 設定

在使用 SDK 之前，您需要設定您的豆包 API 金鑰。金鑰可以直接在模型建構函式中提供，或透過 `DOUBAO_API_KEY` 環境變數提供。

```typescript
import { DoubaoChatModel } from "@aigne/doubao";

// 選項 1：直接提供 API 金鑰
const model = new DoubaoChatModel({
  apiKey: "your-api-key",
});

// 選項 2：使用環境變數 (DOUBAO_API_KEY)
// 請確保已在您的環境中設定該變數
// const model = new DoubaoChatModel();
```

## 4. 聊天模型用法

`DoubaoChatModel` 類別提供了一個與豆包聊天完成模型互動的介面。

### 基本用法

以下是一個如何呼叫聊天模型以取得回應的簡單範例。

```typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  // 直接提供 API 金鑰，或使用環境變數 DOUBAO_API_KEY
  apiKey: "your-api-key", // 若已在環境變數中設定則為選用
  // 指定模型版本（預設為 'doubao-seed-1-6-250615'）
  model: "doubao-seed-1-6-250615",
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
    text: "您好！我是一個由豆包語言模型驅動的 AI 助理。",
    model: "doubao-seed-1-6-250615",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
*/
```

### 串流回應

對於即時應用程式，您可以從模型中串流回應。這讓您可以在輸出可用時立即處理。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-api-key",
  model: "doubao-seed-1-6-250615",
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

console.log(fullText); // 輸出："您好！我是一個由豆包語言模型驅動的 AI 助理。"
console.log(json); // { model: "doubao-seed-1-6-250615", usage: { inputTokens: 7, outputTokens: 12 } }
```

## 5. 圖片模型用法

`DoubaoImageModel` 類別讓您能使用豆包的圖片生成模型（例如 `doubao-seedream-4-0-250828`）來生成圖片。

### 基本圖片生成

以下範例示範如何從文字提示生成圖片。

```typescript
import { DoubaoImageModel } from "@aigne/doubao";

async function generateImage() {
  const imageModel = new DoubaoImageModel({
    apiKey: "your-api-key", // 或使用 DOUBAO_API_KEY 環境變數
    model: "doubao-seedream-4-0-250828", // 指定圖片模型
  });

  const output = await imageModel.invoke({
    prompt: "A futuristic cityscape at sunset",
  });

  // 輸出包含生成的圖片資料（URL 或 base64）
  console.log(output.images);
}

generateImage();
```

`output.images` 陣列將為每張生成的圖片包含一個帶有 `url` 或 `data` 屬性（base64 編碼）的物件。

## 6. 授權條款

`@aigne/doubao` SDK 採用 Elastic-2.0 授權條款發行。