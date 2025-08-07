# @aigne/aigne-hub

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

[![GitHub stars](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/aigne-hub)](https://www.npmjs.com/package/@aigne/aigne-hub)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/aigne-hub)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE SDK for accessing AI chat models via [AIGNE Hub](https://github.com/AIGNE-io/aigne-framework), a unified proxy layer for multiple LLM providers.

# Introduction

`@aigne/aigne-hub` connects your application to the AIGNE Hub service, a gateway that aggregates multiple LLM providers such as OpenAI, Anthropic, AWS Bedrock, Google, DeepSeek, Ollama, xAI, and OpenRouter. You can call any supported model simply by passing the appropriate `model` name.

It enables you to switch providers without changing your client-side logic.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/refs/heads/chore-readme-arch/assets/aigne-hub-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/refs/heads/chore-readme-arch/assets/aigne-hub.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/refs/heads/chore-readme-arch/aigne-hub.png" alt="AIGNE Arch" />
</picture>

## Supported Providers

The AIGNE Hub backend supports the following AI providers via a single, unified API:

```ts
type AIProvider =
  | "openai"
  | "anthropic"
  | "bedrock"
  | "deepseek"
  | "google"
  | "ollama"
  | "openRouter"
  | "xai";
```

## Example models:

* openai/gpt-4o-mini
* anthropic/claude-3-sonnet
* bedrock/us.amazon.titan-text-lite-v1
* google/gemini-pro
* xai/grok-1
* openRouter/mistralai/mistral-7b-instruct
* ollama/llama3

## Features

* 🔌 Unified LLM Access: Route all requests through one endpoint
* 🧠 Multi-provider Support: Choose from any supported vendor via the model name
* 🔐 API Key Security: Use accessKey to manage authentication and authorization
* 💬 Chat Completions: Works with standard messages format ({ role, content })
* 🌊 Streaming Support: Enable streaming: true for real-time token-level responses
* 🧱 Framework Compatible: Seamless integration with the AIGNE Framework

## Installation

### Using npm

```
npm install @aigne/aigne-hub @aigne/core
```

### Using yarn

```
yarn add @aigne/aigne-hub @aigne/core
```

### Using pnpm

```
pnpm add @aigne/aigne-hub @aigne/core
```

## Basic Usage

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
/* Example Output:
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

## Streaming Usage

```typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

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

console.log(fullText); // Output: "Hello! How can I assist you today?"
console.log(json); // { model: "gpt-4o", usage: { inputTokens: 10, outputTokens: 9 } }
```

## Configuration Options

```typescript
interface ClientChatModelOptions {
  url: string; // Your AIGNE Hub endpoint
  accessKey: string; // API access key
  model: string; // Model name with provider prefix (e.g. openai/gpt-4o-mini)
  modelOptions?: object; // Optional model-specific parameters
}
```

## License

Elastic-2.0
