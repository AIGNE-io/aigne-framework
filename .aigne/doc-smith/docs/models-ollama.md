# Ollama

The `@aigne/ollama` package provides a seamless integration between the AIGNE Framework and AI models hosted locally via [Ollama](https://ollama.ai/). This allows developers to leverage a wide variety of open-source language models running on their own hardware, ensuring privacy and offline access to AI capabilities.

This guide covers the necessary steps to configure and use the `OllamaChatModel` in your AIGNE applications. For information on other model providers, please see the [Models Overview](./models-overview.md).

The following diagram illustrates how the AIGNE Framework interacts with a local Ollama instance.

```d2
direction: right
style: {
  font-size: 14
  fill: "#F6F8FA"
  stroke: "#B4B4B4"
  stroke-width: 1
}

AIGNE_Application: "AIGNE Application" {
  shape: rectangle
  style.fill: "#E6F7FF"
  style.stroke: "#91D5FF"
}

OllamaChatModel: "@aigne/ollama\nOllamaChatModel" {
  shape: rectangle
  style.fill: "#F9F0FF"
  style.stroke: "#D3ADF7"
}

Ollama_Instance: "Local Ollama Instance" {
  shape: cylinder
  style.fill: "#FFF7E6"
  style.stroke: "#FFE7BA"
  
  LLM: "Language Model\n(e.g., Llama 3)" {
    shape: hexagon
    style.fill: "#F6FFED"
    style.stroke: "#B7EB8F"
  }
}

AIGNE_Application -> OllamaChatModel: "1. Invokes model"
OllamaChatModel -> Ollama_Instance: "2. Sends request to\n   http://localhost:11434"
Ollama_Instance.LLM -> Ollama_Instance: "3. Processes request"
Ollama_Instance -> OllamaChatModel: "4. Returns response"
OllamaChatModel -> AIGNE_Application: "5. Delivers result"
```

## Prerequisites

Before using this package, you must have Ollama installed and running on your local machine. You also need to have pulled at least one model. For detailed instructions, please refer to the [official Ollama website](https://ollama.ai/).

## Installation

To get started, install the necessary AIGNE packages using your preferred package manager.

<x-cards data-columns="3">
  <x-card data-title="npm" data-icon="logos:npm-icon">
    ```bash
    npm install @aigne/ollama @aigne/core
    ```
  </x-card>
  <x-card data-title="yarn" data-icon="logos:yarn">
    ```bash
    yarn add @aigne/ollama @aigne/core
    ```
  </x-card>
  <x-card data-title="pnpm" data-icon="logos:pnpm">
    ```bash
    pnpm add @aigne/ollama @aigne/core
    ```
  </x-card>
</x-cards>

## Configuration

The `OllamaChatModel` class is the primary interface for interacting with Ollama. When instantiating the model, you can provide several configuration options to customize its behavior.

```typescript OllamaChatModel Instantiation icon=logos:typescript-icon
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  // Specify the Ollama model to use
  model: "llama3",
  
  // The base URL of your local Ollama instance
  baseURL: "http://localhost:11434/v1",

  // Optional parameters to pass to the model
  modelOptions: {
    temperature: 0.7,
  },
});
```

The constructor accepts the following parameters:

<x-field-group>
  <x-field data-name="model" data-type="string" data-default="llama3.2" data-required="false">
    <x-field-desc markdown>The name of the model to use (e.g., `llama3`, `mistral`). Ensure the model has been pulled in your Ollama instance.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="http://localhost:11434/v1" data-required="false">
    <x-field-desc markdown>The base URL for the Ollama API. This can also be configured using the `OLLAMA_BASE_URL` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-default="ollama" data-required="false">
    <x-field-desc markdown>A placeholder API key. Ollama does not require authentication by default, but the AIGNE framework requires a non-empty key. It defaults to `"ollama"` and can be set with the `OLLAMA_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>An object containing additional parameters to pass to the Ollama API, such as `temperature`, `top_p`, etc. These options allow for fine-tuning the model's response generation.</x-field-desc>
  </x-field>
</x-field-group>

## Basic Usage

To run the model, use the `invoke` method. Pass a message payload to generate a chat completion.

```typescript Basic Invocation icon=logos:typescript-icon
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Explain the importance of local AI models." }],
});

console.log(result.text);
```

The `invoke` method returns a promise that resolves to an object containing the model's response.

**Example Response**
```json
{
  "text": "Local AI models are crucial for several reasons. Firstly, they offer enhanced privacy and security since data is processed on-device and never leaves the user's machine...",
  "model": "llama3"
}
```

## Streaming Responses

For applications requiring real-time interaction, you can stream the model's response. Set the `streaming` option to `true` in the `invoke` method. The method will return an async iterator that yields response chunks as they become available.

```typescript Streaming Example icon=logos:typescript-icon
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story about a robot." }],
  },
  { streaming: true },
);

let fullText = "";
process.stdout.write("Response: ");

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
  }
}

console.log("\n\n--- End of Stream ---");
console.log("Full text:", fullText);
```

This example demonstrates how to process a stream. Each chunk is a delta of the full response. You can accumulate the text from each chunk to reconstruct the complete message.

## Summary

The `@aigne/ollama` package offers a robust and straightforward way to integrate local, open-source models into your AIGNE applications. By following the steps in this guide, you can set up the `OllamaChatModel`, configure it for your needs, and leverage both standard and streaming completions.

For further reading on other available models, please see the following guides:
- [OpenAI](./models-openai.md)
- [Google Gemini](./models-gemini.md)
- [Anthropic](./models-anthropic.md)