[Documentation](../../../README.md) / [@aigne/core](../README.md) / models/openai-chat-model

# models/openai-chat-model

## Classes

### OpenAIChatModel

Implementation of the ChatModel interface for OpenAI's API

This model provides access to OpenAI's capabilities including:

- Text generation
- Tool use with parallel tool calls
- JSON structured output
- Image understanding

Default model: 'gpt-4o-mini'

#### Examples

Here's how to create and use an OpenAI chat model:

```ts
const model = new OpenAIChatModel({
  // Provide API key directly or use environment variable OPENAI_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  model: "gpt-4o", // Defaults to "gpt-4o-mini" if not specified
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
/* Output:
{
  text: "Hello! How can I assist you today?",
  model: "gpt-4o",
  usage: {
    inputTokens: 10,
    outputTokens: 9
  }
}
*/
```

Here's an example with streaming response:

```ts
const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
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

console.log(fullText); // Output: "Hello! How can I assist you today?"
console.log(json); // { model: "gpt-4o", usage: { inputTokens: 10, outputTokens: 9 } }
```

#### Extends

- [`ChatModel`](chat-model.md#chatmodel)

#### Extended by

- [`DeepSeekChatModel`](deepseek-chat-model.md#deepseekchatmodel)
- [`GeminiChatModel`](gemini-chat-model.md#geminichatmodel)
- [`OllamaChatModel`](ollama-chat-model.md#ollamachatmodel)
- [`OpenRouterChatModel`](open-router-chat-model.md#openrouterchatmodel)
- [`XAIChatModel`](xai-chat-model.md#xaichatmodel)

#### Constructors

##### Constructor

> **new OpenAIChatModel**(`options?`): [`OpenAIChatModel`](#openaichatmodel)

###### Parameters

| Parameter  | Type                                                |
| ---------- | --------------------------------------------------- |
| `options?` | [`OpenAIChatModelOptions`](#openaichatmodeloptions) |

###### Returns

[`OpenAIChatModel`](#openaichatmodel)

###### Overrides

[`ChatModel`](chat-model.md#chatmodel).[`constructor`](chat-model.md#chatmodel#constructor)

#### Properties

##### options?

> `optional` **options**: [`OpenAIChatModelOptions`](#openaichatmodeloptions)

##### apiKeyEnvName

> `protected` **apiKeyEnvName**: `string` = `"OPENAI_API_KEY"`

##### apiKeyDefault

> `protected` **apiKeyDefault**: `undefined` \| `string`

##### supportsNativeStructuredOutputs

> `protected` **supportsNativeStructuredOutputs**: `boolean` = `true`

##### supportsEndWithSystemMessage

> `protected` **supportsEndWithSystemMessage**: `boolean` = `true`

##### supportsToolsUseWithJsonSchema

> `protected` **supportsToolsUseWithJsonSchema**: `boolean` = `true`

##### supportsParallelToolCalls

> `protected` **supportsParallelToolCalls**: `boolean` = `true`

Indicates whether the model supports parallel tool calls

Defaults to true, subclasses can override this property based on
specific model capabilities

###### Overrides

[`ChatModel`](chat-model.md#chatmodel).[`supportsParallelToolCalls`](chat-model.md#chatmodel#supportsparalleltoolcalls)

##### supportsToolsEmptyParameters

> `protected` **supportsToolsEmptyParameters**: `boolean` = `true`

##### supportsToolStreaming

> `protected` **supportsToolStreaming**: `boolean` = `true`

##### supportsTemperature

> `protected` **supportsTemperature**: `boolean` = `true`

#### Accessors

##### client

###### Get Signature

> **get** **client**(): `OpenAI`

###### Returns

`OpenAI`

##### modelOptions

###### Get Signature

> **get** **modelOptions**(): `undefined` \| [`ChatModelOptions`](chat-model.md#chatmodeloptions)

###### Returns

`undefined` \| [`ChatModelOptions`](chat-model.md#chatmodeloptions)

#### Methods

##### process()

> **process**(`input`): `PromiseOrValue`\<[`AgentProcessResult`](../agents/agent.md#agentprocessresult)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

Process the input and generate a response

###### Parameters

| Parameter | Type                                             | Description          |
| --------- | ------------------------------------------------ | -------------------- |
| `input`   | [`ChatModelInput`](chat-model.md#chatmodelinput) | The input to process |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](../agents/agent.md#agentprocessresult)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

The generated response

###### Overrides

[`ChatModel`](chat-model.md#chatmodel).[`process`](chat-model.md#chatmodel#process)

## Interfaces

### OpenAIChatModelCapabilities

#### Properties

| Property                                                                       | Type      |
| ------------------------------------------------------------------------------ | --------- |
| <a id="supportsnativestructuredoutputs"></a> `supportsNativeStructuredOutputs` | `boolean` |
| <a id="supportsendwithsystemmessage"></a> `supportsEndWithSystemMessage`       | `boolean` |
| <a id="supportstoolsusewithjsonschema"></a> `supportsToolsUseWithJsonSchema`   | `boolean` |
| <a id="supportsparalleltoolcalls"></a> `supportsParallelToolCalls`             | `boolean` |
| <a id="supportstoolsemptyparameters"></a> `supportsToolsEmptyParameters`       | `boolean` |
| <a id="supportstoolstreaming"></a> `supportsToolStreaming`                     | `boolean` |
| <a id="supportstemperature"></a> `supportsTemperature`                         | `boolean` |

---

### OpenAIChatModelOptions

Configuration options for OpenAI Chat Model

#### Properties

| Property                                  | Type                                                 | Description                                                                                   |
| ----------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| <a id="apikey"></a> `apiKey?`             | `string`                                             | API key for OpenAI API If not provided, will look for OPENAI_API_KEY in environment variables |
| <a id="baseurl"></a> `baseURL?`           | `string`                                             | Base URL for OpenAI API Useful for proxies or alternate endpoints                             |
| <a id="model"></a> `model?`               | `string`                                             | OpenAI model to use Defaults to 'gpt-4o-mini'                                                 |
| <a id="modeloptions"></a> `modelOptions?` | [`ChatModelOptions`](chat-model.md#chatmodeloptions) | Additional model options to control behavior                                                  |
