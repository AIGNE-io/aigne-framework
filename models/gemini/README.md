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

## Chat Completions

### Basic Usage

```typescript file="test/gemini-chat-model.test.ts" region="example-gemini-chat-model"
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // Provide API key directly or use environment variable GOOGLE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify Gemini model version (defaults to 'gemini-2.0-flash' if not specified)
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
    model: "gemini-1.5-flash",
    usage: {
      inputTokens: 12,
      outputTokens: 18
    }
  }
  */
```

### GeminiChatModel Input

- `messages` (array, required): Conversation messages
  - Each message has: `role` ("user" | "assistant" | "system" | "tool"), `content` (string or multimodal array)
  - Multimodal content supports: text, images (url/base64), files, audio, video
- `tools` (array, optional): Available function tools for the model to call
  - Each tool has: `type: "function"`, `function` with `name`, `description`, `parameters` (JSON schema)
- `toolChoice` (string/object, optional): Control tool usage - "auto", "required", "none", or specific tool
- `responseFormat` (object, optional): Control output format
  - `type: "json_schema"` with `jsonSchema` for structured JSON output
- `model` (string, optional): Model to use (e.g., "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash")
- `temperature` (number, optional): Sampling temperature (0-1), controls randomness
- `topP` (number, optional): Nucleus sampling parameter (0-1), alternative to temperature
- `topK` (number, optional): Top-k sampling parameter, limits token selection
- `frequencyPenalty` (number, optional): Frequency penalty, reduces repetition
- `presencePenalty` (number, optional): Presence penalty, encourages topic diversity
- `reasoningEffort` (string/number, optional): For thinking models (Gemini 2.5) - "minimal", "low", "medium", "high" or token count (128-32768)
- `modalities` (array, optional): Response modalities - ["TEXT"], ["IMAGE"], ["TEXT", "IMAGE"], ["AUDIO"]

### GeminiChatModel Output

- `text` (string, optional): Generated text response
- `toolCalls` (array, optional): Function calls requested by the model
  - Each call has: `id`, `type: "function"`, `function` with `name` and `arguments` (parsed JSON)
- `json` (object, optional): Structured JSON output (when using `responseFormat`)
- `files` (array, optional): Generated files (images, audio, etc.) as `FileUnionContent[]`
  - Each file contains: `type: "file"`, `data` (base64), `mimeType`, `filename`
- `usage` (object): Token usage statistics
  - `inputTokens` (number): Input tokens consumed
  - `outputTokens` (number): Output tokens generated (includes thoughts tokens if applicable)
- `model` (string): Actual model version used for the request
- `modelOptions` (object, optional): Model options used
  - `reasoningEffort` (number, optional): Thinking budget applied (for thinking models)

## Image Generation

### Basic Image Generation

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
        type: "file",
        data: "iVBORw0KGgoAAAANSUhEUgAA...",
        mimeType: "image/png"
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

### Image Editing with Gemini Models

```typescript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "gemini-2.0-flash-exp", // Use Gemini model for editing
});

const result = await model.invoke({
  prompt: "Add vibrant flowers in the foreground",
  image: [
    {
      type: "url",
      url: "https://example.com/original-image.png",
    },
  ],
  n: 1,
});

console.log(result.images); // Array of edited images
```

### GeminiImageModel Input

**Common Parameters:**
- `prompt` (string, required): Text description of the desired image
- `model` (string, optional): Model to use (default: "imagen-4.0-generate-001")
  - Imagen models: "imagen-4.0-generate-001", "imagen-3.0-generate-001"
  - Gemini models: "gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"
- `n` (number, optional): Number of images to generate (default: 1)
- `image` (array, optional): Reference images for editing (Gemini models only)

**Imagen Models Parameters:**
- `seed` (number, optional): Random seed for reproducible generation
- `safetyFilterLevel` (string, optional): Safety filter level for content moderation
- `personGeneration` (string, optional): Person generation settings
- `outputMimeType` (string, optional): Output image format ("image/png", "image/jpeg")
- `outputGcsUri` (string, optional): Google Cloud Storage URI for output
- `outputCompressionQuality` (number, optional): JPEG compression quality (1-100)
- `negativePrompt` (string, optional): Description of what to exclude from the image
- `language` (string, optional): Language for the prompt
- `includeSafetyAttributes` (boolean, optional): Include safety attributes in response
- `includeRaiReason` (boolean, optional): Include RAI reasoning in response
- `imageSize` (string, optional): Size of the generated image
- `guidanceScale` (number, optional): Guidance scale for generation
- `aspectRatio` (string, optional): Aspect ratio of the image
- `addWatermark` (boolean, optional): Add watermark to generated images

**Gemini Models Parameters:**
- `temperature` (number, optional): Controls randomness in generation (0.0 to 1.0)
- `maxOutputTokens` (number, optional): Maximum number of tokens in response
- `topP` (number, optional): Nucleus sampling parameter
- `topK` (number, optional): Top-k sampling parameter
- `safetySettings` (array, optional): Safety settings for content generation
- `seed` (number, optional): Random seed for reproducible generation
- `stopSequences` (array, optional): Sequences that stop generation
- `systemInstruction` (string, optional): System-level instructions

### GeminiImageModel Output

- `images` (array): Generated/edited images as `FileUnionContent[]`
  - Each image contains: `type: "file"`, `data` (base64), `mimeType`, `filename` (optional)
- `usage` (object): Token usage information
  - `inputTokens` (number): Input tokens used
  - `outputTokens` (number): Output tokens used
- `model` (string): The model used for generation

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

## Video Generation

Use `GeminiVideoModel` to generate videos with Google's Veo models.

### Basic Video Generation

```typescript
import { GeminiVideoModel } from "@aigne/gemini";

const videoModel = new GeminiVideoModel({
  apiKey: "your-api-key",
  model: "veo-3.1-generate-preview", // or "veo-3-generate-preview"
});

const result = await videoModel.invoke({
  prompt: "A serene lake with mountains in the background, gentle waves rippling",
  aspectRatio: "16:9",
  size: "720p",
  seconds: "8",
});

console.log(result);
/* Output:
  {
    videos: [
      {
        type: "file",
        data: "base64-encoded-video-data...",
        mimeType: "video/mp4",
        filename: "timestamp.mp4"
      }
    ],
    usage: {
      inputTokens: 0,
      outputTokens: 0
    },
    model: "veo-3.1-generate-preview",
    seconds: 8
  }
  */
```

### Image-to-Video

```typescript
import { GeminiVideoModel } from "@aigne/gemini";

const videoModel = new GeminiVideoModel({
  apiKey: "your-api-key",
  model: "veo-3.1-generate-preview",
});

const result = await videoModel.invoke({
  prompt: "Animate this image with gentle movement, clouds drifting slowly",
  image: {
    type: "url",
    url: "https://example.com/input-image.png",
  },
  aspectRatio: "16:9",
  size: "720p",
  seconds: "8",
});

console.log(result.videos); // Array containing generated video
```

### Frame Interpolation

```typescript
const result = await videoModel.invoke({
  prompt: "Smooth transition between the two frames",
  image: {
    type: "url",
    url: "https://example.com/first-frame.png",
  },
  lastFrame: {
    type: "url",
    url: "https://example.com/last-frame.png",
  },
  aspectRatio: "16:9",
  size: "720p",
  seconds: "8",
});
```

### GeminiVideoModel Input

- `prompt` (string, required): Text description of the desired video
- `model` (string, optional): Veo model to use (default: "veo-3.1-generate-preview")
  - "veo-3.1-generate-preview": Latest version with reference images support
  - "veo-3-generate-preview": Previous version
- `aspectRatio` (string, optional): Video aspect ratio
  - "16:9": Horizontal video (default)
  - "9:16": Vertical video
- `size` (string, optional): Video resolution (default: "720p")
  - "720p": 720p resolution
  - "1080p": 1080p resolution (16:9 only for Veo 3, 8 seconds only for Veo 3.1)
- `seconds` (string, optional): Video duration - "4", "6", or "8" seconds (default: "8")
- `image` (object, optional): Reference image for image-to-video or frame interpolation
  - Supports `type: "url"` with `url` or `type: "file"` with base64 `data`
- `lastFrame` (object, optional): Last frame for frame interpolation
  - Supports `type: "url"` with `url` or `type: "file"` with base64 `data`
- `referenceImages` (array, optional): Reference images for video generation (Veo 3.1 only)
- `negativePrompt` (string, optional): Description of what to avoid in the video
- `personGeneration` (string, optional): Control person generation
  - Veo 3.1: "allow_all" for image-to-video/frame interpolation/reference images; "allow_adult" for text-to-video
  - Veo 3: "allow_all" for image-to-video; "allow_adult" for text-to-video

### GeminiVideoModel Output

- `videos` (array): Generated videos as `FileUnionContent[]`
  - Each video contains: `type: "file"`, `data` (base64), `mimeType: "video/mp4"`, `filename`
- `usage` (object): Token usage information
  - `inputTokens` (number): Input tokens used (typically 0 for video generation)
  - `outputTokens` (number): Output tokens used (typically 0 for video generation)
- `model` (string): The model used for generation
- `seconds` (number): Actual duration of the generated video

## Environment Variables

Set the following environment variable for automatic API key detection:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

## API Reference

For complete API documentation, please visit:

- [AIGNE Documentation](https://aigne.io/docs)
- [Google GenAI API Reference](https://googleapis.github.io/js-genai/release_docs/)
  - [Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent) - Chat completions
  - [Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages) - Image generation
  - [Models.generateVideos()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatevideos) - Video generation

## License

Elastic-2.0
