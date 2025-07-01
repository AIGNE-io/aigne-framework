# @aigne/ollama

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/ollama)](https://www.npmjs.com/package/@aigne/ollama)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/ollama)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[English](README.md) | **中文**

AIGNE Ollama SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 中通过 Ollama 集成本地托管的 AI 模型。

## 简介

`@aigne/ollama` 提供了 AIGNE 框架与通过 Ollama 本地托管的 AI 模型之间的无缝集成。该包使开发者能够在 AIGNE 应用程序中轻松利用通过 Ollama 在本地运行的开源语言模型，同时提供框架内一致的接口，并提供私有、离线的 AI 能力访问。

## 特性

* **Ollama 集成**：直接连接到本地 Ollama 实例
* **本地模型支持**：支持通过 Ollama 托管的各种开源模型
* **聊天完成**：支持所有可用 Ollama 模型的聊天完成 API
* **流式响应**：支持流式响应，提供更高响应性的应用程序体验
* **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义
* **一致接口**：兼容 AIGNE 框架的模型接口
* **注重隐私**：本地运行模型，无需将数据发送到外部 API 服务
* **完整配置**：丰富的配置选项用于微调行为

## 安装

### 使用 npm

```bash
npm install @aigne/ollama @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/ollama @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/ollama @aigne/core
```

## 前提条件

在使用此包之前，您需要在机器上安装并运行 [Ollama](https://ollama.ai/)，并至少拉取一个模型。请按照 [Ollama 网站](https://ollama.ai/) 上的说明设置 Ollama。

## 基本用法

```typescript file="test/ollama-chat-model.test.ts" region="example-ollama-chat-model"
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  // Specify base URL (defaults to http://localhost:11434)
  baseURL: "http://localhost:11434",
  // Specify Ollama model to use (defaults to 'llama3')
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
/* Output:
  {
    text: "I'm an AI assistant running on Ollama with the llama3 model.",
    model: "llama3"
  }
  */
```

## 流式响应

```typescript file="test/ollama-chat-model.test.ts" region="example-ollama-chat-model-streaming"
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  baseURL: "http://localhost:11434",
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me what model you're using" }],
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

console.log(fullText); // Output: "I'm an AI assistant running on Ollama with the llama3 model."
console.log(json); // { model: "llama3" }
```

## 许可证

Elastic-2.0
