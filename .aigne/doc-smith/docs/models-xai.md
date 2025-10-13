# @aigne/xai

The `@aigne/xai` package provides a seamless integration between the AIGNE Framework and XAI's language models, such as Grok. It offers a standardized interface for leveraging XAI's advanced AI capabilities within your AIGNE applications, ensuring a consistent development experience.

This SDK is built on top of the OpenAI-compatible API format provided by X.AI, allowing for easy interaction with models like `grok-2-latest`.

## Architecture Overview

The `@aigne/xai` package acts as a connector between the core AIGNE framework and the XAI API, allowing you to incorporate XAI models into your applications with a consistent interface.

```d2
direction: down

AIGNE-Application: {
  label: "AIGNE Application"
  shape: rectangle

  aigne-xai: {
    label: "@aigne/xai SDK"
    shape: rectangle
  }
}

XAI-API: {
  label: "XAI API"
  shape: rectangle

  XAI-Models: {
    label: "XAI Models\n(e.g., Grok)"
    shape: cylinder
  }
}

AIGNE-Application.aigne-xai -> XAI-API: "Communicates via\nOpenAI-compatible API"
XAI-API -> XAI-API.XAI-Models: "Provides Access"
```

## Features

*   **XAI API Integration**: Direct connection to XAI's API services.
*   **Chat Completions**: Support for XAI's chat completions API with all available models.
*   **Function Calling**: Built-in support for function calling capabilities.
*   **Streaming Responses**: Enables handling of streaming responses for more responsive applications.
*   **Type-Safe**: Comes with comprehensive TypeScript typings for all APIs and models.
*   **Consistent Interface**: Fully compatible with the AIGNE Framework's model interface.
*   **Error Handling**: Includes robust error handling and retry mechanisms.
*   **Full Configuration**: Provides extensive configuration options for fine-tuning model behavior.

## Installation

You can install the package using npm, yarn, or pnpm.

### npm

```bash
npm install @aigne/xai @aigne/core
```

### yarn

```bash
yarn add @aigne/xai @aigne/core
```

### pnpm

```bash
pnpm add @aigne/xai @aigne/core
```

## Configuration

To get started, you need to configure the `XAIChatModel`. The model can be initialized with various options to customize its behavior.

```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // Provide API key directly or use the XAI_API_KEY environment variable
  apiKey: "your-xai-api-key", // Optional if env var is set

  // Specify the model to use. Defaults to 'grok-2-latest'
  model: "grok-2-latest",

  // Additional options to pass to the model
  modelOptions: {
    temperature: 0.7,
    max_tokens: 1024,
  },
});
```

The `apiKey` can be passed directly to the constructor or set as an environment variable named `XAI_API_KEY`. The SDK will automatically pick it up.

## Basic Usage

The following example demonstrates how to use the `invoke` method to send a simple request to the XAI model and receive a response.

```typescript
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

For applications requiring real-time interaction, you can stream responses from the model. This is useful for creating conversational interfaces where users see the response as it's being generated.

```typescript
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

This package is released under the Elastic-2.0 license.