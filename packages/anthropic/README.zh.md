# @aigne/anthropic

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/anthropic)](https://www.npmjs.com/package/@aigne/anthropic)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/anthropic)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[English](README.md) | **中文**

AIGNE Anthropic SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 中集成 Anthropic 的 Claude AI 模型。

## 简介

`@aigne/anthropic` 提供了 AIGNE 框架与 Anthropic 的 Claude 语言模型和 API 之间的无缝集成。该包使开发者能够在 AIGNE 应用程序中轻松利用 Anthropic 的 Claude 模型，同时提供框架内一致的接口，充分发挥 Claude 先进的 AI 能力。

## 特性

* **Anthropic API 集成**：使用官方 SDK 直接连接到 Anthropic 的 API 服务
* **聊天完成**：支持 Claude 的聊天完成 API 和所有可用模型
* **工具调用**：内置支持 Claude 的工具调用功能
* **流式响应**：支持流式响应，提供更高响应性的应用程序体验
* **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义
* **一致接口**：兼容 AIGNE 框架的模型接口
* **错误处理**：健壮的错误处理和重试机制
* **完整配置**：丰富的配置选项用于微调行为

## 安装

### 使用 npm

```bash
npm install @aigne/anthropic @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/anthropic @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/anthropic @aigne/core
```

## 基本用法

```typescript file="test/anthropic-chat-model.test.ts" region="example-anthropic-chat-model"
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // Provide API key directly or use environment variable ANTHROPIC_API_KEY or CLAUDE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify Claude model version (defaults to 'claude-3-7-sonnet-latest')
  model: "claude-3-haiku-20240307",
  // Configure model behavior
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
/* Output:
  {
    text: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
    model: "claude-3-haiku-20240307",
    usage: {
      inputTokens: 8,
      outputTokens: 15
    }
  }
  */
```

## 流式响应

```typescript file="test/anthropic-chat-model.test.ts" region="example-anthropic-chat-model-streaming-async-generator"
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-haiku-20240307",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me about yourself" }],
  },
  undefined,
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}

console.log(fullText); // Output: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?"
console.log(json); // { model: "claude-3-haiku-20240307", usage: { inputTokens: 8, outputTokens: 15 } }
```

## 许可证

Elastic-2.0
