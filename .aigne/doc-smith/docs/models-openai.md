This document provides a comprehensive guide to using the `@aigne/openai` package, an SDK designed for seamless integration with OpenAI's GPT models within the AIGNE Framework.

<div align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</div>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/openai)](https://www.npmjs.com/package/@aigne/openai)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/openai)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

### Introduction

`@aigne/openai` provides a seamless integration between the AIGNE Framework and OpenAI's powerful language models. This package enables developers to easily leverage OpenAI's GPT models in their AIGNE applications, providing a consistent interface across the framework while taking advantage of OpenAI's advanced AI capabilities.

### Architecture

The `@aigne/openai` package acts as a connector, allowing the AIGNE Framework to communicate directly with the OpenAI API. This integration enables you to incorporate OpenAI's advanced models into your AIGNE applications seamlessly.
<diagram>
```d2
direction: down

Developer: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"

  AIGNE-Application: {
    label: "AIGNE Application"
    shape: rectangle
  }

  aigne-openai: {
    label: "@aigne/openai\n(Connector)"
    shape: rectangle
  }
}

OpenAI-API: {
  label: "OpenAI API\n(GPT Models)"
  shape: rectangle
}

Developer -> AIGNE-Framework.AIGNE-Application: "Builds"
AIGNE-Framework.AIGNE-Application -> AIGNE-Framework.aigne-openai: "Uses"
AIGNE-Framework.aigne-openai -> OpenAI-API: "API Calls"
```
</diagram>

## Features

*   **OpenAI API Integration**: Direct connection to OpenAI's API services using the official SDK.
*   **Chat Completions**: Support for OpenAI's chat completions API with all available models.
*   **Function Calling**: Built-in support for OpenAI's function calling capability.
*   **Streaming Responses**: Support for streaming responses for more responsive applications.
*   **Type-Safe**: Comprehensive TypeScript typings for all APIs and models.
*   **Consistent Interface**: Compatible with the AIGNE Framework's model interface.
*   **Error Handling**: Robust error handling and retry mechanisms.
*   **Full Configuration**: Extensive configuration options for fine-tuning behavior.

## Installation

Install the package and its core dependency using your preferred package manager:

### npm

```bash
npm install @aigne/openai @aigne/core
```

### yarn

```bash
yarn add @aigne/openai @aigne/core
```

### pnpm

```bash
pnpm add @aigne/openai @aigne/core
```

## API Reference

The `@aigne/openai` package exposes two main classes for interacting with OpenAI's services: `OpenAIChatModel` and `OpenAIImageModel`.

### OpenAIChatModel

The `OpenAIChatModel` class provides access to OpenAI's chat completion capabilities, including text generation, tool use, JSON structured output, and image understanding.

#### Configuration

You can configure the `OpenAIChatModel` by passing an `OpenAIChatModelOptions` object to its constructor.

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="Your OpenAI API key. If not provided, it will fall back to the `OPENAI_API_KEY` environment variable."></x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="An optional base URL for the OpenAI API, useful for proxies."></x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false" data-desc="The OpenAI model to use for chat completions."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Additional options to control the model's behavior.">
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness. Lower values make the model more deterministic."></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus sampling parameter."></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="Penalizes new tokens based on their existing frequency."></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="Penalizes new tokens based on whether they appear in the text so far."></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="Whether to enable parallel function calling."></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="Partial<ClientOptions>" data-required="false" data-desc="Additional client options for the underlying OpenAI SDK."></x-field>
</x-field-group>

#### Basic Usage

Here is a basic example of how to instantiate and use the `OpenAIChatModel`.

```typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // Provide API key directly or use environment variable OPENAI_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  model: "gpt-4o", // Defaults to "gpt-4o-mini" if not specified
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

#### Streaming Responses

For real-time applications, you can stream the response from the model.

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
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

### OpenAIImageModel

The `OpenAIImageModel` class allows you to generate and edit images using OpenAI's DALL-E models.

#### Configuration

You can configure the `OpenAIImageModel` by passing an `OpenAIImageModelOptions` object to its constructor.

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="Your OpenAI API key. If not provided, it will fall back to the `OPENAI_API_KEY` environment variable."></x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="An optional base URL for the OpenAI API, useful for proxies."></x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false" data-desc="The OpenAI model to use for image generation (e.g., 'dall-e-2', 'dall-e-3')."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Additional options to control the image generation behavior, such as size, quality, and style."></x-field>
  <x-field data-name="clientOptions" data-type="Partial<ClientOptions>" data-required="false" data-desc="Additional client options for the underlying OpenAI SDK."></x-field>
</x-field-group>

#### Usage Example

Below is an example of how to generate an image.

```typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    size: "1024x1024",
    quality: "hd",
  },
});

const result = await imageModel.process({
  prompt: "A futuristic cityscape at sunset, with flying cars and neon lights.",
});

console.log(result.images);
/* Output:
[
  {
    type: 'url',
    url: 'https://...', // URL of the generated image
    mimeType: 'image/png'
  }
]
*/
```

## License

This package is licensed under the [Elastic-2.0 License](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md).