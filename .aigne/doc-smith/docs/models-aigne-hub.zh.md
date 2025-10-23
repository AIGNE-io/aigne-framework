# AIGNE Hub

AIGNE Hub 提供了一个统一的代理层，用于访问来自多个提供商的各种大型语言模型（LLM）和图像生成服务。通过使用 `@aigne/aigne-hub` 包，您可以在不同的 AI 模型之间无缝切换，而无需更改客户端应用程序逻辑，所有请求都通过一个单一、一致的 API 端点进行定向。

本指南涵盖了 `AIGNEHubChatModel` 和 `AIGNEHubImageModel` 类的安装、配置和使用，以将您的应用程序连接到 AIGNE Hub。

## 概述

AIGNE Hub 作为一个网关，聚合了 OpenAI、Anthropic、Google 等主要 AI 提供商。这种架构通过抽象每个提供商 API 的特定要求来简化集成。您只需传递模型的唯一标识符（包含提供商前缀，例如 `openai/gpt-4o-mini` 或 `anthropic/claude-3-sonnet`），即可与任何支持的模型进行交互。

### 架构图

下图说明了 AIGNE Hub 如何充当您的应用程序与各种 LLM 提供商之间的中介。您的应用程序向 Hub 发送统一请求，然后 Hub 根据指定的模型将其路由到相应的下游服务。

```d2
direction: down

Your-Application: {
  label: "你的应用"
  shape: rectangle
}

AIGNE-Hub: {
  label: "AIGNE Hub"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

LLM-Providers: {
  label: "LLM 提供商"
  shape: rectangle
  style.stroke-dash: 4

  OpenAI: {
    label: "OpenAI\n(GPT-4o, DALL-E 3)"
  }
  Anthropic: {
    label: "Anthropic\n(Claude)"
  }
  Google: {
    label: "Google\n(Gemini, Imagen)"
  }
}

Your-Application -> AIGNE-Hub: "统一 API 请求\n(例如 'openai/gpt-4o-mini')"
AIGNE-Hub -> LLM-Providers.OpenAI: "路由请求"
AIGNE-Hub -> LLM-Providers.Anthropic: "路由请求"
AIGNE-Hub -> LLM-Providers.Google: "路由请求"
```

### 主要功能

-   **统一访问**：为所有 LLM 和图像生成请求提供单一端点。
-   **多提供商支持**：访问来自 OpenAI、Anthropic、AWS Bedrock、Google、DeepSeek、Ollama、xAI 和 OpenRouter 的模型。
-   **安全身份验证**：通过单个 API 密钥（`accessKey`）管理访问。
-   **聊天和图像模型**：支持聊天补全和图像生成。
-   **流式传输**：为聊天响应提供实时、令牌级的流式传输。
-   **无缝集成**：旨在与更广泛的 AIGNE 框架完美协作。

### 支持的提供商

AIGNE Hub 通过其统一的 API 支持广泛的 AI 提供商。

| 提供商 | 标识符 |
| :---------- | :------------ |
| OpenAI | `openai` |
| Anthropic | `anthropic` |
| AWS Bedrock | `bedrock` |
| DeepSeek | `deepseek` |
| Google | `google` |
| Ollama | `ollama` |
| OpenRouter | `openRouter` |
| xAI | `xai` |

## 安装

首先，请在您的项目中安装 `@aigne/aigne-hub` 和 `@aigne/core` 包。

```bash npm install icon=logos:npm
npm install @aigne/aigne-hub @aigne/core
```

```bash yarn add icon=logos:yarn
yarn add @aigne/aigne-hub @aigne/core
```

```bash pnpm add icon=logos:pnpm
pnpm add @aigne/aigne-hub @aigne/core
```

## 配置

聊天和图像模型都需要配置才能连接到您的 AIGNE Hub 实例。主要选项包括 Hub 的 URL、访问密钥和所需的模型标识符。

### 聊天模型配置

使用以下选项配置 `AIGNEHubChatModel`。

<x-field-group>
  <x-field data-name="baseUrl" data-type="string" data-required="true">
    <x-field-desc markdown>您的 AIGNE Hub 实例的基础 URL（例如 `https://your-aigne-hub-instance/ai-kit`）。</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="true">
    <x-field-desc markdown>用于向 AIGNE Hub 进行身份验证的 API 访问密钥。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="true">
    <x-field-desc markdown>模型标识符，以提供商为前缀（例如 `openai/gpt-4o-mini`）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>可选的模型特定参数，将传递给提供商的 API。</x-field-desc>
  </x-field>
</x-field-group>

### 图像模型配置

`AIGNEHubImageModel` 使用类似的配置结构。

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true">
    <x-field-desc markdown>您的 AIGNE Hub 实例的端点。</x-field-desc>
  </x-field>
  <x-field data-name="accessKey" data-type="string" data-required="true">
    <x-field-desc markdown>用于身份验证的 API 访问密钥。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="true">
    <x-field-desc markdown>模型标识符，以提供商为前缀（例如 `openai/dall-e-3`）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>可选的模型特定参数，将传递给提供商的 API。</x-field-desc>
  </x-field>
</x-field-group>

## 使用方法

### 聊天补全

要执行聊天补全，请使用您的配置实例化 `AIGNEHubChatModel` 并调用 `invoke` 方法。

```typescript 基本聊天补全 icon=logos:typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(result);
```

**响应示例**

```json
{
  "text": "Hello! How can I help you today?",
  "model": "openai/gpt-4o-mini",
  "usage": {
    "inputTokens": 8,
    "outputTokens": 9
  }
}
```

**模型示例：**

*   `openai/gpt-4o-mini`
*   `anthropic/claude-3-sonnet`
*   `google/gemini-pro`
*   `xai/grok-1`
*   `openRouter/mistralai/mistral-7b-instruct`
*   `ollama/llama3`

### 流式聊天响应

对于实时响应，请在 `invoke` 调用中将 `streaming` 选项设置为 `true`。这将返回一个异步迭代器，在响应块可用时生成它们。

```typescript 流式示例 icon=logos:typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AIGNEHubChatModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
  },
  { streaming: true },
);

let fullText = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
  }
}

console.log("\n--- Response Complete ---");
console.log(fullText);
```

### 图像生成

AIGNE Hub 支持来自多个提供商的图像生成。实例化 `AIGNEHubImageModel` 并提供提示和模型特定参数。

#### OpenAI DALL-E

```typescript 使用 DALL-E 3 生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/dall-e-3",
});

const result = await model.invoke({
  prompt: "A futuristic cityscape with flying cars and neon lights",
  n: 1,
  size: "1024x1024",
  quality: "standard",
  style: "natural",
});

console.log(result.images[0].url);
```

-   **参考**：[OpenAI Images API 文档](https://platform.openai.com/docs/guides/images)

#### Google Gemini Imagen

```typescript 使用 Imagen 生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
  n: 1,
  aspectRatio: "1:1",
});

console.log(result.images[0].base64); // 注意：Gemini 模型返回 base64 数据
```

-   **参考**：[Google AI Generative Models API](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html)

#### Ideogram

```typescript 使用 Ideogram 生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes, cinematic style",
  aspectRatio: "1:1",
  styleType: "cinematic",
});

console.log(result.images[0].url);
```

-   **参考**：[Ideogram API 文档](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

## 总结

`@aigne/aigne-hub` 包通过为 AIGNE Hub 服务提供统一的客户端，简化了多提供商 LLM 的集成。通过抽象特定于提供商的逻辑，它使开发人员能够构建更灵活、更易于维护的 AI 驱动的应用程序。

有关特定模型及其功能的更多详细信息，请参阅各个 AI 提供商提供的文档。要探索其他模型集成，请参阅[模型概述](./models-overview.md)。