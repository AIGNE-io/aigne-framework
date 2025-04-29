[**@aigne/core**](../../README.md)

---

[@aigne/core](../../README.md) / core/models/OpenaiChatModel

# core/models/OpenaiChatModel

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

for await (const chunk of readableStreamToAsyncIterator(stream)) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}

console.log(fullText); // Output: "Hello! How can I assist you today?"

console.log(json); // { model: "gpt-4o", usage: { inputTokens: 10, outputTokens: 9 } }
```

#### Extends

- [`ChatModel`](ChatModel.md#chatmodel)

#### Extended by

- [`DeepSeekChatModel`](DeepSeekChatModel.md#deepseekchatmodel)
- [`GeminiChatModel`](GeminiChatModel.md#geminichatmodel)
- [`OllamaChatModel`](OllamaChatModel.md#ollamachatmodel)
- [`OpenRouterChatModel`](OpenRouterChatModel.md#openrouterchatmodel)
- [`XAIChatModel`](XAIChatModel.md#xaichatmodel)

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

[`ChatModel`](ChatModel.md#chatmodel).[`constructor`](ChatModel.md#chatmodel#constructor)

#### Properties

| Property                                                                         | Type                                                | Default value      | Description                                                                                                                                           | Overrides                                                                                                             |
| -------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| <a id="options"></a> `options?`                                                  | [`OpenAIChatModelOptions`](#openaichatmodeloptions) | `undefined`        | -                                                                                                                                                     | -                                                                                                                     |
| <a id="_client"></a> `_client?`                                                  | `OpenAI`                                            | `undefined`        | -                                                                                                                                                     | -                                                                                                                     |
| <a id="apikeyenvname"></a> `apiKeyEnvName`                                       | `string`                                            | `"OPENAI_API_KEY"` | -                                                                                                                                                     | -                                                                                                                     |
| <a id="apikeydefault"></a> `apiKeyDefault`                                       | `undefined` \| `string`                             | `undefined`        | -                                                                                                                                                     | -                                                                                                                     |
| <a id="supportsnativestructuredoutputs-1"></a> `supportsNativeStructuredOutputs` | `boolean`                                           | `true`             | -                                                                                                                                                     | -                                                                                                                     |
| <a id="supportsendwithsystemmessage-1"></a> `supportsEndWithSystemMessage`       | `boolean`                                           | `true`             | -                                                                                                                                                     | -                                                                                                                     |
| <a id="supportstoolsusewithjsonschema-1"></a> `supportsToolsUseWithJsonSchema`   | `boolean`                                           | `true`             | -                                                                                                                                                     | -                                                                                                                     |
| <a id="supportsparalleltoolcalls-1"></a> `supportsParallelToolCalls`             | `boolean`                                           | `true`             | Indicates whether the model supports parallel tool calls Defaults to true, subclasses can override this property based on specific model capabilities | [`ChatModel`](ChatModel.md#chatmodel).[`supportsParallelToolCalls`](ChatModel.md#chatmodel#supportsparalleltoolcalls) |
| <a id="supportstoolsemptyparameters-1"></a> `supportsToolsEmptyParameters`       | `boolean`                                           | `true`             | -                                                                                                                                                     | -                                                                                                                     |
| <a id="supportstemperature-1"></a> `supportsTemperature`                         | `boolean`                                           | `true`             | -                                                                                                                                                     | -                                                                                                                     |

#### Accessors

##### client

###### Get Signature

> **get** **client**(): `OpenAI`

###### Returns

`OpenAI`

##### modelOptions

###### Get Signature

> **get** **modelOptions**(): `undefined` \| [`ChatModelOptions`](ChatModel.md#chatmodeloptions)

###### Returns

`undefined` \| [`ChatModelOptions`](ChatModel.md#chatmodeloptions)

#### Methods

##### process()

> **process**(`input`): `PromiseOrValue`\<[`AgentProcessResult`](../agents/Agent.md#agentprocessresult)\<[`ChatModelOutput`](ChatModel.md#chatmodeloutput)\>\>

Process the input and generate a response

###### Parameters

| Parameter | Type                                            | Description          |
| --------- | ----------------------------------------------- | -------------------- |
| `input`   | [`ChatModelInput`](ChatModel.md#chatmodelinput) | The input to process |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](../agents/Agent.md#agentprocessresult)\<[`ChatModelOutput`](ChatModel.md#chatmodeloutput)\>\>

The generated response

###### Overrides

`ChatModel.process`

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
| <a id="supportstemperature"></a> `supportsTemperature`                         | `boolean` |

---

### OpenAIChatModelOptions

Configuration options for OpenAI Chat Model

#### Properties

| Property                                  | Type                                                | Description                                                                                   |
| ----------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| <a id="apikey"></a> `apiKey?`             | `string`                                            | API key for OpenAI API If not provided, will look for OPENAI_API_KEY in environment variables |
| <a id="baseurl"></a> `baseURL?`           | `string`                                            | Base URL for OpenAI API Useful for proxies or alternate endpoints                             |
| <a id="model"></a> `model?`               | `string`                                            | OpenAI model to use Defaults to 'gpt-4o-mini'                                                 |
| <a id="modeloptions"></a> `modelOptions?` | [`ChatModelOptions`](ChatModel.md#chatmodeloptions) | Additional model options to control behavior                                                  |

## Variables

### openAIChatModelOptionsSchema

> `const` **openAIChatModelOptionsSchema**: `ZodObject`\<\{ `apiKey`: `ZodOptional`\<`ZodString`\>; `baseURL`: `ZodOptional`\<`ZodString`\>; `model`: `ZodOptional`\<`ZodString`\>; `modelOptions`: `ZodOptional`\<`ZodObject`\<\{ `model`: `ZodOptional`\<`ZodString`\>; `temperature`: `ZodOptional`\<`ZodNumber`\>; `topP`: `ZodOptional`\<`ZodNumber`\>; `frequencyPenalty`: `ZodOptional`\<`ZodNumber`\>; `presencePenalty`: `ZodOptional`\<`ZodNumber`\>; `parallelToolCalls`: `ZodDefault`\<`ZodOptional`\<`ZodBoolean`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `model?`: `string`; `temperature?`: `number`; `topP?`: `number`; `frequencyPenalty?`: `number`; `presencePenalty?`: `number`; `parallelToolCalls`: `boolean`; \}, \{ `model?`: `string`; `temperature?`: `number`; `topP?`: `number`; `frequencyPenalty?`: `number`; `presencePenalty?`: `number`; `parallelToolCalls?`: `boolean`; \}\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `apiKey?`: `string`; `baseURL?`: `string`; `model?`: `string`; `modelOptions?`: \{ `model?`: `string`; `temperature?`: `number`; `topP?`: `number`; `frequencyPenalty?`: `number`; `presencePenalty?`: `number`; `parallelToolCalls`: `boolean`; \}; \}, \{ `apiKey?`: `string`; `baseURL?`: `string`; `model?`: `string`; `modelOptions?`: \{ `model?`: `string`; `temperature?`: `number`; `topP?`: `number`; `frequencyPenalty?`: `number`; `presencePenalty?`: `number`; `parallelToolCalls?`: `boolean`; \}; \}\>

---

### ROLE_MAP

> `const` **ROLE_MAP**: `{ [key in Role]: ChatCompletionMessageParam["role"] }`

## Functions

### contentsFromInputMessages()

> **contentsFromInputMessages**(`messages`): `Promise`\<`ChatCompletionMessageParam`[]\>

#### Parameters

| Parameter  | Type                                                            |
| ---------- | --------------------------------------------------------------- |
| `messages` | [`ChatModelInputMessage`](ChatModel.md#chatmodelinputmessage)[] |

#### Returns

`Promise`\<`ChatCompletionMessageParam`[]\>

---

### toolsFromInputTools()

> **toolsFromInputTools**(`tools?`, `options?`): `undefined` \| `ChatCompletionTool`[]

#### Parameters

| Parameter                           | Type                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| `tools?`                            | [`ChatModelInputTool`](ChatModel.md#chatmodelinputtool)[] |
| `options?`                          | \{ `addTypeToEmptyParameters?`: `boolean`; \}             |
| `options.addTypeToEmptyParameters?` | `boolean`                                                 |

#### Returns

`undefined` \| `ChatCompletionTool`[]

---

### jsonSchemaToOpenAIJsonSchema()

> **jsonSchemaToOpenAIJsonSchema**(`schema`): `Record`\<`string`, `unknown`\>

#### Parameters

| Parameter | Type                            |
| --------- | ------------------------------- |
| `schema`  | `Record`\<`string`, `unknown`\> |

#### Returns

`Record`\<`string`, `unknown`\>
