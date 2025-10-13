# @aigne/xai

`@aigne/xai` 软件包提供了 AIGNE 框架与 XAI 语言模型（如 Grok）之间的无缝集成。它提供了一个标准化的接口，用于在您的 AIGNE 应用程序中利用 XAI 先进的 AI 功能，确保了一致的开发体验。

该 SDK 基于 X.AI 提供的 OpenAI 兼容 API 格式构建，可以轻松与 `grok-2-latest` 等模型进行交互。

## 架构概述

`@aigne/xai` 软件包充当核心 AIGNE 框架与 XAI API 之间的连接器，使您能够以一致的接口将 XAI 模型集成到您的应用程序中。

```d2
direction: down

AIGNE-Application: {
  label: "AIGNE 应用程序"
  shape: rectangle

  aigne-xai: {
    label: "@aigne/xai SDK"
    shape: rectangle
  }
}

XAI-API: {
  label: "XAI API"
  shape: rectangle

  XAI-Models: {
    label: "XAI 模型\n（例如，Grok）"
    shape: cylinder
  }
}

AIGNE-Application.aigne-xai -> XAI-API: "通过\nOpenAI 兼容 API 通信"
XAI-API -> XAI-API.XAI-Models: "提供访问"
```

## 功能

*   **XAI API 集成**：直接连接到 XAI 的 API 服务。
*   **聊天补全**：支持 XAI 的聊天补全 API，并兼容所有可用模型。
*   **函数调用**：内置对函数调用功能的支持。
*   **流式响应**：支持处理流式响应，以实现响应更快的应用程序。
*   **类型安全**：为所有 API 和模型提供了全面的 TypeScript 类型定义。
*   **一致的接口**：与 AIGNE 框架的模型接口完全兼容。
*   **错误处理**：包含强大的错误处理和重试机制。
*   **完全可配置**：提供广泛的配置选项，用于微调模型行为。

## 安装

您可以使用 npm、yarn 或 pnpm 安装该软件包。

### npm

```bash
npm install @aigne/xai @aigne/core
```

### yarn

```bash
yarn add @aigne/xai @aigne/core
```

### pnpm

```bash
pnpm add @aigne/xai @aigne/core
```

## 配置

首先，您需要配置 `XAIChatModel`。该模型可以通过多种选项进行初始化，以自定义其行为。

```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // 直接提供 API 密钥或使用 XAI_API_KEY 环境变量
  apiKey: "your-xai-api-key", // 如果设置了环境变量，则此项为可选

  // 指定要使用的模型。默认为 'grok-2-latest'
  model: "grok-2-latest",

  // 传递给模型的附加选项
  modelOptions: {
    temperature: 0.7,
    max_tokens: 1024,
  },
});
```

`apiKey` 可以直接传递给构造函数，也可以设置为名为 `XAI_API_KEY` 的环境变量。SDK 会自动读取它。

## 基本用法

以下示例演示了如何使用 `invoke` 方法向 XAI 模型发送简单请求并接收响应。

```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // 直接提供 API 密钥或使用环境变量 XAI_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置，则此项为可选
  // 指定模型（默认为 'grok-2-latest'）
  model: "grok-2-latest",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
/* 输出：
  {
    text: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!",
    model: "grok-2-latest",
    usage: {
      inputTokens: 6,
      outputTokens: 17
    }
  }
  */
```

## 流式响应

对于需要实时交互的应用程序，您可以从模型中流式传输响应。这对于创建对话式界面非常有用，用户可以在响应生成时看到它。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  apiKey: "your-api-key",
  model: "grok-2-latest",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me about yourself" }],
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

console.log(fullText); // 输出: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!"
console.log(json); // { model: "grok-2-latest", usage: { inputTokens: 6, outputTokens: 17 } }
```

## 许可证

该软件包在 Elastic-2.0 许可下发布。