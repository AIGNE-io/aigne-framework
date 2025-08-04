# @aigne/doubao

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/doubao)](https://www.npmjs.com/package/@aigne/doubao)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/doubao)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Doubao SDK for integrating with Doubao AI models within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/doubao` provides a seamless integration between the AIGNE Framework and Doubao's powerful language models and API. This package enables developers to easily leverage Doubao's AI models in their AIGNE applications, providing a consistent interface across the framework while taking advantage of Doubao's advanced AI capabilities.

## Features

* **Doubao API Integration**: Direct connection to Doubao's API services
* **Chat Completions**: Support for Doubao's chat completions API with all available models
* **Function Calling**: Built-in support for function calling capabilities
* **Streaming Responses**: Support for streaming responses for more responsive applications
* **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
* **Consistent Interface**: Compatible with the AIGNE Framework's model interface
* **Error Handling**: Robust error handling and retry mechanisms
* **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/doubao @aigne/core
```

### Using yarn

```bash
yarn add @aigne/doubao @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/doubao @aigne/core
```

## Basic Usage

// todo
```typescript file="test/doubao-chat-model.test.ts" region="example-doubao-chat-model"
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  // Provide API key directly or use environment variable DOUBAO_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model version (defaults to 'doubao-seed-1-6-250615')
  model: "doubao-seed-1-6-250615",
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
    text: "Hello! I'm Doubao, an AI developed by ByteDance. My main goal is to assist you with a wide range of tasks—whether you have questions to ask, need help brainstorming ideas, want explanations on topics, or just feel like chatting. I’m here to provide helpful, clear, and friendly responses. Feel free to let me know what you need—I’m happy to help! 😊",
    usage: { inputTokens: 87, outputTokens: 219 },
    model: 'doubao-seed-1-6-250615'
  }
  */
```

## Streaming Responses

// todo
```typescript file="test/doubao-seed-1-6-250615-model.test.ts" region="example-doubao-seed-1-6-250615-model-streaming"
import { isAgentResponseDelta } from "@aigne/core";
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-api-key",
  model: "doubao-seed-1-6-250615",
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

console.log(fullText); // Output: "Hello! I'm an AI assistant powered by Doubao's language model."
console.log(json); // { model: "doubao-seed-1-6-250615", usage: { inputTokens: 7, outputTokens: 12 } }
```

## License

Elastic-2.0
