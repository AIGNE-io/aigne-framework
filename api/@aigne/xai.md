[Documentation](../README.md) / @aigne/xai

# @aigne/xai

## Classes

### XAIChatModel

Implementation of the ChatModel interface for X.AI's API (Grok)

This model uses OpenAI-compatible API format to interact with X.AI models,
providing access to models like Grok.

Default model: 'grok-2-latest'

#### Examples

Here's how to create and use an X.AI chat model:

```ts
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
/* Output:
{
  text: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!",
  model: "grok-2-latest",
  usage: {
    inputTokens: 6,
    outputTokens: 17
  }
}
*/
```

Here's an example with streaming response:

```ts
const model = new XAIChatModel({
  apiKey: "your-api-key",
  model: "grok-2-latest",
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

console.log(fullText); // Output: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!"
console.log(json); // { model: "grok-2-latest", usage: { inputTokens: 6, outputTokens: 17 } }
```

#### Extends

* `OpenAIChatModel`

#### Constructors

##### Constructor

> **new XAIChatModel**(`options?`): [`XAIChatModel`](#xaichatmodel)

###### Parameters

| Parameter  | Type                     |
| ---------- | ------------------------ |
| `options?` | `OpenAIChatModelOptions` |

###### Returns

[`XAIChatModel`](#xaichatmodel)

###### Overrides

`OpenAIChatModel.constructor`

#### Properties

##### apiKeyEnvName

> `protected` **apiKeyEnvName**: `string` = `"XAI_API_KEY"`

###### Overrides

`OpenAIChatModel.apiKeyEnvName`
