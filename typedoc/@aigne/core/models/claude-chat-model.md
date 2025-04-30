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

spyOn(model, "process").mockReturnValueOnce({
  text: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
  model: "claude-3-haiku-20240307",
  usage: {
    inputTokens: 8,
    outputTokens: 15,
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
expect(result).toEqual({
  text: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
  model: "claude-3-haiku-20240307",
  usage: {
    inputTokens: 8,
    outputTokens: 15,
  },
});
```

Here's an example with streaming response:

```ts
const model = new ClaudeChatModel({
  apiKey: "your-api-key",
  model: "claude-3-haiku-20240307",
});

spyOn(model, "process").mockImplementationOnce(async function* () {
  yield textDelta({ text: "I'm Claude" });
  yield textDelta({ text: ", an AI assistant" });
  yield textDelta({ text: " created by Anthropic." });
  yield textDelta({ text: " How can I help you today?" });
  return {
    model: "claude-3-haiku-20240307",
    usage: { inputTokens: 8, outputTokens: 15 },
  };
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

expect(fullText).toBe(
  "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
);

expect(json).toEqual({
  model: "claude-3-haiku-20240307",
  usage: { inputTokens: 8, outputTokens: 15 },
});
```

#### Extends

- [`ChatModel`](chat-model.md#chatmodel)

#### Constructors

##### Constructor

> **new ClaudeChatModel**(`options?`): [`ClaudeChatModel`](#claudechatmodel)

###### Parameters

| Parameter  | Type                                                  |
| ---------- | ----------------------------------------------------- |
| `options?` | [`ClaudeChatModelOptions`](#claudechatmodeloptions-1) |

###### Returns

[`ClaudeChatModel`](#claudechatmodel)

###### Overrides

[`ChatModel`](chat-model.md#chatmodel).[`constructor`](chat-model.md#chatmodel#constructor)

#### Properties

| Property                                                           | Type                                                                                                                                                                                                                                                                         | Default value | Description                                                                                                                                                             | Inherited from                                                                                                          |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| <a id="_client"></a> `_client?`                                    | `Anthropic`                                                                                                                                                                                                                                                                  | `undefined`   | -                                                                                                                                                                       | -                                                                                                                       |
| <a id="description"></a> `description?`                            | `string`                                                                                                                                                                                                                                                                     | `undefined`   | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              | [`ChatModel`](chat-model.md#chatmodel).[`description`](chat-model.md#chatmodel#description)                             |
| <a id="includeinputinoutput"></a> `includeInputInOutput?`          | `boolean`                                                                                                                                                                                                                                                                    | `undefined`   | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 | [`ChatModel`](chat-model.md#chatmodel).[`includeInputInOutput`](chat-model.md#chatmodel#includeinputinoutput)           |
| <a id="memory"></a> `memory?`                                      | `AgentMemory`                                                                                                                                                                                                                                                                | `undefined`   | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     | [`ChatModel`](chat-model.md#chatmodel).[`memory`](chat-model.md#chatmodel#memory)                                       |
| <a id="name"></a> `name`                                           | `string`                                                                                                                                                                                                                                                                     | `undefined`   | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               | [`ChatModel`](chat-model.md#chatmodel).[`name`](chat-model.md#chatmodel#name)                                           |
| <a id="options"></a> `options?`                                    | [`ClaudeChatModelOptions`](#claudechatmodeloptions-1)                                                                                                                                                                                                                        | `undefined`   | -                                                                                                                                                                       | -                                                                                                                       |
| <a id="publishtopic"></a> `publishTopic?`                          | [`PublishTopic`](../agents/agent.md#publishtopic-4)\<[`Message`](../agents/agent.md#message)\>                                                                                                                                                                               | `undefined`   | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          | [`ChatModel`](chat-model.md#chatmodel).[`publishTopic`](chat-model.md#chatmodel#publishtopic)                           |
| <a id="skills"></a> `skills`                                       | [`Agent`](../agents/agent.md#agent)\<[`Message`](../agents/agent.md#message), [`Message`](../agents/agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](../agents/agent.md#agent)\<[`Message`](../agents/agent.md#message), [`Message`](../agents/agent.md#message)\>; \} | `undefined`   | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents | [`ChatModel`](chat-model.md#chatmodel).[`skills`](chat-model.md#chatmodel#skills)                                       |
| <a id="subscribetopic"></a> `subscribeTopic?`                      | [`SubscribeTopic`](../agents/agent.md#subscribetopic-4)                                                                                                                                                                                                                      | `undefined`   | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         | [`ChatModel`](chat-model.md#chatmodel).[`subscribeTopic`](chat-model.md#chatmodel#subscribetopic)                       |
| <a id="supportsparalleltoolcalls"></a> `supportsParallelToolCalls` | `boolean`                                                                                                                                                                                                                                                                    | `true`        | Indicates whether the model supports parallel tool calls Defaults to true, subclasses can override this property based on specific model capabilities                   | [`ChatModel`](chat-model.md#chatmodel).[`supportsParallelToolCalls`](chat-model.md#chatmodel#supportsparalleltoolcalls) |

#### Accessors

##### client

###### Get Signature

> **get** **client**(): `Anthropic`

###### Returns

`Anthropic`

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

[`ChatModel`](chat-model.md#chatmodel).[`inputSchema`](chat-model.md#chatmodel#inputschema)

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

###### Inherited from

[`ChatModel`](chat-model.md#chatmodel).[`isInvokable`](chat-model.md#chatmodel#isinvokable)

##### modelOptions

###### Get Signature

> **get** **modelOptions**(): `undefined` \| [`ChatModelOptions`](chat-model.md#chatmodeloptions)

###### Returns

`undefined` \| [`ChatModelOptions`](chat-model.md#chatmodeloptions)

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

[`ChatModel`](chat-model.md#chatmodel).[`outputSchema`](chat-model.md#chatmodel#outputschema)

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

[`ChatModel`](chat-model.md#chatmodel).[`topic`](chat-model.md#chatmodel#topic)

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

const shutdown = spyOn(agent, "shutdown");

expect(shutdown).not.toHaveBeenCalled();
```

###### Inherited from

[`ChatModel`](chat-model.md#chatmodel).[`[asyncDispose]`](chat-model.md#chatmodel#asyncdispose)

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

###### Inherited from

[`ChatModel`](chat-model.md#chatmodel).[`[custom]`](chat-model.md#chatmodel#custom)

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

[`ChatModel`](chat-model.md#chatmodel).[`addSkill`](chat-model.md#chatmodel#addskill)

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

[`ChatModel`](chat-model.md#chatmodel).[`attach`](chat-model.md#chatmodel#attach)

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

[`ChatModel`](chat-model.md#chatmodel).[`checkAgentInvokesUsage`](chat-model.md#chatmodel#checkagentinvokesusage)

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

###### Inherited from

[`ChatModel`](chat-model.md#chatmodel).[`getModelCapabilities`](chat-model.md#chatmodel#getmodelcapabilities)

##### invoke()

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                                         | Description                                                      |
| ---------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `input`    | `string` \| [`ChatModelInput`](chat-model.md#chatmodelinput)                                 | Input message to the agent, can be a string or structured object |
| `context?` | [`Context`](../aigne.md#context)                                                             | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](../agents/agent.md#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

###### Returns

`Promise`\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>

Final JSON response

###### Example

Here's an example of invoking an agent with regular mode:

```ts
// Create a chat model
const model = new OpenAIChatModel();

spyOn(model, "process").mockReturnValueOnce(
  Promise.resolve(
    stringToAgentResponseStream("Hello, How can I assist you today?"),
  ),
);

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

expect(result).toEqual({ $message: "Hello, How can I assist you today?" });
```

###### Inherited from

[`ChatModel`](chat-model.md#chatmodel).[`invoke`](chat-model.md#chatmodel#invoke)

###### Call Signature

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](../agents/agent.md#agentresponsestream)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

Invoke the agent with streaming response

Streaming responses allow the agent to return results incrementally,
suitable for scenarios requiring real-time progress updates, such as
chat bot typing effects.

###### Parameters

| Parameter           | Type                                                         | Description                                                      |
| ------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `input`             | `string` \| [`ChatModelInput`](chat-model.md#chatmodelinput) | Input message to the agent, can be a string or structured object |
| `context`           | `undefined` \| [`Context`](../aigne.md#context)              | Execution context, providing environment and resource access     |
| `options`           | \{ `streaming`: `true`; \}                                   | Invocation options, must set streaming to true for this overload |
| `options.streaming` | `true`                                                       | -                                                                |

###### Returns

`Promise`\<[`AgentResponseStream`](../agents/agent.md#agentresponsestream)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

Streaming response object

###### Example

Here's an example of invoking an agent with streaming response:

```ts
// Create a chat model
const model = new OpenAIChatModel();

spyOn(model, "process").mockReturnValueOnce(
  Promise.resolve(
    stringToAgentResponseStream("Hello, How can I assist you today?"),
  ),
);

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

expect(chunks).toMatchSnapshot();
```

###### Inherited from

[`ChatModel`](chat-model.md#chatmodel).[`invoke`](chat-model.md#chatmodel#invoke)

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](../agents/agent.md#agentresponse)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                                          | Description                |
| ---------- | ------------------------------------------------------------- | -------------------------- |
| `input`    | `string` \| [`ChatModelInput`](chat-model.md#chatmodelinput)  | Input message to the agent |
| `context?` | [`Context`](../aigne.md#context)                              | Execution context          |
| `options?` | [`AgentInvokeOptions`](../agents/agent.md#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](../agents/agent.md#agentresponse)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

Agent response (streaming or regular)

###### Inherited from

[`ChatModel`](chat-model.md#chatmodel).[`invoke`](chat-model.md#chatmodel#invoke)

##### postprocess()

> `protected` **postprocess**(`input`, `output`, `context`): `void`

Performs postprocessing operations after handling output

Primarily updates token usage statistics in the context

###### Parameters

| Parameter | Type                                               | Description       |
| --------- | -------------------------------------------------- | ----------------- |
| `input`   | [`ChatModelInput`](chat-model.md#chatmodelinput)   | Input message     |
| `output`  | [`ChatModelOutput`](chat-model.md#chatmodeloutput) | Output message    |
| `context` | [`Context`](../aigne.md#context)                   | Execution context |

###### Returns

`void`

###### Inherited from

[`ChatModel`](chat-model.md#chatmodel).[`postprocess`](chat-model.md#chatmodel#postprocess)

##### preprocess()

> `protected` **preprocess**(`input`, `context`): `void`

Performs preprocessing operations before handling input

Primarily checks if token usage exceeds limits, throwing an exception if limits are exceeded

###### Parameters

| Parameter | Type                                             | Description       |
| --------- | ------------------------------------------------ | ----------------- |
| `input`   | [`ChatModelInput`](chat-model.md#chatmodelinput) | Input message     |
| `context` | [`Context`](../aigne.md#context)                 | Execution context |

###### Returns

`void`

###### Throws

Error if token usage exceeds maximum limit

###### Inherited from

[`ChatModel`](chat-model.md#chatmodel).[`preprocess`](chat-model.md#chatmodel#preprocess)

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

const shutdown = spyOn(agent, "shutdown");

await agent.shutdown();

expect(shutdown).toHaveBeenCalled();
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

const shutdown = spyOn(agent, "shutdown");

expect(shutdown).not.toHaveBeenCalled();
```

###### Inherited from

[`ChatModel`](chat-model.md#chatmodel).[`shutdown`](chat-model.md#chatmodel#shutdown)

## Interfaces

### ClaudeChatModelOptions

Configuration options for Claude Chat Model

#### Properties

| Property                                    | Type                                                 | Description                                                                                                                    |
| ------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| <a id="apikey"></a> `apiKey?`               | `string`                                             | API key for Anthropic's Claude API If not provided, will look for ANTHROPIC_API_KEY or CLAUDE_API_KEY in environment variables |
| <a id="model"></a> `model?`                 | `string`                                             | Claude model to use Defaults to 'claude-3-7-sonnet-latest'                                                                     |
| <a id="modeloptions-1"></a> `modelOptions?` | [`ChatModelOptions`](chat-model.md#chatmodeloptions) | Additional model options to control behavior                                                                                   |

## Variables

### claudeChatModelOptionsSchema

> `const` **claudeChatModelOptionsSchema**: `ZodObject`\<\{ `apiKey`: `ZodOptional`\<`ZodString`\>; `model`: `ZodOptional`\<`ZodString`\>; `modelOptions`: `ZodOptional`\<`ZodObject`\<\{ `frequencyPenalty`: `ZodOptional`\<`ZodNumber`\>; `model`: `ZodOptional`\<`ZodString`\>; `parallelToolCalls`: `ZodDefault`\<`ZodOptional`\<`ZodBoolean`\>\>; `presencePenalty`: `ZodOptional`\<`ZodNumber`\>; `temperature`: `ZodOptional`\<`ZodNumber`\>; `topP`: `ZodOptional`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `frequencyPenalty?`: `number`; `model?`: `string`; `parallelToolCalls`: `boolean`; `presencePenalty?`: `number`; `temperature?`: `number`; `topP?`: `number`; \}, \{ `frequencyPenalty?`: `number`; `model?`: `string`; `parallelToolCalls?`: `boolean`; `presencePenalty?`: `number`; `temperature?`: `number`; `topP?`: `number`; \}\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `apiKey?`: `string`; `model?`: `string`; `modelOptions?`: \{ `frequencyPenalty?`: `number`; `model?`: `string`; `parallelToolCalls`: `boolean`; `presencePenalty?`: `number`; `temperature?`: `number`; `topP?`: `number`; \}; \}, \{ `apiKey?`: `string`; `model?`: `string`; `modelOptions?`: \{ `frequencyPenalty?`: `number`; `model?`: `string`; `parallelToolCalls?`: `boolean`; `presencePenalty?`: `number`; `temperature?`: `number`; `topP?`: `number`; \}; \}\>
