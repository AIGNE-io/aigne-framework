[Documentation](../../../README.md) / [@aigne/core](../README.md) / models/bedrock-chat-model

# models/bedrock-chat-model

## Classes

### BedrockChatModel

ChatModel is an abstract base class for interacting with Large Language Models (LLMs).

This class extends the Agent class and provides a common interface for handling model inputs,
outputs, and capabilities. Specific model implementations (like OpenAI, Anthropic, etc.)
should inherit from this class and implement their specific functionalities.

#### Examples

Here's how to implement a custom ChatModel:

```ts
class TestChatModel extends ChatModel {
  process(input: ChatModelInput): ChatModelOutput {
    // You can fetch upstream api here
    return {
      model: "gpt-4o",
      text: `Processed: ${input.messages[0]?.content || ""}`,
      usage: {
        inputTokens: 5,
        outputTokens: 10,
      },
    };
  }
}

const model = new TestChatModel();
const result = await model.invoke({
  messages: [{ role: "user", content: "Hello" }],
});

console.log(result);
// Output:
// {
//   text: "Processed: Hello",
//   model: "gpt-4o",
//   usage: {
//     inputTokens: 5,
//     outputTokens: 10
//   }
// }
```

Here's an example showing streaming response with readable stream:

```ts
class StreamingChatModel extends ChatModel {
  process(_input: ChatModelInput): AgentResponseStream<ChatModelOutput> {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(textDelta({ text: "Processing" }));
        controller.enqueue(textDelta({ text: " your" }));
        controller.enqueue(textDelta({ text: " request" }));
        controller.enqueue(textDelta({ text: "..." }));
        controller.enqueue(
          jsonDelta({
            model: "gpt-4o",
            usage: { inputTokens: 5, outputTokens: 10 },
          }),
        );
        controller.close();
      },
    });
  }
}

const model = new StreamingChatModel();
const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello" }],
  },
  undefined,
  { streaming: true },
);

let fullText = "";
const json: Partial<AgentProcessResult<ChatModelOutput>> = {};
for await (const chunk of stream) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}

console.log(fullText); // Output: "Processing your request..."
console.log(json); // // Output: { model: "gpt-4o", usage: { inputTokens: 5, outputTokens: 10 } }
```

Here's an example showing streaming response with async generator:

```ts
class StreamingChatModel extends ChatModel {
  async *process(_input: ChatModelInput): AgentProcessResult<ChatModelOutput> {
    yield textDelta({ text: "Processing" });
    yield textDelta({ text: " your" });
    yield textDelta({ text: " request" });
    yield textDelta({ text: "..." });

    return { model: "gpt-4o", usage: { inputTokens: 5, outputTokens: 10 } };
  }
}

const model = new StreamingChatModel();
const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello" }],
  },
  undefined,
  { streaming: true },
);

let fullText = "";
const json: Partial<AgentProcessResult<ChatModelOutput>> = {};
for await (const chunk of stream) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}

console.log(fullText); // Output: "Processing your request..."
console.log(json); // // Output: { model: "gpt-4o", usage: { inputTokens: 5, outputTokens: 10 } }
```

Here's an example with tool calls:

```ts
class ToolEnabledChatModel extends ChatModel {
  process(input: ChatModelInput): ChatModelOutput {
    // Mock a response with tool calls based on input
    const toolName = input.tools?.[0]?.function?.name;
    if (toolName) {
      return {
        toolCalls: [
          {
            id: "call_123",
            type: "function",
            function: {
              name: toolName,
              arguments: { param: "value" },
            },
          },
        ],
      };
    }

    return {
      text: "No tools available",
    };
  }
}

const model = new ToolEnabledChatModel();

const result = await model.invoke({
  messages: [{ role: "user", content: "What's the weather?" }],
  tools: [
    {
      type: "function",
      function: {
        name: "get_weather",
        description: "Get weather for a location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The location to get weather for",
            },
          },
        },
      },
    },
  ],
});

console.log(result);
/* Output:
{
  toolCalls: [
    {
      id: "call_123",
      type: "function",
      function: {
        name: "get_weather",
        arguments: { param: "value" }
      }
    }
  ]
}
*/
```

#### Extends

- [`ChatModel`](chat-model.md#chatmodel)

#### Constructors

##### Constructor

> **new BedrockChatModel**(`options?`): [`BedrockChatModel`](#bedrockchatmodel)

###### Parameters

| Parameter  | Type                                                  |
| ---------- | ----------------------------------------------------- |
| `options?` | [`BedrockChatModelOptions`](#bedrockchatmodeloptions) |

###### Returns

[`BedrockChatModel`](#bedrockchatmodel)

###### Overrides

[`ChatModel`](chat-model.md#chatmodel).[`constructor`](chat-model.md#chatmodel#constructor)

#### Properties

##### options?

> `optional` **options**: [`BedrockChatModelOptions`](#bedrockchatmodeloptions)

#### Accessors

##### client

###### Get Signature

> **get** **client**(): `BedrockRuntimeClient`

###### Returns

`BedrockRuntimeClient`

##### modelOptions

###### Get Signature

> **get** **modelOptions**(): `undefined` \| [`ChatModelOptions`](chat-model.md#chatmodeloptions)

###### Returns

`undefined` \| [`ChatModelOptions`](chat-model.md#chatmodeloptions)

#### Methods

##### process()

> **process**(`input`): `Promise`\<[`AgentResponse`](../agents/agent.md#agentresponse)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

Processes input messages and generates model responses

This is the core method that must be implemented by all ChatModel subclasses.
It handles the communication with the underlying language model,
processes the input messages, and generates appropriate responses.

Implementations should handle:

- Conversion of input format to model-specific format
- Sending requests to the language model
- Processing model responses
- Handling streaming responses if supported
- Proper error handling and retries
- Token counting and usage tracking
- Tool call processing if applicable

###### Parameters

| Parameter | Type                                             | Description                                                  |
| --------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `input`   | [`ChatModelInput`](chat-model.md#chatmodelinput) | The standardized input containing messages and model options |

###### Returns

`Promise`\<[`AgentResponse`](../agents/agent.md#agentresponse)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

A promise or direct value containing the model's response

###### Overrides

[`ChatModel`](chat-model.md#chatmodel).[`process`](chat-model.md#chatmodel#process)

## Interfaces

### BedrockChatModelOptions

#### Properties

| Property                                        | Type                                                 |
| ----------------------------------------------- | ---------------------------------------------------- |
| <a id="accesskeyid"></a> `accessKeyId?`         | `string`                                             |
| <a id="secretaccesskey"></a> `secretAccessKey?` | `string`                                             |
| <a id="region"></a> `region?`                   | `string`                                             |
| <a id="model"></a> `model?`                     | `string`                                             |
| <a id="modeloptions"></a> `modelOptions?`       | [`ChatModelOptions`](chat-model.md#chatmodeloptions) |
