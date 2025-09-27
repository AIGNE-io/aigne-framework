# OpenRouter

Access a diverse marketplace of AI models from multiple providers through a single, unified OpenRouter API. The `@aigne/open-router` package provides seamless integration between the AIGNE Framework and OpenRouter, allowing you to easily use models from OpenAI, Anthropic, Google, and more with a consistent interface.

This approach simplifies model management, enabling flexible selection and the setup of fallback options to ensure your application remains robust.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter.png" alt="AIGNE OpenRouter Architecture Diagram" />
</picture>

## Features

*   **Multi-Provider Access**: Connect to models from dozens of providers like OpenAI, Anthropic, Google, and more through a single API.
*   **Unified Interface**: Use a consistent API for all models, regardless of their provider.
*   **Model Fallbacks**: Easily configure fallback models to be used if the primary choice fails.
*   **Chat Completions**: Full support for the standard chat completions API.
*   **Streaming Responses**: Get real-time, token-by-token responses for more interactive experiences.
*   **Full Configuration**: Extensive options to fine-tune model behavior, including temperature and other parameters.

## Installation

To get started, install the necessary AIGNE packages in your project.

```bash NPM
npm install @aigne/open-router @aigne/core
```

```bash Yarn
yarn add @aigne/open-router @aigne/core
```

```bash PNPM
pnpm add @aigne/open-router @aigne/core
```

## Configuration

When creating an instance of `OpenRouterChatModel`, you can provide several options to customize its behavior. Your OpenRouter API key can be passed directly in the constructor or set as an environment variable named `OPEN_ROUTER_API_KEY`.

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your OpenRouter API key. If not provided, the system will look for the `OPEN_ROUTER_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="openai/gpt-4o" data-required="false">
    <x-field-desc markdown>The identifier for the model you want to use, e.g., `anthropic/claude-3-opus`. Defaults to `openai/gpt-4o`.</x-field-desc>
  </x-field>
  <x-field data-name="fallbackModels" data-type="string[]" data-required="false">
    <x-field-desc markdown>An array of model identifiers to use as fallbacks if the primary model fails.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://openrouter.ai/api/v1" data-required="false">
    <x-field-desc markdown>The base URL for the OpenRouter API. You typically won't need to change this.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to pass to the model, such as `temperature`, `max_tokens`, etc.</x-field-desc>
  </x-field>
</x-field-group>

## Basic Usage

Here is a simple example of how to use the `OpenRouterChatModel` to get a response.

```typescript Basic Chat Completion icon=logos:typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // Provide API key directly or use environment variable OPEN_ROUTER_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model (defaults to 'openai/gpt-4o')
  model: "anthropic/claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

**Output:**

```json Output
{
  text: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.",
  model: "anthropic/claude-3-opus",
  usage: {
    inputTokens: 5,
    outputTokens: 14
  }
}
```

## Using Multiple Models with Fallbacks

You can specify a list of fallback models that will be tried in order if the primary model request fails. This adds resilience to your application.

```typescript Fallback Configuration icon=logos:typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const modelWithFallbacks = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "openai/gpt-4o",
  fallbackModels: ["anthropic/claude-3-opus", "google/gemini-1.5-pro"], // Fallback order
  modelOptions: {
    temperature: 0.7,
  },
});

// Will try gpt-4o first, then claude-3-opus if that fails, then gemini-1.5-pro
const fallbackResult = await modelWithFallbacks.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(fallbackResult);
```

## Streaming Responses

For applications that require real-time feedback, like chatbots, you can stream the response token by token.

```typescript Streaming Example icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus",
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

console.log(fullText);
console.log(json);
```

**Output:**

```text Text Output
I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.
```
```json JSON Output
{ model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## Summary

The OpenRouter integration provides a powerful way to access a vast ecosystem of AI models through a simple, unified interface. To explore other available models, check out the main [AI Models](./models.md) page or dive into specific providers like [OpenAI](./models-openai.md) and [Anthropic](./models-anthropic.md).