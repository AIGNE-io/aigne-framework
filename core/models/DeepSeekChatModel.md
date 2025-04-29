[**@aigne/core**](../../README.md)

---

[@aigne/core](../../README.md) / core/models/DeepSeekChatModel

# core/models/DeepSeekChatModel

## Classes

### DeepSeekChatModel

Implementation of the ChatModel interface for DeepSeek's API

This model uses OpenAI-compatible API format to interact with DeepSeek's models,
but with specific configuration and capabilities for DeepSeek.

Default model: 'deepseek-chat'

#### Examples

Here's how to create and use a DeepSeek chat model:

```ts
const model = new DeepSeekChatModel({
  // Provide API key directly or use environment variable DEEPSEEK_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model version (defaults to 'deepseek-chat')
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

Here's an example with streaming response:

```ts
const model = new DeepSeekChatModel({
  apiKey: "your-api-key",
  model: "deepseek-chat",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
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

console.log(fullText); // Output: "Hello! I'm an AI assistant powered by DeepSeek's language model."

console.log(json); // { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

#### Extends

- [`OpenAIChatModel`](OpenaiChatModel.md#openaichatmodel)

#### Constructors

##### Constructor

> **new DeepSeekChatModel**(`options?`): [`DeepSeekChatModel`](#deepseekchatmodel)

###### Parameters

| Parameter  | Type                                                                  |
| ---------- | --------------------------------------------------------------------- |
| `options?` | [`OpenAIChatModelOptions`](OpenaiChatModel.md#openaichatmodeloptions) |

###### Returns

[`DeepSeekChatModel`](#deepseekchatmodel)

###### Overrides

[`OpenAIChatModel`](OpenaiChatModel.md#openaichatmodel).[`constructor`](OpenaiChatModel.md#openaichatmodel#constructor)

#### Properties

| Property                                                                       | Type      | Default value        | Overrides                                                                                                                                                         |
| ------------------------------------------------------------------------------ | --------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="apikeyenvname"></a> `apiKeyEnvName`                                     | `string`  | `"DEEPSEEK_API_KEY"` | [`OpenAIChatModel`](OpenaiChatModel.md#openaichatmodel).[`apiKeyEnvName`](OpenaiChatModel.md#openaichatmodel#apikeyenvname)                                       |
| <a id="supportsnativestructuredoutputs"></a> `supportsNativeStructuredOutputs` | `boolean` | `false`              | [`OpenAIChatModel`](OpenaiChatModel.md#openaichatmodel).[`supportsNativeStructuredOutputs`](OpenaiChatModel.md#openaichatmodel#supportsnativestructuredoutputs-1) |
| <a id="supportstoolsemptyparameters"></a> `supportsToolsEmptyParameters`       | `boolean` | `false`              | [`OpenAIChatModel`](OpenaiChatModel.md#openaichatmodel).[`supportsToolsEmptyParameters`](OpenaiChatModel.md#openaichatmodel#supportstoolsemptyparameters-1)       |
