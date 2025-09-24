# LM Studio

Run local language models on your own machine through LM Studio's OpenAI-compatible server.

The AIGNE LM Studio model adapter provides a seamless integration with LM Studio, allowing you to use local Large Language Models (LLMs) within the AIGNE framework. This is a great option if you want to experiment with different models, work offline, or keep your data private on your own machine.

## Prerequisites

Before you can connect AIGNE to LM Studio, you need to have it set up and running on your computer.

1.  **Install LM Studio**: If you haven't already, download and install the LM Studio application from the official website: [https://lmstudio.ai/](https://lmstudio.ai/)
2.  **Download a Model**: Open LM Studio and use the search tab to find and download a model. Popular choices include Llama 3.2, Mistral, and Phi-3.
3.  **Start the Local Server**: Go to the "Local Server" tab in LM Studio (it usually has a `<->` icon) and click the "Start Server" button. This will make your downloaded model available for AIGNE to use.

## Installation

To add the LM Studio adapter to your AIGNE project, run the following command:

```bash Installation icon=lucide:package
npm install @aigne/lmstudio
```

## Quick Start

Once your LM Studio server is running, you can connect to it with just a few lines of code. Make sure the `model` name matches the model file you have loaded in LM Studio.

```typescript Quick Start Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

// Create a new LM Studio chat model
const model = new LMStudioChatModel({
  baseURL: "http://localhost:1234/v1", // Default LM Studio server URL
  model: "llama-3.2-3b-instruct", // Model name as shown in LM Studio
  modelOptions: {
    temperature: 0.7,
    maxTokens: 2048,
  },
});

// Send a message to the model
const response = await model.invoke({
  messages: [
    { role: "user", content: "What is the capital of France?" }
  ],
});

console.log(response.text); // "The capital of France is Paris."
```

## Configuration

You can configure the connection to LM Studio when you create the model instance or by using environment variables.

### Constructor Options

When creating a `LMStudioChatModel`, you can pass the following options:

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false" data-default="llama-3.2-3b-instruct">
    <x-field-desc markdown>The name of the model to use. This must match the model identifier shown in your LM Studio interface.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-default="http://localhost:1234/v1">
    <x-field-desc markdown>The URL of your local LM Studio server. The default value is usually correct.</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="false" data-default="not-required">
    <x-field-desc markdown>An API key for authentication. By default, LM Studio does not require an API key, so this is optional.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to control the model's behavior.</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness. Lower values are more deterministic, higher values are more creative."></x-field>
    <x-field data-name="maxTokens" data-type="number" data-required="false" data-desc="The maximum number of tokens to generate in the response."></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Nucleus sampling parameter."></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="Penalizes new tokens based on their existing frequency."></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="Penalizes new tokens based on whether they appear in the text so far."></x-field>
  </x-field>
</x-field-group>

### Environment Variables

Alternatively, you can configure the adapter using environment variables, which is useful for keeping your code clean.

```bash Environment Variables icon=lucide:terminal
# The URL for the LM Studio server
LM_STUDIO_BASE_URL=http://localhost:1234/v1

# The API key (only needed if you configured authentication in LM Studio)
# LM_STUDIO_API_KEY=your-key-if-needed
```

## Features

The LM Studio adapter supports several advanced features of the AIGNE framework.

### Streaming Support

You can stream the model's response as it's being generated, which is great for creating real-time chat experiences.

```typescript Streaming Example icon=logos:typescript
const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story" }],
  },
  { streaming: true }
);

for await (const chunk of stream) {
  if (chunk.type === "delta" && chunk.delta.text) {
    process.stdout.write(chunk.delta.text.text);
  }
}
```

### Tool & Function Calling

Some local models support function calling, which allows the model to request the use of external tools to answer a question.

```typescript Tool Calling Example icon=logos:typescript
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description: "Get current weather information",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
        },
        required: ["location"],
      },
    },
  },
];

const response = await model.invoke({
  messages: [
    { role: "user", content: "What's the weather like in New York?" }
  ],
  tools,
});

if (response.toolCalls?.length) {
  console.log("Tool calls:", response.toolCalls);
}
```

### Structured Output

You can instruct the model to return its response in a specific JSON format, which is useful for predictable, machine-readable output.

```typescript Structured Output Example icon=logos:typescript
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

const response = await model.invoke({
  messages: [
    { role: "user", content: "Get weather for Paris in JSON format" }
  ],
  responseFormat,
});

console.log(response.json); // Parsed JSON object
```

## Supported Models

LM Studio can run a vast number of open-source models. Popular families include:

- Llama 3.2 & 3.1
- Mistral
- CodeLlama
- Qwen
- Phi-3

Remember to use the exact model name that appears in your LM Studio interface when configuring the `model` option.

## Troubleshooting

Here are some solutions to common problems:

- **Connection Refused**: This usually means the local server in LM Studio is not running. Go to the "Local Server" tab and make sure you've clicked "Start Server".
- **Model Not Found**: Double-check that the `model` name in your code exactly matches the model identifier shown in LM Studio.
- **Out of Memory**: Your computer may not have enough RAM to run the selected model. Try using a smaller model (e.g., a 3B or 8B parameter model).
- **Slow Responses**: Running large models can be slow, especially without a dedicated GPU. Using smaller models will improve performance.
