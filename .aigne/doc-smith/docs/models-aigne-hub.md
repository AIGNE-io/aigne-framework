# @aigne/aigne-hub

The `@aigne/aigne-hub` SDK provides a unified interface for accessing a wide range of AI models for chat and image generation. It acts as a client for the [AIGNE Hub](https://github.com/AIGNE-io/aigne-framework), a powerful proxy layer that connects to multiple Large Language Model (LLM) providers.

This guide will walk you through the installation, basic setup, and usage of the SDK for both chat completions and image generation.

## Introduction

`@aigne/aigne-hub` simplifies interaction with various AI providers by routing requests through the AIGNE Hub service. This gateway aggregates providers like OpenAI, Anthropic, AWS Bedrock, Google, and more, allowing you to switch between them seamlessly just by changing a model identifier. This approach abstracts away the complexity of handling different APIs and authentication methods, letting you focus on building your application.

### How It Works

The SDK sends requests from your application to a centralized AIGNE Hub instance. The Hub then forwards these requests to the appropriate downstream AI provider based on the specified model name. This architecture provides a single point of access and control for all AI interactions.

```d2
direction: down

Your-Application: {
  label: "Your Application"
  shape: rectangle

  aigne-aigne-hub: {
    label: "@aigne/aigne-hub SDK"
    shape: rectangle
  }
}

AIGNE-Hub: {
  label: "AIGNE Hub Service"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

LLM-Providers: {
  label: "LLM Providers"
  shape: rectangle
  grid-columns: 4

  OpenAI: {}
  Anthropic: {}
  Google: {}
  AWS-Bedrock: {
    label: "AWS Bedrock"
  }
  DeepSeek: {}
  Ollama: {}
  xAI: {}
  OpenRouter: {}
}

Your-Application.aigne-aigne-hub -> AIGNE-Hub: "API Request"
AIGNE-Hub -> LLM-Providers: "Aggregates & Routes"
```

## Features

-   🔌 **Unified LLM Access**: Route all requests through a single, consistent endpoint.
-   🧠 **Multi-Provider Support**: Access models from OpenAI, Anthropic, Google, and more using a simple `provider/model` naming convention.
-   🔐 **Secure Authentication**: Manage API access securely using a single `accessKey`.
-   💬 **Chat Completions**: Standardized interface for chat models using the `{ role, content }` message format.
-   🎨 **Image Generation**: Generate images with models from OpenAI (DALL-E), Google (Imagen), and Ideogram.
-   🌊 **Streaming Support**: Get real-time, token-level responses for chat models by enabling streaming.
-   🧱 **Framework Compatible**: Integrates seamlessly with the broader AIGNE Framework.

## Installation

To get started, install the `@aigne/aigne-hub` and `@aigne/core` packages using your preferred package manager.

**npm**
```bash
npm install @aigne/aigne-hub @aigne/core
```

**yarn**
```bash
yarn add @aigne/aigne-hub @aigne/core
```

**pnpm**
```bash
pnpm add @aigne/aigne-hub @aigne/core
```

## Chat Models

The `AIGNEHubChatModel` class is your primary tool for interacting with text-based AI models.

### Basic Usage

To use a chat model, instantiate `AIGNEHubChatModel` with your AIGNE Hub endpoint, an access key, and the desired model identifier.

```typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(result);
/* Example Output:
  {
    text: "Hello! How can I help you today?",
    model: "openai/gpt-4o-mini",
    usage: {
      inputTokens: 8,
      outputTokens: 9
    }
  }
*/
```

### Streaming Usage

For interactive, real-time applications, you can stream the response from the model. Set the `streaming` option to `true` in the `invoke` call and iterate over the resulting stream to process chunks as they arrive.

```typescript
import { AIGNEHubChatModel, isAgentResponseDelta } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
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

console.log(fullText); // "I am an AI assistant, ready to help you with any questions or tasks you have."
console.log(json); // { model: "openai/gpt-4o-mini", usage: { ... } }
```

### Configuration

The `AIGNEHubChatModel` constructor accepts the following options:

| Parameter      | Type     | Description                                                              |
| -------------- | -------- | ------------------------------------------------------------------------ |
| `url`          | `string` | The endpoint URL of your AIGNE Hub instance.                             |
| `accessKey`    | `string` | Your secret API key for authenticating with the AIGNE Hub.               |
| `model`        | `string` | The model identifier, prefixed with the provider (e.g., `openai/gpt-4o`). |
| `modelOptions` | `object` | Optional. Additional parameters to pass to the underlying model.         |

## Image Generation Models

The `AIGNEHubImageModel` class allows you to generate images using various AI models.

### Basic Usage

Instantiate `AIGNEHubImageModel` with your Hub credentials and the desired image model. Then, call `invoke` with a prompt and other model-specific parameters.

```typescript
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
});

console.log(result);
/* Example Output:
  {
    images: [{ url: "https://..." }],
    usage: { inputTokens: 0, outputTokens: 0 },
    model: "openai/dall-e-3"
  }
*/
```

### Supported Providers and Parameters

AIGNE Hub supports image generation from multiple providers, each with its own set of capabilities and parameters.

#### OpenAI DALL-E

-   **Models**: `dall-e-2`, `dall-e-3`
-   **Key Parameters**: `prompt`, `size`, `n`, `quality`, `style`.
-   **Reference**: [OpenAI Images API Documentation](https://platform.openai.com/docs/guides/images)

```typescript
// Example for DALL-E 3
const result = await model.invoke({
  model: "openai/dall-e-3",
  prompt: "A photorealistic image of a cat wearing sunglasses",
  size: "1024x1024",
  quality: "hd",
  style: "vivid",
});
```

#### Google Gemini & Imagen

-   **Models**: `imagen-4.0`, `gemini-pro-vision`, etc.
-   **Key Parameters**: `prompt`, `imageSize`, `aspectRatio`, `guidanceScale`, `negativePrompt`.
-   **Note**: Gemini image models currently return images in `base64` format.
-   **Reference**: [Google GenAI Models Documentation](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html)

```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
  n: 1,
  imageSize: "1024x1024",
  aspectRatio: "1:1",
});
```

#### Ideogram

-   **Models**: `ideogram-v3`
-   **Key Parameters**: `prompt`, `resolution`, `aspectRatio`, `renderingSpeed`, `styleType`.
-   **Reference**: [Ideogram API Documentation](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes",
  resolution: "1024x1024",
  styleType: "cinematic",
});
```

### Configuration

The `AIGNEHubImageModel` constructor accepts the following options:

| Parameter      | Type     | Description                                                                 |
| -------------- | -------- | --------------------------------------------------------------------------- |
| `url`          | `string` | The endpoint URL of your AIGNE Hub instance.                                |
| `accessKey`    | `string` | Your secret API key for authenticating with the AIGNE Hub.                  |
| `model`        | `string` | The model identifier, prefixed with the provider (e.g., `openai/dall-e-3`). |
| `modelOptions` | `object` | Optional. Additional parameters to pass to the underlying model.            |