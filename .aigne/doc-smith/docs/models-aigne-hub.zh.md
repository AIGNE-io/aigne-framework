# AIGNE Hub

AIGNE Hub 提供了一个统一的代理层，用于访问来自多个提供商的各种大型语言模型 (LLM)、图像和视频生成服务。通过使用 `@aigne/aigne-hub` 包，您可以在不同的 AI 模型之间无缝切换，而无需更改客户端应用程序逻辑，所有请求都通过一个统一且一致的 API 端点进行。

本指南涵盖了 `AIGNEHubChatModel`、`AIGNEHubImageModel` 和 `AIGNEHubVideoModel` 类的安装、配置和使用，以将您的应用程序连接到 AIGNE Hub。

## 概述

AIGNE Hub 充当一个网关，聚合了 OpenAI、Anthropic、Google 等主要 AI 提供商。这种架构通过抽象每个提供商 API 的特定要求，简化了集成。您只需传递模型的唯一标识符（包括提供商前缀，例如 `openai/gpt-4o-mini` 或 `anthropic/claude-3-sonnet`），即可与任何受支持的模型进行交互。

### 主要功能

-   **统一访问**：所有 LLM、图像和视频生成请求的单一端点。
-   **多提供商支持**：访问来自 OpenAI、Anthropic、AWS Bedrock、Google、DeepSeek、Ollama、xAI 和 OpenRouter 的模型。
-   **安全身份验证**：通过单个 API 密钥 (`apiKey`) 管理访问。
-   **聊天、图像和视频模型**：支持聊天补全、图像生成和视频创建。
-   **流式传输**：聊天响应的实时、令牌级流式传输。
-   **无缝集成**：旨在与更广泛的 AIGNE 框架协同工作。

### 支持的提供商

AIGNE Hub 通过其统一的 API 支持广泛的 AI 提供商。

| 提供商 | 标识符 |
| :--- | :--- |
| OpenAI | `openai` |
| Anthropic | `anthropic` |
| AWS Bedrock | `bedrock` |
| DeepSeek | `deepseek` |
| Google | `google` |
| Ollama | `ollama` |
| OpenRouter | `openRouter` |
| xAI | `xai` |

## 安装

首先，在您的项目中安装 `@aigne/aigne-hub` 和 `@aigne/core` 包。

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

聊天、图像和视频模型需要配置才能连接到您的 AIGNE Hub 实例。主要选项包括 Hub 的 URL、访问密钥和所需的模型标识符。

### 模型配置

配置选项在 `AIGNEHubChatModel`、`AIGNEHubImageModel` 和 `AIGNEHubVideoModel` 之间是一致的。

<x-field-group>
  <x-field data-name="baseUrl" data-type="string" data-required="true">
    <x-field-desc markdown>您的 AIGNE Hub 实例的基础 URL（例如 `https://your-aigne-hub-instance/ai-kit`）。</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="true">
    <x-field-desc markdown>您用于向 AIGNE Hub 进行身份验证的 API 访问密钥。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="true">
    <x-field-desc markdown>模型标识符，以提供商为前缀（例如 `openai/gpt-4o-mini`）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>可选的特定于模型的参数，用于传递给提供商的 API。</x-field-desc>
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

对于实时响应，请在 `invoke` 调用中将 `streaming` 选项设置为 `true`。这将返回一个异步迭代器，在响应块可用时产生它们。

```typescript 流式传输示例 icon=logos:typescript
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

AIGNE Hub 支持来自多个提供商的图像生成。实例化 `AIGNEHubImageModel` 并提供提示和特定于模型的参数。

#### OpenAI DALL-E

```typescript 使用 DALL-E 3 生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
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

-   **参考资料**：[OpenAI Images API Documentation](https://platform.openai.com/docs/guides/images)

#### Google Gemini Imagen

```typescript 使用 Imagen 生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
  n: 1,
  aspectRatio: "1:1",
});

console.log(result.images[0].base64); // 注意：Gemini 模型返回 base64 数据
```

-   **参考资料**：[Google AI Generative Models API](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html)

#### Ideogram

```typescript 使用 Ideogram 生成 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes, cinematic style",
  aspectRatio: "1:1",
  styleType: "cinematic",
});

console.log(result.images[0].url);
```

-   **参考资料**：[Ideogram API Documentation](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

### 视频生成

AIGNE Hub 将其统一的 API 扩展到由 AI 驱动的、来自领先提供商的视频生成。要创建视频，请使用适当的配置实例化 `AIGNEHubVideoModel`。

#### OpenAI Sora

```typescript 使用 Sora 生成 icon=logos:typescript
import { AIGNEHubVideoModel } from "@aigne/aigne-hub";

const model = new AIGNEHubVideoModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "openai/sora-2",
});

const result = await model.invoke({
  prompt: "A serene beach scene with gentle waves at sunset",
  size: "1280x720",
  seconds: "8",
  outputFileType: "url",
});

console.log(result);
```

**响应示例**
```json
{
  "videos": [{ "url": "https://...", "type": "url" }],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0,
    "aigneHubCredits": 200
  },
  "model": "openai/sora-2",
  "seconds": 8
}
```

-   **参考资料**：[OpenAI Video API Documentation](https://platform.openai.com/docs/api-reference/videos)

#### Google Gemini Veo

```typescript 使用 Veo 生成 icon=logos:typescript
import { AIGNEHubVideoModel } from "@aigne/aigne-hub";

const model = new AIGNEHubVideoModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "google/veo-3.1-generate-preview",
});

const result = await model.invoke({
  prompt: "A majestic eagle soaring through mountain valleys",
  aspectRatio: "16:9",
  size: "1080p",
  seconds: "6",
  outputFileType: "url",
});

console.log(result);
```

**响应示例**
```json
{
  "videos": [{ "url": "https://...", "type": "url" }],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0,
    "aigneHubCredits": 150
  },
  "model": "google/veo-3.1-generate-preview",
  "seconds": 6
}
```

-   **参考资料**：[Google Gemini Video API Documentation](https://ai.google.dev/api/generate-videos)

## 总结

`@aigne/aigne-hub` 包通过为 AIGNE Hub 服务提供统一的客户端，简化了多提供商 LLM 的集成。通过为聊天、图像和视频模型抽象出特定于提供商的逻辑，它使开发人员能够构建更灵活、更易于维护的 AI 驱动应用程序。

有关特定模型及其功能的更详细信息，请参阅各个 AI 提供商提供的文档。要探索其他模型集成，请参阅[模型概述](./models-overview.md)。