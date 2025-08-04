# @aigne/bedrock

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
[![NPM Version](https://img.shields.io/npm/v/@aigne/bedrock)](https://www.npmjs.com/package/@aigne/bedrock)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/bedrock)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE AWS Bedrock SDK for integrating with AWS foundation models within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/bedrock` provides a seamless integration between the AIGNE Framework and AWS Bedrock foundation models. This package enables developers to easily leverage various AI models available through AWS Bedrock in their AIGNE applications, providing a consistent interface across the framework while taking advantage of AWS's secure and scalable infrastructure.

## Features

* **AWS Bedrock Integration**: Direct connection to AWS Bedrock services using the official AWS SDK
* **Multiple Model Support**: Access to Claude, Llama, Titan, and other foundation models through AWS Bedrock
* **Chat Completions**: Support for chat completions API with all available Bedrock models
* **Streaming Responses**: Support for streaming responses for more responsive applications
* **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
* **Consistent Interface**: Compatible with the AIGNE Framework's model interface
* **Error Handling**: Robust error handling and retry mechanisms
* **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/bedrock @aigne/core
```

### Using yarn

```bash
yarn add @aigne/bedrock @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/bedrock @aigne/core
```

## Basic Usage

```typescript file="test/bedrock-chat-model.test.ts" region="example-bedrock-chat-model"
import { BedrockChatModel } from "@aigne/bedrock";

const model = new BedrockChatModel({
  // Provide API key directly or use environment variable AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
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
/* Output:
  {
    text: "Hello! How can I assist you today?",
    model: "gpt-4o",
    usage: {
      inputTokens: 10,
      outputTokens: 9
    }
  }
  */
```

## Streaming Responses

```typescript file="test/bedrock-chat-model.test.ts" region="example-bedrock-chat-model-streaming"
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

const model = new BedrockChatModel({
  // Provide API key directly or use environment variable AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  model: "us.amazon.nova-premier-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
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

## License

Elastic-2.0
