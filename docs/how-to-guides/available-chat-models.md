# Available Chat Models

The AIGNE framework supports multiple chat models, allowing you to choose the AI capabilities that best suit your application scenarios. This document provides detailed information about all available chat models, including installation instructions, basic usage, and feature overviews.

## Supported Model Providers

The AIGNE framework currently supports integration with the following model providers:

* [OpenAI](#openai) - GPT series models
* [Anthropic](#anthropic) - Claude series models
* [Google Gemini](#google-gemini) - Gemini series models
* [AWS Bedrock](#aws-bedrock) - AWS various foundation models
* [Ollama](#ollama) - Local self-hosted open source models
* [OpenRouter](#openrouter) - Unified API access to multiple models
* [DeepSeek](#deepseek) - DeepSeek models
* [XAI](#xai) - X.AI's Grok models

***

## OpenAI

**Introduction**

The `@aigne/openai` package provides seamless integration between the AIGNE framework and OpenAI's powerful language models. Through this package, developers can easily use OpenAI's GPT models in AIGNE applications.

**Installation**

```bash
# Using npm
npm install @aigne/openai @aigne/core

# Using yarn
yarn add @aigne/openai @aigne/core

# Using pnpm
pnpm add @aigne/openai @aigne/core
```

**Basic Usage**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-openai"
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});
```

***

## Anthropic

**Introduction**

The `@aigne/anthropic` package provides integration with Anthropic's Claude series models.

**Installation**

```bash
# Using npm
npm install @aigne/anthropic @aigne/core

# Using yarn
yarn add @aigne/anthropic @aigne/core

# Using pnpm
pnpm add @aigne/anthropic @aigne/core
```

**Basic Usage**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-anthropic"
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-v1",
});
```

***

## Google Gemini

**Introduction**

The `@aigne/gemini` package provides integration with Google Gemini models (such as gemini-beta).

**Installation**

```bash
# Using npm
npm install @aigne/gemini @aigne/core

# Using yarn
yarn add @aigne/gemini @aigne/core

# Using pnpm
pnpm add @aigne/gemini @aigne/core
```

**Basic Usage**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-gemini"
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash",
});
```

***

## AWS Bedrock

**Introduction**

The `@aigne/bedrock` package provides support for AWS Bedrock, enabling calls to models like Amazon nova.

**Installation**

```bash
# Using npm
npm install @aigne/bedrock @aigne/core

# Using yarn
yarn add @aigne/bedrock @aigne/core

# Using pnpm
pnpm add @aigne/bedrock @aigne/core
```

**Basic Usage**

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

**Introduction**

The `@aigne/ollama` package enables local hosting of open source models with inference through Ollama. Suitable for scenarios with privacy requirements or custom inference environments.

**Installation**

```bash
# Using npm
npm install @aigne/ollama @aigne/core

# Using yarn
yarn add @aigne/ollama @aigne/core

# Using pnpm
pnpm add @aigne/ollama @aigne/core
```

**Basic Usage**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-ollama"
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  baseURL: "http://localhost:11411",
  model: "llama3.2",
});
```

***

## OpenRouter

**Introduction**

`@aigne/open-router` provides a unified API for accessing multiple model services, allowing quick switching between underlying models based on different needs, improving development efficiency and flexibility.

**Installation**

```bash
# Using npm
npm install @aigne/open-router @aigne/core

# Using yarn
yarn add @aigne/open-router @aigne/core

# Using pnpm
pnpm add @aigne/open-router @aigne/core
```

**Basic Usage**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-open-router"
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  model: "openai/gpt-4o",
});
```

***

## DeepSeek

**Introduction**

The `@aigne/deepseek` package integrates DeepSeek models, providing an open and flexible API for advanced reasoning and conversational scenarios.

**Installation**

```bash
# Using npm
npm install @aigne/deepseek @aigne/core

# Using yarn
yarn add @aigne/deepseek @aigne/core

# Using pnpm
pnpm add @aigne/deepseek @aigne/core
```

**Basic Usage**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-deepseek"
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: "deepseek-chat",
});
```

***

## XAI

**Introduction**

`@aigne/xai` provides support for using X.AI's Grok models in conversational or Q\&A scenarios.

**Installation**

```bash
# Using npm
npm install @aigne/xai @aigne/core

# Using yarn
yarn add @aigne/xai @aigne/core

# Using pnpm
pnpm add @aigne/xai @aigne/core
```

**Basic Usage**

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-xai"
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  apiKey: process.env.XAI_API_KEY,
  model: "grok-2-latest",
});
```

***
