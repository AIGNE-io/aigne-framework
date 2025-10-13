# @aigne/poe

AIGNE Poe SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)内与 Poe 语言模型和 API 服务集成。

## 简介

`@aigne/poe` 提供了 AIGNE 框架与 Poe 语言模型及 API 服务之间的无缝集成。该包使开发者能够在其 AIGNE 应用中轻松利用 Poe 的模型，在整个框架内提供一致的接口，同时利用 Poe 先进的 AI 功能。

```d2
direction: down

Developer: {
  shape: c4-person
  label: "开发者"
}

AIGNE-Application: {
  label: "AIGNE 应用"
  shape: rectangle

  App-Code: {
    label: "应用代码\n(例如 `model.invoke()`)"
    shape: rectangle
  }

  Dependencies: {
    label: "依赖项"
    shape: rectangle

    aigne-core: {
      label: "@aigne/core"
      shape: rectangle
    }

    aigne-poe: {
      label: "@aigne/poe\n(PoeChatModel)"
      shape: rectangle
    }
  }
}

Poe-API: {
  label: "Poe API 服务"
  shape: cylinder

  Poe-Models: {
    label: "Poe 语言模型\n(例如 claude-3-opus)"
    shape: rectangle
  }
}

Developer -> AIGNE-Application.App-Code: "编写并运行代码"
AIGNE-Application.Dependencies.aigne-poe -> AIGNE-Application.Dependencies.aigne-core: "依赖并实现\n核心接口"
AIGNE-Application.App-Code -> AIGNE-Application.Dependencies.aigne-poe: "1. 调用 'invoke()'"
AIGNE-Application.Dependencies.aigne-poe -> Poe-API: "2. 发送 API 请求"
Poe-API -> AIGNE-Application.Dependencies.aigne-poe: "3. 返回响应\n（单个对象或流）"
AIGNE-Application.Dependencies.aigne-poe -> AIGNE-Application.App-Code: "4. 将结果交付给应用"
```

## 功能特性

*   **Poe API 集成**：直接连接到 Poe 的 API 服务。
*   **聊天补全**：支持 Poe 的聊天补全 API，并涵盖所有可用模型。
*   **函数调用**：内置对函数调用功能的支持。
*   **流式响应**：支持流式响应，以实现更具响应性的应用。
*   **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义。
*   **一致的接口**：与 AIGNE 框架的模型接口兼容。
*   **错误处理**：稳健的错误处理和重试机制。
*   **完整的配置**：提供广泛的配置选项，用于微调行为。

## 安装

使用你偏好的包管理器安装此包：

### npm

```bash
npm install @aigne/poe @aigne/core
```

### yarn

```bash
yarn add @aigne/poe @aigne/core
```

### pnpm

```bash
pnpm add @aigne/poe @aigne/core
```

## 配置

首先，实例化 `PoeChatModel`。构造函数接受一个 `options` 对象进行配置。

```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // 选项
});
```

**构造函数选项**

<x-field-group>
    <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="您的 Poe API 密钥。如果未提供，SDK 将使用 `POE_API_KEY` 环境变量。"></x-field>
    <x-field data-name="model" data-type="string" data-required="false" data-default="'gpt-5-mini'" data-desc="用于补全的特定 Poe 模型（例如 'claude-3-opus'）。"></x-field>
    <x-field data-name="baseURL" data-type="string" data-required="false" data-default="'https://api.poe.com/v1'" data-desc="Poe API 的基础 URL。"></x-field>
    <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="传递给模型 API 的附加选项，例如 `temperature`、`top_p` 等。"></x-field>
</x-field-group>

您的 API 密钥可以通过以下两种方式设置：
1.  直接在构造函数中设置：`new PoeChatModel({ apiKey: "your-api-key" })`
2.  作为名为 `POE_API_KEY` 的环境变量。

## 使用方法

### 基本调用

要向 Poe API 发送请求，请使用 `invoke` 方法。它接受一个包含 `messages` 数组的对象，并返回一个解析为模型响应的 promise。

```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // 直接提供 API 密钥或使用环境变量 POE_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置了，则此项为可选
  // 指定模型（默认为 'gpt-5-mini'）
  model: "claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
/* 输出：
  {
    text: "I'm powered by Poe, using the Claude 3 Opus model from Anthropic.",
    model: "claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
  */
```

### 流式响应

对于实时应用，您可以流式传输来自模型的响应。在 `invoke` 方法的第二个参数中设置 `streaming: true` 选项。这将返回一个异步迭代器，它会在响应块可用时逐个生成。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  apiKey: "your-api-key",
  model: "claude-3-opus",
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

console.log(fullText); // 输出: "I'm powered by Poe, using the Claude 3 Opus model from Anthropic."
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## 许可证

本包采用 [Elastic-2.0 许可证](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 授权。