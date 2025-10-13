本文档为开发者提供了一份全面的指南，旨在帮助他们集成 `@aigne/open-router` 包。您将学习如何安装、配置和使用该包，以便通过统一的接口利用各种 AI 模型。

# @aigne/open-router

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)"/>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)"/>
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE 标志" width="400" />
  </picture>
</p>

`@aigne/open-router` 提供了 AIGNE 框架与 OpenRouter 统一 API 之间的无缝集成。这使得开发者可以通过单一、一致的接口访问来自 OpenAI、Anthropic 和 Google 等提供商的大量 AI 模型，从而简化模型选择并实现稳健的备用配置。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter-dark.png" media="(prefers-color-scheme: dark)"/>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter.png" media="(prefers-color-scheme: light)"/>
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-openrouter.png" alt="AIGNE OpenRouter 架构图" />
</picture>

## 功能特性

*   **统一 API**：通过单一、一致的接口访问数十家提供商的模型。
*   **模型备用**：当主模型失败时，自动切换到备用模型。
*   **流式支持**：通过流式响应，支持实时、响应迅速的应用程序。
*   **AIGNE 框架兼容性**：与 `@aigne/core` 的模型接口完美集成。
*   **丰富的配置选项**：通过广泛的选项微调模型行为。
*   **类型安全**：受益于所有 API 和模型的全面 TypeScript 类型定义。

## 安装

要开始使用，请使用您偏好的包管理器安装所需包：

### npm

```bash
npm install @aigne/open-router @aigne/core
```

### yarn

```bash
yarn add @aigne/open-router @aigne/core
```

### pnpm

```bash
pnpm add @aigne/open-router @aigne/core
```

## 配置与基本用法

该包的主要导出是 `OpenRouterChatModel`。它扩展了 `@aigne/openai` 包的 `OpenAIChatModel`，因此接受相同的选项。

要配置该模型，您需要提供您的 OpenRouter API 密钥。您可以通过直接将其传递给构造函数或设置 `OPEN_ROUTER_API_KEY` 环境变量来实现。

以下是如何实例化和使用该模型的基本示例：

```typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // 直接提供 API 密钥或使用环境变量 OPEN_ROUTER_API_KEY
  apiKey: "your-api-key", // 如果已在环境变量中设置，则此项为可选
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
/* 输出:
  {
    text: "我由 OpenRouter 驱动，使用的是 Anthropic 的 Claude 3 Opus 模型。",
    model: "anthropic/claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
*/
```

## 流式响应

对于需要实时交互的应用程序，您可以启用流式传输，以在响应块生成时接收它们。在 `invoke` 方法中设置 `streaming: true` 选项。

```typescript
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

console.log(fullText); // 输出: "我由 OpenRouter 驱动，使用的是 Anthropic 的 Claude 3 Opus 模型。"
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## 使用带备用机制的多个模型

`@aigne/open-router` 的一个关键特性是能够配置备用模型。如果主模型因任何原因（例如 API 错误、速率限制）失败，系统将自动尝试指定列表中的下一个模型。

您可以使用 `fallbackModels` 选项定义备用顺序。

```typescript
const modelWithFallbacks = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "openai/gpt-4o",
  fallbackModels: ["anthropic/claude-3-opus", "google/gemini-1.5-pro"], // 备用顺序
  modelOptions: {
    temperature: 0.7,
  },
});

// 将首先尝试 gpt-4o，如果失败则尝试 claude-3-opus，再失败则尝试 gemini-1.5-pro
const fallbackResult = await modelWithFallbacks.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});
```

下图说明了备用逻辑：

```d2
direction: down

Your-App: {
  label: "你的应用"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  aigne-open-router: {
    label: "@aigne/open-router"
  }
}

OpenRouter-API: {
  label: "OpenRouter API"
  shape: rectangle
}

Model-Providers: {
  label: "模型提供商"
  shape: rectangle
  grid-columns: 3

  OpenAI: {
    label: "OpenAI\n(gpt-4o)"
    shape: cylinder
  }
  Anthropic: {
    label: "Anthropic\n(claude-3-opus)"
    shape: cylinder
  }
  Google: {
    label: "Google\n(gemini-1.5-pro)"
    shape: cylinder
  }
}

Your-App -> AIGNE-Framework.aigne-open-router: "1. invoke()"

AIGNE-Framework.aigne-open-router -> OpenRouter-API: "2. 尝试主模型"
OpenRouter-API -> Model-Providers.OpenAI

Model-Providers.OpenAI -> AIGNE-Framework.aigne-open-router: {
  label: "3. 失败"
  style: {
    stroke-dash: 2
  }
}
AIGNE-Framework.aigne-open-router -> OpenRouter-API: {
  label: "4. 尝试备用模型 1"
  style: {
    stroke-dash: 2
  }
}
OpenRouter-API -> Model-Providers.Anthropic

Model-Providers.Anthropic -> AIGNE-Framework.aigne-open-router: {
  label: "5. 失败"
  style: {
    stroke-dash: 2
  }
}
AIGNE-Framework.aigne-open-router -> OpenRouter-API: {
  label: "6. 尝试备用模型 2"
  style: {
    stroke-dash: 2
  }
}
OpenRouter-API -> Model-Providers.Google

Model-Providers.Google -> AIGNE-Framework.aigne-open-router: "7. 成功"
AIGNE-Framework.aigne-open-router -> Your-App: "8. 返回响应"

```