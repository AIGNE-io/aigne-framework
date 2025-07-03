# @aigne/bedrock

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/bedrock)](https://www.npmjs.com/package/@aigne/bedrock)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/bedrock)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[English](README.md) | **中文**

AIGNE AWS Bedrock SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 中集成 AWS 基础模型。

## 简介

`@aigne/bedrock` 提供了 AIGNE 框架与 AWS Bedrock 基础模型之间的无缝集成。该包使开发者能够在 AIGNE 应用程序中轻松利用 AWS Bedrock 提供的各种 AI 模型，同时提供框架内一致的接口，充分发挥 AWS 安全可扩展的基础设施优势。

## 特性

* **AWS Bedrock 集成**：使用官方 AWS SDK 直接连接到 AWS Bedrock 服务
* **多模型支持**：通过 AWS Bedrock 访问 Claude、Llama、Titan 等基础模型
* **聊天完成**：支持所有可用 Bedrock 模型的聊天完成 API
* **流式响应**：支持流式响应，提供更高响应性的应用程序体验
* **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义
* **一致接口**：兼容 AIGNE 框架的模型接口
* **错误处理**：健壮的错误处理和重试机制
* **完整配置**：丰富的配置选项用于微调行为

## 安装

### 使用 npm

```bash
npm install @aigne/bedrock @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/bedrock @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/bedrock @aigne/core
```

## 基本用法

```typescript file="test/bedrock-chat-model.test.ts" region="example-bedrock-chat-model"
import { BedrockChatModel } from "@aigne/bedrock";

const model = new BedrockChatModel({
  // Provide API key directly or use environment variable AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
  accessKeyId: "",
  secretAccessKey: "",
  model: "us.amazon.nova-premier-v1:0",
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

```typescript file="test/bedrock-chat-model.test.ts" region="example-bedrock-chat-model-streaming"
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

const model = new BedrockChatModel({
  // Provide API key directly or use environment variable AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
  accessKeyId: "",
  secretAccessKey: "",
  model: "us.amazon.nova-premier-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
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
