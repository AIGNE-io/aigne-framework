# @aigne/openai

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/openai)](https://www.npmjs.com/package/@aigne/openai)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/openai)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[English](README.md) | **中文**

AIGNE OpenAI SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 中集成 OpenAI 的 GPT 模型和 API 服务。

## 简介

`@aigne/openai` 提供了 AIGNE 框架与 OpenAI 强大的语言模型和 API 之间的无缝集成。该包使开发者能够在 AIGNE 应用程序中轻松利用 OpenAI 的 GPT 模型，同时提供框架内一致的接口，充分发挥 OpenAI 先进的 AI 能力。

## 特性

* **OpenAI API 集成**：使用官方 SDK 直接连接到 OpenAI 的 API 服务
* **聊天完成**：支持 OpenAI 的聊天完成 API 和所有可用模型
* **函数调用**：内置支持 OpenAI 的函数调用功能
* **流式响应**：支持流式响应，提供更高响应性的应用程序体验
* **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义
* **一致接口**：兼容 AIGNE 框架的模型接口
* **错误处理**：健壮的错误处理和重试机制
* **完整配置**：丰富的配置选项用于微调行为

## 安装

### 使用 npm

```bash
npm install @aigne/openai @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/openai @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/openai @aigne/core
```

## 基本用法

```typescript file="test/openai-chat-model.test.ts" region="example-openai-chat-model"
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // Provide API key directly or use environment variable OPENAI_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  model: "gpt-4o", // Defaults to "gpt-4o-mini" if not specified
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
/* Output:
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

## 流式响应

```typescript file="test/openai-chat-model.test.ts" region="example-openai-chat-model-stream"
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

console.log(fullText); // Output: "Hello! How can I assist you today?"
console.log(json); // { model: "gpt-4o", usage: { inputTokens: 10, outputTokens: 9 } }
```

## 许可证

Elastic-2.0
