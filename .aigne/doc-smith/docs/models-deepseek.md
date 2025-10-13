# @aigne/deepseek

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
[![NPM Version](https://img.shields.io/npm/v/@aigne/deepseek)](https://www.npmjs.com/package/@aigne/deepseek)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/deepseek)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Deepseek SDK for integrating with Deepseek AI models within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/deepseek` provides a seamless integration between the AIGNE Framework and Deepseek's powerful language models. This package enables developers to easily leverage Deepseek's AI models in their AIGNE applications, providing a consistent interface across the framework while taking advantage of Deepseek's advanced AI capabilities.

```d2
direction: down

Your-Application: {
  label: "Your Application"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle
  grid-columns: 2
  grid-gap: 100

  aigne-core: {
    label: "@aigne/core"
    shape: rectangle
    AIGNE-Model-Interface: {
      label: "AIGNE Model\nInterface"
      shape: rectangle
    }
  }

  aigne-deepseek: {
    label: "@aigne/deepseek"
    shape: rectangle
    DeepSeekChatModel: {
      label: "DeepSeekChatModel"
      shape: rectangle
    }
  }
}

Deepseek-API: {
  label: "Deepseek API"
  shape: rectangle
}

Your-Application -> AIGNE-Framework.aigne-deepseek.DeepSeekChatModel: "Invokes"
AIGNE-Framework.aigne-deepseek.DeepSeekChatModel -> AIGNE-Framework.aigne-core.AIGNE-Model-Interface: "Implements" {
  style.stroke-dash: 2
}
AIGNE-Framework.aigne-deepseek.DeepSeekChatModel -> Deepseek-API: "Makes API Calls"
```

## Features

*   **Deepseek API Integration**: Direct connection to Deepseek's API services.
*   **Chat Completions**: Support for Deepseek's chat completions API with all available models.
*   **Function Calling**: Built-in support for function calling capabilities.
*   **Streaming Responses**: Support for streaming responses for more responsive applications.
*   **Type-Safe**: Comprehensive TypeScript typings for all APIs and models.
*   **Consistent Interface**: Compatible with the AIGNE Framework's model interface.
*   **Error Handling**: Robust error handling and retry mechanisms.
*   **Full Configuration**: Extensive configuration options for fine-tuning behavior.

## Installation

Install the package with your favorite package manager:

### npm

```bash
npm install @aigne/deepseek @aigne/core
```

### yarn

```bash
yarn add @aigne/deepseek @aigne/core
```

### pnpm

```bash
pnpm add @aigne/deepseek @aigne/core
```

## API Reference

### `DeepSeekChatModel`

The `DeepSeekChatModel` class is the primary interface for interacting with the Deepseek Chat API. It extends the `OpenAIChatModel` from `@aigne/openai`, providing a familiar, OpenAI-compatible API format.

#### Constructor

To get started, create a new instance of `DeepSeekChatModel`.

```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key", // Or set DEEPSEEK_API_KEY env variable
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});
```

**Parameters**

<x-field-group>
    <x-field data-name="options" data-type="OpenAIChatModelOptions" data-required="false" data-desc="Configuration options for the model.">
        <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="Your Deepseek API key. If not provided, it will be read from the `DEEPSEEK_API_KEY` environment variable."></x-field>
        <x-field data-name="model" data-type="string" data-default="deepseek-chat" data-required="false" data-desc="The model to use for chat completions (e.g., 'deepseek-chat', 'deepseek-coder')."></x-field>
        <x-field data-name="baseURL" data-type="string" data-default="https://api.deepseek.com" data-required="false" data-desc="The base URL for the Deepseek API."></x-field>
        <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Additional options to pass to the model API, such as `temperature`, `top_p`, etc."></x-field>
    </x-field>
</x-field-group>

## Basic Usage

To send a simple request to the model, use the `invoke` method.

```typescript
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

For real-time applications, you can stream the response from the model. Set the `streaming: true` option in the `invoke` call to receive chunks of data as they become available.

```typescript
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

This package is licensed under the [Elastic-2.0 License](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md).