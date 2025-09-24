# xAI (Grok)

Connect to xAI's models, like Grok, known for their unique personality and real-time information access. The `@aigne/xai` package provides a seamless integration between the AIGNE Framework and xAI's language models, allowing you to leverage their advanced AI capabilities within your AIGNE agents.

This integration uses an OpenAI-compatible API format to interact with xAI models, providing a consistent and familiar experience for developers.

![AIGNE xAI Integration](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-xai.png)

## Features

- **Direct XAI API Integration**: Connects directly to xAI's API services.
- **Chat Completions**: Full support for xAI's chat completion models.
- **Function Calling**: Built-in support for function calling capabilities.
- **Streaming Responses**: Enables streaming for more responsive and real-time applications.
- **Type-Safe**: Comes with comprehensive TypeScript typings for all APIs and models.
- **Consistent Interface**: Adheres to the standard AIGNE Framework model interface.
- **Robust Error Handling**: Includes built-in error handling and retry mechanisms.
- **Full Configuration**: Offers extensive options for fine-tuning model behavior.

## Installation

To get started, you need to install the `@aigne/xai` package along with `@aigne/core`.

```bash npm icon=logos:npm
npm install @aigne/xai @aigne/core
```

```bash yarn icon=logos:yarn
yarn add @aigne/xai @aigne/core
```

```bash pnpm icon=logos:pnpm
pnpm add @aigne/xai @aigne/core
```

## Configuration

To use xAI models, instantiate the `XAIChatModel` class. You'll need to provide your API key, which can be done either directly in the options or by setting the `XAI_API_KEY` environment variable.

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>Your xAI API key. If not provided, the SDK will look for the `XAI_API_KEY` environment variable.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="grok-2-latest" data-required="false">
    <x-field-desc markdown>The specific xAI model to use. Defaults to `grok-2-latest`.</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.x.ai/v1" data-required="false">
    <x-field-desc markdown>The base URL for the xAI API. Defaults to `https://api.x.ai/v1`.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>Additional options to pass to the model, such as `temperature`, `top_p`, etc.</x-field-desc>
  </x-field>
</x-field-group>

## Basic Usage

Here's a simple example of how to invoke the model to get a chat completion.

```typescript Basic Chat Completion icon=logos:typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // Provide API key directly or use environment variable XAI_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model (defaults to 'grok-2-latest')
  model: "grok-2-latest",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

### Example Response

```json Response icon=mdi:code-json
{
  "text": "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!",
  "model": "grok-2-latest",
  "usage": {
    "inputTokens": 6,
    "outputTokens": 17
  }
}
```

## Streaming Responses

For interactive applications, you can stream the response from the model as it's being generated. This allows you to display the text token by token for a better user experience.

```typescript Streaming Example icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  apiKey: "your-api-key",
  model: "grok-2-latest",
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

console.log("Full Text:", fullText);
console.log("Metadata:", json);
```

### Example Output

```text Streaming Output
Full Text: I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!
Metadata: { model: 'grok-2-latest', usage: { inputTokens: 6, outputTokens: 17 } }
```