# Ollama

Utilize a wide variety of open-source models running locally on your machine via the Ollama server. The `@aigne/ollama` package provides a seamless integration between the AIGNE Framework and your local Ollama instance, allowing you to leverage powerful open-source language models with complete privacy and offline access.

This setup is ideal for developers who need to keep their data on-premise or want to experiment with a wide range of models without relying on external API services.

![AIGNE Ollama Integration](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-ollama.png)

## Features

<x-cards data-columns="2">
  <x-card data-title="Direct Ollama Integration" data-icon="lucide:cpu">
    Connects directly to your local Ollama instance for fast, private AI processing.
  </x-card>
  <x-card data-title="Broad Model Support" data-icon="lucide:library">
    Works with any open-source model available through Ollama.
  </x-card>
  <x-card data-title="Chat & Streaming" data-icon="lucide:messages-square">
    Supports both standard chat completions and real-time streaming responses.
  </x-card>
  <x-card data-title="Privacy First" data-icon="lucide:lock">
    Run models entirely on your own machine, ensuring your data never leaves your control.
  </x-card>
</x-cards>

## Prerequisites

Before you can use this integration, you must have [Ollama](https://ollama.ai/) installed and running on your local machine. You also need to have pulled at least one model.

For example, to download the `llama3.2` model, run the following command in your terminal:

```bash
ollama pull llama3.2
```

Follow the complete setup instructions on the [Ollama website](https://ollama.ai/).

## Installation

To get started, install the necessary AIGNE packages in your project.

```bash Tabs
--npm--
npm install @aigne/ollama @aigne/core
--yarn--
yarn add @aigne/ollama @aigne/core
--pnpm--
pnpm add @aigne/ollama @aigne/core
```

## Configuration

The `OllamaChatModel` class is your entry point for interacting with Ollama. When you create a new instance, you can provide several configuration options to customize its behavior.

<x-field-group>
  <x-field data-name="model" data-type="string" data-default="llama3.2" data-required="false">
    <x-field-desc markdown>The name of the Ollama model you want to use (e.g., `mistral`, `gemma`).</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="http://localhost:11434/v1" data-required="false">
    <x-field-desc markdown>The base URL of your Ollama server. It can also be configured using the `OLLAMA_BASE_URL` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to pass to the model, such as `temperature`, `top_p`, etc., to fine-tune its responses.</x-field-desc>
  </x-field>
</x-field-group>

## Basic Usage

Here’s how you can send a message to your local model and get a response. This example uses the `invoke` method for a simple request-response interaction.

```typescript Basic Chat Completion icon=logos:typescript
import { OllamaChatModel } from "@aigne/ollama";

// Initialize the model, defaulting to 'llama3.2'
const model = new OllamaChatModel({
  // The Ollama server URL (defaults to http://localhost:11434)
  baseURL: "http://localhost:11434",
  // Specify the model you've pulled in Ollama
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

// Send a message to the model
const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
```

**Example Response**

```json
{
  "text": "I'm an AI assistant running on Ollama with the llama3 model.",
  "model": "llama3"
}
```

## Streaming Responses

For more interactive applications, you can stream the response from the model as it's being generated. This allows you to update your UI in real-time without waiting for the full response to complete.

To enable streaming, set the `streaming` option to `true` in the `invoke` method call.

```typescript Streaming Example icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  baseURL: "http://localhost:11434",
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me what model you're using" }],
  },
  { streaming: true },
);

let fullText = "";

// Process each chunk from the stream
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // Print text to the console as it arrives
    }
  }
}

console.log("\n\n--- Final Assembled Text ---");
console.log(fullText);
```

This script will print the response word by word as it is generated, and then log the complete message at the end.
