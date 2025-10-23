# AIGNE Hub

The AIGNE Hub provides a unified proxy layer for accessing a variety of Large Language Models (LLMs) and image generation services from multiple providers. By using the `@aigne/aigne-hub` package, you can seamlessly switch between different AI models without altering your client-side application logic, directing all requests through a single, consistent API endpoint.

This guide covers the installation, configuration, and usage of the `AIGNEHubChatModel` and `AIGNEHubImageModel` classes to connect your application to the AIGNE Hub.

## Overview

AIGNE Hub acts as a gateway, aggregating major AI providers such as OpenAI, Anthropic, Google, and others. This architecture simplifies integration by abstracting the specific requirements of each provider's API. You interact with any supported model by simply passing its unique identifier, which includes the provider prefix (e.g., `openai/gpt-4o-mini` or `anthropic/claude-3-sonnet`).

### Architecture Diagram

The diagram below illustrates how AIGNE Hub serves as an intermediary between your application and the various LLM providers. Your application sends a unified request to the Hub, which then routes it to the appropriate downstream service based on the specified model.

```d2
direction: down

Your-Application: {
  label: "Your Application"
  shape: rectangle
}

AIGNE-Hub: {
  label: "AIGNE Hub"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

LLM-Providers: {
  label: "LLM Providers"
  shape: rectangle
  style.stroke-dash: 4

  OpenAI: {
    label: "OpenAI\n(GPT-4o, DALL-E 3)"
  }
  Anthropic: {
    label: "Anthropic\n(Claude)"
  }
  Google: {
    label: "Google\n(Gemini, Imagen)"
  }
}

Your-Application -> AIGNE-Hub: "Unified API Request\n(e.g., 'openai/gpt-4o-mini')"
AIGNE-Hub -> LLM-Providers.OpenAI: "Routes request"
AIGNE-Hub -> LLM-Providers.Anthropic: "Routes request"
AIGNE-Hub -> LLM-Providers.Google: "Routes request"
```

### Key Features

-   **Unified Access**: A single endpoint for all LLM and image generation requests.
-   **Multi-Provider Support**: Access models from OpenAI, Anthropic, AWS Bedrock, Google, DeepSeek, Ollama, xAI, and OpenRouter.
-   **Secure Authentication**: Manage access through a single API key (`accessKey`).
-   **Chat and Image Models**: Supports both chat completions and image generation.
-   **Streaming**: Real-time, token-level streaming for chat responses.
-   **Seamless Integration**: Designed to work perfectly with the broader AIGNE Framework.

### Supported Providers

AIGNE Hub supports a wide range of AI providers through its unified API.

| Provider    | Identifier    |
| :---------- | :------------ |
| OpenAI      | `openai`      |
| Anthropic   | `anthropic`   |
| AWS Bedrock | `bedrock`     |
| DeepSeek    | `deepseek`    |
| Google      | `google`      |
| Ollama      | `ollama`      |
| OpenRouter  | `openRouter`  |
| xAI         | `xai`         |

## Installation

To get started, install the `@aigne/aigne-hub` and `@aigne/core` packages in your project.

```bash npm install icon=logos:npm
npm install @aigne/aigne-hub @aigne/core
```

```bash yarn add icon=logos:yarn
yarn add @aigne/aigne-hub @aigne/core
```

```bash pnpm add icon=logos:pnpm
pnpm add @aigne/aigne-hub @aigne/core
```

## Configuration

Both the chat and image models require configuration to connect to your AIGNE Hub instance. The primary options include the Hub's URL, an access key, and the desired model identifier.

### Chat Model Configuration

The `AIGNEHubChatModel` is configured using the following options.

<x-field-group>
  <x-field data-name="baseUrl" data-type="string" data-required="true">
    <x-field-desc markdown>The base URL of your AIGNE Hub instance (e.g., `https://your-aigne-hub-instance/ai-kit`).</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="true">
    <x-field-desc markdown>Your API access key for authenticating with the AIGNE Hub.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="true">
    <x-field-desc markdown>The model identifier, prefixed with the provider (e.g., `openai/gpt-4o-mini`).</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Optional model-specific parameters to pass through to the provider's API.</x-field-desc>
  </x-field>
</x-field-group>

### Image Model Configuration

The `AIGNEHubImageModel` uses a similar configuration structure.

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true">
    <x-field-desc markdown>The endpoint for your AIGNE Hub instance.</x-field-desc>
  </x-field>
  <x-field data-name="accessKey" data-type="string" data-required="true">
    <x-field-desc markdown>Your API access key for authentication.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="true">
    <x-field-desc markdown>The model identifier, prefixed with the provider (e.g., `openai/dall-e-3`).</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Optional model-specific parameters to pass through to the provider's API.</x-field-desc>
  </x-field>
</x-field-group>

## Usage

### Chat Completions

To perform a chat completion, instantiate `AIGNEHubChatModel` with your configuration and call the `invoke` method.

```typescript Basic Chat Completion icon=logos:typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(result);
```

**Example Response**

```json
{
  "text": "Hello! How can I help you today?",
  "model": "openai/gpt-4o-mini",
  "usage": {
    "inputTokens": 8,
    "outputTokens": 9
  }
}
```

**Example Models:**

*   `openai/gpt-4o-mini`
*   `anthropic/claude-3-sonnet`
*   `google/gemini-pro`
*   `xai/grok-1`
*   `openRouter/mistralai/mistral-7b-instruct`
*   `ollama/llama3`

### Streaming Chat Responses

For real-time responses, set the `streaming` option to `true` in the `invoke` call. This returns an async iterator that yields response chunks as they become available.

```typescript Streaming Example icon=logos:typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AIGNEHubChatModel({
  baseUrl: "https://your-aigne-hub-instance/ai-kit",
  apiKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
  },
  { streaming: true },
);

let fullText = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
  }
}

console.log("\n--- Response Complete ---");
console.log(fullText);
```

### Image Generation

AIGNE Hub supports image generation from multiple providers. Instantiate `AIGNEHubImageModel` and provide a prompt and model-specific parameters.

#### OpenAI DALL-E

```typescript Generate with DALL-E 3 icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/dall-e-3",
});

const result = await model.invoke({
  prompt: "A futuristic cityscape with flying cars and neon lights",
  n: 1,
  size: "1024x1024",
  quality: "standard",
  style: "natural",
});

console.log(result.images[0].url);
```

-   **Reference**: [OpenAI Images API Documentation](https://platform.openai.com/docs/guides/images)

#### Google Gemini Imagen

```typescript Generate with Imagen icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
  n: 1,
  aspectRatio: "1:1",
});

console.log(result.images[0].base64); // Note: Gemini models return base64 data
```

-   **Reference**: [Google AI Generative Models API](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html)

#### Ideogram

```typescript Generate with Ideogram icon=logos:typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes, cinematic style",
  aspectRatio: "1:1",
  styleType: "cinematic",
});

console.log(result.images[0].url);
```

-   **Reference**: [Ideogram API Documentation](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

## Summary

The `@aigne/aigne-hub` package simplifies multi-provider LLM integration by offering a unified client for the AIGNE Hub service. By abstracting provider-specific logic, it enables developers to build more flexible and maintainable AI-powered applications.

For more detailed information on specific models and their capabilities, please refer to the documentation provided by each respective AI provider. To explore other model integrations, see the [Models Overview](./models-overview.md).