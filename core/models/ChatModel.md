[**@aigne/core**](../../README.md)

---

[@aigne/core](../../README.md) / core/models/ChatModel

# core/models/ChatModel

## Classes

### `abstract` ChatModel

ChatModel is an abstract base class for interacting with Large Language Models (LLMs).

This class extends the Agent class and provides a common interface for handling model inputs,
outputs, and capabilities. Specific model implementations (like OpenAI, Anthropic, etc.)
should inherit from this class and implement their specific functionalities.

#### Template

The input message type for the model

#### Template

The output message type from the model

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
```

Here's an example showing streaming response:

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

for await (const chunk of readableStreamToAsyncIterator(stream)) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}

console.log(fullText); // Output: "Processing your request..."

console.log(json); // // Output: { model: "gpt-4o", usage: { inputTokens: 5, outputTokens: 10 } }
```

Here's an example showing streaming response:

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

for await (const chunk of readableStreamToAsyncIterator(stream)) {
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
```

#### Extends

- [`Agent`](../agents/Agent.md#agent)\<[`ChatModelInput`](#chatmodelinput), [`ChatModelOutput`](#chatmodeloutput)\>

#### Extended by

- [`ClaudeChatModel`](ClaudeChatModel.md#claudechatmodel)
- [`OpenAIChatModel`](OpenaiChatModel.md#openaichatmodel)

#### Constructors

##### Constructor

> **new ChatModel**(): [`ChatModel`](#chatmodel)

###### Returns

[`ChatModel`](#chatmodel)

###### Overrides

[`Agent`](../agents/Agent.md#agent).[`constructor`](../agents/Agent.md#agent#constructor)

#### Properties

| Property                                                           | Type      | Default value | Description                                                                                                                                           |
| ------------------------------------------------------------------ | --------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="supportsparalleltoolcalls"></a> `supportsParallelToolCalls` | `boolean` | `true`        | Indicates whether the model supports parallel tool calls Defaults to true, subclasses can override this property based on specific model capabilities |

#### Methods

##### getModelCapabilities()

> **getModelCapabilities**(): \{ `supportsParallelToolCalls`: `boolean`; \}

Gets the model's supported capabilities

Currently returns capabilities including: whether parallel tool calls are supported

###### Returns

\{ `supportsParallelToolCalls`: `boolean`; \}

An object containing model capabilities

| Name                        | Type      |
| --------------------------- | --------- |
| `supportsParallelToolCalls` | `boolean` |

##### preprocess()

> `protected` **preprocess**(`input`, `context`): `void`

Performs preprocessing operations before handling input

Primarily checks if token usage exceeds limits, throwing an exception if limits are exceeded

###### Parameters

| Parameter | Type                                | Description       |
| --------- | ----------------------------------- | ----------------- |
| `input`   | [`ChatModelInput`](#chatmodelinput) | Input message     |
| `context` | [`Context`](../aigne.md#context)    | Execution context |

###### Returns

`void`

###### Throws

Error if token usage exceeds maximum limit

###### Overrides

[`Agent`](../agents/Agent.md#agent).[`preprocess`](../agents/Agent.md#agent#preprocess)

##### postprocess()

> `protected` **postprocess**(`input`, `output`, `context`): `void`

Performs postprocessing operations after handling output

Primarily updates token usage statistics in the context

###### Parameters

| Parameter | Type                                  | Description       |
| --------- | ------------------------------------- | ----------------- |
| `input`   | [`ChatModelInput`](#chatmodelinput)   | Input message     |
| `output`  | [`ChatModelOutput`](#chatmodeloutput) | Output message    |
| `context` | [`Context`](../aigne.md#context)      | Execution context |

###### Returns

`void`

###### Overrides

[`Agent`](../agents/Agent.md#agent).[`postprocess`](../agents/Agent.md#agent#postprocess)

## Interfaces

### ChatModelInput

Input message format for ChatModel

Contains an array of messages to send to the model, response format settings,
tool definitions, and model-specific options

#### Examples

Here's a basic ChatModel input example:

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
```

Here's an example with tool calling:

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
```

#### Extends

- [`Message`](../agents/Agent.md#message)

#### Indexable

\[`key`: `string`\]: `unknown`

#### Properties

| Property                                      | Type                                                              | Description                                  |
| --------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| <a id="messages"></a> `messages`              | [`ChatModelInputMessage`](#chatmodelinputmessage)[]               | Array of messages to send to the model       |
| <a id="responseformat"></a> `responseFormat?` | [`ChatModelInputResponseFormat`](#chatmodelinputresponseformat-1) | Specifies the expected response format       |
| <a id="tools"></a> `tools?`                   | [`ChatModelInputTool`](#chatmodelinputtool)[]                     | List of tools available for the model to use |
| <a id="toolchoice"></a> `toolChoice?`         | [`ChatModelInputToolChoice`](#chatmodelinputtoolchoice-1)         | Specifies the tool selection strategy        |
| <a id="modeloptions"></a> `modelOptions?`     | [`ChatModelOptions`](#chatmodeloptions)                           | Model-specific configuration options         |

---

### ChatModelInputMessage

Structure of input messages

Defines the format of each message sent to the model, including
role, content, and tool call related information

#### Properties

| Property                              | Type                                                                                                                                     | Description                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <a id="role-1"></a> `role`            | [`Role`](#role)                                                                                                                          | Role of the message (system, user, agent, or tool)                   |
| <a id="content"></a> `content?`       | [`ChatModelInputMessageContent`](#chatmodelinputmessagecontent-1)                                                                        | Message content, can be text or multimodal content array             |
| <a id="toolcalls"></a> `toolCalls?`   | \{ `id`: `string`; `type`: `"function"`; `function`: \{ `name`: `string`; `arguments`: [`Message`](../agents/Agent.md#message); \}; \}[] | Tool call details when the agent wants to execute tool calls         |
| <a id="toolcallid"></a> `toolCallId?` | `string`                                                                                                                                 | For tool response messages, specifies the corresponding tool call ID |
| <a id="name"></a> `name?`             | `string`                                                                                                                                 | Name of the message sender (for multi-agent scenarios)               |

---

### ChatModelInputTool

Tool definition provided to the model

Defines a function tool, including name, description and parameter structure

#### Example

Here's an example showing how to use tools:

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
```

#### Properties

| Property                         | Type                                                                      | Description                                       |
| -------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| <a id="type-2"></a> `type`       | `"function"`                                                              | Tool type, currently only "function" is supported |
| <a id="function"></a> `function` | \{ `name`: `string`; `description?`: `string`; `parameters`: `object`; \} | Function tool definition                          |
| `function.name`                  | `string`                                                                  | Function name                                     |
| `function.description?`          | `string`                                                                  | Function description                              |
| `function.parameters`            | `object`                                                                  | Function parameter structure definition           |

---

### ChatModelOptions

Model-specific configuration options

Contains various parameters for controlling model behavior, such as model name, temperature, etc.

#### Properties

| Property                                            | Type      | Description                                      |
| --------------------------------------------------- | --------- | ------------------------------------------------ |
| <a id="model"></a> `model?`                         | `string`  | Model name or version                            |
| <a id="temperature"></a> `temperature?`             | `number`  | Temperature parameter, controls randomness (0-1) |
| <a id="topp"></a> `topP?`                           | `number`  | Top-p parameter, controls vocabulary diversity   |
| <a id="frequencypenalty"></a> `frequencyPenalty?`   | `number`  | Frequency penalty parameter, reduces repetition  |
| <a id="presencepenalty"></a> `presencePenalty?`     | `number`  | Presence penalty parameter, encourages diversity |
| <a id="paralleltoolcalls"></a> `parallelToolCalls?` | `boolean` | Whether to allow parallel tool calls             |

---

### ChatModelOutput

Output message format for ChatModel

Contains model response content, which can be text, JSON data, tool calls, and usage statistics

#### Examples

Here's a basic output example:

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
```

#### Extends

- [`Message`](../agents/Agent.md#message)

#### Indexable

\[`key`: `string`\]: `unknown`

#### Properties

| Property                              | Type                                                    | Description                               |
| ------------------------------------- | ------------------------------------------------------- | ----------------------------------------- |
| <a id="text-1"></a> `text?`           | `string`                                                | Text format response content              |
| <a id="json"></a> `json?`             | `object`                                                | JSON format response content              |
| <a id="toolcalls-1"></a> `toolCalls?` | [`ChatModelOutputToolCall`](#chatmodeloutputtoolcall)[] | List of tools the model requested to call |
| <a id="usage"></a> `usage?`           | [`ChatModelOutputUsage`](#chatmodeloutputusage-1)       | Token usage statistics                    |
| <a id="model-1"></a> `model?`         | `string`                                                | Model name or version used                |

---

### ChatModelOutputToolCall

Tool call information in model output

Describes tool calls requested by the model, including tool ID and call parameters

#### Example

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
```

#### Properties

| Property                           | Type                                                                          | Description                                       |
| ---------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| <a id="id"></a> `id`               | `string`                                                                      | Unique ID of the tool call                        |
| <a id="type-3"></a> `type`         | `"function"`                                                                  | Tool type, currently only "function" is supported |
| <a id="function-1"></a> `function` | \{ `name`: `string`; `arguments`: [`Message`](../agents/Agent.md#message); \} | Function call details                             |
| `function.name`                    | `string`                                                                      | Name of the function being called                 |
| `function.arguments`               | [`Message`](../agents/Agent.md#message)                                       | Arguments for the function call                   |

---

### ChatModelOutputUsage

Model usage statistics

Records the number of input and output tokens for tracking model usage

#### Properties

| Property                                 | Type     | Description             |
| ---------------------------------------- | -------- | ----------------------- |
| <a id="inputtokens"></a> `inputTokens`   | `number` | Number of input tokens  |
| <a id="outputtokens"></a> `outputTokens` | `number` | Number of output tokens |

## Type Aliases

### Role

> **Role** = `"system"` \| `"user"` \| `"agent"` \| `"tool"`

Message role types

- system: System instructions
- user: User messages
- agent: Agent/assistant messages
- tool: Tool call responses

---

### ChatModelInputMessageContent

> **ChatModelInputMessageContent** = `string` \| ([`TextContent`](#textcontent) \| [`ImageUrlContent`](#imageurlcontent))[]

Type of input message content

Can be a simple string, or a mixed array of text and image content

---

### TextContent

> **TextContent** = \{ `type`: `"text"`; `text`: `string`; \}

Text content type

Used for text parts of message content

#### Properties

| Property                 | Type     |
| ------------------------ | -------- |
| <a id="type"></a> `type` | `"text"` |
| <a id="text"></a> `text` | `string` |

---

### ImageUrlContent

> **ImageUrlContent** = \{ `type`: `"image_url"`; `url`: `string`; \}

Image URL content type

Used for image parts of message content, referencing images via URL

#### Properties

| Property                   | Type          |
| -------------------------- | ------------- |
| <a id="type-1"></a> `type` | `"image_url"` |
| <a id="url"></a> `url`     | `string`      |

---

### ChatModelInputResponseFormat

> **ChatModelInputResponseFormat** = \{ `type`: `"text"`; \} \| \{ `type`: `"json_schema"`; `jsonSchema`: \{ `name`: `string`; `description?`: `string`; `schema`: `Record`\<`string`, `unknown`\>; `strict?`: `boolean`; \}; \}

Model response format settings

Can be specified as plain text format or according to a JSON Schema

---

### ChatModelInputToolChoice

> **ChatModelInputToolChoice** = `"auto"` \| `"none"` \| `"required"` \| \{ `type`: `"function"`; `function`: \{ `name`: `string`; `description?`: `string`; \}; \}

Tool selection strategy

Determines how the model selects and uses tools:

- "auto": Automatically decides whether to use tools
- "none": Does not use any tools
- "required": Must use tools
- object: Specifies a particular tool function

#### Example

Here's an example showing how to use tools:

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
```
