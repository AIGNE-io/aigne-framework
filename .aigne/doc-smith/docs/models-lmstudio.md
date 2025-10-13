This document provides a comprehensive guide to using the `@aigne/lmstudio` package, an AIGNE model adapter for integrating with locally hosted AI models via LM Studio.

## Overview

The `@aigne/lmstudio` model adapter provides a seamless integration with LM Studio's OpenAI-compatible API, allowing you to run local Large Language Models (LLMs) through the AIGNE framework. LM Studio offers a user-friendly interface for downloading, managing, and running local AI models with a built-in server that mimics the OpenAI API.

This adapter inherits from the `@aigne/openai` package, which means it supports the familiar OpenAI API structure for operations like chat, streaming, tool/function calling, and structured output.

## Prerequisites

Before using this package, you must complete the following steps:

1.  **Install LM Studio**: Download and install the LM Studio application from the official website: [https://lmstudio.ai/](https://lmstudio.ai/)
2.  **Download a Model**: Use the LM Studio interface to search for and download a local model. Popular choices include Llama 3.2, Mistral, and Phi-3.
3.  **Start the Local Server**: Navigate to the "Local Server" tab in LM Studio, select your downloaded model, and click "Start Server". This will expose a local endpoint (typically `http://localhost:1234/v1`) that the adapter will connect to.

## Installation

Install the package into your project using your preferred package manager:

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

The following example demonstrates how to create an instance of the `LMStudioChatModel` and make a basic request.

```typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

// 1. Create a new LM Studio chat model instance
const model = new LMStudioChatModel({
  // The baseURL should match the address of your LM Studio local server
  baseURL: "http://localhost:1234/v1",
  // The model name must exactly match the one loaded in LM Studio
  model: "llama-3.2-3b-instruct",
  modelOptions: {
    temperature: 0.7,
    maxTokens: 2048,
  },
});

// 2. Invoke the model with a user message
const response = await model.invoke({
  messages: [
    { role: "user", content: "What is the capital of France?" }
  ],
});

// 3. Print the response text
console.log(response.text);
// Expected output: "The capital of France is Paris."
```

## Configuration

You can configure the `LMStudioChatModel` through its constructor or by using environment variables.

### Constructor Options

The `LMStudioChatModel` extends the `OpenAIChatModel`, so it accepts standard OpenAI options.

```typescript
const model = new LMStudioChatModel({
  // The base URL of the LM Studio server (defaults to http://localhost:1234/v1)
  baseURL: "http://localhost:1234/v1",
  
  // The model identifier, which must match the one loaded in LM Studio
  model: "llama-3.2-3b-instruct",

  // API key is not required for local LM Studio instances
  // It defaults to "not-required"
  // apiKey: "your-key-if-needed",

  // Standard model options
  modelOptions: {
    temperature: 0.7,     // Controls randomness (0.0 to 2.0)
    maxTokens: 2048,      // Maximum tokens in the response
    topP: 0.9,            // Nucleus sampling
    frequencyPenalty: 0,  // Penalizes new tokens based on their frequency
    presencePenalty: 0,   // Penalizes new tokens based on their presence
  },
});
```

### Environment Variables

For more flexible configuration, you can use environment variables:

```bash
# Sets the LM Studio server URL (default: http://localhost:1234/v1)
LM_STUDIO_BASE_URL=http://localhost:1234/v1

# The API Key is not required by default for local LM Studio.
# Only set this if you have configured authentication on your server.
# LM_STUDIO_API_KEY=your-key-if-needed
```

**Note:** LM Studio typically runs locally without authentication. The API key is set to a placeholder value `"not-required"` by default to satisfy the underlying OpenAI client.

## Features

The adapter supports several advanced features, including streaming, tool calling, and structured JSON output.

### Streaming Support

For real-time responses, you can stream the output from the model. This is useful for applications like chatbots where you want to display the response as it's being generated.

```typescript
const model = new LMStudioChatModel();

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
```

### Tool & Function Calling

The adapter supports OpenAI-compatible function calling, allowing the model to request the invocation of external tools.

```typescript
// Define the tool specification
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description: "Get the current weather information for a specified location",
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

// Invoke the model with the tools
const response = await model.invoke({
  messages: [
    { role: "user", content: "What's the weather like in New York?" }
  ],
  tools,
});

// Check if the model requested a tool call
if (response.toolCalls?.length) {
  console.log("Tool calls:", response.toolCalls);
  // Example Output:
  // Tool calls: [ { id: '...', type: 'function', function: { name: 'get_weather', arguments: '{"location":"New York"}' } } ]
}
```

### Structured Output (JSON)

You can instruct the model to generate a response that conforms to a specific JSON schema.

```typescript
// Define the desired JSON schema for the output
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

// Invoke the model with the response format
const response = await model.invoke({
  messages: [
    { role: "user", content: "Get the current weather for Paris in JSON format." }
  ],
  responseFormat,
});

// The parsed JSON object is available in the `response.json` field
console.log(response.json);
```

## Supported Models

LM Studio supports a wide variety of open-source models. The model name used in the configuration must exactly match what is shown in your LM Studio interface. Popular choices include:

-   **Llama 3.2** (3B, 8B, 70B variants)
-   **Llama 3.1** (8B, 70B, 405B variants)
-   **Mistral** (7B, 8x7B variants)
-   **CodeLlama** (7B, 13B, 34B variants)
-   **Qwen** (various sizes)
-   **Phi-3** (mini, small, medium variants)

## Error Handling

When interacting with a local server, it's important to handle potential connection errors. A common issue is the LM Studio server not being active.

```typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel();

try {
  const response = await model.invoke({
    messages: [{ role: "user", content: "Hello!" }],
  });
  console.log(response.text);
} catch (error) {
  // Specifically check for a connection refused error
  if (error.code === "ECONNREFUSED") {
    console.error("Connection failed: The LM Studio server is not running. Please start the local server.");
  } else {
    console.error("An unexpected error occurred:", error.message);
  }
}
```

## Troubleshooting

Here are solutions to common issues:

1.  **Connection Refused**: This error (`ECONNREFUSED`) occurs when the LM Studio local server is not running. Ensure you have started the server from the "Local Server" tab in the LM Studio application.
2.  **Model Not Found**: If you receive a "model not found" error, verify that the `model` name in your configuration exactly matches the model file name loaded in LM Studio.
3.  **Out of Memory**: Large models can consume significant system resources. If you experience crashes or memory issues, try using a smaller model (e.g., a 3B or 8B parameter variant) or reduce the context length (`maxTokens`).
4.  **Slow Responses**: Response speed depends on your hardware (CPU/GPU) and the model size. For faster inference, consider using GPU acceleration if your hardware supports it and is configured correctly in LM Studio.