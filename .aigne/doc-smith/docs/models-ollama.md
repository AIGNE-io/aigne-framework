# @aigne/ollama

The `@aigne/ollama` SDK provides a seamless integration between the AIGNE Framework and AI models hosted locally via Ollama. This allows developers to easily leverage open-source language models in their AIGNE applications, offering a consistent interface while ensuring privacy and offline access to AI capabilities.

```d2
direction: down

AIGNE-Application: {
  label: "Your AIGNE Application"
  shape: rectangle
}

aigne-ollama: {
  label: "@aigne/ollama SDK"
  shape: rectangle
}

Ollama-Instance: {
  label: "Ollama Instance\n(Runs Locally)"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  API-Server: {
    label: "API Server\n(localhost:11434)"
    shape: rectangle
  }

  Local-Models: {
    label: "Local AI Models"
    shape: rectangle
    grid-columns: 2

    Llama3: { shape: rectangle }
    Mistral: { shape: rectangle }
    "and more...": { shape: rectangle }
  }
}

AIGNE-Application -> aigne-ollama: "Uses `OllamaChatModel`"
aigne-ollama -> Ollama-Instance.API-Server: "Sends HTTP API requests"
Ollama-Instance.API-Server -> Ollama-Instance.Local-Models: "Loads & runs model"
Ollama-Instance.Local-Models -> Ollama-Instance.API-Server: "Returns completion"
```

## Features

*   **Direct Ollama Integration**: Connect directly to a local Ollama instance.
*   **Local Model Support**: Use a wide variety of open-source models hosted via Ollama.
*   **Chat Completions**: Full support for the chat completions API with all compatible Ollama models.
*   **Streaming Responses**: Enable real-time, responsive applications with support for streaming responses.
*   **Type-Safe**: Benefit from comprehensive TypeScript typings for all APIs and models.
*   **Consistent Interface**: Integrates smoothly with the AIGNE Framework's model interface.
*   **Privacy-Focused**: Run models locally without sending data to external services.
*   **Full Configuration**: Access extensive configuration options to fine-tune model behavior.

## Prerequisites

Before using this package, you must have [Ollama](https://ollama.ai/) installed and running on your machine. You also need to have pulled at least one model. Follow the official instructions on the [Ollama website](https://ollama.ai/) to complete the setup.

## Installation

Install the package and its core dependency using your preferred package manager.

### npm

```bash
npm install @aigne/ollama @aigne/core
```

### yarn

```bash
yarn add @aigne/ollama @aigne/core
```

### pnpm

```bash
pnpm add @aigne/ollama @aigne/core
```

## Configuration

The primary entry point is the `OllamaChatModel` class, which connects to your local Ollama instance.

```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  // The base URL of your Ollama instance.
  // Defaults to `http://localhost:11434`.
  baseURL: "http://localhost:11434",

  // The Ollama model to use for completions.
  // Defaults to 'llama3'.
  model: "llama3",

  // Additional options to pass to the model.
  modelOptions: {
    temperature: 0.8,
  },
});
```

The constructor accepts the following options:

| Parameter | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `model` | `string` | The name of the Ollama model to use. | `llama3.2` |
| `baseURL` | `string` | The base URL for the Ollama server. Can also be set with the `OLLAMA_BASE_URL` environment variable. | `http://localhost:11434/v1` |
| `modelOptions` | `object` | An object containing model-specific parameters like `temperature`, `top_p`, etc. | `{}` |
| `apiKey` | `string` | The API key for authentication. Can also be set with `OLLAMA_API_KEY`. | `ollama` |

## Basic Usage

To generate a response, use the `invoke` method. Pass a list of messages, and it will return a single, complete response.

```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
```

**Output:**

```json
{
  "text": "I'm an AI assistant running on Ollama with the llama3 model.",
  "model": "llama3"
}
```

## Streaming Responses

For more interactive applications, you can stream the response as it's being generated. Set the `streaming: true` option in the `invoke` call to receive an asynchronous stream of response chunks.

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me what model you're using" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  // Use the isAgentResponseDelta type guard to handle deltas
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // Print text as it arrives
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Data ---");
console.log("Full Text:", fullText);
console.log("JSON:", json);
```

**Output:**

```
I'm an AI assistant running on Ollama with the llama3 model.
--- Final Data ---
Full Text: I'm an AI assistant running on Ollama with the llama3 model.
JSON: { "model": "llama3" }
```

## License

This package is licensed under the [Elastic-2.0 License](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md).