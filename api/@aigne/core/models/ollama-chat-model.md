[Documentation](../../../README.md) / [@aigne/core](../README.md) / models/ollama-chat-model

# models/ollama-chat-model

## Classes

### OllamaChatModel

Implementation of the ChatModel interface for Ollama

This model allows you to run open-source LLMs locally using Ollama,
with an OpenAI-compatible API interface.

Default model: 'llama3.2'

#### Examples

Here's how to create and use an Ollama chat model:

```ts
const model = new OllamaChatModel({
  // Specify base URL (defaults to http://localhost:11434)
  baseURL: "http://localhost:11434",
  // Specify Ollama model to use (defaults to 'llama3')
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
/* Output:
{
  text: "I'm an AI assistant running on Ollama with the llama3 model.",
  model: "llama3"
}
*/
```

Here's an example with streaming response:

```ts
const model = new OllamaChatModel({
  baseURL: "http://localhost:11434",
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me what model you're using" }],
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

console.log(fullText); // Output: "I'm an AI assistant running on Ollama with the llama3 model."
console.log(json); // { model: "llama3" }
```

#### Extends

- [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel)

#### Constructors

##### Constructor

> **new OllamaChatModel**(`options?`): [`OllamaChatModel`](#ollamachatmodel)

###### Parameters

| Parameter  | Type                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| `options?` | [`OpenAIChatModelOptions`](openai-chat-model.md#openaichatmodeloptions) |

###### Returns

[`OllamaChatModel`](#ollamachatmodel)

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`constructor`](openai-chat-model.md#openaichatmodel#constructor)

#### Properties

##### apiKeyEnvName

> `protected` **apiKeyEnvName**: `string` = `"OLLAMA_API_KEY"`

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`apiKeyEnvName`](openai-chat-model.md#openaichatmodel#apikeyenvname)

##### apiKeyDefault

> `protected` **apiKeyDefault**: `string` = `"ollama"`

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`apiKeyDefault`](openai-chat-model.md#openaichatmodel#apikeydefault)
