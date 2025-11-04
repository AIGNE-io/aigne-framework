# @aigne/openai

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
[![NPM Version](https://img.shields.io/npm/v/@aigne/openai)](https://www.npmjs.com/package/@aigne/openai)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/openai)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE OpenAI SDK for integrating with OpenAI's GPT models and API services within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/openai` provides a seamless integration between the AIGNE Framework and OpenAI's powerful language models and APIs. This package enables developers to easily leverage OpenAI's GPT models in their AIGNE applications, providing a consistent interface across the framework while taking advantage of OpenAI's advanced AI capabilities.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openai-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openai.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-openai.png" alt="AIGNE Arch" />
</picture>

## Features

* **OpenAI API Integration**: Direct connection to OpenAI's API services using the official SDK
* **Chat Completions**: Support for OpenAI's chat completions API with all available models
* **Function Calling**: Built-in support for OpenAI's function calling capability
* **Streaming Responses**: Support for streaming responses for more responsive applications
* **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
* **Consistent Interface**: Compatible with the AIGNE Framework's model interface
* **Error Handling**: Robust error handling and retry mechanisms
* **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/openai @aigne/core
```

### Using yarn

```bash
yarn add @aigne/openai @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/openai @aigne/core
```

## Chat Completions

### Basic Usage

```typescript file="test/openai-chat-model.test.ts" region="example-openai-chat-model"
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // Provide API key directly or use environment variable OPENAI_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  model: "gpt-4o", // Defaults to "gpt-4o-mini" if not specified
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
/* Output:
  {
    text: "Hello! How can I assist you today?",
    model: "gpt-4o",
    usage: {
      inputTokens: 10,
      outputTokens: 9
    }
  }
  */
```

### OpenAIChatModel Input

- `messages` (array, required): Conversation messages
  - Each message has: `role` ("user" | "assistant" | "system" | "tool"), `content` (string or multimodal array)
  - Multimodal content supports: text, images (url/base64), files
- `tools` (array, optional): Available function tools for the model to call
  - Each tool has: `type: "function"`, `function` with `name`, `description`, `parameters` (JSON schema)
- `toolChoice` (string/object, optional): Control tool usage - "auto", "required", "none", or specific tool
- `responseFormat` (object, optional): Control output format
  - `type: "json_schema"` with `jsonSchema` for structured JSON output
- `model` (string, optional): Model to use (e.g., "gpt-4o", "gpt-4o-mini", "o1", "o3-mini")
- `temperature` (number, optional): Sampling temperature (0-2), controls randomness
- `topP` (number, optional): Nucleus sampling parameter (0-1), alternative to temperature
- `frequencyPenalty` (number, optional): Frequency penalty (-2 to 2), reduces repetition
- `presencePenalty` (number, optional): Presence penalty (-2 to 2), encourages topic diversity
- `parallelToolCalls` (boolean, optional): Enable parallel tool calls (default: true)
- `reasoningEffort` (string/number, optional): For reasoning models (o1/o3) - "minimal", "low", "medium", "high" or token count

### OpenAIChatModel Output

- `text` (string, optional): Generated text response
- `toolCalls` (array, optional): Function calls requested by the model
  - Each call has: `id`, `type: "function"`, `function` with `name` and `arguments` (parsed JSON)
- `json` (object, optional): Structured JSON output (when using `responseFormat`)
- `usage` (object): Token usage statistics
  - `inputTokens` (number): Input tokens consumed
  - `outputTokens` (number): Output tokens generated
- `model` (string): Actual model used for the request
- `modelOptions` (object, optional): Model options used
  - `reasoningEffort` (string, optional): Reasoning effort applied

## Streaming Responses

```typescript file="test/openai-chat-model.test.ts" region="example-openai-chat-model-stream"
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
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

console.log(fullText); // Output: "Hello! How can I assist you today?"
console.log(json); // { model: "gpt-4o", usage: { inputTokens: 10, outputTokens: 9 } }
```

## Image Generation

Use `OpenAIImageModel` to generate or edit images with DALL-E models.

### Basic Image Generation

```typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3", // or "dall-e-2", "gpt-image-1"
  modelOptions: {
    size: "1024x1024",
    quality: "standard", // or "hd" for dall-e-3
    style: "vivid", // or "natural"
  },
});

const result = await imageModel.invoke({
  prompt: "A futuristic city at sunset with flying cars",
});

console.log(result);
/* Output:
  {
    images: [
      {
        type: "url",
        url: "https://...",
        mimeType: "image/png"
      }
    ],
    usage: {
      inputTokens: 0,
      outputTokens: 0
    },
    model: "dall-e-3"
  }
  */
```

### Image Editing

**Note**: Image editing is only supported by `gpt-image-1` model.

```typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "gpt-image-1",
});

const result = await imageModel.invoke({
  prompt: "Add a rainbow to the sky",
  image: [
    {
      type: "url",
      url: "https://example.com/original-image.png",
    },
  ],
});

console.log(result.images); // Array of edited images
```

### OpenAIImageModel Input

- `prompt` (string, required): Text description of the desired image
- `model` (string, optional): Model to use - "dall-e-2", "dall-e-3", or "gpt-image-1" (default: "dall-e-2")
- `size` (string, optional): Image dimensions
  - dall-e-2: "256x256", "512x512", "1024x1024"
  - dall-e-3: "1024x1024", "1792x1024", "1024x1792"
  - gpt-image-1: Various sizes supported
- `n` (number, optional): Number of images to generate
  - dall-e-2: 1-10
  - dall-e-3: 1 only
- `quality` (string, optional): "standard" or "hd" (dall-e-3 only)
- `style` (string, optional): "vivid" or "natural" (dall-e-3 only)
- `image` (array, optional): Reference images for editing (gpt-image-1 only)
- `background` (string, optional): Background style (gpt-image-1 only)
- `moderation` (boolean, optional): Enable content moderation (gpt-image-1 only)
- `outputCompression` (string, optional): Output compression level (gpt-image-1 only)
- `outputFormat` (string, optional): Output format (gpt-image-1 only)
- `user` (string, optional): User identifier for tracking

### OpenAIImageModel Output

- `images` (array): Generated/edited images as `FileUnionContent[]`
  - Each image contains: `type`, `url` or `data` (base64), `mimeType`
- `usage` (object): Token usage information
  - `inputTokens` (number): Input tokens used
  - `outputTokens` (number): Output tokens used
- `model` (string): The model used for generation

## Video Generation

Use `OpenAIVideoModel` to generate videos with OpenAI's Sora models.

### Basic Video Generation

```typescript
import { OpenAIVideoModel } from "@aigne/openai";

const videoModel = new OpenAIVideoModel({
  apiKey: "your-api-key",
  model: "sora-2", // or "sora-2-pro"
  modelOptions: {
    size: "1280x720", // 16:9 horizontal
    seconds: "4", // "4", "8", or "12"
  },
});

const result = await videoModel.invoke({
  prompt: "A serene lake with mountains in the background, gentle waves rippling",
});

console.log(result);
/* Output:
  {
    videos: [
      {
        type: "file",
        data: "base64-encoded-video-data...",
        mimeType: "video/mp4",
        filename: "video-id.mp4"
      }
    ],
    usage: {
      inputTokens: 0,
      outputTokens: 0
    },
    model: "sora-2",
    seconds: 4
  }
  */
```

### Image-to-Video

```typescript
import { OpenAIVideoModel } from "@aigne/openai";

const videoModel = new OpenAIVideoModel({
  apiKey: "your-api-key",
  model: "sora-2",
});

const result = await videoModel.invoke({
  prompt: "Animate this image with gentle movement",
  image: {
    type: "url",
    url: "https://example.com/input-image.png",
  },
  size: "1280x720",
  seconds: "8",
});

console.log(result.videos); // Array containing generated video
```

### OpenAIVideoModel Input

- `prompt` (string, required): Text description of the desired video
- `model` (string, optional): "sora-2" (standard, lower cost) or "sora-2-pro" (higher quality) (default: "sora-2")
- `size` (string, optional): Video resolution
  - "720x1280": Vertical 9:16
  - "1280x720": Horizontal 16:9 (default)
  - "1024x1792": Vertical 9:16 (higher res)
  - "1792x1024": Horizontal 16:9 (higher res)
- `seconds` (string, optional): Video duration - "4", "8", or "12" seconds (default: "4")
- `image` (object, optional): Reference image for image-to-video generation
  - Supports `type: "url"` with `url` or `type: "file"` with base64 `data`

### OpenAIVideoModel Output

- `videos` (array): Generated videos as `FileUnionContent[]`
  - Each video contains: `type: "file"`, `data` (base64), `mimeType: "video/mp4"`, `filename`
- `usage` (object): Token usage information
  - `inputTokens` (number): Input tokens used (typically 0 for video generation)
  - `outputTokens` (number): Output tokens used (typically 0 for video generation)
- `model` (string): The model used for generation
- `seconds` (number): Actual duration of the generated video

## API Reference

For complete API documentation, please visit the [AIGNE Documentation](https://aigne.io/docs).

## License

Elastic-2.0
