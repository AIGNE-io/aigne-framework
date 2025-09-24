# OpenAI

Integrate OpenAI's powerful GPT models, including chat completions and DALL-E image generation, into your AIGNE agents. The `@aigne/openai` package provides a seamless connection between the AIGNE Framework and OpenAI's suite of AI services, allowing you to leverage their advanced capabilities with a consistent interface.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openai-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openai.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-openai.png" alt="AIGNE OpenAI Integration Architecture" />
</picture>

This provider supports two main types of models: chat models for text-based tasks and image models for creating and editing visuals.

## Installation

To get started, you'll need to install the OpenAI package along with the AIGNE core library.

```bash NPM
npm install @aigne/openai @aigne/core
```

```bash Yarn
yarn add @aigne/openai @aigne/core
```

```bash PNPM
pnpm add @aigne/openai @aigne/core
```

## Chat Completions

The `OpenAIChatModel` class gives you access to OpenAI's powerful language models like GPT-4o and GPT-4o-mini. You can use it for text generation, conversations, function calling, and structured data extraction.

### Configuration

When creating an instance of `OpenAIChatModel`, you can provide the following options:

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your API key for the OpenAI API. If you don't provide it here, the system will look for the `OPENAI_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="A custom base URL for the OpenAI API. This is useful if you're using a proxy or an alternative endpoint."></x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false" data-desc="The specific chat model you want to use, for example, 'gpt-4o'."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Additional options to fine-tune the model's behavior.">
    <x-field data-name="temperature" data-type="number" data-desc="Controls randomness. A lower value makes the output more deterministic."></x-field>
    <x-field data-name="topP" data-type="number" data-desc="Nucleus sampling. The model considers tokens with top_p probability mass."></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-desc="Decreases the likelihood of repeating the same lines of text."></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-desc="Increases the likelihood of talking about new topics."></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-desc="Whether the model can call multiple tools in parallel."></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false" data-desc="Advanced options to pass directly to the underlying OpenAI client."></x-field>
</x-field-group>

### Basic Usage

Here’s a simple example of how to send a message to an OpenAI model and get a response.

```typescript Basic Chat Example icon=logos:typescript
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
```

This will produce a result containing the model's text response and token usage information.

```json Expected Output
{
  text: "Hello! I am a large language model trained by Google.",
  model: "gpt-4o",
  usage: {
    inputTokens: 10,
    outputTokens: 9
  }
}
```

### Streaming Responses

For a more interactive experience, you can stream the response from the model. This allows you to receive the text in chunks as it's being generated, rather than waiting for the entire response to complete.

```typescript Streaming Example icon=logos:typescript
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

console.log("\n\n--- Response Complete ---");
console.log(fullText);
```

## Image Generation

The `OpenAIImageModel` class allows you to generate and edit images using OpenAI's DALL-E models.

### Configuration

When creating an instance of `OpenAIImageModel`, you can provide the following options:

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your API key for the OpenAI API. If you don't provide it here, the system will look for the `OPENAI_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="A custom base URL for the OpenAI API, useful for proxies."></x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false" data-desc="The specific image model you want to use, e.g., 'dall-e-3'."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Additional options to fine-tune image generation, such as size, quality, and style."></x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false" data-desc="Advanced options to pass directly to the underlying OpenAI client."></x-field>
</x-field-group>

### Usage

To generate an image, simply provide a text prompt. The model will return a URL or base64-encoded data for the generated image.

```typescript Generate an Image icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
});

const result = await imageModel.invoke({
  prompt: "A cute cat programming on a laptop, cartoon style",
  modelOptions: {
    size: "1024x1024",
    quality: "hd",
  },
});

console.log(result.images);
```

Some models also support image editing. To edit an image, you provide the original image file along with your prompt.

```typescript Edit an Image icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";
import { readFileSync } from 'fs';

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-2", // Note: DALL-E 2 supports editing
});

const imageBuffer = readFileSync('./my-image.png');

const result = await imageModel.invoke({
  prompt: "Add a party hat to the person in the image",
  image: [
    {
      type: "file",
      data: imageBuffer.toString('base64'),
      mimeType: 'image/png',
    }
  ]
});

console.log(result.images);
```

---

Now you're equipped to build powerful AI agents using OpenAI's models. For a simplified way to manage API keys and access multiple model providers, consider exploring the [AIGNE Hub](./models-aigne-hub.md).