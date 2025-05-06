[Documentation](../../../README.md) / [@aigne/core](../README.md) / models/gemini-chat-model

# models/gemini-chat-model

## Classes

### GeminiChatModel

Implementation of the ChatModel interface for Google's Gemini API

This model uses OpenAI-compatible API format to interact with Google's Gemini models,
providing access to models like Gemini 1.5 and Gemini 2.0.

#### Examples

Here's how to create and use a Gemini chat model:

```ts
const model = new GeminiChatModel({
  // Provide API key directly or use environment variable GOOGLE_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify Gemini model version (defaults to 'gemini-1.5-pro' if not specified)
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

Here's an example with streaming response:

```ts
const model = new GeminiChatModel({
  apiKey: "your-api-key",
  model: "gemini-1.5-flash",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
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

console.log(fullText); // Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"

console.log(json); // { model: "gemini-1.5-flash" }
```

#### Extends

- [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel)

#### Constructors

##### Constructor

> **new GeminiChatModel**(`options?`): [`GeminiChatModel`](#geminichatmodel)

###### Parameters

| Parameter  | Type                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| `options?` | [`OpenAIChatModelOptions`](openai-chat-model.md#openaichatmodeloptions) |

###### Returns

[`GeminiChatModel`](#geminichatmodel)

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`constructor`](openai-chat-model.md#openaichatmodel#constructor)

#### Properties

##### apiKeyEnvName

> `protected` **apiKeyEnvName**: `string` = `"GEMINI_API_KEY"`

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`apiKeyEnvName`](openai-chat-model.md#openaichatmodel#apikeyenvname)

##### supportsEndWithSystemMessage

> `protected` **supportsEndWithSystemMessage**: `boolean` = `false`

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsEndWithSystemMessage`](openai-chat-model.md#openaichatmodel#supportsendwithsystemmessage-1)

##### supportsToolsUseWithJsonSchema

> `protected` **supportsToolsUseWithJsonSchema**: `boolean` = `false`

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsToolsUseWithJsonSchema`](openai-chat-model.md#openaichatmodel#supportstoolsusewithjsonschema-1)

##### supportsParallelToolCalls

> `protected` **supportsParallelToolCalls**: `boolean` = `false`

Indicates whether the model supports parallel tool calls

Defaults to true, subclasses can override this property based on
specific model capabilities

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsParallelToolCalls`](openai-chat-model.md#openaichatmodel#supportsparalleltoolcalls-1)

##### supportsToolStreaming

> `protected` **supportsToolStreaming**: `boolean` = `false`

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsToolStreaming`](openai-chat-model.md#openaichatmodel#supportstoolstreaming-1)
