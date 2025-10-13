本文档为 `@aigne/openai` 包提供了一份全面的使用指南，该 SDK 旨在实现 AIGNE 框架与 OpenAI GPT 模型的无缝集成。

<div align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE 徽标" width="400" />
  </picture>
</div>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/openai)](https://www.npmjs.com/package/@aigne/openai)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/openai)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

### 简介

`@aigne/openai` 提供了 AIGNE 框架与 OpenAI 强大语言模型之间的无缝集成。该包使开发人员能够在其 AIGNE 应用程序中轻松利用 OpenAI 的 GPT 模型，在利用 OpenAI 先进 AI 能力的同时，在整个框架内提供一致的接口。

### 架构

`@aigne/openai` 包作为一个连接器，允许 AIGNE 框架直接与 OpenAI API 通信。这种集成使您能够将 OpenAI 的先进模型无缝地整合到您的 AIGNE 应用程序中。
<diagram>
```d2
direction: down

Developer: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"

  AIGNE-Application: {
    label: "AIGNE 应用程序"
    shape: rectangle
  }

  aigne-openai: {
    label: "@aigne/openai\n（连接器）"
    shape: rectangle
  }
}

OpenAI-API: {
  label: "OpenAI API\n（GPT 模型）"
  shape: rectangle
}

Developer -> AIGNE-Framework.AIGNE-Application: "构建"
AIGNE-Framework.AIGNE-Application -> AIGNE-Framework.aigne-openai: "使用"
AIGNE-Framework.aigne-openai -> OpenAI-API: "API 调用"
```
</diagram>

## 功能特性

*   **OpenAI API 集成**：使用官方 SDK 直接连接到 OpenAI 的 API 服务。
*   **聊天补全**：支持 OpenAI 的聊天补全 API，并兼容所有可用模型。
*   **函数调用**：内置支持 OpenAI 的函数调用功能。
*   **流式响应**：支持流式响应，以实现更具响应性的应用程序。
*   **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义。
*   **一致的接口**：与 AIGNE 框架的模型接口兼容。
*   **错误处理**：强大的错误处理和重试机制。
*   **全面配置**：提供广泛的配置选项以微调行为。

## 安装

使用您偏好的包管理器安装此包及其核心依赖项：

### npm

```bash
npm install @aigne/openai @aigne/core
```

### yarn

```bash
yarn add @aigne/openai @aigne/core
```

### pnpm

```bash
pnpm add @aigne/openai @aigne/core
```

## API 参考

`@aigne/openai` 包公开了两个用于与 OpenAI 服务交互的主要类：`OpenAIChatModel` 和 `OpenAIImageModel`。

### OpenAIChatModel

`OpenAIChatModel` 类提供了对 OpenAI 聊天补全功能的访问，包括文本生成、工具使用、JSON 结构化输出和图像理解。

#### 配置

您可以通过向 `OpenAIChatModel` 的构造函数传递一个 `OpenAIChatModelOptions` 对象来对其进行配置。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="您的 OpenAI API 密钥。如果未提供，将回退使用 `OPENAI_API_KEY` 环境变量。"></x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="OpenAI API 的可选基础 URL，适用于代理。"></x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false" data-desc="用于聊天补全的 OpenAI 模型。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="用于控制模型行为的附加选项。">
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制随机性。值越低，模型越确定。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心采样参数。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="根据新标记在文本中的现有频率对其进行惩罚。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="根据新标记是否已在文本中出现过对其进行惩罚。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="是否启用并行函数调用。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="Partial<ClientOptions>" data-required="false" data-desc="用于底层 OpenAI SDK 的附加客户端选项。"></x-field>
</x-field-group>

#### 基本用法

这是一个如何实例化和使用 `OpenAIChatModel` 的基本示例。

```typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // 直接提供 API 密钥或使用环境变量 OPENAI_API_KEY
  apiKey: "your-api-key", // 如果已在环境变量中设置，则此项为可选
  model: "gpt-4o", // 如果未指定，则默认为 "gpt-4o-mini"
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
/* 输出:
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

#### 流式响应

对于实时应用程序，您可以从模型中流式传输响应。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
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

console.log(fullText); // 输出: "Hello! How can I assist you today?"
console.log(json); // { model: "gpt-4o", usage: { inputTokens: 10, outputTokens: 9 } }
```

### OpenAIImageModel

`OpenAIImageModel` 类允许您使用 OpenAI 的 DALL-E 模型生成和编辑图像。

#### 配置

您可以通过向 `OpenAIImageModel` 的构造函数传递一个 `OpenAIImageModelOptions` 对象来对其进行配置。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="您的 OpenAI API 密钥。如果未提供，将回退使用 `OPENAI_API_KEY` 环境变量。"></x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="OpenAI API 的可选基础 URL，适用于代理。"></x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false" data-desc="用于图像生成的 OpenAI 模型（例如 'dall-e-2'、'dall-e-3'）。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="用于控制图像生成行为的附加选项，例如尺寸、质量和风格。"></x-field>
  <x-field data-name="clientOptions" data-type="Partial<ClientOptions>" data-required="false" data-desc="用于底层 OpenAI SDK 的附加客户端选项。"></x-field>
</x-field-group>

#### 用法示例

以下是一个生成图像的示例。

```typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    size: "1024x1024",
    quality: "hd",
  },
});

const result = await imageModel.process({
  prompt: "A futuristic cityscape at sunset, with flying cars and neon lights.",
});

console.log(result.images);
/* 输出:
[
  {
    type: 'url',
    url: 'https://...', // 生成图像的 URL
    mimeType: 'image/png'
  }
]
*/
```

## 许可证

该软件包根据 [Elastic-2.0 许可证](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 获得许可。