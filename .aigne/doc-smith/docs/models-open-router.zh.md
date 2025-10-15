# OpenRouter

OpenRouter 是一个统一的网关，可以访问来自 OpenAI、Anthropic 和 Google 等不同提供商的多种 AI 模型。`@aigne/open-router` 包提供了一个标准化接口，用于将这些模型集成到 AIGNE 框架中。这使得开发人员只需最少的代码更改即可在不同模型之间切换，并实现强大的回退机制。

本指南详细介绍了安装、配置和使用 `@aigne/open-router` 包以利用多种 AI 模型的过程。

```d2
direction: down

Application: {
  label: "你的应用程序"
  shape: rectangle
}

aigne-open-router: {
  label: "@aigne/open-router"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

OpenRouter-Service: {
  label: "OpenRouter 服务"
  shape: rectangle
}

Providers: {
  label: "模型提供商"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  OpenAI: {
    shape: rectangle
    "GPT-4": {}
    "GPT-3.5": {}
  }

  Google: {
    shape: rectangle
    "Gemini Pro": {}
  }

  Anthropic: {
    shape: rectangle
    "Claude 3": {}
  }
}

Application -> aigne-open-router: "1. 使用 API 密钥进行配置"
aigne-open-router -> OpenRouter-Service: "2. 使用模型 ID 发出 API 请求"
OpenRouter-Service -> Providers: "3. 路由到提供商"
Providers -> OpenRouter-Service: "4. 提供商响应"
OpenRouter-Service -> aigne-open-router: "5. 统一响应"
aigne-open-router -> Application: "6. 返回结果"
```

## 安装

首先，安装 `@aigne/open-router` 和 `@aigne/core` 包。以下命令演示了如何使用 npm、yarn 和 pnpm 进行安装。

```bash npm
npm install @aigne/open-router @aigne/core
```

```bash yarn
yarn add @aigne/open-router @aigne/core
```

```bash pnpm
pnpm add @aigne/open-router @aigne/core
```

## 配置和使用

`OpenRouterChatModel` 类是与 OpenRouter API 交互的主要接口。要使用它，您必须提供您的 OpenRouter API 密钥。这可以直接在构造函数中通过 `apiKey` 选项提供，也可以通过设置 `OPEN_ROUTER_API_KEY` 环境变量来提供。

### 基本示例

下面是使用 `OpenRouterChatModel` 发送聊天请求的标准实现。此示例使用了 Anthropic 的 `claude-3-opus` 模型。

```typescript 基本用法 icon=logos:typescript
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

预期输出将包含文本响应、模型标识符和 token 使用指标。

```json 输出 icon=mdi:code-json
{
  "text": "I am currently using the anthropic/claude-3-opus model, accessed through OpenRouter.",
  "model": "anthropic/claude-3-opus",
  "usage": {
    "inputTokens": 15,
    "outputTokens": 23
  }
}
```

### 构造函数选项

`OpenRouterChatModel` 继承自 `@aigne/openai` 包的 `OpenAIChatModel`，并接受相同的构造函数选项。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenRouter API 密钥。如果未提供，客户端将检查 `OPEN_ROUTER_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="openai/gpt-4o" data-required="false">
    <x-field-desc markdown>您希望使用的模型的标识符（例如 `anthropic/claude-3-opus`）。</x-field-desc>
  </x-field>
  <x-field data-name="fallbackModels" data-type="string[]" data-required="false">
    <x-field-desc markdown>一个模型标识符数组，用作主模型失败时的回退选项。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://openrouter.ai/api/v1" data-required="false">
    <x-field-desc markdown>OpenRouter API 的基础 URL。可以为测试或代理覆盖此 URL。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>一个包含要传递给模型提供商的参数的对象，例如 `temperature`、`max_tokens` 或 `top_p`。</x-field-desc>
  </x-field>
</x-field-group>

## 使用多种模型及回退机制

`@aigne/open-router` 包的一个关键特性是能够指定回退模型。如果主模型请求失败，系统将自动使用 `fallbackModels` 列表中的下一个模型重试请求。这确保了更高的应用程序可靠性。

```typescript 模型回退 icon=logos:typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const modelWithFallbacks = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "openai/gpt-4o",
  fallbackModels: ["anthropic/claude-3-opus", "google/gemini-1.5-pro"], // 回退顺序
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

对于需要实时交互的应用程序，您可以启用流式传输，以便在响应块可用时进行处理。在 `invoke` 方法中设置 `streaming: true` 选项。

必须遍历响应流以组装完整的消息。

```typescript 流式传输示例 icon=logos:typescript
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

最终的 `fullText` 和 `json` 对象将包含聚合后的响应数据。

```text 输出 icon=mdi:console
I am currently using the anthropic/claude-3-opus model, accessed through OpenRouter.
{ model: 'anthropic/claude-3-opus', usage: { inputTokens: 15, outputTokens: 23 } }
```

## 总结

`@aigne/open-router` 包通过一个统一且具有弹性的接口，简化了对多种语言模型的访问。通过利用模型回退和流式传输等特性，您可以构建更强大、响应更快的 AI 应用程序。

有关 AIGNE 框架中模型基本概念的更多信息，请参阅[模型概述](./models-overview.md)。