# Doubao

The `@aigne/doubao` package provides a seamless integration between the AIGNE Framework and Doubao's powerful language and image generation models. This guide provides a complete reference for configuring and utilizing Doubao models within your AIGNE applications.

This integration allows developers to leverage Doubao's advanced AI capabilities through the consistent and unified interface of the AIGNE Framework.

## Installation

To begin, install the necessary packages using your preferred package manager. You will need both `@aigne/core` and the Doubao-specific package.

```bash
npm install @aigne/doubao @aigne/core
```

```bash
yarn add @aigne/doubao @aigne/core
```

```bash
pnpm add @aigne/doubao @aigne/core
```

## Configuration

To use the Doubao models, you must provide an API key. The key can be configured in one of two ways, in order of precedence:

1.  **Direct Instantiation**: Pass the `apiKey` directly in the model's constructor. This method is explicit and overrides any other configuration.
2.  **Environment Variable**: Set the `DOUBAO_API_KEY` environment variable. The model will automatically use this variable if no key is provided in the constructor.

```typescript "Configuration Example" icon=logos:typescript
import { DoubaoChatModel } from "@aigne/doubao";

// Method 1: Direct Instantiation
const modelWithApiKey = new DoubaoChatModel({
  apiKey: "your-doubao-api-key",
});

// Method 2: Environment Variable
// Set DOUBAO_API_KEY in your .env file or shell
// DOUBAO_API_KEY="your-doubao-api-key"
const modelFromEnv = new DoubaoChatModel();
```

The base URL for the Doubao API is pre-configured to `https://ark.cn-beijing.volces.com/api/v3`, but it can be overridden by passing a `baseURL` option to the constructor if necessary.

## Chat Models

For conversational tasks, the `DoubaoChatModel` provides an interface to Doubao's language models. It leverages an OpenAI-compatible API structure, ensuring a familiar development experience.

### Basic Usage

To perform a chat completion, instantiate `DoubaoChatModel` and use the `invoke` method.

```typescript "Basic Chat Completion" icon=logos:typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-doubao-api-key", // Or use environment variable
  model: "doubao-seed-1-6-250615",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

**Example Response**

```json
{
  "text": "Hello! I'm an AI assistant powered by Doubao's language model.",
  "model": "doubao-seed-1-6-250615",
  "usage": {
    "inputTokens": 7,
    "outputTokens": 12
  }
}
```

### Streaming Responses

For real-time applications, you can stream the response from the model. Set the `streaming` option to `true` in the `invoke` call and iterate over the resulting stream to process chunks as they arrive.

```typescript "Streaming Chat Response" icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-doubao-api-key",
  model: "doubao-seed-1-6-250615",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
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
      process.stdout.write(text); // Print text chunks as they arrive
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Data ---");
console.log(fullText);
console.log(json);
```

### Chat Model Parameters

The `DoubaoChatModel` constructor accepts the following options:

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your Doubao API key. If not provided, the `DOUBAO_API_KEY` environment variable will be used.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="doubao-seed-1-6-250615">
    <x-field-desc markdown>The specific chat model to use.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-default="https://ark.cn-beijing.volces.com/api/v3">
    <x-field-desc markdown>The base URL for the Doubao API endpoint.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options passed to the model API, such as `temperature`, `top_p`, etc. These are standard OpenAI-compatible parameters.</x-field-desc>
  </x-field>
</x-field-group>

## Image Models

The `DoubaoImageModel` class enables image generation by interfacing with Doubao's image models.

### Basic Usage

Instantiate `DoubaoImageModel` and call the `invoke` method with a prompt to generate an image.

```typescript "Image Generation" icon=logos:typescript
import { DoubaoImageModel } from "@aigne/doubao";

async function generateImage() {
  const imageModel = new DoubaoImageModel({
    apiKey: "your-doubao-api-key", // Or use environment variable
    model: "doubao-seedream-4-0-250828",
  });

  const result = await imageModel.invoke({
    prompt: "A photorealistic image of a cat programming on a laptop",
    modelOptions: {
      size: "1024x1024",
      watermark: false,
    },
  });

  console.log(result);
}

generateImage();
```

**Example Response**

```json
{
  "images": [
    {
      "type": "file",
      "data": "...", // base64 encoded image data
      "mimeType": "image/jpeg"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 1
  },
  "model": "doubao-seedream-4-0-250828"
}
```

### Image Model Parameters

The `DoubaoImageModel` `invoke` method accepts an input object with the following properties. Note that parameter availability may vary by model.

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>A text description of the desired image(s).</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="doubao-seedream-4-0-250828">
    <x-field-desc markdown>The identifier for the image model to use.</x-field-desc>
  </x-field>
  <x-field data-name="image" data-type="FileUnion" data-required="false">
    <x-field-desc markdown>For image-to-image models (`doubao-seededit-3-0-i2i`), provides the input image.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>An object containing model-specific parameters.</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false">
      <x-field-desc markdown>The desired dimensions of the generated image (e.g., `"1024x1024"`).</x-field-desc>
    </x-field>
    <x-field data-name="seed" data-type="number" data-required="false">
      <x-field-desc markdown>A seed value for reproducible results. Supported by `doubao-seedream-3-0-t2i` and `doubao-seededit-3-0-i2i`.</x-field-desc>
    </x-field>
    <x-field data-name="guidanceScale" data-type="number" data-required="false">
      <x-field-desc markdown>Controls how closely the generated image follows the prompt. Supported by `doubao-seedream-3-0-t2i` and `doubao-seededit-3-0-i2i`.</x-field-desc>
    </x-field>
    <x-field data-name="stream" data-type="boolean" data-required="false" data-default="false">
      <x-field-desc markdown>If `true`, streams the generation results. Supported by `doubao-seedream-4` models.</x-field-desc>
    </x-field>
    <x-field data-name="watermark" data-type="boolean" data-required="false" data-default="false">
      <x-field-desc markdown>If `false`, disables the watermark on the generated image.</x-field-desc>
    </x-field>
    <x-field data-name="sequentialImageGeneration" data-type="boolean" data-required="false">
      <x-field-desc markdown>Enables sequential image generation. Supported by `doubao-seedream-4` models.</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### Supported Image Models

The following table lists the supported image models and their key characteristics.

| Model Family                | Supported Models                | Key Use Case          |
| --------------------------- | ------------------------------- | --------------------- |
| `doubao-seedream-4`         | `doubao-seedream-4-0-250828`    | Text-to-Image (T2I)   |
| `doubao-seedream-3-0-t2i`   | (Specific model names vary)     | Text-to-Image (T2I)   |
| `doubao-seededit-3-0-i2i`   | (Specific model names vary)     | Image-to-Image (I2I)  |