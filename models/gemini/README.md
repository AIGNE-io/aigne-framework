# @aigne/gemini

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
[![NPM Version](https://img.shields.io/npm/v/@aigne/gemini)](https://www.npmjs.com/package/@aigne/gemini)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/gemini)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Gemini SDK for integrating with Google's Gemini AI models within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/gemini` provides a seamless integration between the AIGNE Framework and Google's Gemini language models and API. This package enables developers to easily leverage Gemini's advanced AI capabilities in their AIGNE applications, providing a consistent interface across the framework while taking advantage of Google's state-of-the-art multimodal models.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini.png" alt="AIGNE Arch" />
</picture>

## Features

* **Google Gemini API Integration**: Direct connection to Google's Gemini API services
* **Chat Completions**: Support for Gemini's chat completions API with all available models
* **Image Generation**: Support for both Imagen and Gemini image generation models
* **Multimodal Support**: Built-in support for handling both text and image inputs
* **Function Calling**: Support for function calling capabilities
* **Streaming Responses**: Support for streaming responses for more responsive applications
* **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
* **Consistent Interface**: Compatible with the AIGNE Framework's model interface
* **Error Handling**: Robust error handling and retry mechanisms
* **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/gemini @aigne/core
```

### Using yarn

```bash
yarn add @aigne/gemini @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/gemini @aigne/core
```

## Basic Usage

### Chat Model

```typescript file="test/gemini-chat-model.test.ts" region="example-gemini-chat-model"
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // Provide API key directly or use environment variable GOOGLE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify Gemini model version (defaults to 'gemini-1.5-pro' if not specified)
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
/* Output:
  {
    text: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
    model: "gemini-1.5-flash"
  }
  */
```

### Image Generation Model

```typescript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key", // Optional if set in env variables
  model: "imagen-4.0-generate-001", // Default Imagen model
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
/* Output:
  {
    images: [
      {
        base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      }
    ],
    usage: {
      inputTokens: 0,
      outputTokens: 0
    },
    model: "imagen-4.0-generate-001"
  }
  */
```

## Streaming Responses

```typescript file="test/gemini-chat-model.test.ts" region="example-gemini-chat-model-streaming"
import { isAgentResponseDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-api-key",
  model: "gemini-1.5-flash",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
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

console.log(fullText); // Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"
console.log(json); // { model: "gemini-1.5-flash" }
```

## Image Generation Parameters

The `GeminiImageModel` supports different parameters depending on the model type:

### Imagen Models (e.g., `imagen-4.0-generate-001`)

- **`prompt`** (string): The text description of the image you want to generate
- **`n`** (number): Number of images to generate (defaults to 1)
- **`seed`** (number): Random seed for reproducible generation
- **`safetyFilterLevel`** (string): Safety filter level for content moderation
- **`personGeneration`** (string): Person generation settings
- **`outputMimeType`** (string): Output image format (e.g., "image/png", "image/jpeg")
- **`outputGcsUri`** (string): Google Cloud Storage URI for output
- **`outputCompressionQuality`** (number): JPEG compression quality (1-100)
- **`negativePrompt`** (string): Description of what to exclude from the image
- **`language`** (string): Language for the prompt
- **`includeSafetyAttributes`** (boolean): Include safety attributes in response
- **`includeRaiReason`** (boolean): Include RAI reasoning in response
- **`imageSize`** (string): Size of the generated image
- **`guidanceScale`** (number): Guidance scale for generation
- **`aspectRatio`** (string): Aspect ratio of the image
- **`addWatermark`** (boolean): Add watermark to generated images

### Gemini Models (e.g., `gemini-1.5-pro`)

- **`prompt`** (string): The text description of the image you want to generate
- **`n`** (number): Number of images to generate (defaults to 1)
- **`temperature`** (number): Controls randomness in generation (0.0 to 1.0)
- **`maxOutputTokens`** (number): Maximum number of tokens in response
- **`topP`** (number): Nucleus sampling parameter
- **`topK`** (number): Top-k sampling parameter
- **`safetySettings`** (array): Safety settings for content generation
- **`seed`** (number): Random seed for reproducible generation
- **`stopSequences`** (array): Sequences that stop generation
- **`systemInstruction`** (string): System-level instructions

### Advanced Image Generation Example

```typescript
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
  outputMimeType: "image/png"
});
```

## Model Options

You can also set default options when creating the model:

```typescript
const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "imagen-4.0-generate-001",
  modelOptions: {
    safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
    includeSafetyAttributes: true,
    outputMimeType: "image/png"
  }
});
```

## Environment Variables

Set the following environment variable for automatic API key detection:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

## API Reference

For complete parameter details and advanced features:

- **Imagen Models**: Refer to [Google GenAI Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages)
- **Gemini Models**: Refer to [Google GenAI Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent)

## License

Elastic-2.0
