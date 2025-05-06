[Documentation](../../../README.md) / [@aigne/core](../README.md) / models/claude-chat-model

# models/claude-chat-model

## Classes

### ClaudeChatModel

Implementation of the ChatModel interface for Anthropic's Claude API

This model provides access to Claude's capabilities including:

- Text generation
- Tool use
- JSON structured output

Default model: 'claude-3-7-sonnet-latest'

#### Examples

Here's how to create and use a Claude chat model:

```ts
const model = new ClaudeChatModel({
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

Here's an example with streaming response:

```ts
const model = new ClaudeChatModel({
  apiKey: "your-api-key",
  model: "claude-3-haiku-20240307",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me about yourself" }],
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

console.log(fullText); // Output: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?"

console.log(json); // { model: "claude-3-haiku-20240307", usage: { inputTokens: 8, outputTokens: 15 } }
```

#### Extends

- [`ChatModel`](chat-model.md#chatmodel)

#### Constructors

##### Constructor

> **new ClaudeChatModel**(`options?`): [`ClaudeChatModel`](#claudechatmodel)

###### Parameters

| Parameter  | Type                                                |
| ---------- | --------------------------------------------------- |
| `options?` | [`ClaudeChatModelOptions`](#claudechatmodeloptions) |

###### Returns

[`ClaudeChatModel`](#claudechatmodel)

###### Overrides

[`ChatModel`](chat-model.md#chatmodel).[`constructor`](chat-model.md#chatmodel#constructor)

#### Properties

##### options?

> `optional` **options**: [`ClaudeChatModelOptions`](#claudechatmodeloptions)

#### Accessors

##### client

###### Get Signature

> **get** **client**(): `Anthropic`

###### Returns

`Anthropic`

##### modelOptions

###### Get Signature

> **get** **modelOptions**(): `undefined` \| [`ChatModelOptions`](chat-model.md#chatmodeloptions)

###### Returns

`undefined` \| [`ChatModelOptions`](chat-model.md#chatmodeloptions)

#### Methods

##### process()

> **process**(`input`): `PromiseOrValue`\<[`AgentProcessResult`](../agents/agent.md#agentprocessresult)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

Process the input using Claude's chat model

###### Parameters

| Parameter | Type                                             | Description          |
| --------- | ------------------------------------------------ | -------------------- |
| `input`   | [`ChatModelInput`](chat-model.md#chatmodelinput) | The input to process |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](../agents/agent.md#agentprocessresult)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

The processed output from the model

###### Overrides

[`ChatModel`](chat-model.md#chatmodel).[`process`](chat-model.md#chatmodel#process)

## Interfaces

### ClaudeChatModelOptions

Configuration options for Claude Chat Model

#### Properties

| Property                                  | Type                                                 | Description                                                                                                                    |
| ----------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| <a id="apikey"></a> `apiKey?`             | `string`                                             | API key for Anthropic's Claude API If not provided, will look for ANTHROPIC_API_KEY or CLAUDE_API_KEY in environment variables |
| <a id="model"></a> `model?`               | `string`                                             | Claude model to use Defaults to 'claude-3-7-sonnet-latest'                                                                     |
| <a id="modeloptions"></a> `modelOptions?` | [`ChatModelOptions`](chat-model.md#chatmodeloptions) | Additional model options to control behavior                                                                                   |
