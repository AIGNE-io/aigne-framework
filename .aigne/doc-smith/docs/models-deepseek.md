# DeepSeek

Integrate DeepSeek's powerful open-source language models into your agents for strong coding and reasoning capabilities. The `@aigne/deepseek` package provides a seamless connection to the DeepSeek API, allowing you to leverage their models within the AIGNE Framework.

This integration is built on an OpenAI-compatible API format, making it familiar and easy to work with if you've used other similar models.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-deepseek-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-deepseek.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-deepseek.png" alt="AIGNE DeepSeek Architecture" />
</picture>

## Setup

Before you can use DeepSeek models, you'll need an API key from the [DeepSeek platform](https://platform.deepseek.com/). Once you have your key, the recommended way to use it is by setting it as an environment variable. The AIGNE framework will automatically detect and use this key.

```bash
export DEEPSEEK_API_KEY="your-api-key"
```

Alternatively, you can pass the `apiKey` directly when creating the model instance, as shown in the examples below.

## Installation

To get started, you need to install the `@aigne/deepseek` package along with the core AIGNE framework.

```bash NPM
npm install @aigne/deepseek @aigne/core
```

```bash Yarn
yarn add @aigne/deepseek @aigne/core
```

```bash PNPM
pnpm add @aigne/deepseek @aigne/core
```

## Basic Usage

Here’s a simple example of how to use the `DeepSeekChatModel` to get a response from the API.

```typescript Basic Chat Example icon=logos:typescript
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

This code creates an instance of the chat model, sends a user message, and prints the AI's response.

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

## Configuration

You can configure the `DeepSeekChatModel` by passing options to its constructor. Here are the main parameters:

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your DeepSeek API key. If not provided, the model will look for the `DEEPSEEK_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="deepseek-chat" data-required="false">
    <x-field-desc markdown>The specific DeepSeek model you want to use, for example, `deepseek-chat`.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.deepseek.com" data-required="false">
    <x-field-desc markdown>The base URL for the DeepSeek API. You typically don't need to change this.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to pass to the model API, such as `temperature`, `max_tokens`, etc.</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-default="0.7" data-required="false">
      <x-field-desc markdown>Controls the randomness of the output. A higher value like `0.7` makes the output more creative, while a lower value makes it more deterministic.</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

## Streaming Responses

For more interactive applications like chatbots, you can stream the response as it's being generated. This allows you to display the text to the user token by token, creating a real-time effect.

```typescript Streaming Example icon=logos:typescript
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

console.log(fullText); // "Hello! I'm an AI assistant powered by DeepSeek's language model."
console.log(json); // { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

In this example, we set `streaming: true` in the `invoke` options. We then loop through the stream, check for response delta chunks, and build the full text and metadata as they arrive.

---

Now you're ready to use DeepSeek's advanced models in your AIGNE applications. For more options, you might also want to explore other integrations like [OpenAI](./models-openai.md) or the unified [AIGNE Hub](./models-aigne-hub.md).