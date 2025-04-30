[Documentation](../../../README.md) / [@aigne/core](../README.md) / models/chat-model

# models/chat-model

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

- [`Agent`](../agents/agent.md#agent)\<[`ChatModelInput`](#chatmodelinput), [`ChatModelOutput`](#chatmodeloutput)\>

#### Extended by

- [`ClaudeChatModel`](claude-chat-model.md#claudechatmodel)
- [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel)

#### Constructors

##### Constructor

> **new ChatModel**(): [`ChatModel`](#chatmodel)

###### Returns

[`ChatModel`](#chatmodel)

###### Overrides

[`Agent`](../agents/agent.md#agent).[`constructor`](../agents/agent.md#agent#constructor)

#### Properties

| Property                                                           | Type                                                                                                                                                                                                                                                                         | Default value | Description                                                                                                                                                             | Inherited from                                                                                              |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| <a id="description"></a> `description?`                            | `string`                                                                                                                                                                                                                                                                     | `undefined`   | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              | [`Agent`](../agents/agent.md#agent).[`description`](../agents/agent.md#agent#description)                   |
| <a id="includeinputinoutput"></a> `includeInputInOutput?`          | `boolean`                                                                                                                                                                                                                                                                    | `undefined`   | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 | [`Agent`](../agents/agent.md#agent).[`includeInputInOutput`](../agents/agent.md#agent#includeinputinoutput) |
| <a id="memory"></a> `memory?`                                      | `AgentMemory`                                                                                                                                                                                                                                                                | `undefined`   | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     | [`Agent`](../agents/agent.md#agent).[`memory`](../agents/agent.md#agent#memory)                             |
| <a id="name"></a> `name`                                           | `string`                                                                                                                                                                                                                                                                     | `undefined`   | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               | [`Agent`](../agents/agent.md#agent).[`name`](../agents/agent.md#agent#name)                                 |
| <a id="publishtopic"></a> `publishTopic?`                          | [`PublishTopic`](../agents/agent.md#publishtopic-4)\<[`Message`](../agents/agent.md#message)\>                                                                                                                                                                               | `undefined`   | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          | [`Agent`](../agents/agent.md#agent).[`publishTopic`](../agents/agent.md#agent#publishtopic)                 |
| <a id="skills"></a> `skills`                                       | [`Agent`](../agents/agent.md#agent)\<[`Message`](../agents/agent.md#message), [`Message`](../agents/agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](../agents/agent.md#agent)\<[`Message`](../agents/agent.md#message), [`Message`](../agents/agent.md#message)\>; \} | `undefined`   | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents | [`Agent`](../agents/agent.md#agent).[`skills`](../agents/agent.md#agent#skills)                             |
| <a id="subscribetopic"></a> `subscribeTopic?`                      | [`SubscribeTopic`](../agents/agent.md#subscribetopic-4)                                                                                                                                                                                                                      | `undefined`   | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         | [`Agent`](../agents/agent.md#agent).[`subscribeTopic`](../agents/agent.md#agent#subscribetopic)             |
| <a id="supportsparalleltoolcalls"></a> `supportsParallelToolCalls` | `boolean`                                                                                                                                                                                                                                                                    | `true`        | Indicates whether the model supports parallel tool calls Defaults to true, subclasses can override this property based on specific model capabilities                   | -                                                                                                           |

#### Accessors

##### inputSchema

###### Get Signature

> **get** **inputSchema**(): `ZodType`\<`I`\>

Get the input data schema for this agent

Used to validate that input messages conform to required format
If no input schema is set, returns an empty object schema by default

###### Returns

`ZodType`\<`I`\>

The Zod type definition for input data

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`inputSchema`](../agents/agent.md#agent#inputschema)

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`isInvokable`](../agents/agent.md#agent#isinvokable)

##### outputSchema

###### Get Signature

> **get** **outputSchema**(): `ZodType`\<`O`\>

Get the output data schema for this agent

Used to validate that output messages conform to required format
If no output schema is set, returns an empty object schema by default

###### Returns

`ZodType`\<`O`\>

The Zod type definition for output data

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`outputSchema`](../agents/agent.md#agent#outputschema)

##### topic

###### Get Signature

> **get** **topic**(): `string`

Default topic this agent subscribes to

Each agent has a default topic in the format "$agent\_[agent name]"
The agent automatically subscribes to this topic to receive messages

###### Returns

`string`

The default topic string

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`topic`](../agents/agent.md#agent#topic)

#### Methods

##### \[asyncDispose\]()

> **\[asyncDispose\]**(): `Promise`\<`void`\>

Async dispose method for shutdown the agent

###### Returns

`Promise`\<`void`\>

###### Example

Here's an example of shutting down an agent by using statement:

```ts
class MyAgent extends Agent {
  override process(input: Message): Message {
    return { text: `Hello, ${input}` };
  }
  override async shutdown() {
    console.log("Agent is shutting down...");
    // Clean up resources, close connections, etc.
  }
}

// agent will be automatically disposed of at the end of this block
await using agent = new MyAgent();
```

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`[asyncDispose]`](../agents/agent.md#agent#asyncdispose)

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`[custom]`](../agents/agent.md#agent#custom)

##### addSkill()

> **addSkill**(...`skills`): `void`

Add skills (other agents or functions) to this agent

Skills allow agents to reuse functionality from other agents,
building more complex behaviors.

###### Parameters

| Parameter   | Type                                                                                                                                                                                                   | Description                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| ...`skills` | ([`Agent`](../agents/agent.md#agent)\<[`Message`](../agents/agent.md#message), [`Message`](../agents/agent.md#message)\> \| [`FunctionAgentFn`](../agents/agent.md#functionagentfn)\<`any`, `any`\>)[] | List of skills to add, can be Agent instances or functions |

###### Returns

`void`

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`addSkill`](../agents/agent.md#agent#addskill)

##### attach()

> **attach**(`context`): `void`

Attach agent to context:

- Subscribe to topics and invoke process method when messages are received
- Subscribe to memory topics if memory is enabled

Agents can receive messages and respond through the topic subscription system,
enabling inter-agent communication.

###### Parameters

| Parameter | Type                                                      | Description          |
| --------- | --------------------------------------------------------- | -------------------- |
| `context` | `Pick`\<[`Context`](../aigne.md#context), `"subscribe"`\> | Context to attach to |

###### Returns

`void`

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`attach`](../agents/agent.md#agent#attach)

##### checkAgentInvokesUsage()

> `protected` **checkAgentInvokesUsage**(`context`): `void`

Check agent invocation usage to prevent exceeding limits

If the context has a maximum invocation limit set, checks if the limit
has been exceeded and increments the invocation counter

###### Parameters

| Parameter | Type                             | Description       |
| --------- | -------------------------------- | ----------------- |
| `context` | [`Context`](../aigne.md#context) | Execution context |

###### Returns

`void`

###### Throws

Error if maximum invocation limit is exceeded

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`checkAgentInvokesUsage`](../agents/agent.md#agent#checkagentinvokesusage)

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

##### invoke()

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`ChatModelOutput`](#chatmodeloutput)\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                                         | Description                                                      |
| ---------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `input`    | `string` \| [`ChatModelInput`](#chatmodelinput)                                              | Input message to the agent, can be a string or structured object |
| `context?` | [`Context`](../aigne.md#context)                                                             | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](../agents/agent.md#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

###### Returns

`Promise`\<[`ChatModelOutput`](#chatmodeloutput)\>

Final JSON response

###### Example

Here's an example of invoking an agent with regular mode:

```ts
// Create a chat model
const model = new OpenAIChatModel();

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({
  model,
});

// Create an Agent instance
const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

// Invoke the agent
const result = await aigne.invoke(agent, "hello");

console.log(result); // Output: { $message: "Hello, How can I assist you today?" }
```

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`invoke`](../agents/agent.md#agent#invoke)

###### Call Signature

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](../agents/agent.md#agentresponsestream)\<[`ChatModelOutput`](#chatmodeloutput)\>\>

Invoke the agent with streaming response

Streaming responses allow the agent to return results incrementally,
suitable for scenarios requiring real-time progress updates, such as
chat bot typing effects.

###### Parameters

| Parameter           | Type                                            | Description                                                      |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `input`             | `string` \| [`ChatModelInput`](#chatmodelinput) | Input message to the agent, can be a string or structured object |
| `context`           | `undefined` \| [`Context`](../aigne.md#context) | Execution context, providing environment and resource access     |
| `options`           | \{ `streaming`: `true`; \}                      | Invocation options, must set streaming to true for this overload |
| `options.streaming` | `true`                                          | -                                                                |

###### Returns

`Promise`\<[`AgentResponseStream`](../agents/agent.md#agentresponsestream)\<[`ChatModelOutput`](#chatmodeloutput)\>\>

Streaming response object

###### Example

Here's an example of invoking an agent with streaming response:

```ts
// Create a chat model
const model = new OpenAIChatModel();

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({
  model,
});

// Create an Agent instance
const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

// Invoke the agent with streaming enabled
const stream = await aigne.invoke(agent, "hello", { streaming: true });

const chunks: string[] = [];

// Read the stream using an async iterator
for await (const chunk of readableStreamToAsyncIterator(stream)) {
  const text = chunk.delta.text?.$message;
  if (text) {
    chunks.push(text);
  }
}

console.log(chunks); // Output: ["Hello", ",", " ", "How", " ", "can", " ", "I", " ", "assist", " ", "you", " ", "today", "?"]
```

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`invoke`](../agents/agent.md#agent#invoke)

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](../agents/agent.md#agentresponse)\<[`ChatModelOutput`](#chatmodeloutput)\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                                          | Description                |
| ---------- | ------------------------------------------------------------- | -------------------------- |
| `input`    | `string` \| [`ChatModelInput`](#chatmodelinput)               | Input message to the agent |
| `context?` | [`Context`](../aigne.md#context)                              | Execution context          |
| `options?` | [`AgentInvokeOptions`](../agents/agent.md#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](../agents/agent.md#agentresponse)\<[`ChatModelOutput`](#chatmodeloutput)\>\>

Agent response (streaming or regular)

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`invoke`](../agents/agent.md#agent#invoke)

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

[`Agent`](../agents/agent.md#agent).[`postprocess`](../agents/agent.md#agent#postprocess)

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

[`Agent`](../agents/agent.md#agent).[`preprocess`](../agents/agent.md#agent#preprocess)

##### process()

> `abstract` **process**(`input`, `context`): `PromiseOrValue`\<[`AgentProcessResult`](../agents/agent.md#agentprocessresult)\<[`ChatModelOutput`](#chatmodeloutput)\>\>

Core processing method of the agent, must be implemented in subclasses

This is the main functionality implementation of the agent, processing input and
generating output. Can return various types of results:

- Regular object response
- Streaming response
- Async generator
- Another agent instance (transfer agent)

###### Parameters

| Parameter | Type                                | Description       |
| --------- | ----------------------------------- | ----------------- |
| `input`   | [`ChatModelInput`](#chatmodelinput) | Input message     |
| `context` | [`Context`](../aigne.md#context)    | Execution context |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](../agents/agent.md#agentprocessresult)\<[`ChatModelOutput`](#chatmodeloutput)\>\>

Processing result

###### Examples

Example of returning a direct object:

```ts
class DirectResponseAgent extends Agent {
  process(input: Message): Message {
    // Process input and return a direct object response
    return {
      text: `Hello, I received your message: ${JSON.stringify(input)}`,
      confidence: 0.95,
      timestamp: new Date().toISOString(),
    };
  }
}

const agent = new DirectResponseAgent();

const result = await agent.invoke({ message: "Hello" });

console.log(result); // { text: "Hello, I received your message: { message: 'Hello' }", confidence: 0.95, timestamp: "2023-10-01T12:00:00Z" }
```

Example of returning a streaming response:

```ts
class StreamResponseAgent extends Agent {
  process(_input: Message): AgentResponseStream<Message> {
    // Return a ReadableStream as a streaming response
    return new ReadableStream({
      start(controller) {
        controller.enqueue(textDelta({ text: "Hello" }));
        controller.enqueue(textDelta({ text: ", " }));
        controller.enqueue(textDelta({ text: "This" }));
        controller.enqueue(textDelta({ text: " is" }));
        controller.enqueue(textDelta({ text: "..." }));
        controller.close();
      },
    });
  }
}

const agent = new StreamResponseAgent();

const stream = await agent.invoke("Hello", undefined, { streaming: true });

let fullText = "";

for await (const chunk of readableStreamToAsyncIterator(stream)) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
}

console.log(fullText); // Output: "Hello, This is..."
```

Example of using an async generator:

```ts
class AsyncGeneratorAgent extends Agent {
  async *process(
    _input: Message,
    _context: Context,
  ): AgentProcessAsyncGenerator<Message> {
    // Use async generator to produce streaming results
    yield textDelta({ message: "This" });
    yield textDelta({ message: "," });
    yield textDelta({ message: " " });
    yield textDelta({ message: "This" });
    yield textDelta({ message: " " });
    yield textDelta({ message: "is" });
    yield textDelta({ message: "..." });
    // Optional return a JSON object at the end
    return { time: new Date().toISOString() };
  }
}

const agent = new AsyncGeneratorAgent();

const stream = await agent.invoke("Hello", undefined, { streaming: true });

const message: string[] = [];

let json: Message | undefined;

for await (const chunk of readableStreamToAsyncIterator(stream)) {
  const text = chunk.delta.text?.message;
  if (text) message.push(text);
  if (chunk.delta.json) json = chunk.delta.json;
}

console.log(message); // Output: ["This", ",", " ", "This", " ", "is", "..."]

console.log(json); // Output: { time: "2023-10-01T12:00:00Z" }
```

Example of transfer to another agent:

```ts
class SpecialistAgent extends Agent {
  process(_input: Message): Message {
    return {
      response: "This is a specialist response",
      expertise: "technical",
    };
  }
}

class MainAgent extends Agent {
  process(_input: Message): Agent {
    // Create a specialized agent for handling technical issues
    return new SpecialistAgent();
  }
}

const aigne = new AIGNE({});

const mainAgent = new MainAgent();

const result = await aigne.invoke(mainAgent, "technical question");

console.log(result); // { response: "This is a specialist response", expertise: "technical" }
```

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`process`](../agents/agent.md#agent#process)

##### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Shut down the agent and clean up resources

Primarily used to clean up memory and other resources to prevent memory leaks

###### Returns

`Promise`\<`void`\>

###### Examples

Here's an example of shutting down an agent:

```ts
class MyAgent extends Agent {
  override process(input: Message): Message {
    return { text: `Hello, ${input}` };
  }
  override async shutdown() {
    console.log("Agent is shutting down...");
    // Clean up resources, close connections, etc.
  }
}

const agent = new MyAgent();

await agent.shutdown();
```

Here's an example of shutting down an agent by using statement:

```ts
class MyAgent extends Agent {
  override process(input: Message): Message {
    return { text: `Hello, ${input}` };
  }
  override async shutdown() {
    console.log("Agent is shutting down...");
    // Clean up resources, close connections, etc.
  }
}

// agent will be automatically disposed of at the end of this block
await using agent = new MyAgent();
```

###### Inherited from

[`Agent`](../agents/agent.md#agent).[`shutdown`](../agents/agent.md#agent#shutdown)

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

- [`Message`](../agents/agent.md#message)

#### Indexable

\[`key`: `string`\]: `unknown`

#### Properties

| Property                                      | Type                                                              | Description                                  |
| --------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| <a id="messages"></a> `messages`              | [`ChatModelInputMessage`](#chatmodelinputmessage)[]               | Array of messages to send to the model       |
| <a id="modeloptions"></a> `modelOptions?`     | [`ChatModelOptions`](#chatmodeloptions)                           | Model-specific configuration options         |
| <a id="responseformat"></a> `responseFormat?` | [`ChatModelInputResponseFormat`](#chatmodelinputresponseformat-1) | Specifies the expected response format       |
| <a id="toolchoice"></a> `toolChoice?`         | [`ChatModelInputToolChoice`](#chatmodelinputtoolchoice-1)         | Specifies the tool selection strategy        |
| <a id="tools"></a> `tools?`                   | [`ChatModelInputTool`](#chatmodelinputtool)[]                     | List of tools available for the model to use |

---

### ChatModelInputMessage

Structure of input messages

Defines the format of each message sent to the model, including
role, content, and tool call related information

#### Properties

| Property                              | Type                                                                                                                                     | Description                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <a id="content"></a> `content?`       | [`ChatModelInputMessageContent`](#chatmodelinputmessagecontent-1)                                                                        | Message content, can be text or multimodal content array             |
| <a id="name-1"></a> `name?`           | `string`                                                                                                                                 | Name of the message sender (for multi-agent scenarios)               |
| <a id="role"></a> `role`              | [`Role`](#role-1)                                                                                                                        | Role of the message (system, user, agent, or tool)                   |
| <a id="toolcallid"></a> `toolCallId?` | `string`                                                                                                                                 | For tool response messages, specifies the corresponding tool call ID |
| <a id="toolcalls"></a> `toolCalls?`   | \{ `function`: \{ `arguments`: [`Message`](../agents/agent.md#message); `name`: `string`; \}; `id`: `string`; `type`: `"function"`; \}[] | Tool call details when the agent wants to execute tool calls         |

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
| <a id="function"></a> `function` | \{ `description?`: `string`; `name`: `string`; `parameters`: `object`; \} | Function tool definition                          |
| `function.description?`          | `string`                                                                  | Function description                              |
| `function.name`                  | `string`                                                                  | Function name                                     |
| `function.parameters`            | `object`                                                                  | Function parameter structure definition           |
| <a id="type"></a> `type`         | `"function"`                                                              | Tool type, currently only "function" is supported |

---

### ChatModelOptions

Model-specific configuration options

Contains various parameters for controlling model behavior, such as model name, temperature, etc.

#### Properties

| Property                                            | Type      | Description                                      |
| --------------------------------------------------- | --------- | ------------------------------------------------ |
| <a id="frequencypenalty"></a> `frequencyPenalty?`   | `number`  | Frequency penalty parameter, reduces repetition  |
| <a id="model"></a> `model?`                         | `string`  | Model name or version                            |
| <a id="paralleltoolcalls"></a> `parallelToolCalls?` | `boolean` | Whether to allow parallel tool calls             |
| <a id="presencepenalty"></a> `presencePenalty?`     | `number`  | Presence penalty parameter, encourages diversity |
| <a id="temperature"></a> `temperature?`             | `number`  | Temperature parameter, controls randomness (0-1) |
| <a id="topp"></a> `topP?`                           | `number`  | Top-p parameter, controls vocabulary diversity   |

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

- [`Message`](../agents/agent.md#message)

#### Indexable

\[`key`: `string`\]: `unknown`

#### Properties

| Property                              | Type                                                    | Description                               |
| ------------------------------------- | ------------------------------------------------------- | ----------------------------------------- |
| <a id="json"></a> `json?`             | `object`                                                | JSON format response content              |
| <a id="model-1"></a> `model?`         | `string`                                                | Model name or version used                |
| <a id="text"></a> `text?`             | `string`                                                | Text format response content              |
| <a id="toolcalls-1"></a> `toolCalls?` | [`ChatModelOutputToolCall`](#chatmodeloutputtoolcall)[] | List of tools the model requested to call |
| <a id="usage"></a> `usage?`           | [`ChatModelOutputUsage`](#chatmodeloutputusage-1)       | Token usage statistics                    |

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
| <a id="function-1"></a> `function` | \{ `arguments`: [`Message`](../agents/agent.md#message); `name`: `string`; \} | Function call details                             |
| `function.arguments`               | [`Message`](../agents/agent.md#message)                                       | Arguments for the function call                   |
| `function.name`                    | `string`                                                                      | Name of the function being called                 |
| <a id="id"></a> `id`               | `string`                                                                      | Unique ID of the tool call                        |
| <a id="type-1"></a> `type`         | `"function"`                                                                  | Tool type, currently only "function" is supported |

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

### ChatModelInputMessageContent

> **ChatModelInputMessageContent** = `string` \| ([`TextContent`](#textcontent) \| [`ImageUrlContent`](#imageurlcontent))[]

Type of input message content

Can be a simple string, or a mixed array of text and image content

---

### ChatModelInputResponseFormat

> **ChatModelInputResponseFormat** = \{ `type`: `"text"`; \} \| \{ `jsonSchema`: \{ `description?`: `string`; `name`: `string`; `schema`: `Record`\<`string`, `unknown`\>; `strict?`: `boolean`; \}; `type`: `"json_schema"`; \}

Model response format settings

Can be specified as plain text format or according to a JSON Schema

---

### ChatModelInputToolChoice

> **ChatModelInputToolChoice** = `"auto"` \| `"none"` \| `"required"` \| \{ `function`: \{ `description?`: `string`; `name`: `string`; \}; `type`: `"function"`; \}

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

---

### ImageUrlContent

> **ImageUrlContent** = \{ `type`: `"image_url"`; `url`: `string`; \}

Image URL content type

Used for image parts of message content, referencing images via URL

#### Properties

| Property                   | Type          |
| -------------------------- | ------------- |
| <a id="type-2"></a> `type` | `"image_url"` |
| <a id="url"></a> `url`     | `string`      |

---

### Role

> **Role** = `"system"` \| `"user"` \| `"agent"` \| `"tool"`

Message role types

- system: System instructions
- user: User messages
- agent: Agent/assistant messages
- tool: Tool call responses

---

### TextContent

> **TextContent** = \{ `text`: `string`; `type`: `"text"`; \}

Text content type

Used for text parts of message content

#### Properties

| Property                   | Type     |
| -------------------------- | -------- |
| <a id="text-1"></a> `text` | `string` |
| <a id="type-3"></a> `type` | `"text"` |
