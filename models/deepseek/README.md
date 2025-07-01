# @aigne/deepseek

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/deepseek)](https://www.npmjs.com/package/@aigne/deepseek)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/deepseek)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

**English** | [中文](README.zh.md)

AIGNE Deepseek SDK for integrating with Deepseek AI models within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/deepseek` provides a seamless integration between the AIGNE Framework and Deepseek's powerful language models and API. This package enables developers to easily leverage Deepseek's AI models in their AIGNE applications, providing a consistent interface across the framework while taking advantage of Deepseek's advanced AI capabilities.

## Features

* **Deepseek API Integration**: Direct connection to Deepseek's API services
* **Chat Completions**: Support for Deepseek's chat completions API with all available models
* **Function Calling**: Built-in support for function calling capabilities
* **Streaming Responses**: Support for streaming responses for more responsive applications
* **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
* **Consistent Interface**: Compatible with the AIGNE Framework's model interface
* **Error Handling**: Robust error handling and retry mechanisms
* **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/deepseek @aigne/core
```

### Using yarn

```bash
yarn add @aigne/deepseek @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/deepseek @aigne/core
```

## Basic Usage

```typescript file="test/deepseek-chat-model.test.ts" region="example-deepseek-chat-model"
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // Provide API key directly or use environment variable DEEPSEEK_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model version (defaults to 'deepseek-chat')
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
/* Output:
  {
    text: "Hello! I'm an AI assistant powered by DeepSeek's language model.",
    model: "deepseek-chat",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
  */
```

## Streaming Responses

```typescript file="test/deepseek-chat-model.test.ts" region="example-deepseek-chat-model-streaming"
import { isAgentResponseDelta } from "@aigne/core";
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key",
  model: "deepseek-chat",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
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

console.log(fullText); // Output: "Hello! I'm an AI assistant powered by DeepSeek's language model."
console.log(json); // { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

## License

Elastic-2.0
