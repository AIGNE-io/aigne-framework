# @aigne/gemini

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/gemini)](https://www.npmjs.com/package/@aigne/gemini)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/gemini)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[English](README.md) | **中文**

AIGNE Gemini SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 中集成 Google 的 Gemini AI 模型。

## 简介

`@aigne/gemini` 提供了 AIGNE 框架与 Google 的 Gemini 语言模型和 API 之间的无缝集成。该包使开发者能够在 AIGNE 应用程序中轻松利用 Gemini 的先进 AI 能力，同时提供框架内一致的接口，充分发挥 Google 最先进的多模态模型优势。

## 特性

* **Google Gemini API 集成**：直接连接到 Google 的 Gemini API 服务
* **聊天完成**：支持 Gemini 的聊天完成 API 和所有可用模型
* **多模态支持**：内置支持处理文本和图像输入
* **函数调用**：支持函数调用功能
* **流式响应**：支持流式响应，提供更高响应性的应用程序体验
* **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义
* **一致接口**：兼容 AIGNE 框架的模型接口
* **错误处理**：健壮的错误处理和重试机制
* **完整配置**：丰富的配置选项用于微调行为

## 安装

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

## 基本用法

```typescript file="test/gemini-chat-model.test.ts" region="example-gemini-chat-model"
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // Provide API key directly or use environment variable GOOGLE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify Gemini model version (defaults to 'gemini-1.5-pro' if not specified)
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
/* Output:
  {
    text: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
    model: "gemini-1.5-flash"
  }
  */
```

## 流式响应

```typescript file="test/gemini-chat-model.test.ts" region="example-gemini-chat-model-streaming"
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

console.log(fullText); // Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"
console.log(json); // { model: "gemini-1.5-flash" }
```

## 许可证

Elastic-2.0
