# @aigne/ollama

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
[![NPM Version](https://img.shields.io/npm/v/@aigne/ollama)](https://www.npmjs.com/package/@aigne/ollama)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/ollama)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Ollama SDK for integrating with locally hosted AI models via Ollama within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/ollama` provides a seamless integration between the AIGNE Framework and locally hosted AI models via Ollama. This package enables developers to easily leverage open-source language models running locally through Ollama in their AIGNE applications, providing a consistent interface across the framework while offering private, offline access to AI capabilities.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-ollama-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-ollama.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-ollama.png" alt="AIGNE Arch" />
</picture>

## Features

* **Ollama Integration**: Direct connection to a local Ollama instance
* **Local Model Support**: Support for a wide variety of open-source models hosted via Ollama
* **Chat Completions**: Support for chat completions API with all available Ollama models
* **Streaming Responses**: Support for streaming responses for more responsive applications
* **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
* **Consistent Interface**: Compatible with the AIGNE Framework's model interface
* **Privacy-Focused**: Run models locally without sending data to external API services
* **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/ollama @aigne/core
```

### Using yarn

```bash
yarn add @aigne/ollama @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/ollama @aigne/core
```

## Prerequisites

Before using this package, you need to have [Ollama](https://ollama.ai/) installed and running on your machine with at least one model pulled. Follow the instructions on the [Ollama website](https://ollama.ai/) to set up Ollama.

## Basic Usage

```typescript file="test/ollama-chat-model.test.ts" region="example-ollama-chat-model"
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  // Specify base URL (defaults to http://localhost:11434)
  baseURL: "http://localhost:11434",
  // Specify Ollama model to use (defaults to 'llama3')
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
/* Output:
  {
    text: "I'm an AI assistant running on Ollama with the llama3 model.",
    model: "llama3"
  }
  */
```

## Streaming Responses

```typescript file="test/ollama-chat-model.test.ts" region="example-ollama-chat-model-streaming"
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  baseURL: "http://localhost:11434",
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me what model you're using" }],
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

console.log(fullText); // Output: "I'm an AI assistant running on Ollama with the llama3 model."
console.log(json); // { model: "llama3" }
```

## License

Elastic-2.0
