[**@aigne/core**](../README.md)

---

[@aigne/core](../README.md) / models/open-router-chat-model

# models/open-router-chat-model

## Classes

### OpenRouterChatModel

Implementation of the ChatModel interface for OpenRouter service

OpenRouter provides access to a variety of large language models through a unified API.
This implementation uses the OpenAI-compatible interface to connect to OpenRouter's service.

Default model: 'openai/gpt-4o'

#### Examples

Here's how to create and use an OpenRouter chat model:

```ts
const model = new OpenRouterChatModel({
  // Provide API key directly or use environment variable OPEN_ROUTER_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model (defaults to 'openai/gpt-4o')
  model: "anthropic/claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

Here's an example with streaming response:

```ts
const model = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Which model are you using?" }],
  },
  undefined,
  { streaming: true },
);

let fullText = "";

const json = {};

for await (const chunk of readableStreamToAsyncIterator(stream)) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}

console.log(fullText); // Output: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic."

console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

#### Extends

- [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel)

#### Constructors

##### Constructor

> **new OpenRouterChatModel**(`options?`): [`OpenRouterChatModel`](#openrouterchatmodel)

###### Parameters

| Parameter  | Type                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| `options?` | [`OpenAIChatModelOptions`](openai-chat-model.md#openaichatmodeloptions) |

###### Returns

[`OpenRouterChatModel`](#openrouterchatmodel)

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`constructor`](openai-chat-model.md#openaichatmodel#constructor)

#### Properties

| Property                                                           | Type      | Default value           | Description                                                                                                                                           | Overrides                                                                                                                                                 |
| ------------------------------------------------------------------ | --------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="apikeyenvname"></a> `apiKeyEnvName`                         | `string`  | `"OPEN_ROUTER_API_KEY"` | -                                                                                                                                                     | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`apiKeyEnvName`](openai-chat-model.md#openaichatmodel#apikeyenvname)                           |
| <a id="supportsparalleltoolcalls"></a> `supportsParallelToolCalls` | `boolean` | `false`                 | Indicates whether the model supports parallel tool calls Defaults to true, subclasses can override this property based on specific model capabilities | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsParallelToolCalls`](openai-chat-model.md#openaichatmodel#supportsparalleltoolcalls-1) |
