# Poe

The `@aigne/poe` package allows you to integrate a wide variety of AI models available on the Poe platform directly into your AIGNE agents. Poe acts as a gateway to models from different providers, and this integration leverages its OpenAI-compatible API to provide a simple and consistent experience within the AIGNE Framework.

This makes it easy to switch between different models like those from OpenAI or Anthropic, all through a single interface.

## Features

*   **Simple API Integration**: Connect to Poe's services with minimal setup.
*   **Chat Completions**: Use Poe's full range of chat models for conversational AI.
*   **Streaming Responses**: Get real-time, token-by-token responses for interactive applications.
*   **Easy Configuration**: Fine-tune model behavior with extensive configuration options.
*   **Consistent Interface**: Works seamlessly with the standard AIGNE Framework model interface.

## Installation

To get started, you'll need to install the Poe package along with the AIGNE core library.

```bash NPM icon=logos:npm
npm install @aigne/poe @aigne/core
```

```bash Yarn icon=logos:yarn
yarn add @aigne/poe @aigne/core
```

```bash PNPM icon=pnpm:pnpm
pnpm add @aigne/poe @aigne/core
```

## Configuration

To connect to Poe, you'll need an API key from your Poe account. You can provide this key either by setting an environment variable or by passing it directly in the configuration object.

-   **Environment Variable**: Set the `POE_API_KEY` environment variable in your project.
-   **Directly in Code**: Pass the key using the `apiKey` option when creating the model instance.

Here are the main configuration options for the `PoeChatModel`:

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your Poe API key. If not provided, the system will look for the `POE_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-5-mini" data-required="false">
    <x-field-desc markdown>The specific model you want to use, such as `claude-3-opus` or `gpt-4o`.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to pass to the model, such as `temperature` to control the creativity of the response.</x-field-desc>
  </x-field>
</x-field-group>

## Basic Usage

Here's a simple example of how to create a Poe chat model instance and get a response.

```typescript Using the Poe Chat Model icon=logos:typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // Provide API key directly or use environment variable POE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model (defaults to 'gpt-5-mini')
  model: "claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

When you run this code, you'll get a response object containing the model's reply and usage details.

```json Example Output icon=mdi:code-json
{
  text: "I'm powered by Poe, using the Claude 3 Opus model from Anthropic.",
  model: "claude-3-opus",
  usage: {
    inputTokens: 5,
    outputTokens: 14
  }
}
```

## Streaming Responses

For a more interactive, real-time feel, you can stream the response from the model. This means you'll receive the text in small chunks as it's being generated, rather than waiting for the entire response to finish.

```typescript Streaming a Response icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  apiKey: "your-api-key",
  model: "claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Which model are you using?" }],
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

This will print the full text of the response as it's completed, followed by the final metadata.

```text Example Streaming Output
I'm powered by Poe, using the Claude 3 Opus model from Anthropic.
{ model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

---

The Poe integration offers a flexible way to access many different models through a single, easy-to-use interface. To explore other model providers, you can check out the documentation for [OpenAI](./models-openai.md) or [Anthropic (Claude)](./models-anthropic.md).