# @aigne/deepseek

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/deepseek)](https://www.npmjs.com/package/@aigne/deepseek)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/deepseek)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[English](README.md) | **中文**

AIGNE Deepseek SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 中集成 Deepseek AI 模型。

## 简介

`@aigne/deepseek` 提供了 AIGNE 框架与 Deepseek 强大的语言模型和 API 之间的无缝集成。该包使开发者能够在 AIGNE 应用程序中轻松利用 Deepseek 的 AI 模型，同时提供框架内一致的接口，充分发挥 Deepseek 先进的 AI 能力。

## 特性

* **Deepseek API 集成**：直接连接到 Deepseek 的 API 服务
* **聊天完成**：支持 Deepseek 的聊天完成 API 和所有可用模型
* **函数调用**：内置支持函数调用功能
* **流式响应**：支持流式响应，提供更高响应性的应用程序体验
* **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义
* **一致接口**：兼容 AIGNE 框架的模型接口
* **错误处理**：健壮的错误处理和重试机制
* **完整配置**：丰富的配置选项用于微调行为

## 安装

### 使用 npm

```bash
npm install @aigne/deepseek @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/deepseek @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/deepseek @aigne/core
```

## 基本用法

```typescript file="test/deepseek-chat-model.test.ts" region="example-deepseek-chat-model"
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // Provide API key directly or use environment variable DEEPSEEK_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model version (defaults to 'deepseek-chat')
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
/* Output:
  {
    text: "Hello! I'm an AI assistant powered by DeepSeek's language model.",
    model: "deepseek-chat",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
  */
```

## 流式响应

```typescript file="test/deepseek-chat-model.test.ts" region="example-deepseek-chat-model-streaming"
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

console.log(fullText); // Output: "Hello! I'm an AI assistant powered by DeepSeek's language model."
console.log(json); // { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

## 许可证

Elastic-2.0
