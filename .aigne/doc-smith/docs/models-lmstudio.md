# LMStudio

The `@aigne/lmstudio` package provides a model adapter for integrating AIGNE with large language models (LLMs) hosted locally via [LM Studio](https://lmstudio.ai/). This allows developers to leverage the power of local models within the AIGNE framework, offering greater privacy, control, and cost-effectiveness.

This guide covers the necessary setup for LM Studio and demonstrates how to use the `LMStudioChatModel` to interact with your local models. For information on other local model providers, see the [Ollama](./models-ollama.md) documentation.

## Prerequisites

Before using this package, you must complete the following steps:

1.  **Install LM Studio**: Download and install the LM Studio application from the official website: [https://lmstudio.ai/](https://lmstudio.ai/).
2.  **Download a Model**: Use the LM Studio interface to search for and download a model. Popular choices include variants of Llama 3.2, Mistral, and Phi-3.
3.  **Start the Local Server**: Navigate to the "Local Server" tab (server icon) in LM Studio, select your downloaded model from the dropdown, and click "Start Server". This will expose an OpenAI-compatible API endpoint, typically at `http://localhost:1234/v1`.

## Installation

To add the LMStudio package to your project, run one of the following commands in your terminal:

```bash
npm install @aigne/lmstudio
```

```bash
pnpm add @aigne/lmstudio
```

```bash
yarn add @aigne/lmstudio
```

## Quick Start

Once the LM Studio server is running, you can interact with your local model using the `LMStudioChatModel`. The following example demonstrates how to instantiate the model and send a simple request.

```typescript Quick Start icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

// 1. Instantiate the model
// Ensure the model name matches the one loaded in LM Studio.
const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

// 2. Invoke the model
async function main() {
  try {
    const response = await model.invoke({
      messages: [
        { role: "user", content: "What is the capital of France?" }
      ],
    });

    console.log(response.text);
  } catch (error) {
    console.error("Error invoking model:", error);
  }
}

main();
```

If the request is successful, the output will be:

```text
The capital of France is Paris.
```

## Configuration

The `LMStudioChatModel` can be configured through its constructor or with environment variables.

### Constructor Options

The `LMStudioChatModel` extends the standard `OpenAIChatModel` and accepts the following options:

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false">
    <x-field-desc markdown>The name of the model to use, which must match the model file loaded in the LM Studio server. Defaults to `llama-3.2-3b-instruct`.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>The base URL of the LM Studio server. Defaults to `http://localhost:1234/v1`.</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>An API key, if you have configured authentication on your LM Studio server. By default, LM Studio runs without authentication, and the key is set to a placeholder value of `not-required`.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to control model generation.</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness. Lower values (e.g., 0.2) make the output more deterministic. Defaults to 0.7."></x-field>
    <x-field data-name="maxTokens" data-type="number" data-required="false" data-desc="The maximum number of tokens to generate in the response."></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus sampling parameter."></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="Penalizes new tokens based on their existing frequency."></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="Penalizes new tokens based on whether they appear in the text so far."></x-field>
  </x-field>
</x-field-group>

Here is an example with custom configuration:

```typescript Configuration Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  baseURL: "http://localhost:1234/v1",
  model: "Mistral-7B-Instruct-v0.2-GGUF",
  modelOptions: {
    temperature: 0.8,
    maxTokens: 4096,
  },
});
```

### Environment Variables

You can also configure the model by setting environment variables. The constructor options will take precedence if both are provided.

-   `LM_STUDIO_BASE_URL`: Sets the server's base URL. Defaults to `http://localhost:1234/v1`.
-   `LM_STUDIO_API_KEY`: Sets the API key. Only necessary if your server requires authentication.

```bash .env
LM_STUDIO_BASE_URL=http://localhost:1234/v1
# LM_STUDIO_API_KEY=your-key-if-needed
```

## Features

The `LMStudioChatModel` supports several advanced features, including streaming, tool calling, and structured outputs.

### Streaming

For real-time applications, you can stream the response as it's being generated. Set the `streaming: true` option in the `invoke` method.

```typescript Streaming Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

async function streamStory() {
  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Tell me a short story about a robot who discovers music." }],
    },
    { streaming: true }
  );

  for await (const chunk of stream) {
    if (chunk.type === "delta" && chunk.delta.text) {
      process.stdout.write(chunk.delta.text.text);
    }
  }
}

streamStory();
```

### Tool Calling

Many local models support OpenAI-compatible tool calling (also known as function calling). You can provide a list of tools to the model, and it will generate the arguments required to call them.

```typescript Tool Calling Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description: "Get the current weather for a specified location.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g., San Francisco, CA",
          },
        },
        required: ["location"],
      },
    },
  },
];

async function checkWeather() {
  const response = await model.invoke({
    messages: [
      { role: "user", content: "What's the weather like in New York?" }
    ],
    tools,
  });

  if (response.toolCalls?.length) {
    console.log("Tool calls:", JSON.stringify(response.toolCalls, null, 2));
  }
}

checkWeather();
```

### Structured Output

To ensure the model's output conforms to a specific JSON schema, you can define a `responseFormat`. This is useful for tasks that require reliable, machine-readable data.

```typescript Structured Output Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

const responseFormat = {
  type: "json_schema" as const,
  json_schema: {
    name: "weather_response",
    schema: {
      type: "object",
      properties: {
        location: { type: "string" },
        temperature: { type: "number" },
        description: { type: "string" },
      },
      required: ["location", "temperature", "description"],
    },
  },
};

async function getWeatherAsJson() {
  const response = await model.invoke({
    messages: [
      { role: "user", content: "What is the weather in Paris? Respond in the requested JSON format." }
    ],
    responseFormat,
  });

  console.log(response.json);
}

getWeatherAsJson();
```

## Supported Models

LM Studio supports a wide variety of GGUF-format models. The exact model name must match what is shown in the LM Studio user interface. Popular compatible models include:

| Model Family | Variants                               |
| :----------- | :------------------------------------- |
| **Llama 3.2**  | 3B, 8B, 70B Instruct                   |
| **Llama 3.1**  | 8B, 70B, 405B Instruct                 |
| **Mistral**    | 7B, 8x7B Instruct                      |
| **Phi-3**      | Mini, Small, Medium Instruct           |
| **CodeLlama**  | 7B, 13B, 34B Instruct                  |
| **Qwen**       | Various sizes                          |

## Troubleshooting

If you encounter issues, consult the following list of common problems and solutions.

| Issue               | Solution                                                                                                   |
| :------------------ | :--------------------------------------------------------------------------------------------------------- |
| **Connection Refused** | Verify that the LM Studio local server is running and that the `baseURL` in your code is correct.        |
| **Model Not Found**    | Ensure the `model` name in your code exactly matches the model file name loaded in the LM Studio server. |
| **Slow Responses**     | If available, enable GPU acceleration in LM Studio's server settings. Using a smaller model can also help. |
| **Out of Memory**      | The model may require more RAM than your system has available. Try using a smaller model or reducing the context length. |

### Error Handling

It is good practice to wrap your model calls in a `try...catch` block to handle potential runtime errors, such as network issues.

```typescript Error Handling Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel();

async function safeInvoke() {
  try {
    const response = await model.invoke({
      messages: [{ role: "user", content: "Hello!" }],
    });
    console.log(response.text);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error("Connection failed. Please ensure the LM Studio server is running.");
    } else {
      console.error("An unexpected error occurred:", error.message);
    }
  }
}

safeInvoke();
```

---

For more detailed information, refer to the official [LM Studio Documentation](https://lmstudio.ai/docs). To explore other model integrations, you can proceed to the documentation for [AIGNE Hub](./models-aigne-hub.md).