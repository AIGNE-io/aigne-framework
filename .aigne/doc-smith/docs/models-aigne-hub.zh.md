# @aigne/aigne-hub

`@aigne/aigne-hub` SDK 提供了一个统一的接口，用于访问各种用于聊天和图像生成的人工智能模型。它充当 [AIGNE Hub](https://github.com/AIGNE-io/aigne-framework) 的客户端，后者是一个强大的代理层，连接到多个大型语言模型（LLM）提供商。

本指南将引导您完成该 SDK 的安装、基本设置以及在聊天补全和图像生成方面的使用。

## 简介

`@aigne/aigne-hub` 通过 AIGNE Hub 服务路由请求，简化了与各种 AI 提供商的交互。该网关聚合了 OpenAI、Anthropic、AWS Bedrock、Google 等提供商，让您只需更改模型标识符即可在它们之间无缝切换。这种方法消除了处理不同 API 和身份验证方法的复杂性，让您可以专注于构建您的应用程序。

### 工作原理

SDK 将请求从您的应用程序发送到集中的 AIGNE Hub 实例。然后，Hub 根据指定的模型名称将这些请求转发给相应的下游 AI 提供商。这种架构为所有 AI 交互提供了一个单一的访问和控制点。

```d2
direction: down

Your-Application: {
  label: "您的应用程序"
  shape: rectangle

  aigne-aigne-hub: {
    label: "@aigne/aigne-hub SDK"
    shape: rectangle
  }
}

AIGNE-Hub: {
  label: "AIGNE Hub 服务"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

LLM-Providers: {
  label: "LLM 提供商"
  shape: rectangle
  grid-columns: 4

  OpenAI: {}
  Anthropic: {}
  Google: {}
  AWS-Bedrock: {
    label: "AWS Bedrock"
  }
  DeepSeek: {}
  Ollama: {}
  xAI: {}
  OpenRouter: {}
}

Your-Application.aigne-aigne-hub -> AIGNE-Hub: "API 请求"
AIGNE-Hub -> LLM-Providers: "聚合与路由"
```

## 功能

-   🔌 **统一的 LLM 访问**：通过单一、一致的端点路由所有请求。
-   🧠 **多提供商支持**：使用简单的 `provider/model` 命名约定，访问来自 OpenAI、Anthropic、Google 等的模型。
-   🔐 **安全身份验证**：使用单一的 `accessKey` 安全地管理 API 访问。
-   💬 **聊天补全**：使用 `{ role, content }` 消息格式为聊天模型提供标准化接口。
-   🎨 **图像生成**：使用来自 OpenAI (DALL-E)、Google (Imagen) 和 Ideogram 的模型生成图像。
-   🌊 **流式传输支持**：通过启用流式传输，为聊天模型获取实时的、令牌级别的响应。
-   🧱 **框架兼容**：与更广泛的 AIGNE 框架无缝集成。

## 安装

首先，使用您偏好的包管理器安装 `@aigne/aigne-hub` 和 `@aigne/core` 包。

**npm**
```bash
npm install @aigne/aigne-hub @aigne/core
```

**yarn**
```bash
yarn add @aigne/aigne-hub @aigne/core
```

**pnpm**
```bash
pnpm add @aigne/aigne-hub @aigne/core
```

## 聊天模型

`AIGNEHubChatModel` 类是您与基于文本的 AI 模型交互的主要工具。

### 基本用法

要使用聊天模型，请使用您的 AIGNE Hub 端点、访问密钥和所需的模型标识符来实例化 `AIGNEHubChatModel`。

```typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(result);
/* 示例输出:
  {
    text: "你好！今天我能为你做些什么？",
    model: "openai/gpt-4o-mini",
    usage: {
      inputTokens: 8,
      outputTokens: 9
    }
  }
*/
```

### 流式传输用法

对于交互式的实时应用程序，您可以从模型中流式传输响应。在 `invoke` 调用中将 `streaming` 选项设置为 `true`，并遍历结果流以在数据块到达时进行处理。

```typescript
import { AIGNEHubChatModel, isAgentResponseDelta } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
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

console.log(fullText); // "我是一个 AI 助手，随时准备帮助您解决任何问题或任务。"
console.log(json); // { model: "openai/gpt-4o-mini", usage: { ... } }
```

### 配置

`AIGNEHubChatModel` 构造函数接受以下选项：

| Parameter      | Type     | Description                                                              |
| -------------- | -------- | ------------------------------------------------------------------------ |
| `url`          | `string` | 您的 AIGNE Hub 实例的端点 URL。                                          |
| `accessKey`    | `string` | 您用于向 AIGNE Hub 进行身份验证的秘密 API 密钥。                         |
| `model`        | `string` | 模型标识符，以提供商为前缀（例如，`openai/gpt-4o`）。                       |
| `modelOptions` | `object` | 可选。传递给底层模型的附加参数。                                         |

## 图像生成模型

`AIGNEHubImageModel` 类允许您使用各种 AI 模型生成图像。

### 基本用法

使用您的 Hub 凭据和所需的图像模型实例化 `AIGNEHubImageModel`。然后，使用提示和其他特定于模型的参数调用 `invoke`。

```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/dall-e-3",
});

const result = await model.invoke({
  prompt: "一个充满未来感的城市景观，有飞行汽车和霓虹灯",
  n: 1,
  size: "1024x1024",
});

console.log(result);
/* 示例输出:
  {
    images: [{ url: "https://..." }],
    usage: { inputTokens: 0, outputTokens: 0 },
    model: "openai/dall-e-3"
  }
*/
```

### 支持的提供商和参数

AIGNE Hub 支持来自多个提供商的图像生成，每个提供商都有其自己的功能和参数集。

#### OpenAI DALL-E

-   **模型**：`dall-e-2`、`dall-e-3`
-   **关键参数**：`prompt`、`size`、`n`、`quality`、`style`。
-   **参考**：[OpenAI 图像 API 文档](https://platform.openai.com/docs/guides/images)

```typescript
// DALL-E 3 示例
const result = await model.invoke({
  model: "openai/dall-e-3",
  prompt: "一张戴着太阳镜的猫的逼真照片",
  size: "1024x1024",
  quality: "hd",
  style: "vivid",
});
```

#### Google Gemini & Imagen

-   **模型**：`imagen-4.0`、`gemini-pro-vision` 等。
-   **关键参数**：`prompt`、`imageSize`、`aspectRatio`、`guidanceScale`、`negativePrompt`。
-   **注意**：Gemini 图像模型目前以 `base64` 格式返回图像。
-   **参考**：[Google GenAI 模型文档](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html)

```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "日落时宁静的山景",
  n: 1,
  imageSize: "1024x1024",
  aspectRatio: "1:1",
});
```

#### Ideogram

-   **模型**：`ideogram-v3`
-   **关键参数**：`prompt`、`resolution`、`aspectRatio`、`renderingSpeed`、`styleType`。
-   **参考**：[Ideogram API 文档](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "一个有着发光蓝眼睛的赛博朋克角色",
  resolution: "1024x1024",
  styleType: "cinematic",
});
```

### 配置

`AIGNEHubImageModel` 构造函数接受以下选项：

| Parameter      | Type     | Description                                                                 |
| -------------- | -------- | --------------------------------------------------------------------------- |
| `url`          | `string` | 您的 AIGNE Hub 实例的端点 URL。                                             |
| `accessKey`    | `string` | 您用于向 AIGNE Hub 进行身份验证的秘密 API 密钥。                            |
| `model`        | `string` | 模型标识符，以提供商为前缀（例如，`openai/dall-e-3`）。                       |
| `modelOptions` | `object` | 可选。传递给底层模型的附加参数。                                            |