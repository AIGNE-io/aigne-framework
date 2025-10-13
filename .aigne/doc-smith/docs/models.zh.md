# AIGNE 模型

AIGNE 提供了一套全面的 SDK，旨在与各种 AI 模型提供商无缝集成。这些软件包在 AIGNE 框架中提供了一致、统一的接口，使开发人员能够轻松利用不同 AI 模型的强大功能，而无需更改其核心应用程序逻辑。

无论您是使用 OpenAI 的 GPT 模型、Anthropic 的 Claude、Google 的 Gemini，还是通过 Ollama 本地托管的模型，AIGNE 模型 SDK 都能简化开发流程。每个 SDK 都针对特定提供商的 API 进行了定制，同时遵循标准化的 `invoke` 方法，用于聊天补全、流式传输和其他功能。

此外，通过 `@aigne/aigne-hub`，您可以通过单个网关访问多个提供商，从而简化 API 密钥管理，并实现动态模型切换和回退。本介绍概述了可用的模型，并指导您完成其安装和使用。

```d2
direction: down

Developer-Application: {
  label: "开发者应用"
  shape: rectangle
}

AIGNE-Ecosystem: {
  label: "AIGNE SDK 生态系统"
  shape: rectangle
  style: {
    stroke-dash: 4
  }
  grid-gap: 100

  AIGNE-SDKs: {
    label: "AIGNE SDK"
    shape: rectangle
    grid-columns: 4
    grid-gap: 40

    aigne-core: {
      label: "@aigne/core\n(基础)"
      style.fill: "#d1e7dd"
    }

    aigne-hub: {
      label: "@aigne/aigne-hub\n(网关)"
      style.fill: "#cfe2ff"
    }
    aigne-open-router: {
      label: "@aigne/open-router\n(网关)"
      style.fill: "#cfe2ff"
    }
    aigne-poe: {
      label: "@aigne/poe\n(网关)"
      style.fill: "#cfe2ff"
    }

    aigne-openai: { label: "@aigne/openai" }
    aigne-anthropic: { label: "@aigne/anthropic" }
    aigne-gemini: { label: "@aigne/gemini" }
    aigne-bedrock: { label: "@aigne/bedrock" }
    aigne-deepseek: { label: "@aigne/deepseek" }
    aigne-doubao: { label: "@aigne/doubao" }
    aigne-ideogram: { label: "@aigne/ideogram" }
    aigne-ollama: { label: "@aigne/ollama" }
    aigne-xai: { label: "@aigne/xai" }
  }

  AI-Model-Providers: {
    label: "AI 模型提供商 (外部服务)"
    shape: rectangle
    grid-columns: 4
    grid-gap: 40

    OpenAI: { label: "OpenAI\n(GPT, DALL-E)" }
    Anthropic: { label: "Anthropic\n(Claude)" }
    Google: { label: "Google\n(Gemini, Imagen)" }
    AWS-Bedrock: { label: "AWS Bedrock" }
    Deepseek: { label: "Deepseek" }
    Doubao: { label: "Doubao" }
    Ideogram: { label: "Ideogram" }
    Ollama: { label: "Ollama\n(本地服务)" }
    OpenRouter: { label: "OpenRouter" }
    Poe: { label: "Poe" }
    xAI: { label: "xAI\n(Grok)" }
  }
}

Developer-Application -> AIGNE-Ecosystem.AIGNE-SDKs: "使用 SDK"

AIGNE-Ecosystem.AIGNE-SDKs.aigne-openai -> AIGNE-Ecosystem.AI-Model-Providers.OpenAI
AIGNE-Ecosystem.AIGNE-SDKs.aigne-anthropic -> AIGNE-Ecosystem.AI-Model-Providers.Anthropic
AIGNE-Ecosystem.AIGNE-SDKs.aigne-gemini -> AIGNE-Ecosystem.AI-Model-Providers.Google
AIGNE-Ecosystem.AIGNE-SDKs.aigne-bedrock -> AIGNE-Ecosystem.AI-Model-Providers.AWS-Bedrock
AIGNE-Ecosystem.AIGNE-SDKs.aigne-deepseek -> AIGNE-Ecosystem.AI-Model-Providers.Deepseek
AIGNE-Ecosystem.AIGNE-SDKs.aigne-doubao -> AIGNE-Ecosystem.AI-Model-Providers.Doubao
AIGNE-Ecosystem.AIGNE-SDKs.aigne-ideogram -> AIGNE-Ecosystem.AI-Model-Providers.Ideogram
AIGNE-Ecosystem.AIGNE-SDKs.aigne-ollama -> AIGNE-Ecosystem.AI-Model-Providers.Ollama
AIGNE-Ecosystem.AIGNE-SDKs.aigne-open-router -> AIGNE-Ecosystem.AI-Model-Providers.OpenRouter
AIGNE-Ecosystem.AIGNE-SDKs.aigne-poe -> AIGNE-Ecosystem.AI-Model-Providers.Poe
AIGNE-Ecosystem.AIGNE-SDKs.aigne-xai -> AIGNE-Ecosystem.AI-Model-Providers.xAI

AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.OpenAI
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Anthropic
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Google
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Ideogram
```

## 快速入门

首先，您需要安装 AIGNE 核心包以及您希望使用的 AI 模型提供商的特定 SDK。

### 安装

使用您偏好的包管理器安装必要的包。例如，要使用 OpenAI SDK：

**使用 npm**
```bash
npm install @aigne/openai @aigne/core
```

**使用 yarn**
```bash
yarn add @aigne/openai @aigne/core
```

**使用 pnpm**
```bash
pnpm add @aigne/openai @aigne/core
```

## 支持的提供商

AIGNE 支持多种 AI 模型提供商，每家提供商都有其专用的 SDK 以实现最佳集成。以下是每个受支持提供商的详细指南。

### AIGNE Hub

`@aigne/aigne-hub` 通过单个网关服务提供对多个 LLM 提供商的统一访问。它允许您在 OpenAI、Anthropic 和 Google 等提供商的模型之间切换，而无需更改客户端代码。

**主要特性：**
- 通过单个端点将请求路由到任何受支持的提供商。
- 使用单个 `accessKey` 安全地管理 API 密钥。
- 支持聊天补全、流式传输和图像生成。

#### 安装
```bash
npm install @aigne/aigne-hub @aigne/core
```

#### 基本聊天用法
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
/* 输出示例：
  {
    text: "Hello! How can I help you today?",
    model: "openai/gpt-4o-mini",
    usage: {
      inputTokens: 8,
      outputTokens: 9
    }
  }
*/
```

#### 图像生成
AIGNE Hub 支持从多个提供商生成图像。只需指定模型名称即可在它们之间切换。

**OpenAI DALL-E 示例**
```typescript
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
});
```

**Google Imagen 示例**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
});
```

**Ideogram 示例**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes",
  resolution: "1024x1024",
});
```

### OpenAI

`@aigne/openai` SDK 提供了与 OpenAI GPT 模型的无缝集成。它支持聊天补全、函数调用和流式响应。

#### 安装
```bash
npm install @aigne/openai @aigne/core
```

#### 基本用法
```typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // 直接提供 API 密钥或使用环境变量 OPENAI_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置，则为可选
  model: "gpt-4o", // 如果未指定，则默认为 "gpt-4o-mini"
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

#### 流式响应
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
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
  }
}
console.log(fullText);
```

### Anthropic

`@aigne/anthropic` SDK 与 Anthropic 的 Claude AI 模型集成，支持聊天补全、工具调用和流式传输。

#### 安装
```bash
npm install @aigne/anthropic @aigne/core
```

#### 基本用法
```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // 直接提供 API 密钥或使用环境变量 ANTHROPIC_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置，则为可选
  model: "claude-3-haiku-20240307", // 默认为 'claude-3-7-sonnet-latest'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

### Google Gemini

`@aigne/gemini` SDK 连接到 Google 的 Gemini AI 模型，支持多模态输入、函数调用以及使用 Imagen 进行图像生成。

#### 安装
```bash
npm install @aigne/gemini @aigne/core
```

#### 基本聊天用法
```typescript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // 直接提供 API 密钥或使用环境变量 GOOGLE_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置，则为可选
  model: "gemini-1.5-flash", // 默认为 'gemini-1.5-pro'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

#### 图像生成
```typescript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key", 
  model: "imagen-4.0-generate-001", // 默认 Imagen 模型
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

### AWS Bedrock

`@aigne/bedrock` SDK 与 AWS Bedrock 上托管的基础模型（包括 Claude、Llama 和 Titan）集成，提供安全且可扩展的解决方案。

#### 安装
```bash
npm install @aigne/bedrock @aigne/core
```

#### 基本用法
```typescript
import { BedrockChatModel } from "@aigne/bedrock";

const model = new BedrockChatModel({
  // 使用环境变量 AWS_ACCESS_KEY_ID 和 AWS_SECRET_ACCESS_KEY
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  model: "us.amazon.nova-premier-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

### Deepseek

`@aigne/deepseek` SDK 连接到 Deepseek 的语言模型，为聊天补全提供了一个强大且经济高效的选择。

#### 安装
```bash
npm install @aigne/deepseek @aigne/core
```

#### 基本用法
```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // 直接提供 API 密钥或使用环境变量 DEEPSEEK_API_KEY
  apiKey: "your-api-key",
  model: "deepseek-chat", // 默认为 'deepseek-chat'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

### Doubao

`@aigne/doubao` SDK 提供了与 Doubao 语言模型的集成。

#### 安装
```bash
npm install @aigne/doubao @aigne/core
```

#### 基本用法
```typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  // 直接提供 API 密钥或使用环境变量 DOUBAO_API_KEY
  apiKey: "your-api-key",
  model: "doubao-seed-1-6-250615", // 默认模型
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

### Ideogram

`@aigne/ideogram` SDK 专门用于与 Ideogram 的高级图像生成模型集成。

#### 安装
```bash
npm install @aigne/ideogram @aigne/core
```

#### 基本用法
```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  apiKey: "your-api-key", // 如果在环境变量中设置，则为可选
});

const result = await model.invoke({
  model: "ideogram-v3",
  prompt: "A serene mountain landscape at sunset with golden light",
});

console.log(result);
```

### Ollama

`@aigne/ollama` SDK 允许您通过 Ollama 连接到本地托管的开源模型，确保 AI 功能的隐私和离线访问。

#### 安装
```bash
npm install @aigne/ollama @aigne/core
```

#### 前提条件
确保 [Ollama](https://ollama.ai/) 已在您的机器上安装并运行。

#### 基本用法
```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  baseURL: "http://localhost:11434", // 默认为 localhost
  model: "llama3", // 默认为 'llama3'
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
```

### OpenRouter

`@aigne/open-router` SDK 提供了一个统一的 API，通过单一集成访问来自 OpenAI、Anthropic 和 Google 等多个提供商的模型。

#### 安装
```bash
npm install @aigne/open-router @aigne/core
```

#### 基本用法
```typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // 直接提供 API 密钥或使用环境变量 OPEN_ROUTER_API_KEY
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus", // 默认为 'openai/gpt-4o'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

### Poe

`@aigne/poe` SDK 与 Poe 的 API 集成，使您可以访问该平台上的各种语言模型。

#### 安装
```bash
npm install @aigne/poe @aigne/core
```

#### 基本用法
```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // 直接提供 API 密钥或使用环境变量 POE_API_KEY
  apiKey: "your-api-key",
  model: "claude-3-opus", // 默认为 'openai/gpt-4o'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

### xAI

`@aigne/xai` SDK 连接到 XAI 的语言模型，包括以其独特的个性和实时信息访问而闻名的 Grok。

#### 安装
```bash
npm install @aigne/xai @aigne/core
```

#### 基本用法
```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // 直接提供 API 密钥或使用环境变量 XAI_API_KEY
  apiKey: "your-api-key",
  model: "grok-2-latest", // 默认为 'grok-2-latest'
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```