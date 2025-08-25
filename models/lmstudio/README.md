# @aigne/lmstudio

AIGNE LM Studio model adapter for integrating with locally hosted AI models via LM Studio.

## Overview

This model adapter provides a seamless integration with LM Studio's OpenAI-compatible API, allowing you to run local Large Language Models (LLMs) through the AIGNE framework. LM Studio provides a user-friendly interface for running local AI models with an OpenAI-compatible API.

## Installation

```bash
npm install @aigne/lmstudio
# or
pnpm add @aigne/lmstudio
# or
yarn add @aigne/lmstudio
```

## Prerequisites

1. **Install LM Studio**: Download and install LM Studio from [https://lmstudio.ai/](https://lmstudio.ai/)
2. **Download Models**: Use LM Studio's interface to download local models (e.g., Llama 3.2, Mistral, etc.)
3. **Start Local Server**: Launch the local server from LM Studio's "Local Server" tab

## Quick Start

```typescript
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

// Basic usage
const response = await model.invoke({
  messages: [
    { role: "user", content: "What is the capital of France?" }
  ],
});

console.log(response.text); // "The capital of France is Paris."
```

## Configuration

### Environment Variables

You can configure the LM Studio connection using environment variables:

```bash
# LM Studio server URL (default: http://localhost:1234/v1)
LM_STUDIO_BASE_URL=http://localhost:1234/v1

# API Key (not required for local LM Studio, defaults to "not-required")
# Only set this if you have configured authentication in LM Studio
# LM_STUDIO_API_KEY=your-key-if-needed
```

**Note:** LM Studio typically runs locally without authentication. The API key is set to a placeholder value "not-required" by default.

### Model Options

```typescript
const model = new LMStudioChatModel({
  baseURL: "http://localhost:1234/v1",
  model: "llama-3.2-3b-instruct",
  // apiKey: "not-required", // Optional, not required for local LM Studio
  modelOptions: {
    temperature: 0.7,     // Controls randomness (0.0 to 2.0)
    maxTokens: 2048,      // Maximum tokens in response
    topP: 0.9,           // Nucleus sampling
    frequencyPenalty: 0,  // Frequency penalty
    presencePenalty: 0,   // Presence penalty
  },
});
```

## Features

### Streaming Support

```typescript
const model = new LMStudioChatModel();

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

### Tool/Function Calling

LM Studio supports OpenAI-compatible function calling:

```typescript
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

Generate structured JSON responses:

```typescript
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

LM Studio supports a wide variety of models. Popular choices include:

- **Llama 3.2** (3B, 8B, 70B variants)
- **Llama 3.1** (8B, 70B, 405B variants)
- **Mistral** (7B, 8x7B variants)
- **CodeLlama** (7B, 13B, 34B variants)
- **Qwen** (various sizes)
- **Phi-3** (mini, small, medium variants)

The model name should match exactly what appears in your LM Studio interface.

## Error Handling

```typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel();

try {
  const response = await model.invoke({
    messages: [{ role: "user", content: "Hello!" }],
  });
  console.log(response.text);
} catch (error) {
  if (error.code === "ECONNREFUSED") {
    console.error("LM Studio server is not running. Please start the local server.");
  } else {
    console.error("Error:", error.message);
  }
}
```

## Performance Tips

1. **Model Selection**: Smaller models (3B-8B parameters) are faster but less capable
2. **Context Length**: Be mindful of context window limits for your chosen model
3. **Temperature**: Lower values (0.1-0.3) for factual tasks, higher (0.7-1.0) for creative tasks
4. **Batch Processing**: Process multiple requests concurrently when possible

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure LM Studio's local server is running
2. **Model Not Found**: Verify the model name matches what's shown in LM Studio
3. **Out of Memory**: Try using a smaller model or reduce context length
4. **Slow Responses**: Consider using GPU acceleration if available

## License

This project is licensed under the Elastic License 2.0 - see the [LICENSE](../../LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our [contributing guidelines](../../CONTRIBUTING.md) first.

## Support

- [GitHub Issues](https://github.com/AIGNE-io/aigne-framework/issues)
- [Documentation](https://www.arcblock.io/docs/aigne-framework)
- [LM Studio Documentation](https://lmstudio.ai/docs)
