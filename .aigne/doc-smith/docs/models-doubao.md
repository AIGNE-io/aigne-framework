This document provides a comprehensive guide to using the `@aigne/doubao` SDK, which integrates Doubao AI models into the AIGNE Framework. You will learn how to install, configure, and use the SDK to leverage Doubao's chat and image generation capabilities in your applications.

To illustrate the SDK's role, here is a high-level overview of the architecture:

```d2
direction: down

User-Application: {
  label: "Your Application"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  aigne-doubao-SDK: {
    label: "@aigne/doubao SDK"
    shape: rectangle
  }
}

Doubao-AI-Service: {
  label: "Doubao AI Service"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-dash: 4
  }

  Chat-Models: {
    label: "Chat Models"
  }
  Image-Models: {
    label: "Image Generation Models"
  }
}

User-Application -> AIGNE-Framework.aigne-doubao-SDK: "Uses SDK"
AIGNE-Framework.aigne-doubao-SDK -> Doubao-AI-Service: "API Calls"
```

## 1. Introduction

`@aigne/doubao` provides a seamless integration between the AIGNE Framework and Doubao's powerful language models. This package enables developers to easily leverage Doubao's AI capabilities in their AIGNE applications, offering a consistent interface while harnessing Doubao's advanced features.

### Features

*   **Direct Doubao API Integration**: Connects directly to Doubao's API services.
*   **Chat Completions**: Supports all available Doubao chat models.
*   **Function Calling**: Includes built-in support for function calling.
*   **Streaming Responses**: Enables streaming for more responsive applications.
*   **Type-Safe**: Provides comprehensive TypeScript typings for all APIs.
*   **Consistent Interface**: Aligns with the AIGNE Framework's model interface for interoperability.
*   **Robust Error Handling**: Features built-in error handling and retry mechanisms.
*   **Full Configuration**: Offers extensive options for fine-tuning model behavior.

## 2. Installation

To get started, install the `@aigne/doubao` and `@aigne/core` packages using your preferred package manager.

### Using npm

```bash
npm install @aigne/doubao @aigne/core
```

### Using yarn

```bash
yarn add @aigne/doubao @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/doubao @aigne/core
```

## 3. Configuration

Before using the SDK, you need to configure your Doubao API key. The key can be provided directly in the model constructor or through the `DOUBAO_API_KEY` environment variable.

```typescript
import { DoubaoChatModel } from "@aigne/doubao";

// Option 1: Provide API key directly
const model = new DoubaoChatModel({
  apiKey: "your-api-key",
});

// Option 2: Use environment variable (DOUBAO_API_KEY)
// Make sure the variable is set in your environment
// const model = new DoubaoChatModel();
```

## 4. Chat Model Usage

The `DoubaoChatModel` class provides an interface for interacting with Doubao's chat completion models.

### Basic Usage

Here is a simple example of how to invoke the chat model to get a response.

```typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  // Provide API key directly or use environment variable DOUBAO_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model version (defaults to 'doubao-seed-1-6-250615')
  model: "doubao-seed-1-6-250615",
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
    text: "Hello! I'm an AI assistant powered by Doubao's language model.",
    model: "doubao-seed-1-6-250615",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
*/
```

### Streaming Responses

For real-time applications, you can stream responses from the model. This allows you to process the output as it becomes available.

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-api-key",
  model: "doubao-seed-1-6-250615",
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

console.log(fullText); // Output: "Hello! I'm an AI assistant powered by Doubao's language model."
console.log(json); // { model: "doubao-seed-1-6-250615", usage: { inputTokens: 7, outputTokens: 12 } }
```

## 5. Image Model Usage

The `DoubaoImageModel` class allows you to generate images using Doubao's image creation models, such as `doubao-seedream-4-0-250828`.

### Basic Image Generation

The following example demonstrates how to generate an image from a text prompt.

```typescript
import { DoubaoImageModel } from "@aigne/doubao";

async function generateImage() {
  const imageModel = new DoubaoImageModel({
    apiKey: "your-api-key", // Or use DOUBAO_API_KEY env var
    model: "doubao-seedream-4-0-250828", // Specify the image model
  });

  const output = await imageModel.invoke({
    prompt: "A futuristic cityscape at sunset",
  });

  // The output contains the generated image data (URL or base64)
  console.log(output.images);
}

generateImage();
```

The `output.images` array will contain objects with either a `url` or a `data` property (base64 encoded) for each generated image.

## 6. License

The `@aigne/doubao` SDK is released under the Elastic-2.0 License.