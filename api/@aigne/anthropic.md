[Documentation](../README.md) / @aigne/anthropic

# @aigne/anthropic

## Classes

### AnthropicChatModel

Implementation of the ChatModel interface for Anthropic's Claude API

This model provides access to Claude's capabilities including:

* Text generation
* Tool use
* JSON structured output

Default model: 'claude-3-7-sonnet-latest'

#### Examples

Here's how to create and use a Claude chat model:

```ts
const model = new AnthropicChatModel({
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
/* Output:
{
  text: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
  model: "claude-3-haiku-20240307",
  usage: {
    inputTokens: 8,
    outputTokens: 15
  }
}
*/
```

Here's an example with streaming response:

```ts
const model = new AnthropicChatModel({
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

for await (const chunk of stream) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}

console.log(fullText); // Output: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?"
console.log(json); // { model: "claude-3-haiku-20240307", usage: { inputTokens: 8, outputTokens: 15 } }
```

#### Extends

* `ChatModel`

#### Constructors

##### Constructor

> **new AnthropicChatModel**(`options?`): [`AnthropicChatModel`](#anthropicchatmodel)

###### Parameters

| Parameter  | Type                                                      |
| ---------- | --------------------------------------------------------- |
| `options?` | [`AnthropicChatModelOptions`](#anthropicchatmodeloptions) |

###### Returns

[`AnthropicChatModel`](#anthropicchatmodel)

###### Overrides

`ChatModel.constructor`

#### Properties

##### options?

> `optional` **options**: [`AnthropicChatModelOptions`](#anthropicchatmodeloptions)

#### Accessors

##### client

###### Get Signature

> **get** **client**(): `Anthropic`

###### Returns

`Anthropic`

##### modelOptions

###### Get Signature

> **get** **modelOptions**(): `undefined` | `ChatModelOptions`

###### Returns

`undefined` | `ChatModelOptions`

#### Methods

##### process()

> **process**(`input`): `PromiseOrValue`<[`AgentProcessResult`](core/agents/agent.md#agentprocessresult)<`ChatModelOutput`>>

Process the input using Claude's chat model

###### Parameters

| Parameter | Type             | Description          |
| --------- | ---------------- | -------------------- |
| `input`   | `ChatModelInput` | The input to process |

###### Returns

`PromiseOrValue`<[`AgentProcessResult`](core/agents/agent.md#agentprocessresult)<`ChatModelOutput`>>

The processed output from the model

###### Overrides

`ChatModel.process`

## Interfaces

### AnthropicChatModelOptions

Configuration options for Claude Chat Model

#### Properties

| Property                                  | Type               | Description                                                                                                                    |
| ----------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| <a id="apikey"></a> `apiKey?`             | `string`           | API key for Anthropic's Claude API If not provided, will look for ANTHROPIC\_API\_KEY or CLAUDE\_API\_KEY in environment variables |
| <a id="model"></a> `model?`               | `string`           | Claude model to use Defaults to 'claude-3-7-sonnet-latest'                                                                     |
| <a id="modeloptions"></a> `modelOptions?` | `ChatModelOptions` | Additional model options to control behavior                                                                                   |
