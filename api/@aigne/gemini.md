[Documentation](../README.md) / @aigne/gemini

# @aigne/gemini

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
/* Output:
{
  text: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
  model: "gemini-1.5-flash"
}
*/
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

for await (const chunk of stream) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}

console.log(fullText); // Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"
console.log(json); // { model: "gemini-1.5-flash" }
```

#### Extends

* `OpenAIChatModel`

#### Constructors

##### Constructor

> **new GeminiChatModel**(`options?`): [`GeminiChatModel`](#geminichatmodel)

###### Parameters

| Parameter  | Type                     |
| ---------- | ------------------------ |
| `options?` | `OpenAIChatModelOptions` |

###### Returns

[`GeminiChatModel`](#geminichatmodel)

###### Overrides

`OpenAIChatModel.constructor`

#### Properties

##### apiKeyEnvName

> `protected` **apiKeyEnvName**: `string` = `"GEMINI_API_KEY"`

###### Overrides

`OpenAIChatModel.apiKeyEnvName`

##### supportsEndWithSystemMessage

> `protected` **supportsEndWithSystemMessage**: `boolean` = `false`

###### Overrides

`OpenAIChatModel.supportsEndWithSystemMessage`

##### supportsToolsUseWithJsonSchema

> `protected` **supportsToolsUseWithJsonSchema**: `boolean` = `false`

###### Overrides

`OpenAIChatModel.supportsToolsUseWithJsonSchema`

##### supportsParallelToolCalls

> `protected` **supportsParallelToolCalls**: `boolean` = `false`

###### Overrides

`OpenAIChatModel.supportsParallelToolCalls`

##### supportsToolStreaming

> `protected` **supportsToolStreaming**: `boolean` = `false`

###### Overrides

`OpenAIChatModel.supportsToolStreaming`
