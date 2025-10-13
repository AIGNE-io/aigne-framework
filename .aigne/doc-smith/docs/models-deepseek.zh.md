# @aigne/deepseek

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE 标志" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/deepseek)](https://www.npmjs.com/package/@aigne/deepseek)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/deepseek)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Deepseek SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)内集成 Deepseek AI 模型。

## 简介

`@aigne/deepseek` 提供了 AIGNE 框架与 Deepseek 强大的语言模型之间的无缝集成。该包使开发人员能够在其 AIGNE 应用程序中轻松利用 Deepseek 的 AI 模型，在利用 Deepseek 先进的 AI 功能的同时，提供整个框架一致的接口。

```d2
direction: down

Your-Application: {
  label: "你的应用程序"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle
  grid-columns: 2
  grid-gap: 100

  aigne-core: {
    label: "@aigne/core"
    shape: rectangle
    AIGNE-Model-Interface: {
      label: "AIGNE 模型\n接口"
      shape: rectangle
    }
  }

  aigne-deepseek: {
    label: "@aigne/deepseek"
    shape: rectangle
    DeepSeekChatModel: {
      label: "DeepSeekChatModel"
      shape: rectangle
    }
  }
}

Deepseek-API: {
  label: "Deepseek API"
  shape: rectangle
}

Your-Application -> AIGNE-Framework.aigne-deepseek.DeepSeekChatModel: "调用"
AIGNE-Framework.aigne-deepseek.DeepSeekChatModel -> AIGNE-Framework.aigne-core.AIGNE-Model-Interface: "实现" {
  style.stroke-dash: 2
}
AIGNE-Framework.aigne-deepseek.DeepSeekChatModel -> Deepseek-API: "进行 API 调用"
```

## 功能

*   **Deepseek API 集成**：直接连接到 Deepseek 的 API 服务。
*   **聊天补全**：支持 Deepseek 的聊天补全 API 及其所有可用模型。
*   **函数调用**：内置支持函数调用功能。
*   **流式响应**：支持流式响应，以实现响应更快的应用程序。
*   **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义。
*   **一致的接口**：与 AIGNE 框架的模型接口兼容。
*   **错误处理**：强大的错误处理和重试机制。
*   **完整的配置**：丰富的配置选项，用于微调行为。

## 安装

使用你喜欢的包管理器安装此包：

### npm

```bash
npm install @aigne/deepseek @aigne/core
```

### yarn

```bash
yarn add @aigne/deepseek @aigne/core
```

### pnpm

```bash
pnpm add @aigne/deepseek @aigne/core
```

## API 参考

### `DeepSeekChatModel`

`DeepSeekChatModel` 类是与 Deepseek Chat API 交互的主要接口。它扩展了来自 `@aigne/openai` 的 `OpenAIChatModel`，提供了一个熟悉的、与 OpenAI 兼容的 API 格式。

#### 构造函数

首先，创建一个 `DeepSeekChatModel` 的新实例。

```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key", // 或设置 DEEPSEEK_API_KEY 环境变量
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});
```

**参数**

<x-field-group>
    <x-field data-name="options" data-type="OpenAIChatModelOptions" data-required="false" data-desc="模型的配置选项。">
        <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="你的 Deepseek API 密钥。如果未提供，将从 `DEEPSEEK_API_KEY` 环境变量中读取。"></x-field>
        <x-field data-name="model" data-type="string" data-default="deepseek-chat" data-required="false" data-desc="用于聊天补全的模型（例如 'deepseek-chat', 'deepseek-coder'）。"></x-field>
        <x-field data-name="baseURL" data-type="string" data-default="https://api.deepseek.com" data-required="false" data-desc="Deepseek API 的基础 URL。"></x-field>
        <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="传递给模型 API 的附加选项，例如 `temperature`、`top_p` 等。"></x-field>
    </x-field>
</x-field-group>

## 基本用法

要向模型发送一个简单的请求，请使用 `invoke` 方法。

```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // 直接提供 API 密钥或使用环境变量 DEEPSEEK_API_KEY
  apiKey: "your-api-key", // 如果已在环境变量中设置，则为可选
  // 指定模型版本（默认为 'deepseek-chat'）
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
/* 输出：
  {
    text: "Hello! I'm an AI assistant powered by DeepSeek's language model.",
    model: "deepseek-chat",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
*/
```

## 流式响应

对于实时应用程序，你可以从模型中流式传输响应。在 `invoke` 调用中设置 `streaming: true` 选项，以便在数据块可用时接收它们。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key",
  model: "deepseek-chat",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
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

console.log(fullText); // 输出："Hello! I'm an AI assistant powered by DeepSeek's language model."
console.log(json); // { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

## 许可证

本软件包根据 [Elastic-2.0 许可证](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 获得许可。