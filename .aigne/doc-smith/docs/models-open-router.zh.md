# OpenRouter

通过单一、统一的 OpenRouter API，访问来自多个提供商的多样化 AI 模型市场。`@aigne/open-router` 包提供了 AIGNE 框架与 OpenRouter 之间的无缝集成，让您可以通过一致的接口轻松使用来自 OpenAI、Anthropic、Google 等公司的模型。

这种方法简化了模型管理，可以灵活选择并设置备用选项，以确保您的应用程序保持稳健。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter.png" alt="AIGNE OpenRouter Architecture Diagram" />
</picture>

## 功能

*   **多提供商访问**：通过单一 API 连接来自 OpenAI、Anthropic、Google 等数十家提供商的模型。
*   **统一接口**：无论模型来自哪个提供商，都使用一致的 API。
*   **模型备用**：轻松配置备用模型，以便在主模型选择失败时使用。
*   **聊天补全**：完全支持标准聊天补全 API。
*   **流式响应**：获取实时的、逐个 token 的响应，以获得更具交互性的体验。
*   **完全配置**：提供丰富的选项来微调模型行为，包括温度和其他参数。

## 安装

首先，在您的项目中安装必要的 AIGNE 包。

```bash NPM
npm install @aigne/open-router @aigne/core
```

```bash Yarn
yarn add @aigne/open-router @aigne/core
```

```bash PNPM
pnpm add @aigne/open-router @aigne/core
```

## 配置

创建 `OpenRouterChatModel` 实例时，您可以提供多个选项来自定义其行为。您的 OpenRouter API 密钥可以直接在构造函数中传递，也可以设置为名为 `OPEN_ROUTER_API_KEY` 的环境变量。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenRouter API 密钥。如果未提供，系统将查找 `OPEN_ROUTER_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="openai/gpt-4o" data-required="false">
    <x-field-desc markdown>您想使用的模型的标识符，例如 `anthropic/claude-3-opus`。默认为 `openai/gpt-4o`。</x-field-desc>
  </x-field>
  <x-field data-name="fallbackModels" data-type="string[]" data-required="false">
    <x-field-desc markdown>一个模型标识符数组，用作主模型失败时的备用选项。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://openrouter.ai/api/v1" data-required="false">
    <x-field-desc markdown>OpenRouter API 的基础 URL。通常您不需要更改此项。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>传递给模型的附加选项，例如 `temperature`、`max_tokens` 等。</x-field-desc>
  </x-field>
</x-field-group>

## 基本用法

以下是一个如何使用 `OpenRouterChatModel` 获取响应的简单示例。

```typescript Basic Chat Completion icon=logos:typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // 直接提供 API 密钥或使用环境变量 OPEN_ROUTER_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置，则为可选
  // 指定模型（默认为 'openai/gpt-4o'）
  model: "anthropic/claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

**输出：**

```json Output
{
  text: "我由 OpenRouter 提供支持，使用的是 Anthropic 的 Claude 3 Opus 模型。",
  model: "anthropic/claude-3-opus",
  usage: {
    inputTokens: 5,
    outputTokens: 14
  }
}
```

## 使用带有备用选项的多个模型

您可以指定一个备用模型列表，如果主模型请求失败，将按顺序尝试这些模型。这可以增强您应用程序的弹性。

```typescript Fallback Configuration icon=logos:typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const modelWithFallbacks = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "openai/gpt-4o",
  fallbackModels: ["anthropic/claude-3-opus", "google/gemini-1.5-pro"], // 备用顺序
  modelOptions: {
    temperature: 0.7,
  },
});

// 将首先尝试 gpt-4o，如果失败则尝试 claude-3-opus，然后是 gemini-1.5-pro
const fallbackResult = await modelWithFallbacks.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(fallbackResult);
```

## 流式响应

对于需要实时反馈的应用程序（如聊天机器人），您可以逐个 token 地流式传输响应。

```typescript Streaming Example icon=logos:typescript
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

console.log(fullText);
console.log(json);
```

**输出：**

```text Text Output
我由 OpenRouter 提供支持，使用的是 Anthropic 的 Claude 3 Opus 模型。
```
```json JSON Output
{ model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## 总结

OpenRouter 集成提供了一种强大的方式，通过简单、统一的接口访问庞大的 AI 模型生态系统。要探索其他可用模型，请查看主要的 [AI 模型](./models.md) 页面，或深入了解像 [OpenAI](./models-openai.md) 和 [Anthropic](./models-anthropic.md) 这样的特定提供商。