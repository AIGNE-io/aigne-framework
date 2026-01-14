# Anthropic

This guide provides instructions for configuring and using Anthropic's Claude models within the AIGNE Framework via the `@aigne/anthropic` package. It covers API key setup, model instantiation, and invoking the model for both standard and streaming responses.

For a general overview of how models work within the AIGNE framework, please refer to the [Models core concepts](./developer-guide-core-concepts-models.md) documentation.

## Introduction

The `@aigne/anthropic` package provides a direct and seamless integration between the AIGNE Framework and Anthropic's powerful Claude language models. This allows developers to leverage the advanced capabilities of models like Claude 3.5 Sonnet and Claude 3 Opus through the standardized `ChatModel` interface, ensuring consistency across your agentic applications.

Key features of this integration include:

*   **Direct API Integration**: Utilizes the official Anthropic SDK for reliable communication.
*   **Chat Completions**: Full support for Anthropic's chat completions API.
*   **Tool Calling**: Natively supports Claude's tool-calling functionality.
*   **Streaming Responses**: Enables real-time, responsive applications by handling streaming outputs.
*   **Type-Safe**: Comes with comprehensive TypeScript typings for robust development.

## Installation

To get started, install the `@aigne/anthropic` package along with the core AIGNE package using your preferred package manager.

<tabs>
<tab-item title="npm">

```bash
npm install @aigne/anthropic @aigne/core
```

</tab-item>
<tab-item title="yarn">

```bash
yarn add @aigne/anthropic @aigne/core
```

</tab-item>
<tab-item title="pnpm">

```bash
pnpm add @aigne/anthropic @aigne/core
```

</tab-item>
</tabs>

## Configuration

The `AnthropicChatModel` class is the primary entry point for interacting with Claude models. To instantiate it, you need to provide your Anthropic API key and optionally specify a model and other configurations.

### API Key

Your Anthropic API key can be configured in one of three ways, in order of precedence:

1.  **Directly in the constructor**: Pass the key via the `apiKey` property.
2.  **`ANTHROPIC_API_KEY` environment variable**: The model will automatically detect and use this variable.
3.  **`CLAUDE_API_KEY` environment variable**: An alternative environment variable that is also supported.

```typescript Instantiating the Model icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // Option 1: Provide the API key directly
  apiKey: "your-anthropic-api-key", 
  
  // The model will automatically use ANTHROPIC_API_KEY or CLAUDE_API_KEY
  // if they are set in your environment and apiKey is not provided.
});
```

### Model Selection

You can specify which Claude model to use with the `model` property. If not specified, it defaults to `claude-3-7-sonnet-latest`. Other common model parameters like `temperature` can be set within the `modelOptions` object.

A list of commonly used models includes:
*   `claude-3-5-sonnet-20240620`
*   `claude-3-opus-20240229`
*   `claude-3-sonnet-20240229`
*   `claude-3-haiku-20240307`

```typescript Model Configuration icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  
  // Specify the model version
  model: "claude-3-haiku-20240307",

  // Configure other model behaviors
  modelOptions: {
    temperature: 0.7, // Controls randomness (0.0 to 1.0)
  },
});
```

## Basic Usage

To generate a response, use the `invoke` method. Pass a list of messages to the model to start a conversation. The method returns a promise that resolves with the model's output, including the text response and token usage statistics.

```typescript Basic Chat Completion icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  model: "claude-3-haiku-20240307",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

The `result` object contains the generated text and other metadata from the API.

**Example Response**

```json
{
  "text": "I am Claude, a large language model trained by Anthropic.",
  "model": "claude-3-haiku-20240307",
  "usage": {
    "inputTokens": 8,
    "outputTokens": 12
  }
}
```

## Streaming Responses

For applications requiring real-time interaction, you can enable streaming by setting the `streaming` option to `true` in the `invoke` method. This returns an async iterator that yields response chunks as they become available.

The `isAgentResponseDelta` utility can be used to check if a chunk contains new data.

```typescript Streaming Example icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-anthropic-api-key",
  model: "claude-3-haiku-20240307",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story about a robot." }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      process.stdout.write(text); // Print text to the console as it arrives
      fullText += text;
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n\n--- Final Response ---");
console.log(fullText);
console.log(json);
```

This code processes the stream, printing text chunks to the console immediately and accumulating the full response and metadata.

## Summary

You now have the necessary information to install, configure, and use Anthropic's Claude models within your AIGNE applications. You can perform basic invocations for simple tasks or use streaming for more interactive experiences.

To learn more about orchestrating multiple models and agents, see the [Team Agent](./developer-guide-agents-team-agent.md) documentation. For details on other available models, visit the main [Models](./models.md) section.