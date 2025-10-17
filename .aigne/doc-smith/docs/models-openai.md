# OpenAI

The `@aigne/openai` package provides a direct and robust integration with OpenAI's suite of models, including the powerful GPT series for chat completions and DALL-E for image generation. This guide details the necessary steps for installation, configuration, and utilization of these models within the AIGNE Framework.

For information on other model providers, refer to the main [Models](./models.md) overview.

## Features

The integration with OpenAI is designed to be comprehensive, offering the following capabilities:

*   **Direct API Integration**: Leverages the official OpenAI SDK for reliable communication.
*   **Chat Completions**: Full support for OpenAI's chat completion models, such as `gpt-4o` and `gpt-4o-mini`.
*   **Function Calling**: Native support for OpenAI's function calling and tool use features.
*   **Structured Outputs**: Ability to request and parse JSON-formatted responses from the model.
*   **Image Generation**: Access to DALL-E 2 and DALL-E 3 for creating images from text prompts.
*   **Streaming Responses**: Support for handling real-time, chunked responses for more interactive applications.
*   **Type-Safe**: Complete TypeScript typings for all model options and API responses.

## Installation

To begin, install the `@aigne/openai` package along with the `@aigne/core` framework. Select the command corresponding to your package manager.

```bash icon=npm install @aigne/openai @aigne/core
npm install @aigne/openai @aigne/core
```

```bash icon=yarn add @aigne/openai @aigne/core
yarn add @aigne/openai @aigne/core
```

```bash icon=pnpm add @aigne/openai @aigne/core
pnpm add @aigne/openai @aigne/core
```

## Chat Model (`OpenAIChatModel`)

The `OpenAIChatModel` class is the primary interface for interacting with OpenAI's language models like GPT-4o.

### Configuration

To instantiate the model, you must provide your OpenAI API key. This can be done directly in the constructor or by setting the `OPENAI_API_KEY` environment variable.

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your OpenAI API key. If not provided, the system will check for the `OPENAI_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>An optional base URL for the OpenAI API. This is useful for proxying requests or using compatible alternative endpoints.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false">
    <x-field-desc markdown>The specific model to use for chat completions, e.g., `gpt-4o`.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to control the model's behavior.</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness. Lower values make the model more deterministic."></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus sampling parameter."></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="Penalizes new tokens based on their existing frequency."></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="Penalizes new tokens based on whether they appear in the text so far."></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="Determines if the model can call multiple tools in parallel."></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Advanced options passed directly to the underlying OpenAI SDK client.</x-field-desc>
  </x-field>
</x-field-group>

### Basic Usage

The following example demonstrates how to create an `OpenAIChatModel` instance and invoke it with a simple user message.

```typescript Basic Chat Completion icon=logos:typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // It is recommended to use the OPENAI_API_KEY environment variable.
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

The `invoke` method returns a promise that resolves to an object containing the model's response and usage metrics.

**Example Response**
```json
{
  "text": "I am a large language model, trained by Google.",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 10,
    "outputTokens": 9
  }
}
```

### Streaming Responses

For applications requiring real-time feedback, you can enable streaming by setting the `streaming: true` option in the `invoke` method. This returns an async iterator that yields response chunks as they become available.

```typescript Streaming Chat Response icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story." }],
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

console.log("\n\n--- End of Story ---");
console.log("Full text:", fullText);
```

This approach allows you to process the response incrementally, which is ideal for chat interfaces or other interactive use cases.

## Image Model (`OpenAIImageModel`)

The `OpenAIImageModel` class provides an interface for OpenAI's image generation capabilities, such as DALL-E 2 and DALL-E 3.

### Configuration

Configuration for the image model is similar to the chat model, requiring an API key and allowing for model selection.

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your OpenAI API key. If not provided, the system will check for the `OPENAI_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>An optional base URL for the OpenAI API.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false">
    <x-field-desc markdown>The image model to use, e.g., `dall-e-3`.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to control image generation. Available parameters depend on the selected model.</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false" data-desc="The desired dimensions of the generated image (e.g., '1024x1024')."></x-field>
    <x-field data-name="quality" data-type="string" data-required="false" data-desc="The quality of the image, 'standard' or 'hd' (DALL-E 3 only)."></x-field>
    <x-field data-name="style" data-type="string" data-required="false" data-desc="The style of the generated images, 'vivid' or 'natural' (DALL-E 3 only)."></x-field>
    <x-field data-name="n" data-type="number" data-required="false" data-desc="The number of images to generate."></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Advanced options passed directly to the underlying OpenAI SDK client.</x-field-desc>
  </x-field>
</x-field-group>

### Basic Usage

To generate an image, create an instance of `OpenAIImageModel` and invoke it with a prompt.

```typescript Image Generation icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";
import fs from "fs/promises";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    quality: "hd",
    style: "vivid",
  },
});

const result = await imageModel.invoke({
  prompt: "A futuristic cityscape with flying cars, synthwave style",
});

// The result contains image data. It can be a URL or a base64-encoded string.
const firstImage = result.images[0];

if (firstImage.type === "url") {
  console.log("Image URL:", firstImage.url);
} else if (firstImage.type === "file") {
  await fs.writeFile("cityscape.png", firstImage.data, "base64");
  console.log("Image saved as cityscape.png");
}
```

**Example Response**
```json
{
  "images": [
    {
      "type": "url",
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
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

The response object contains an array of generated images. Each image can be either a URL pointing to the hosted image or a base64-encoded file, depending on the response format requested from the API.

## Summary

This guide has provided the necessary information to install, configure, and use the OpenAI chat and image models within the AIGNE Framework. By leveraging the `@aigne/openai` package, you can seamlessly integrate the advanced capabilities of OpenAI into your agentic applications.

For more advanced configurations or troubleshooting, refer to the official [OpenAI API documentation](https://platform.openai.com/docs/api-reference). To explore other available models, see the [Models Overview](./models-overview.md).