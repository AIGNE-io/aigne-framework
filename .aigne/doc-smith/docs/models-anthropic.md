# Anthropic (Claude)

Leverage Anthropic's Claude models, known for their strong performance in complex reasoning and creative tasks. The `@aigne/anthropic` package provides a seamless integration between the AIGNE Framework and Anthropic's Claude language models, enabling you to easily incorporate Claude's advanced AI capabilities into your agents with a consistent interface.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-anthropic-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-anthropic.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-anthropic.png" alt="AIGNE Anthropic Integration Architecture" />
</picture>

## Features

*   **Anthropic API Integration**: Direct connection to Anthropic's API services using the official SDK.
*   **Chat Completions**: Support for Claude's chat completions API with all available models.
*   **Tool Calling**: Built-in support for Claude's tool calling capability.
*   **Streaming Responses**: Support for streaming responses for more responsive applications.
*   **Type-Safe**: Comprehensive TypeScript typings for all APIs and models.
*   **Consistent Interface**: Fully compatible with the AIGNE Framework's model interface.
*   **Error Handling**: Robust error handling and retry mechanisms.
*   **Full Configuration**: Extensive configuration options for fine-tuning model behavior.

## Installation

To get started, install the necessary packages using your preferred package manager:

```bash npm
npm install @aigne/anthropic @aigne/core
```

```bash yarn
yarn add @aigne/anthropic @aigne/core
```

```bash pnpm
pnpm add @aigne/anthropic @aigne/core
```

## Configuration

When creating an instance of `AnthropicChatModel`, you can provide the following options to configure its behavior:

<x-field-group>
  <x-field data-name="apiKey" data-type="string">
    <x-field-desc markdown>Your API key for Anthropic's Claude API. If not provided, the SDK will automatically look for the `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY` environment variables.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="claude-3-7-sonnet-latest">
    <x-field-desc markdown>The specific Claude model you want to use, such as `claude-3-haiku-20240307`. Defaults to `claude-3-7-sonnet-latest`.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object">
    <x-field-desc markdown>Additional options to control the model's generation behavior.</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-desc="Controls randomness. Lower values make the model more deterministic."></x-field>
    <x-field data-name="topP" data-type="number" data-desc="Nucleus sampling. The model considers only the tokens with the highest probability mass."></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-desc="Penalizes new tokens based on their existing frequency in the text so far."></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-desc="Penalizes new tokens based on whether they appear in the text so far."></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-desc="Whether to allow the model to call multiple tools in parallel."></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-desc="Optional client options for the underlying Anthropic SDK, such as setting a custom timeout."></x-field>
</x-field-group>

## Basic Usage

Here is a simple example of how to use `AnthropicChatModel` to get a response from a Claude model.

```typescript Basic Chat Completion icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // Provide API key directly or use environment variable ANTHROPIC_API_KEY or CLAUDE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify Claude model version (defaults to 'claude-3-7-sonnet-latest')
  model: "claude-3-haiku-20240307",
  // Configure model behavior
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

**Example Response**

```json Response Object
{
  "text": "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
  "model": "claude-3-haiku-20240307",
  "usage": {
    "inputTokens": 8,
    "outputTokens": 15
  }
}
```

## Streaming Responses

For more interactive applications, you can stream the response from the model. This allows you to receive the generated text in chunks as it becomes available.

```typescript Streaming Example icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-haiku-20240307",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me about yourself" }],
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
console.log(json);
```

**Example Output**

```text Console Output
I'm Claude, an AI assistant created by Anthropic. How can I help you today?
{ model: 'claude-3-haiku-20240307', usage: { inputTokens: 8, outputTokens: 15 } }
```

## Summary

You've learned how to integrate Anthropic's powerful Claude models into your AIGNE agents. For more options, you can explore other supported models.

<x-cards>
  <x-card data-title="OpenAI" data-icon="logos:openai-icon" data-href="/models/openai">Integrate OpenAI's powerful GPT models, including chat completions and DALL-E image generation.</x-card>
  <x-card data-title="Google Gemini" data-icon="logos:google-gemini" data-href="/models/gemini">Use Google's Gemini family of multimodal models for tasks involving text, images, and more.</x-card>
  <x-card data-title="AIGNE Hub" data-icon="lucide:gem" data-href="/models/aigne-hub">Connect to the AIGNE Hub to access a unified proxy for multiple LLM providers and simplify API key management.</x-card>
  <x-card data-title="Ollama" data-icon="lucide:laptop" data-href="/models/ollama">Utilize a wide variety of open-source models running locally on your machine via the Ollama server.</x-card>
</x-cards>