# @aigne/open-router

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/open-router)](https://www.npmjs.com/package/@aigne/open-router)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/open-router)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[English](README.md) | **中文**

AIGNE OpenRouter SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 中通过统一 API 访问多种 AI 模型。

## 简介

`@aigne/open-router` 提供了 AIGNE 框架与 OpenRouter 统一 API 之间的无缝集成，用于访问各种 AI 模型。该包使开发者能够通过单一一致的接口轻松使用来自多个提供商（包括 OpenAI、Anthropic、Google 等）的模型，允许灵活的模型选择和备选方案。

## 特性

* **OpenRouter API 集成**：直接连接到 OpenRouter 的 API 服务
* **多提供商访问**：可访问来自 OpenAI、Anthropic、Claude、Google 等多家提供商的模型
* **统一接口**：为所有模型提供一致的接口，无论其来源
* **模型备选**：轻松配置不同模型之间的备选选项
* **聊天完成**：支持所有可用模型的聊天完成 API
* **流式响应**：支持流式响应，提供更高响应性的应用程序体验
* **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义
* **一致接口**：兼容 AIGNE 框架的模型接口
* **错误处理**：健壮的错误处理和重试机制
* **完整配置**：丰富的配置选项用于微调行为

## 安装

### 使用 npm

```bash
npm install @aigne/open-router @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/open-router @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/open-router @aigne/core
```

## 基本用法

```typescript file="test/open-router-chat-model.test.ts" region="example-openrouter-chat-model"
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // Provide API key directly or use environment variable OPEN_ROUTER_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model (defaults to 'openai/gpt-4o')
  model: "anthropic/claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
/* Output:
  {
    text: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.",
    model: "anthropic/claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
  */
```

## 使用多模型备选

```typescript
const modelWithFallbacks = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "openai/gpt-4o",
  fallbackModels: ["anthropic/claude-3-opus", "google/gemini-1.5-pro"], // 备选顺序
  modelOptions: {
    temperature: 0.7,
  },
});

// 将首先尝试 gpt-4o，如果失败则尝试 claude-3-opus，如果再失败则尝试 gemini-1.5-pro
const fallbackResult = await modelWithFallbacks.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});
```

## 流式响应

```typescript file="test/open-router-chat-model.test.ts" region="example-openrouter-chat-model-streaming"
import { isAgentResponseDelta } from "@aigne/core";
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Which model are you using?" }],
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

console.log(fullText); // Output: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic."
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## 许可证

Elastic-2.0
