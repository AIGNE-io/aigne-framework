# @aigne/open-router

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/open-router)](https://www.npmjs.com/package/@aigne/open-router)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/open-router)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE OpenRouter SDK for accessing multiple AI models through a unified API within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/open-router` provides a seamless integration between the AIGNE Framework and OpenRouter's unified API for accessing a wide variety of AI models. This package enables developers to easily leverage models from multiple providers (including OpenAI, Anthropic, Google, and more) through a single consistent interface, allowing for flexible model selection and fallback options.

## Features

* **OpenRouter API Integration**: Direct connection to OpenRouter's API services
* **Multi-Provider Access**: Access to models from OpenAI, Anthropic, Claude, Google, and many other providers
* **Unified Interface**: Consistent interface for all models regardless of their origin
* **Model Fallbacks**: Easily configure fallback options between different models
* **Chat Completions**: Support for chat completions API with all available models
* **Streaming Responses**: Support for streaming responses for more responsive applications
* **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
* **Consistent Interface**: Compatible with the AIGNE Framework's model interface
* **Error Handling**: Robust error handling and retry mechanisms
* **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/open-router @aigne/core
```

### Using yarn

```bash
yarn add @aigne/open-router @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/open-router @aigne/core
```

## Basic Usage

```typescript file="test/open-router-chat-model.test.ts" region="example-openrouter-chat-model"
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // Provide API key directly or use environment variable OPEN_ROUTER_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model (defaults to 'openai/gpt-4o')
  model: "anthropic/claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
/* Output:
  {
    text: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.",
    model: "anthropic/claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
  */
```

## Using Multiple Models with Fallbacks

```typescript
const modelWithFallbacks = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "openai/gpt-4o",
  fallbackModels: ["anthropic/claude-3-opus", "google/gemini-1.5-pro"], // Fallback order
  modelOptions: {
    temperature: 0.7,
  },
});

// Will try gpt-4o first, then claude-3-opus if that fails, then gemini-1.5-pro
const fallbackResult = await modelWithFallbacks.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});
```

## Streaming Responses

```typescript file="test/open-router-chat-model.test.ts" region="example-openrouter-chat-model-streaming"
import { isAgentResponseDelta } from "@aigne/core";
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus",
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

console.log(fullText); // Output: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic."
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## License

Elastic-2.0
