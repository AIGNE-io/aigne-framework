# DeepSeek

This guide provides instructions for configuring and using DeepSeek models within the AIGNE Framework via the `@aigne/deepseek` package. It covers API key setup, model instantiation, and examples for both standard and streaming responses.

The `@aigne/deepseek` package provides a direct integration with the DeepSeek API, leveraging its powerful language models. It is designed to be compatible with the AIGNE Framework's `ChatModel` interface, ensuring a consistent development experience.

## Installation

To begin, install the necessary packages using your preferred package manager. The `@aigne/core` package is a required peer dependency.

```bash tabs
npm install @aigne/deepseek @aigne/core
```

```bash tabs
yarn add @aigne/deepseek @aigne/core
```

```bash tabs
pnpm add @aigne/deepseek @aigne/core
```

## Configuration

The `DeepSeekChatModel` class is the primary interface for interacting with DeepSeek models. It extends the `OpenAIChatModel` and is configured to use DeepSeek's specific API endpoints and authentication methods.

Your DeepSeek API key is required for authentication. You can provide it in two ways:

1.  **Directly in the constructor**: Pass the key via the `apiKey` property.
2.  **Environment variable**: Set the `DEEPSEEK_API_KEY` environment variable. The model will automatically use it if the `apiKey` property is not provided.

### Parameters

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your DeepSeek API key. If not provided, the client will look for the `DEEPSEEK_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="deepseek-chat" data-required="false">
    <x-field-desc markdown>The specific DeepSeek model to use for chat completions. Defaults to `deepseek-chat`.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to pass to the model API, such as `temperature`, `top_p`, or `max_tokens`.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.deepseek.com" data-required="false">
    <x-field-desc markdown>The base URL for the DeepSeek API. This should not be changed unless you are using a custom proxy.</x-field-desc>
  </x-field>
</x-field-group>

## Usage

Once configured, the model can be used to generate text completions or stream responses.

### Basic Invocation

To generate a standard response, use the `invoke` method. Provide a list of messages, and the method will return a promise that resolves with the complete response from the model.

```typescript Basic Usage icon=logos:typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // Provide API key directly or use environment variable DEEPSEEK_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model version (defaults to 'deepseek-chat')
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

The `result` object contains the generated text and metadata about the model's usage.

**Example Response**

```json
{
  "text": "Hello! I'm an AI assistant powered by DeepSeek's language model.",
  "model": "deepseek-chat",
  "usage": {
    "inputTokens": 7,
    "outputTokens": 12
  }
}
```

### Streaming Responses

For real-time applications, you can stream the response from the model. Set the `streaming` option to `true` in the `invoke` method's second argument. This returns an async iterator that yields chunks of the response as they become available.

```typescript Streaming Responses icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key",
  model: "deepseek-chat",
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

console.log(fullText);
// Expected output: "Hello! I'm an AI assistant powered by DeepSeek's language model."

console.log(json);
// Expected output: { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

In this example, the code iterates through the stream, accumulating the text delta from each chunk to build the complete response. Final metadata, such as token usage, is provided in the last chunk.

## Summary

This guide has covered the essential steps to install, configure, and use DeepSeek models with the AIGNE Framework. By following these instructions, you can integrate DeepSeek's chat capabilities into your applications for both single-turn and streaming use cases. For more advanced configurations and features, refer to the API reference and other sections in the documentation.