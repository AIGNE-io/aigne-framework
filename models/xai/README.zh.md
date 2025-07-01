# @aigne/xai

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/xai)](https://www.npmjs.com/package/@aigne/xai)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/xai)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[English](README.md) | **中文**

AIGNE XAI SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 中集成 XAI 语言模型和 API 服务。

## 简介

`@aigne/xai` 提供了 AIGNE 框架与 XAI 的语言模型和 API 服务之间的无缝集成。该包使开发者能够在 AIGNE 应用程序中轻松利用 XAI 的模型，同时提供框架内一致的接口，充分发挥 XAI 先进的 AI 能力。

## 特性

* **XAI API 集成**：直接连接到 XAI 的 API 服务
* **聊天完成**：支持 XAI 的聊天完成 API 和所有可用模型
* **函数调用**：内置支持函数调用功能
* **流式响应**：支持流式响应，提供更高响应性的应用程序体验
* **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义
* **一致接口**：兼容 AIGNE 框架的模型接口
* **错误处理**：健壮的错误处理和重试机制
* **完整配置**：丰富的配置选项用于微调行为

## 安装

### 使用 npm

```bash
npm install @aigne/xai @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/xai @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/xai @aigne/core
```

## 基本用法

```typescript file="test/xai-chat-model.test.ts" region="example-xai-chat-model"
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // Provide API key directly or use environment variable XAI_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model (defaults to 'grok-2-latest')
  model: "grok-2-latest",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
/* Output:
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

```typescript file="test/xai-chat-model.test.ts" region="example-xai-chat-model-streaming"
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

console.log(fullText); // Output: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!"
console.log(json); // { model: "grok-2-latest", usage: { inputTokens: 6, outputTokens: 17 } }
```

## 许可证

Elastic-2.0
