# 可用的聊天模型

AIGNE 框架支持多种聊天模型，允许您选择最适合您应用场景的 AI 能力。本文档提供了所有可用聊天模型的详细信息，包括安装说明、基本用法和特性概述。

## 支持的模型提供商

AIGNE 框架目前支持以下模型提供商的集成：

* [OpenAI](#openai) - GPT 系列模型
* [Anthropic](#anthropic) - Claude 系列模型
* [Google Gemini](#google-gemini) - Gemini 系列模型
* [AWS Bedrock](#aws-bedrock) - AWS 多种基础模型
* [Ollama](#ollama) - 本地自托管开源模型
* [OpenRouter](#openrouter) - 统一 API 访问多种模型
* [DeepSeek](#deepseek) - DeepSeek 模型
* [XAI](#xai) - X.AI 的 Grok 模型

***

## OpenAI

**简介**

`@aigne/openai` 包提供了 AIGNE 框架与 OpenAI 强大语言模型的无缝集成。通过这个包，开发者可以轻松地在 AIGNE 应用中使用 OpenAI 的 GPT 模型。

**安装**

```bash
# 使用 npm
npm install @aigne/openai @aigne/core

# 使用 yarn
yarn add @aigne/openai @aigne/core

# 使用 pnpm
pnpm add @aigne/openai @aigne/core
```

**基本用法**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-openai"
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});
```

***

## Anthropic

**简介**

`@aigne/anthropic` 包提供了对 Anthropic Claude 系列模型的集成。

**安装**

```bash
# 使用 npm
npm install @aigne/anthropic @aigne/core

# 使用 yarn
yarn add @aigne/anthropic @aigne/core

# 使用 pnpm
pnpm add @aigne/anthropic @aigne/core
```

**基本用法**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-anthropic"
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-v1",
});
```

***

## Google Gemini

**简介**

`@aigne/gemini` 包提供了对 Google Gemini 模型（如 gemini-beta）的集成。

**安装**

```bash
# 使用 npm
npm install @aigne/gemini @aigne/core

# 使用 yarn
yarn add @aigne/gemini @aigne/core

# 使用 pnpm
pnpm add @aigne/gemini @aigne/core
```

**基本用法**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-gemini"
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash",
});
```

***

## AWS Bedrock

**简介**

`@aigne/bedrock` 包提供了对 AWS Bedrock 的支持，可调用 Amazon nova 等模型。

**安装**

```bash
# 使用 npm
npm install @aigne/bedrock @aigne/core

# 使用 yarn
yarn add @aigne/bedrock @aigne/core

# 使用 pnpm
pnpm add @aigne/bedrock @aigne/core
```

**基本用法**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-bedrock"
import { BedrockChatModel } from "@aigne/bedrock";

const model = new BedrockChatModel({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  region: "us-east-1",
  model: "us.amazon.nova-lite-v1:0",
});
```

***

## Ollama

**简介**

`@aigne/ollama` 包可在本地托管开源模型，通过 Ollama 进行推理。适合对隐私或自定义推理环境有需求的场景。

**安装**

```bash
# 使用 npm
npm install @aigne/ollama @aigne/core

# 使用 yarn
yarn add @aigne/ollama @aigne/core

# 使用 pnpm
pnpm add @aigne/ollama @aigne/core
```

**基本用法**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-ollama"
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  baseURL: "http://localhost:11411",
  model: "llama3.2",
});
```

***

## OpenRouter

**简介**

`@aigne/open-router` 提供了访问多家模型服务的统一 API，可以根据不同需求快速切换底层模型，提升开发效率和灵活性。

**安装**

```bash
# 使用 npm
npm install @aigne/open-router @aigne/core

# 使用 yarn
yarn add @aigne/open-router @aigne/core

# 使用 pnpm
pnpm add @aigne/open-router @aigne/core
```

**基本用法**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-open-router"
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  model: "openai/gpt-4o",
});
```

***

## DeepSeek

**简介**

`@aigne/deepseek` 包对 DeepSeek 模型进行了集成，提供一套开放且灵活的 API，用于高级推理和对话场景。

**安装**

```bash
# 使用 npm
npm install @aigne/deepseek @aigne/core

# 使用 yarn
yarn add @aigne/deepseek @aigne/core

# 使用 pnpm
pnpm add @aigne/deepseek @aigne/core
```

**基本用法**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-deepseek"
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: "deepseek-chat",
});
```

***

## XAI

**简介**

`@aigne/xai` 提供了对 X.AI 的 Grok 模型在对话或问答场景中的使用支持。

**安装**

```bash
# 使用 npm
npm install @aigne/xai @aigne/core

# 使用 yarn
yarn add @aigne/xai @aigne/core

# 使用 pnpm
pnpm add @aigne/xai @aigne/core
```

**基本用法**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-xai"
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  apiKey: process.env.XAI_API_KEY,
  model: "grok-2-latest",
});
```

***
