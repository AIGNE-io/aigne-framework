本文档提供了 `@aigne/doubao` SDK 的综合使用指南，该 SDK 将豆包 AI 模型集成到 AIGNE 框架中。您将学习如何安装、配置和使用该 SDK，以便在您的应用程序中利用豆包的聊天和图像生成功能。

为了说明该 SDK 的作用，以下是其架构的高阶概览：

```d2
direction: down

User-Application: {
  label: "您的应用程序"
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
  label: "豆包 AI 服务"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-dash: 4
  }

  Chat-Models: {
    label: "聊天模型"
  }
  Image-Models: {
    label: "图像生成模型"
  }
}

User-Application -> AIGNE-Framework.aigne-doubao-SDK: "使用 SDK"
AIGNE-Framework.aigne-doubao-SDK -> Doubao-AI-Service: "API 调用"
```

## 1. 简介

`@aigne/doubao` 提供了 AIGNE 框架与豆包强大语言模型之间的无缝集成。该软件包使开发人员能够在其 AIGNE 应用程序中轻松利用豆包的 AI 功能，在利用豆包高级特性的同时，提供了一致的接口。

### 功能

*   **直接集成豆包 API**：直接连接到豆包的 API 服务。
*   **聊天补全**：支持所有可用的豆包聊天模型。
*   **函数调用**：内置函数调用支持。
*   **流式响应**：支持流式传输，以实现响应更快的应用程序。
*   **类型安全**：为所有 API 提供全面的 TypeScript 类型定义。
*   **一致的接口**：与 AIGNE 框架的模型接口保持一致，以实现互操作性。
*   **强大的错误处理**：具备内置的错误处理和重试机制。
*   **全面的配置**：提供丰富的选项以微调模型行为。

## 2. 安装

首先，请使用您偏好的包管理器安装 `@aigne/doubao` 和 `@aigne/core` 软件包。

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

## 3. 配置

在使用 SDK 之前，您需要配置您的豆包 API 密钥。密钥可以直接在模型构造函数中提供，也可以通过 `DOUBAO_API_KEY` 环境变量提供。

```typescript
import { DoubaoChatModel } from "@aigne/doubao";

// 选项 1：直接提供 API 密钥
const model = new DoubaoChatModel({
  apiKey: "your-api-key",
});

// 选项 2：使用环境变量 (DOUBAO_API_KEY)
// 确保该变量已在您的环境中设置
// const model = new DoubaoChatModel();
```

## 4. 聊天模型用法

`DoubaoChatModel` 类提供了与豆包聊天补全模型交互的接口。

### 基本用法

以下是一个如何调用聊天模型以获取响应的简单示例。

```typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  // 直接提供 API 密钥或使用环境变量 DOUBAO_API_KEY
  apiKey: "your-api-key", // 如果已在环境变量中设置，则此项为可选
  // 指定模型版本（默认为 'doubao-seed-1-6-250615'）
  model: "doubao-seed-1-6-250615",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
/* 输出:
  {
    text: "Hello! I'm an AI assistant powered by Doubao's language model.",
    model: "doubao-seed-1-6-250615",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
*/
```

### 流式响应

对于实时应用程序，您可以从模型中流式传输响应。这使您能够在输出可用时立即处理它。

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

console.log(fullText); // 输出: "Hello! I'm an AI assistant powered by Doubao's language model."
console.log(json); // { model: "doubao-seed-1-6-250615", usage: { inputTokens: 7, outputTokens: 12 } }
```

## 5. 图像模型用法

`DoubaoImageModel` 类允许您使用豆包的图像创建模型（例如 `doubao-seedream-4-0-250828`）来生成图像。

### 基本图像生成

以下示例演示了如何根据文本提示生成图像。

```typescript
import { DoubaoImageModel } from "@aigne/doubao";

async function generateImage() {
  const imageModel = new DoubaoImageModel({
    apiKey: "your-api-key", // 或使用 DOUBAO_API_KEY 环境变量
    model: "doubao-seedream-4-0-250828", // 指定图像模型
  });

  const output = await imageModel.invoke({
    prompt: "A futuristic cityscape at sunset",
  });

  // 输出包含生成的图像数据（URL 或 base64）
  console.log(output.images);
}

generateImage();
```

`output.images` 数组将为每个生成的图像包含一个带有 `url` 或 `data` 属性（base64 编码）的对象。

## 6. 许可证

`@aigne/doubao` SDK 在 Elastic-2.0 许可下发布。