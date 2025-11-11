# OpenAI

The `@aigne/openai` package provides a seamless integration with OpenAI's suite of models, allowing developers to leverage services like GPT for chat completions, DALL-E for image generation, and Sora for video creation directly within the AIGNE Framework. This document provides a comprehensive guide to installing, configuring, and using these models.

For a broader overview of available model providers, please see the [Models](./models.md) section.

## Features

The OpenAI integration is designed to be robust and developer-friendly, offering a range of features:

*   **Comprehensive Model Support**: Full integration with OpenAI's Chat, Image, and Video generation APIs.
*   **Official SDK**: Built on top of the official OpenAI SDK for maximum reliability and compatibility.
*   **Advanced Capabilities**: Includes support for function calling, streaming responses, and structured JSON outputs.
*   **Type-Safe**: Provides complete TypeScript typings for all model configurations and API responses, ensuring code quality and autocompletion.
*   **Consistent Interface**: Adheres to the AIGNE Framework's model interface for uniform implementation across different providers.
*   **Extensive Configuration**: Offers detailed options for fine-tuning model behavior to meet specific application needs.

## Installation

To integrate OpenAI models into your project, install the `@aigne/openai` package alongside the `@aigne/core` framework. Use the command appropriate for your package manager:

```bash npm
npm install @aigne/openai @aigne/core
```

```bash yarn
yarn add @aigne/openai @aigne/core
```

```bash pnpm
pnpm add @aigne/openai @aigne/core
```

## Chat Model (`OpenAIChatModel`)

The `OpenAIChatModel` class serves as the primary interface for interacting with OpenAI's text-based language models, such as GPT-4o and GPT-4o-mini.

### Configuration

When creating an instance of `OpenAIChatModel`, you must provide your OpenAI API key. This can be passed directly in the constructor or set as an environment variable named `OPENAI_API_KEY`.

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your OpenAI API key. If omitted, the system will look for the `OPENAI_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>An optional base URL for the OpenAI API, useful for connecting through a proxy or an alternative endpoint.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false">
    <x-field-desc markdown>The identifier of the model to be used for chat completions (e.g., "gpt-4o").</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>A set of parameters to control the generation process.</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls the randomness of the output. Lower values produce more deterministic results."></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="An alternative to temperature sampling, known as nucleus sampling."></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="Reduces the likelihood of repeating tokens."></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="Reduces the likelihood of repeating topics."></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="Enables the model to execute multiple function calls concurrently."></x-field>
    <x-field data-name="reasoningEffort" data-type="string | number" data-required="false" data-desc="For reasoning models (o1/o3), sets the reasoning effort ('minimal', 'low', 'medium', 'high', or a token count)."></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options passed directly to the underlying OpenAI SDK client for advanced customization.</x-field-desc>
  </x-field>
</x-field-group>

### Basic Usage

The following example shows how to instantiate `OpenAIChatModel` and use the `invoke` method to get a response.

```typescript Basic Chat Completion icon=logos:typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // Using an environment variable for the API key is recommended.
  apiKey: "your-api-key", 
  model: "gpt-4o",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

**Example Response**

```json
{
  "text": "Hello! How can I assist you today?",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 10,
    "outputTokens": 9
  }
}
```

### Streaming Responses

For real-time applications, you can enable streaming by passing `{ streaming: true }` to the `invoke` method. This returns an async iterator that yields response chunks as they are generated.

```typescript Streaming Chat Response icon=logos:typescript
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
```

## Image Model (`OpenAIImageModel`)

The `OpenAIImageModel` class provides an interface for OpenAI's image generation and editing models, such as DALL-E 2, DALL-E 3, and gpt-image-1.

### Configuration

The image model is configured similarly to the chat model, requiring an API key and allowing for model-specific options.

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your OpenAI API key. Defaults to the `OPENAI_API_KEY` environment variable if not provided.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>An optional base URL for the OpenAI API.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false">
    <x-field-desc markdown>The image model to use (e.g., "dall-e-3", "gpt-image-1").</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Parameters to control the image generation process. Available options vary by model.</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false" data-desc="The dimensions of the generated image (e.g., '1024x1024')."></x-field>
    <x-field data-name="quality" data-type="string" data-required="false" data-desc="Image quality, either 'standard' or 'hd' (DALL-E 3 only)."></x-field>
    <x-field data-name="style" data-type="string" data-required="false" data-desc="The artistic style, either 'vivid' or 'natural' (DALL-E 3 only)."></x-field>
    <x-field data-name="n" data-type="number" data-required="false" data-desc="The number of images to generate."></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Advanced options passed directly to the underlying OpenAI SDK client.</x-field-desc>
  </x-field>
</x-field-group>

### Image Generation

To generate an image, create an instance of `OpenAIImageModel` and invoke it with a text prompt.

```typescript Image Generation icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  },
});

const result = await imageModel.invoke({
  prompt: "A futuristic city at sunset with flying cars",
});

console.log(result);
```

**Example Response**

```json
{
  "images": [
    {
      "type": "url",
      "url": "https://...",
      "mimeType": "image/png"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "dall-e-3"
}
```

### Image Editing

Image editing is supported by specific models like `gpt-image-1`. To edit an image, provide both a prompt and a reference image.

```typescript Image Editing icon=logos:typescript
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

## Video Model (`OpenAIVideoModel`)

The `OpenAIVideoModel` class enables video generation using OpenAI's Sora models.

### Configuration

The video model requires an API key and allows for specifying the model, resolution, and duration.

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your OpenAI API key. Defaults to the `OPENAI_API_KEY` environment variable if not provided.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="sora-2" data-required="false">
    <x-field-desc markdown>The video model to use, either "sora-2" (standard) or "sora-2-pro" (higher quality).</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Parameters to control the video generation process.</x-field-desc>
    <x-field data-name="size" data-type="string" data-default="1280x720" data-required="false" data-desc="Video resolution (e.g., '1280x720' for horizontal, '720x1280' for vertical)."></x-field>
    <x-field data-name="seconds" data-type="string" data-default="4" data-required="false" data-desc="Video duration in seconds. Accepted values are '4', '8', or '12'."></x-field>
  </x-field>
</x-field-group>

### Video Generation

The following example demonstrates how to generate a short video from a text prompt.

```typescript Video Generation icon=logos:typescript
import { OpenAIVideoModel } from "@aigne/openai";

const videoModel = new OpenAIVideoModel({
  apiKey: "your-api-key",
  model: "sora-2",
  modelOptions: {
    size: "1280x720",
    seconds: "4",
  },
});

const result = await videoModel.invoke({
  prompt: "A serene lake with mountains in the background, gentle waves rippling",
});

console.log(result);
```

**Example Response**

```json
{
  "videos": [
    {
      "type": "file",
      "data": "base64-encoded-video-data...",
      "mimeType": "video/mp4",
      "filename": "video-id.mp4"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "sora-2",
  "seconds": 4
}
```

### Image-to-Video Generation

You can also generate a video by animating a still image.

```typescript Image-to-Video icon=logos:typescript
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

console.log(result.videos);
```

## Summary

This guide has covered the essentials for integrating OpenAI's chat, image, and video models into your AIGNE applications. By using the `@aigne/openai` package, you can easily harness the power of these advanced AI capabilities.

For further details, refer to the official [OpenAI API documentation](https://platform.openai.com/docs/api-reference). To explore other supported model providers, please visit the [Models Overview](./models-overview.md).