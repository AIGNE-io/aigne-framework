# @aigne/gemini

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/gemini)](https://www.npmjs.com/package/@aigne/gemini)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/gemini)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

**English** | [中文](README.zh.md)

AIGNE Gemini SDK for integrating with Google's Gemini AI models within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/gemini` provides a seamless integration between the AIGNE Framework and Google's Gemini language models and API. This package enables developers to easily leverage Gemini's advanced AI capabilities in their AIGNE applications, providing a consistent interface across the framework while taking advantage of Google's state-of-the-art multimodal models.

## Features

* **Google Gemini API Integration**: Direct connection to Google's Gemini API services
* **Chat Completions**: Support for Gemini's chat completions API with all available models
* **Multimodal Support**: Built-in support for handling both text and image inputs
* **Function Calling**: Support for function calling capabilities
* **Streaming Responses**: Support for streaming responses for more responsive applications
* **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
* **Consistent Interface**: Compatible with the AIGNE Framework's model interface
* **Error Handling**: Robust error handling and retry mechanisms
* **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/gemini @aigne/core
```

### Using yarn

```bash
yarn add @aigne/gemini @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/gemini @aigne/core
```

## Basic Usage

```typescript file="test/gemini-chat-model.test.ts" region="example-gemini-chat-model"
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // Provide API key directly or use environment variable GOOGLE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify Gemini model version (defaults to 'gemini-1.5-pro' if not specified)
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
/* Output:
  {
    text: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
    model: "gemini-1.5-flash"
  }
  */
```

## Streaming Responses

```typescript file="test/gemini-chat-model.test.ts" region="example-gemini-chat-model-streaming"
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-api-key",
  model: "gemini-1.5-flash",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
  },
  undefined,
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}

console.log(fullText); // Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"
console.log(json); // { model: "gemini-1.5-flash" }
```

## License

Elastic-2.0
