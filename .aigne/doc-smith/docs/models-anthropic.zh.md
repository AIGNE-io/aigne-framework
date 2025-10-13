# @aigne/anthropic

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE 徽标" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/anthropic)](https://www.npmjs.com/package/@aigne/anthropic)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/anthropic)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Anthropic SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)内与 Claude AI 模型集成。

## 简介

`@aigne/anthropic` 提供了 AIGNE 框架与 Anthropic 的 Claude 语言模型之间的无缝集成。该软件包使开发人员能够在其 AIGNE 应用程序中轻松利用 Anthropic 的强大模型，提供一致的接口，同时利用 Claude 先进的 AI 功能。

此图说明了 `@aigne/anthropic` 软件包如何将您的 AIGNE 应用程序连接到 Anthropic API 及其底层的 Claude 模型。

```d2
direction: down

AIGNE-Application: {
  label: "AIGNE 应用"
  shape: rectangle

  AIGNE-Framework: {
    label: "AIGNE 框架"
    icon: "https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg"
    shape: rectangle

    aigne-anthropic: {
      label: "@aigne/anthropic"
      shape: rectangle
    }
  }
}

Anthropic-Service: {
  label: "Anthropic 服务"
  shape: rectangle

  Anthropic-API: {
    label: "Anthropic API"
  }

  Claude-Models: {
    label: "Claude 模型"
    claude-3-haiku: "claude-3-haiku"
    claude-3-sonnet: "claude-3-sonnet"
  }
}

AIGNE-Application.AIGNE-Framework.aigne-anthropic -> Anthropic-Service.Anthropic-API: "通过 SDK 集成"
Anthropic-Service.Anthropic-API -> Anthropic-Service.Claude-Models: "访问"
```

## 功能

*   **Anthropic API 集成**：使用官方 SDK 直接连接到 Anthropic 的 API 服务。
*   **聊天补全**：全面支持 Claude 的聊天补全 API，涵盖所有可用模型。
*   **工具调用**：内置支持 Claude 强大的工具调用功能。
*   **流式响应**：支持流式传输，以实现响应更迅速的实时应用。
*   **类型安全**：为所有 API、模型和选项提供全面的 TypeScript 类型定义。
*   **一致的接口**：遵循 AIGNE 框架的统一模型接口，以实现跨提供商的兼容性。
*   **强大的错误处理**：包含内置的错误处理和重试机制。
*   **完整的配置**：提供丰富的选项，用于微调模型行为和客户端设置。

## 安装

要开始使用，请使用您偏好的包管理器安装 `@aigne/anthropic` 和 `@aigne/core` 包。

### npm

```bash
npm install @aigne/anthropic @aigne/core
```

### yarn

```bash
yarn add @aigne/anthropic @aigne/core
```

### pnpm

```bash
pnpm add @aigne/anthropic @aigne/core
```

## 配置

`AnthropicChatModel` 可以在实例化时进行配置。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // 如果您的环境中设置了 ANTHROPIC_API_KEY 或 CLAUDE_API_KEY，则 API 密钥是可选的
  apiKey: "your-anthropic-api-key",

  // 指定模型 ID。默认为 'claude-3-7-sonnet-latest'
  model: "claude-3-haiku-20240307",

  // 配置默认模型参数
  modelOptions: {
    temperature: 0.7,
    topP: 1.0,
  },
  
  // 将自定义选项传递给底层的 Anthropic SDK 客户端
  clientOptions: {
    timeout: 600000, // 10 分钟
  }
});
```

### 配置选项

<x-field-group>
    <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="您的 Anthropic API 密钥。如果未提供，SDK 将检查 `ANTHROPIC_API_KEY` 或 `CLAUDE_API_KEY` 环境变量。"></x-field>
    <x-field data-name="model" data-type="string" data-required="false" data-desc="用于请求的默认模型 ID。默认为 `claude-3-7-sonnet-latest`。"></x-field>
    <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="模型的默认参数。">
        <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制随机性。值越低，模型越确定。"></x-field>
        <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心采样阈值。"></x-field>
        <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="是否允许模型并行调用多个工具。"></x-field>
    </x-field>
    <x-field data-name="clientOptions" data-type="object" data-required="false" data-desc="直接传递给 Anthropic SDK 客户端的高级选项，例如 `timeout` 或 `baseURL`。"></x-field>
</x-field-group>

## 基本用法

这是一个如何调用模型以获得聊天补全的基本示例。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-api-key", // 或在环境中设置 ANTHROPIC_API_KEY
  model: "claude-3-haiku-20240307",
});

async function getGreeting() {
  const result = await model.invoke({
    messages: [{ role: "user", content: "Write a short, friendly greeting." }],
  });

  console.log(result.text);
}

getGreeting();
/* Output:
Hello there! It's a pleasure to meet you. How can I help you today?
*/
```

## 流式响应

对于需要实时输出的应用，您可以流式传输模型的响应。当设置 `streaming: true` 时，`invoke` 方法会返回一个 `AsyncGenerator`。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-haiku-20240307",
});

async function streamStory() {
  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Tell me a short story about a robot." }],
    },
    { streaming: true },
  );

  let fullText = "";
  process.stdout.write("故事：");
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) {
        fullText += text;
        process.stdout.write(text);
      }
    }
  }
  console.log("\n\n已接收完整故事。");
}

streamStory();
```

## 工具调用

`AnthropicChatModel` 支持工具调用，允许模型请求执行您定义的函数。

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { z } from "zod";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-opus-20240229", // 推荐使用 Opus 进行复杂的工具调用
});

async function callWeatherTool() {
  const result = await model.invoke({
    messages: [{ role: "user", content: "What's the weather like in San Francisco?" }],
    tools: [
      {
        type: "function",
        function: {
          name: "getCurrentWeather",
          description: "Get the current weather for a specific location",
          parameters: z.object({
            location: z.string().describe("The city and state, e.g., San Francisco, CA"),
          }),
        },
      },
    ],
    toolChoice: "auto", // 可以是 "auto"、"required"、"none" 或特定工具
  });

  if (result.toolCalls && result.toolCalls.length > 0) {
    const toolCall = result.toolCalls[0];
    console.log("请求工具调用：", toolCall.function.name);
    console.log("参数：", toolCall.function.arguments);
    // 在实际应用中，您会在此处执行该工具
  } else {
    console.log("未进行工具调用。");
    console.log("响应：", result.text);
  }
}

callWeatherTool();
/* Output:
Tool call requested: getCurrentWeather
Arguments: { location: 'San Francisco, CA' }
*/
```

## 许可证

本项目根据 [Elastic-2.0 许可证](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)进行许可。