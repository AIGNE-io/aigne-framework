# Anthropic

本指南介绍了如何在 AIGNE 框架内通过 `@aigne/anthropic` 包配置和使用 Anthropic 的 Claude 模型。内容涵盖 API 密钥设置、模型实例化以及调用模型以获取标准响应和流式响应。

关于模型在 AIGNE 框架中如何工作的一般性概述，请参阅 [模型核心概念](./developer-guide-core-concepts-models.md) 文档。

## 简介

`@aigne/anthropic` 包提供了 AIGNE 框架与 Anthropic 强大的 Claude 语言模型之间直接无缝的集成。这使得开发者可以通过标准化的 `ChatModel` 接口利用 Claude 3.5 Sonnet 和 Claude 3 Opus 等模型的高级功能，确保您的 Agent 应用拥有一致的体验。

该集成的关键特性包括：

*   **直接 API 集成**：利用官方 Anthropic SDK 进行可靠通信。
*   **聊天补全**：完全支持 Anthropic 的聊天补全 API。
*   **工具调用**：原生支持 Claude 的工具调用功能。
*   **流式响应**：通过处理流式输出来实现实时、响应迅速的应用程序。
*   **类型安全**：附带全面的 TypeScript 类型定义，确保开发过程的稳健性。

## 安装

首先，使用您偏好的包管理器安装 `@aigne/anthropic` 包以及核心的 AIGNE 包。

<tabs>
<tab-item title="npm">

```bash
npm install @aigne/anthropic @aigne/core
```

</tab-item>
<tab-item title="yarn">

```bash
yarn add @aigne/anthropic @aigne/core
```

</tab-item>
<tab-item title="pnpm">

```bash
pnpm add @aigne/anthropic @aigne/core
```

</tab-item>
</tabs>

## 配置

`AnthropicChatModel` 类是与 Claude 模型交互的主要入口点。要实例化它，您需要提供您的 Anthropic API 密钥，并可选择性地指定模型和其他配置。

### API 密钥

您的 Anthropic API 密钥可以通过以下三种方式之一进行配置，按以下优先顺序排列：

1.  **直接在构造函数中提供**：通过 `apiKey` 属性传入密钥。
2.  **`ANTHROPIC_API_KEY` 环境变量**：模型将自动检测并使用此变量。
3.  **`CLAUDE_API_KEY` 环境变量**：同样支持的备用环境变量。

```typescript 实例化模型 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // 选项 1：直接提供 API 密钥
  apiKey: "your-anthropic-api-key", 
  
  // 如果您的环境中设置了 ANTHROPIC_API_KEY 或 CLAUDE_API_KEY，
  // 并且没有提供 apiKey，模型将自动使用它们。
});
```

### 模型选择

您可以使用 `model` 属性指定要使用的 Claude 模型。如果未指定，默认为 `claude-3-7-sonnet-latest`。其他常见的模型参数（如 `temperature`）可以在 `modelOptions` 对象中设置。

常用模型列表包括：
*   `claude-3-5-sonnet-20240620`
*   `claude-3-opus-20240229`
*   `claude-3-sonnet-20240229`
*   `claude-3-haiku-20240307`

```typescript 模型配置 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  
  // 指定模型版本
  model: "claude-3-haiku-20240307",

  // 配置其他模型行为
  modelOptions: {
    temperature: 0.7, // 控制随机性（0.0 到 1.0）
  },
});
```

## 基本用法

要生成响应，请使用 `invoke` 方法。向模型传递一个消息列表以开始对话。该方法返回一个 Promise，该 Promise 会解析为模型的输出，包括文本响应和 token 使用情况统计。

```typescript 基本聊天补全 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  model: "claude-3-haiku-20240307",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

`result` 对象包含生成的文本和来自 API 的其他元数据。

**响应示例**

```json
{
  "text": "I am Claude, a large language model trained by Anthropic.",
  "model": "claude-3-haiku-20240307",
  "usage": {
    "inputTokens": 8,
    "outputTokens": 12
  }
}
```

## 流式响应

对于需要实时交互的应用程序，您可以在 `invoke` 方法中将 `streaming` 选项设置为 `true` 来启用流式传输。这将返回一个异步迭代器，在响应块可用时逐个产生它们。

可以使用 `isAgentResponseDelta` 工具函数来检查一个块是否包含新数据。

```typescript 流式处理示例 icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  model: "claude-3-haiku-20240307",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story about a robot." }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      process.stdout.write(text); // 当文本到达时，将其打印到控制台
      fullText += text;
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n\n--- Final Response ---");
console.log(fullText);
console.log(json);
```

此代码处理流，立即将文本块打印到控制台，并累积完整的响应和元数据。

## 总结

您现在已经掌握了在您的 AIGNE 应用程序中安装、配置和使用 Anthropic 的 Claude 模型所需的信息。您可以为简单任务执行基本调用，或为更具交互性的体验使用流式传输。

要了解有关编排多个模型和 Agent 的更多信息，请参阅 [Team Agent](./developer-guide-agents-team-agent.md) 文档。有关其他可用模型的详细信息，请访问主要的[模型](./models.md)部分。