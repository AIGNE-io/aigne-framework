# Google Gemini

This document provides a comprehensive guide for configuring and using Google's Gemini models within the AIGNE Framework. It covers the setup of API keys, model selection, and the specific features available through the `@aigne/gemini` package for both chat and image generation functionalities.

The `@aigne/gemini` package provides a direct integration with Google's Gemini and Imagen APIs, allowing developers to leverage these advanced multimodal models in their AIGNE applications through a consistent and predictable interface.

## Features

- **Direct Google API Integration**: Connects directly to Google's Gemini and Imagen API services.
- **Chat Completions**: Full support for Gemini chat models, including `gemini-1.5-pro` and `gemini-1.5-flash`.
- **Image Generation**: Supports both Imagen (e.g., `imagen-4.0-generate-001`) and Gemini models for image generation.
- **Multimodal Capabilities**: Natively handles both text and image inputs for multimodal applications.
- **Function Calling**: Integrates with Gemini's function calling capabilities.
- **Streaming Responses**: Enables real-time, responsive applications by supporting streaming responses.
- **Type-Safe**: Provides comprehensive TypeScript typings for all API interactions and model configurations.

## Installation

To begin, install the necessary packages using your preferred package manager.

<tabs>
<tab title="npm">
```bash
npm install @aigne/gemini @aigne/core
```
</tab>
<tab title="yarn">
```bash
yarn add @aigne/gemini @aigne/core
```
</tab>
<tab title="pnpm">
```bash
pnpm add @aigne/gemini @aigne/core
```
</tab>
</tabs>

## Configuration

The Gemini models require an API key for authentication. The key can be provided directly in the model constructor or, for better security and flexibility, through an environment variable.

Set the following environment variable to allow the framework to automatically detect your API key:

```bash title="Environment Variable"
export GEMINI_API_KEY="your-google-api-key"
```

## Chat Model

The `GeminiChatModel` class provides an interface for interacting with Google's chat-based models.

### Basic Usage

Below is a standard example of instantiating the `GeminiChatModel` and invoking it to get a response.

```typescript "Chat Model Example" icon=logos:javascript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // The API key is optional if the GEMINI_API_KEY environment variable is set.
  apiKey: "your-google-api-key",

  // Specify the model version. Defaults to 'gemini-1.5-pro' if not provided.
  model: "gemini-1.5-flash",

  // Additional model options can be set.
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

The expected output will be an object containing the model's response.

```json "Example Response"
{
  "text": "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
  "model": "gemini-1.5-flash"
}
```

### Streaming Responses

For applications requiring real-time interaction, you can enable streaming to process response chunks as they become available.

```typescript "Streaming Example" icon=logos:javascript
import { isAgentResponseDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-google-api-key",
  model: "gemini-1.5-flash",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
  },
  { streaming: true }
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log(fullText);
// Expected Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"

console.log(json);
// Expected Output: { model: "gemini-1.5-flash" }
```

## Image Generation Model

The `GeminiImageModel` class is used to generate images. It supports two distinct types of underlying models: **Imagen** models, which are specialized for image generation, and multimodal **Gemini** models, which can also generate images.

### Basic Usage

Here is a basic example of generating an image using the default Imagen model.

```typescript "Image Generation Example" icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-google-api-key",
  // Defaults to "imagen-4.0-generate-001"
  model: "imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

The result will contain the generated image data in Base64 format.

```json "Example Response"
{
  "images": [
    {
      "type": "file",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "imagen-4.0-generate-001"
}
```

### Image Generation Parameters

The available parameters for image generation differ based on whether you are using an Imagen or a Gemini model.

#### Imagen Models (e.g., `imagen-4.0-generate-001`)

These parameters are specific to models optimized for image generation.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `prompt` | `string` | **Required.** The text description of the image to generate. |
| `n` | `number` | The number of images to generate. Defaults to `1`. |
| `negativePrompt` | `string` | A description of elements to exclude from the image. |
| `seed` | `number` | A random seed for ensuring reproducible image generation. |
| `aspectRatio` | `string` | The aspect ratio for the generated image (e.g., "1:1", "16:9"). |
| `imageSize` | `string` | The size of the generated image (e.g., "1024x1024"). |
| `guidanceScale` | `number` | Controls how closely the generated image adheres to the prompt. |
| `outputMimeType` | `string` | The output format for the image (e.g., "image/png", "image/jpeg"). |
| `addWatermark` | `boolean` | If `true`, adds a watermark to the generated images. |
| `safetyFilterLevel` | `string` | The safety filter level for content moderation. |
| `personGeneration` | `string` | Settings related to the generation of people in images. |
| `outputGcsUri` | `string` | A Google Cloud Storage URI to save the output. |
| `outputCompressionQuality` | `number` | JPEG compression quality, from 1 to 100. |
| `language` | `string` | The language of the prompt. |
| `includeSafetyAttributes` | `boolean` | If `true`, includes safety attributes in the response. |
| `includeRaiReason` | `boolean` | If `true`, includes RAI (Responsible AI) reasoning in the response. |

#### Gemini Models (e.g., `gemini-1.5-pro`)

These parameters apply when using a multimodal Gemini model for image generation.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `prompt` | `string` | **Required.** The text description of the image to generate. |
| `n` | `number` | The number of images to generate. Defaults to `1`. |
| `temperature` | `number` | Controls randomness (0.0 to 1.0). Higher values lead to more creative outputs. |
| `maxOutputTokens` | `number` | The maximum number of tokens in the response. |
| `topP` | `number` | The nucleus sampling parameter. |
| `topK` | `number` | The top-k sampling parameter. |
| `seed` | `number` | A random seed for ensuring reproducible generation. |
| `stopSequences` | `array` | A list of sequences that will stop the generation process. |
| `safetySettings` | `array` | Custom safety settings for content generation. |
| `systemInstruction` | `string` | System-level instructions to guide the model's behavior. |

### Advanced Image Generation

This example demonstrates using multiple parameters to fine-tune the output from an Imagen model.

```typescript "Advanced Image Generation" icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({ apiKey: "your-google-api-key" });

const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  model: "imagen-4.0-generate-001",
  n: 2,
  imageSize: "1024x1024",
  aspectRatio: "1:1",
  guidanceScale: 7.5,
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345,
  includeSafetyAttributes: true,
  outputMimeType: "image/png",
});

console.log(result);
```

## Further Reading

For a complete list of parameters and more advanced features, refer to the official Google AI documentation.

- **Imagen Models**: [Google GenAI Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages)
- **Gemini Models**: [Google GenAI Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent)