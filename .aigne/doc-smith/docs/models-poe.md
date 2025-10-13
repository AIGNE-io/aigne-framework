# @aigne/poe

AIGNE Poe SDK for integrating with Poe language models and API services within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/poe` provides a seamless integration between the AIGNE Framework and Poe's language models and API services. This package enables developers to easily leverage Poe's models in their AIGNE applications, providing a consistent interface across the framework while taking advantage of Poe's advanced AI capabilities.

```d2
direction: down

Developer: {
  shape: c4-person
}

AIGNE-Application: {
  label: "AIGNE Application"
  shape: rectangle

  App-Code: {
    label: "Application Code\n(e.g., `model.invoke()`)"
    shape: rectangle
  }

  Dependencies: {
    label: "Dependencies"
    shape: rectangle

    aigne-core: {
      label: "@aigne/core"
      shape: rectangle
    }

    aigne-poe: {
      label: "@aigne/poe\n(PoeChatModel)"
      shape: rectangle
    }
  }
}

Poe-API: {
  label: "Poe API Services"
  shape: cylinder

  Poe-Models: {
    label: "Poe Language Models\n(e.g., claude-3-opus)"
    shape: rectangle
  }
}

Developer -> AIGNE-Application.App-Code: "Writes & runs code"
AIGNE-Application.Dependencies.aigne-poe -> AIGNE-Application.Dependencies.aigne-core: "Depends on & implements\ncore interfaces"
AIGNE-Application.App-Code -> AIGNE-Application.Dependencies.aigne-poe: "1. Calls 'invoke()'"
AIGNE-Application.Dependencies.aigne-poe -> Poe-API: "2. Sends API Request"
Poe-API -> AIGNE-Application.Dependencies.aigne-poe: "3. Returns Response\n(single object or stream)"
AIGNE-Application.Dependencies.aigne-poe -> AIGNE-Application.App-Code: "4. Delivers result to app"
```

## Features

*   **Poe API Integration**: Direct connection to Poe's API services.
*   **Chat Completions**: Support for Poe's chat completions API with all available models.
*   **Function Calling**: Built-in support for function calling capabilities.
*   **Streaming Responses**: Support for streaming responses for more responsive applications.
*   **Type-Safe**: Comprehensive TypeScript typings for all APIs and models.
*   **Consistent Interface**: Compatible with the AIGNE Framework's model interface.
*   **Error Handling**: Robust error handling and retry mechanisms.
*   **Full Configuration**: Extensive configuration options for fine-tuning behavior.

## Installation

Install the package using your preferred package manager:

### npm

```bash
npm install @aigne/poe @aigne/core
```

### yarn

```bash
yarn add @aigne/poe @aigne/core
```

### pnpm

```bash
pnpm add @aigne/poe @aigne/core
```

## Configuration

To get started, instantiate the `PoeChatModel`. The constructor accepts an `options` object for configuration.

```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // Options
});
```

**Constructor Options**

<x-field-group>
    <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="Your Poe API key. If not provided, the SDK will use the `POE_API_KEY` environment variable."></x-field>
    <x-field data-name="model" data-type="string" data-required="false" data-default="'gpt-5-mini'" data-desc="The specific Poe model to use for completions (e.g., 'claude-3-opus')."></x-field>
    <x-field data-name="baseURL" data-type="string" data-required="false" data-default="'https://api.poe.com/v1'" data-desc="The base URL for the Poe API."></x-field>
    <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Additional options to pass to the model API, such as `temperature`, `top_p`, etc."></x-field>
</x-field-group>

Your API key can be set in two ways:
1.  Directly in the constructor: `new PoeChatModel({ apiKey: "your-api-key" })`
2.  As an environment variable named `POE_API_KEY`.

## Usage

### Basic Invocation

To send a request to the Poe API, use the `invoke` method. It takes an object with a `messages` array and returns a promise that resolves with the model's response.

```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // Provide API key directly or use environment variable POE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model (defaults to 'gpt-5-mini')
  model: "claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
/* Output:
  {
    text: "I'm powered by Poe, using the Claude 3 Opus model from Anthropic.",
    model: "claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
  */
```

### Streaming Responses

For real-time applications, you can stream the response from the model. Set the `streaming: true` option in the `invoke` method's second argument. This returns an async iterator that yields chunks of the response as they become available.

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  apiKey: "your-api-key",
  model: "claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Which model are you using?" }],
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

console.log(fullText); // Output: "I'm powered by Poe, using the Claude 3 Opus model from Anthropic."
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## License

This package is licensed under the [Elastic-2.0 License](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md).