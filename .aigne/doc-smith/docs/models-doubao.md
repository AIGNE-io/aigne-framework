# Doubao

The `@aigne/doubao` package provides a seamless integration with Doubao's powerful AI models, allowing you to connect your AIGNE agents to their services for a wide range of language and image generation tasks. This integration offers a consistent interface within the AIGNE Framework, making it easy to leverage Doubao's advanced capabilities.

## Features

*   **Direct API Integration**: Connects directly to Doubao's API services.
*   **Chat Completions**: Full support for Doubao's chat models.
*   **Image Generation**: Generate and edit images using text prompts.
*   **Streaming Responses**: Enables real-time, responsive interactions.
*   **Consistent Interface**: Works smoothly within the AIGNE Framework's model structure.

## Installation

To get started, install the necessary packages using your preferred package manager:

```bash pnpm
pnpm add @aigne/doubao @aigne/core
```

```bash npm
npm install @aigne/doubao @aigne/core
```

```bash yarn
yarn add @aigne/doubao @aigne/core
```

## Configuration

Before using the models, you need to configure your Doubao API key. You can either pass the key directly in the model's constructor or set it as an environment variable named `DOUBAO_API_KEY` for better security.

## Chat Completions

Use the `DoubaoChatModel` for conversational AI, text generation, and function calling.

### Basic Usage

Here's how to create a model instance and get a response:

```typescript Basic Chat Example icon=logos:typescript
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

For more interactive applications, you can stream the response as it's being generated.

```typescript Streaming Chat Example icon=logos:typescript
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

### Constructor Options

When creating a `DoubaoChatModel` instance, you can provide the following options:

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your Doubao API key. If not provided, the `DOUBAO_API_KEY` environment variable will be used.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="doubao-seed-1-6-250615" data-required="false" data-desc="The specific chat model to use."></x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://ark.cn-beijing.volces.com/api/v3" data-required="false" data-desc="The base URL for the Doubao API."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Additional options to pass to the model, such as `temperature`."></x-field>
</x-field-group>

## Image Generation

Use the `DoubaoImageModel` to generate or edit images based on text prompts.

### Basic Usage

Here's how to create an image model and generate an image:

```typescript Image Generation Example icon=logos:typescript
import { DoubaoImageModel } from "@aigne/doubao";

const imageModel = new DoubaoImageModel({
  apiKey: "your-doubao-api-key",
});

const result = await imageModel.invoke({
  prompt: "A photorealistic image of a cat programming on a laptop",
  modelOptions: {
    size: "1024x1024",
  },
});

// The result contains an array of images, which can be URLs or file objects
console.log(result.images[0]);
```

### Constructor Options

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your Doubao API key. If not provided, the `DOUBAO_API_KEY` environment variable will be used.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="doubao-seedream-4-0-250828" data-required="false" data-desc="The specific image model to use."></x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://ark.cn-beijing.volces.com/api/v3" data-required="false" data-desc="The base URL for the Doubao API."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Default options for image generation, such as `size` or `seed`."></x-field>
</x-field-group>

### Input Parameters

When calling the `invoke` method on an image model, you can specify the following parameters:

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="The text prompt describing the image you want to generate."></x-field>
  <x-field data-name="image" data-type="FileUnion" data-required="false" data-desc="An input image for image-to-image generation tasks."></x-field>
  <x-field data-name="modelOptions" data-type="DoubaoImageModelInput" data-required="false" data-desc="Model-specific options for this request.">
    <x-field data-name="size" data-type="string" data-required="false" data-desc="The dimensions of the generated image (e.g., '1024x1024')."></x-field>
    <x-field data-name="seed" data-type="number" data-required="false" data-desc="A seed value for reproducible results."></x-field>
    <x-field data-name="guidanceScale" data-type="number" data-required="false" data-desc="Controls how closely the generated image follows the prompt."></x-field>
    <x-field data-name="watermark" data-type="boolean" data-default="false" data-required="false" data-desc="Whether to include a watermark on the generated image."></x-field>
    <x-field data-name="stream" data-type="boolean" data-required="false" data-desc="Set to true to stream the image generation process."></x-field>
  </x-field>
</x-field-group>

## Supported Models

Here is a list of the available Doubao models you can use:

| Type  | Model ID                        | Default |
| :---- | :------------------------------ | :------ |
| Chat  | `doubao-seed-1-6-250615`        | Yes     |
| Image | `doubao-seedream-4-0-250828`    | Yes     |
| Image | `doubao-seedream-3-0-t2i`       | No      |
| Image | `doubao-seededit-3-0-i2i`       | No      |

---

Now that you know how to use Doubao models, you can explore other integrations like [OpenAI](./models-openai.md) or [Google Gemini](./models-gemini.md) to further expand your agent's capabilities.