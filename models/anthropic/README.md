# @aigne/anthropic

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/anthropic)](https://www.npmjs.com/package/@aigne/anthropic)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/anthropic)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

**English** | [中文](README.zh.md)

AIGNE Anthropic SDK for integrating with Claude AI models within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/anthropic` provides a seamless integration between the AIGNE Framework and Anthropic's Claude language models and API. This package enables developers to easily leverage Anthropic's Claude models in their AIGNE applications, providing a consistent interface across the framework while taking advantage of Claude's advanced AI capabilities.

## Features

* **Anthropic API Integration**: Direct connection to Anthropic's API services using the official SDK
* **Chat Completions**: Support for Claude's chat completions API with all available models
* **Tool Calling**: Built-in support for Claude's tool calling capability
* **Streaming Responses**: Support for streaming responses for more responsive applications
* **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
* **Consistent Interface**: Compatible with the AIGNE Framework's model interface
* **Error Handling**: Robust error handling and retry mechanisms
* **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/anthropic @aigne/core
```

### Using yarn

```bash
yarn add @aigne/anthropic @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/anthropic @aigne/core
```

## Basic Usage

```typescript file="test/anthropic-chat-model.test.ts" region="example-anthropic-chat-model"
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // Provide API key directly or use environment variable ANTHROPIC_API_KEY or CLAUDE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify Claude model version (defaults to 'claude-3-7-sonnet-latest')
  model: "claude-3-haiku-20240307",
  // Configure model behavior
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
/* Output:
  {
    text: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
    model: "claude-3-haiku-20240307",
    usage: {
      inputTokens: 8,
      outputTokens: 15
    }
  }
  */
```

## Streaming Responses

```typescript file="test/anthropic-chat-model.test.ts" region="example-anthropic-chat-model-streaming-async-generator"
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-haiku-20240307",
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

console.log(fullText); // Output: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?"
console.log(json); // { model: "claude-3-haiku-20240307", usage: { inputTokens: 8, outputTokens: 15 } }
```

## License

Elastic-2.0
