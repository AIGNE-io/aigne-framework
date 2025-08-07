# @aigne/xai

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
[![NPM Version](https://img.shields.io/npm/v/@aigne/xai)](https://www.npmjs.com/package/@aigne/xai)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/xai)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE XAI SDK for integrating with XAI language models and API services within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/xai` provides a seamless integration between the AIGNE Framework and XAI's language models and API services. This package enables developers to easily leverage XAI's models in their AIGNE applications, providing a consistent interface across the framework while taking advantage of XAI's advanced AI capabilities.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/refs/heads/chore-readme-arch/assets/aigne-xai-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/refs/heads/chore-readme-arch/assets/aigne-xai.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/refs/heads/chore-readme-arch/aigne-xai.png" alt="AIGNE Arch" />
</picture>

## Features

* **XAI API Integration**: Direct connection to XAI's API services
* **Chat Completions**: Support for XAI's chat completions API with all available models
* **Function Calling**: Built-in support for function calling capabilities
* **Streaming Responses**: Support for streaming responses for more responsive applications
* **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
* **Consistent Interface**: Compatible with the AIGNE Framework's model interface
* **Error Handling**: Robust error handling and retry mechanisms
* **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/xai @aigne/core
```

### Using yarn

```bash
yarn add @aigne/xai @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/xai @aigne/core
```

## Basic Usage

```typescript file="test/xai-chat-model.test.ts" region="example-xai-chat-model"
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // Provide API key directly or use environment variable XAI_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model (defaults to 'grok-2-latest')
  model: "grok-2-latest",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
/* Output:
  {
    text: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!",
    model: "grok-2-latest",
    usage: {
      inputTokens: 6,
      outputTokens: 17
    }
  }
  */
```

## Streaming Responses

```typescript file="test/xai-chat-model.test.ts" region="example-xai-chat-model-streaming"
import { isAgentResponseDelta } from "@aigne/core";
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  apiKey: "your-api-key",
  model: "grok-2-latest",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me about yourself" }],
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

console.log(fullText); // Output: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!"
console.log(json); // { model: "grok-2-latest", usage: { inputTokens: 6, outputTokens: 17 } }
```

## License

Elastic-2.0
