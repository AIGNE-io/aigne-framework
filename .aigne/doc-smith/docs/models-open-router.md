This document provides a comprehensive guide for developers integrating the `@aigne/open-router` package. You will learn how to install, configure, and use this package to leverage a wide variety of AI models through a unified interface.

# @aigne/open-router

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)"/>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)"/>
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

`@aigne/open-router` provides seamless integration between the AIGNE Framework and OpenRouter's unified API. This allows developers to access a vast array of AI models from providers like OpenAI, Anthropic, and Google through a single, consistent interface, simplifying model selection and enabling robust fallback configurations.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter-dark.png" media="(prefers-color-scheme: dark)"/>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openrouter.png" media="(prefers-color-scheme: light)"/>
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-openrouter.png" alt="AIGNE OpenRouter Architecture Diagram" />
</picture>

## Features

*   **Unified API**: Access models from dozens of providers with a single, consistent interface.
*   **Model Fallbacks**: Automatically switch to backup models if a primary model fails.
*   **Streaming Support**: Enable real-time, responsive applications with streaming responses.
*   **AIGNE Framework Compatibility**: Integrates perfectly with the `@aigne/core` model interface.
*   **Extensive Configuration**: Fine-tune model behavior with a wide range of options.
*   **Type-Safe**: Benefit from comprehensive TypeScript typings for all APIs and models.

## Installation

To get started, install the necessary packages using your preferred package manager:

### npm

```bash
npm install @aigne/open-router @aigne/core
```

### yarn

```bash
yarn add @aigne/open-router @aigne/core
```

### pnpm

```bash
pnpm add @aigne/open-router @aigne/core
```

## Configuration and Basic Usage

The primary export of this package is the `OpenRouterChatModel`. It extends the `@aigne/openai` package's `OpenAIChatModel`, so it accepts the same options.

To configure the model, you need to provide your OpenRouter API key. You can do this by passing it directly to the constructor or by setting the `OPEN_ROUTER_API_KEY` environment variable.

Here is a basic example of how to instantiate and use the model:

```typescript
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
/* Output:
  {
    text: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.",
    model: "anthropic/claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
*/
```

## Streaming Responses

For applications requiring real-time interaction, you can enable streaming to receive response chunks as they are generated. Set the `streaming: true` option in the `invoke` method.

```typescript
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

console.log(fullText); // Output: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic."
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## Using Multiple Models with Fallbacks

One of the key features of `@aigne/open-router` is the ability to configure fallback models. If the primary model fails for any reason (e.g., API error, rate limiting), the system will automatically try the next model in the specified list.

You can define the fallback order using the `fallbackModels` option.

```typescript
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
```

The following diagram illustrates the fallback logic:

```d2
direction: down

Your-App: {
  label: "Your App"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  aigne-open-router: {
    label: "@aigne/open-router"
  }
}

OpenRouter-API: {
  label: "OpenRouter API"
  shape: rectangle
}

Model-Providers: {
  label: "Model Providers"
  shape: rectangle
  grid-columns: 3

  OpenAI: {
    label: "OpenAI\n(gpt-4o)"
    shape: cylinder
  }
  Anthropic: {
    label: "Anthropic\n(claude-3-opus)"
    shape: cylinder
  }
  Google: {
    label: "Google\n(gemini-1.5-pro)"
    shape: cylinder
  }
}

Your-App -> AIGNE-Framework.aigne-open-router: "1. invoke()"

AIGNE-Framework.aigne-open-router -> OpenRouter-API: "2. Try Primary Model"
OpenRouter-API -> Model-Providers.OpenAI

Model-Providers.OpenAI -> AIGNE-Framework.aigne-open-router: {
  label: "3. Failure"
  style: {
    stroke-dash: 2
  }
}
AIGNE-Framework.aigne-open-router -> OpenRouter-API: {
  label: "4. Try Fallback 1"
  style: {
    stroke-dash: 2
  }
}
OpenRouter-API -> Model-Providers.Anthropic

Model-Providers.Anthropic -> AIGNE-Framework.aigne-open-router: {
  label: "5. Failure"
  style: {
    stroke-dash: 2
  }
}
AIGNE-Framework.aigne-open-router -> OpenRouter-API: {
  label: "6. Try Fallback 2"
  style: {
    stroke-dash: 2
  }
}
OpenRouter-API -> Model-Providers.Google

Model-Providers.Google -> AIGNE-Framework.aigne-open-router: "7. Success"
AIGNE-Framework.aigne-open-router -> Your-App: "8. Return Response"

```