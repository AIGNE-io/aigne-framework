# @aigne/openai

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/openai)](https://www.npmjs.com/package/@aigne/openai)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/openai)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

**English** | [中文](../_media/README.zh-10.md)

AIGNE OpenAI SDK for integrating with OpenAI's GPT models and API services within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/openai` provides a seamless integration between the AIGNE Framework and OpenAI's powerful language models and APIs. This package enables developers to easily leverage OpenAI's GPT models in their AIGNE applications, providing a consistent interface across the framework while taking advantage of OpenAI's advanced AI capabilities.

## Features

- **OpenAI API Integration**: Direct connection to OpenAI's API services using the official SDK
- **Chat Completions**: Support for OpenAI's chat completions API with all available models
- **Function Calling**: Built-in support for OpenAI's function calling capability
- **Streaming Responses**: Support for streaming responses for more responsive applications
- **Type-Safe**: Comprehensive TypeScript typings for all APIs and models
- **Consistent Interface**: Compatible with the AIGNE Framework's model interface
- **Error Handling**: Robust error handling and retry mechanisms
- **Full Configuration**: Extensive configuration options for fine-tuning behavior

## Installation

### Using npm

```bash
npm install @aigne/openai @aigne/core
```

### Using yarn

```bash
yarn add @aigne/openai @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/openai @aigne/core
```

## Basic Usage

```typescript file="test/openai-chat-model.test.ts" region="example-openai-chat-model"
import { OpenAIChatModel } from "@aigne/openai";

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

## Streaming Responses

```typescript file="test/openai-chat-model.test.ts" region="example-openai-chat-model-stream"
import { OpenAIChatModel } from "@aigne/openai";

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

## License

Elastic-2.0

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

- `ChatModel`

#### Indexable

\[`key`: `symbol`\]: () => `string` \| () => `Promise`\<`void`\>

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

`ChatModel.constructor`

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

`ChatModel.supportsParallelToolCalls`

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

> **get** **modelOptions**(): `undefined` \| `ChatModelOptions`

###### Returns

`undefined` \| `ChatModelOptions`

#### Methods

##### process()

> **process**(`input`): `PromiseOrValue`\<[`AgentProcessResult`](core/agents/agent.md#agentprocessresult)\<`ChatModelOutput`\>\>

Process the input and generate a response

###### Parameters

| Parameter | Type             | Description          |
| --------- | ---------------- | -------------------- |
| `input`   | `ChatModelInput` | The input to process |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](core/agents/agent.md#agentprocessresult)\<`ChatModelOutput`\>\>

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
| <a id="supportstoolstreaming"></a> `supportsToolStreaming`                     | `boolean` |
| <a id="supportstemperature"></a> `supportsTemperature`                         | `boolean` |

---

### OpenAIChatModelOptions

Configuration options for OpenAI Chat Model

#### Properties

| Property                                  | Type               | Description                                                                                   |
| ----------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| <a id="apikey"></a> `apiKey?`             | `string`           | API key for OpenAI API If not provided, will look for OPENAI_API_KEY in environment variables |
| <a id="baseurl"></a> `baseURL?`           | `string`           | Base URL for OpenAI API Useful for proxies or alternate endpoints                             |
| <a id="model"></a> `model?`               | `string`           | OpenAI model to use Defaults to 'gpt-4o-mini'                                                 |
| <a id="modeloptions"></a> `modelOptions?` | `ChatModelOptions` | Additional model options to control behavior                                                  |
