# @aigne/poe

AIGNE Poe SDK，用于在 [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) 内与 Poe 语言模型和 API 服务集成。

## 简介

`@aigne/poe` 提供了 AIGNE Framework 与 Poe 语言模型及 API 服务之间的无缝集成。该软件包使开发者能够在其 AIGNE 应用程序中轻松利用 Poe 的模型，在利用 Poe 先进的 AI 功能的同时，提供整个框架一致的接口。

```d2
direction: down

Developer: {
  shape: c4-person
}

AIGNE-Application: {
  label: "AIGNE 应用程序"
  shape: rectangle

  App-Code: {
    label: "应用程序代码\n(例如 `model.invoke()`)"
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
Poe-API -> AIGNE-Application.Dependencies.aigne-poe: "3. 返回响应\n(单个对象或流)"
AIGNE-Application.Dependencies.aigne-poe -> AIGNE-Application.App-Code: "4. 将结果交付给应用程序"
```

## 功能

*   **Poe API 集成**：直接连接到 Poe 的 API 服务。
*   **聊天补全**：支持 Poe 的聊天补全 API，并兼容所有可用模型。
*   **函数调用**：内置对函数调用功能的支持。
*   **流式响应**：支持流式响应，以实现响应更快的应用程序。
*   **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义。
*   **一致的接口**：与 AIGNE Framework 的模型接口兼容。
*   **错误处理**：强大的错误处理和重试机制。
*   **完全可配置**：提供广泛的配置选项以微调行为。

## 安装

使用您偏好的包管理器安装此软件包：

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

首先，实例化 `PoeChatModel`。构造函数接受一个 `options` 对象用于配置。

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
    <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="传递给模型 API 的额外选项，例如 `temperature`、`top_p` 等。"></x-field>
</x-field-group>

您的 API 密钥可以通过两种方式设置：
1.  直接在构造函数中设置：`new PoeChatModel({ apiKey: "your-api-key" })`
2.  作为名为 `POE_API_KEY` 的环境变量。

## 使用方法

### 基本调用

要向 Poe API 发送请求，请使用 `invoke` 方法。该方法接受一个包含 `messages` 数组的对象，并返回一个解析为模型响应的 Promise。

```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // 直接提供 API 密钥，或使用环境变量 POE_API_KEY
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
/* 输出:
  {
    text: "我由 Poe 提供支持，使用的是 Anthropic 的 Claude 3 Opus 模型。",
    model: "claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
  */
```

### 流式响应

对于实时应用程序，您可以从模型流式传输响应。在 `invoke` 方法的第二个参数中设置 `streaming: true` 选项。这将返回一个异步迭代器，在响应块可用时逐个产生。

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

console.log(fullText); // 输出: "我由 Poe 提供支持，使用的是 Anthropic 的 Claude 3 Opus 模型。"
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## 许可证

该软件包根据 [Elastic-2.0 许可证](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 获得许可。