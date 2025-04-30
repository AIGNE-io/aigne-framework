[Documentation](../../../README.md) / [@aigne/core](../README.md) / models/xai-chat-model

# models/xai-chat-model

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

for await (const chunk of readableStreamToAsyncIterator(stream)) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}

console.log(fullText); // Output: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!"

console.log(json); // { model: "grok-2-latest", usage: { inputTokens: 6, outputTokens: 17 } }
```

#### Extends

- [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel)

#### Constructors

##### Constructor

> **new XAIChatModel**(`options?`): [`XAIChatModel`](#xaichatmodel)

###### Parameters

| Parameter  | Type                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| `options?` | [`OpenAIChatModelOptions`](openai-chat-model.md#openaichatmodeloptions-1) |

###### Returns

[`XAIChatModel`](#xaichatmodel)

###### Overrides

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`constructor`](openai-chat-model.md#openaichatmodel#constructor)

#### Properties

| Property                                                                       | Type                                                                                                                                                                                                                                                                         | Default value   | Description                                                                                                                                                             | Overrides                                                                                                                       | Inherited from                                                                                                                                                      |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="_client"></a> `_client?`                                                | `OpenAI`                                                                                                                                                                                                                                                                     | `undefined`     | -                                                                                                                                                                       | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`_client`](openai-chat-model.md#openaichatmodel#_client)                                                 |
| <a id="apikeydefault"></a> `apiKeyDefault`                                     | `undefined` \| `string`                                                                                                                                                                                                                                                      | `undefined`     | -                                                                                                                                                                       | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`apiKeyDefault`](openai-chat-model.md#openaichatmodel#apikeydefault)                                     |
| <a id="apikeyenvname"></a> `apiKeyEnvName`                                     | `string`                                                                                                                                                                                                                                                                     | `"XAI_API_KEY"` | -                                                                                                                                                                       | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`apiKeyEnvName`](openai-chat-model.md#openaichatmodel#apikeyenvname) | -                                                                                                                                                                   |
| <a id="description"></a> `description?`                                        | `string`                                                                                                                                                                                                                                                                     | `undefined`     | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`description`](openai-chat-model.md#openaichatmodel#description)                                         |
| <a id="includeinputinoutput"></a> `includeInputInOutput?`                      | `boolean`                                                                                                                                                                                                                                                                    | `undefined`     | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`includeInputInOutput`](openai-chat-model.md#openaichatmodel#includeinputinoutput)                       |
| <a id="memory"></a> `memory?`                                                  | `AgentMemory`                                                                                                                                                                                                                                                                | `undefined`     | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`memory`](openai-chat-model.md#openaichatmodel#memory)                                                   |
| <a id="name"></a> `name`                                                       | `string`                                                                                                                                                                                                                                                                     | `undefined`     | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`name`](openai-chat-model.md#openaichatmodel#name)                                                       |
| <a id="options"></a> `options?`                                                | [`OpenAIChatModelOptions`](openai-chat-model.md#openaichatmodeloptions-1)                                                                                                                                                                                                    | `undefined`     | -                                                                                                                                                                       | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`options`](openai-chat-model.md#openaichatmodel#options)                                                 |
| <a id="publishtopic"></a> `publishTopic?`                                      | [`PublishTopic`](../agents/agent.md#publishtopic-4)\<[`Message`](../agents/agent.md#message)\>                                                                                                                                                                               | `undefined`     | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`publishTopic`](openai-chat-model.md#openaichatmodel#publishtopic)                                       |
| <a id="skills"></a> `skills`                                                   | [`Agent`](../agents/agent.md#agent)\<[`Message`](../agents/agent.md#message), [`Message`](../agents/agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](../agents/agent.md#agent)\<[`Message`](../agents/agent.md#message), [`Message`](../agents/agent.md#message)\>; \} | `undefined`     | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`skills`](openai-chat-model.md#openaichatmodel#skills)                                                   |
| <a id="subscribetopic"></a> `subscribeTopic?`                                  | [`SubscribeTopic`](../agents/agent.md#subscribetopic-4)                                                                                                                                                                                                                      | `undefined`     | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`subscribeTopic`](openai-chat-model.md#openaichatmodel#subscribetopic)                                   |
| <a id="supportsendwithsystemmessage"></a> `supportsEndWithSystemMessage`       | `boolean`                                                                                                                                                                                                                                                                    | `true`          | -                                                                                                                                                                       | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsEndWithSystemMessage`](openai-chat-model.md#openaichatmodel#supportsendwithsystemmessage)       |
| <a id="supportsnativestructuredoutputs"></a> `supportsNativeStructuredOutputs` | `boolean`                                                                                                                                                                                                                                                                    | `true`          | -                                                                                                                                                                       | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsNativeStructuredOutputs`](openai-chat-model.md#openaichatmodel#supportsnativestructuredoutputs) |
| <a id="supportsparalleltoolcalls"></a> `supportsParallelToolCalls`             | `boolean`                                                                                                                                                                                                                                                                    | `true`          | Indicates whether the model supports parallel tool calls Defaults to true, subclasses can override this property based on specific model capabilities                   | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsParallelToolCalls`](openai-chat-model.md#openaichatmodel#supportsparalleltoolcalls)             |
| <a id="supportstemperature"></a> `supportsTemperature`                         | `boolean`                                                                                                                                                                                                                                                                    | `true`          | -                                                                                                                                                                       | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsTemperature`](openai-chat-model.md#openaichatmodel#supportstemperature)                         |
| <a id="supportstoolsemptyparameters"></a> `supportsToolsEmptyParameters`       | `boolean`                                                                                                                                                                                                                                                                    | `true`          | -                                                                                                                                                                       | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsToolsEmptyParameters`](openai-chat-model.md#openaichatmodel#supportstoolsemptyparameters)       |
| <a id="supportstoolsusewithjsonschema"></a> `supportsToolsUseWithJsonSchema`   | `boolean`                                                                                                                                                                                                                                                                    | `true`          | -                                                                                                                                                                       | -                                                                                                                               | [`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`supportsToolsUseWithJsonSchema`](openai-chat-model.md#openaichatmodel#supportstoolsusewithjsonschema)   |

#### Accessors

##### client

###### Get Signature

> **get** **client**(): `OpenAI`

###### Returns

`OpenAI`

###### Inherited from

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`client`](openai-chat-model.md#openaichatmodel#client)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`inputSchema`](openai-chat-model.md#openaichatmodel#inputschema)

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

###### Inherited from

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`isInvokable`](openai-chat-model.md#openaichatmodel#isinvokable)

##### modelOptions

###### Get Signature

> **get** **modelOptions**(): `undefined` \| [`ChatModelOptions`](chat-model.md#chatmodeloptions)

###### Returns

`undefined` \| [`ChatModelOptions`](chat-model.md#chatmodeloptions)

###### Inherited from

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`modelOptions`](openai-chat-model.md#openaichatmodel#modeloptions)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`outputSchema`](openai-chat-model.md#openaichatmodel#outputschema)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`topic`](openai-chat-model.md#openaichatmodel#topic)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`[asyncDispose]`](openai-chat-model.md#openaichatmodel#asyncdispose)

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

###### Inherited from

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`[custom]`](openai-chat-model.md#openaichatmodel#custom)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`addSkill`](openai-chat-model.md#openaichatmodel#addskill)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`attach`](openai-chat-model.md#openaichatmodel#attach)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`checkAgentInvokesUsage`](openai-chat-model.md#openaichatmodel#checkagentinvokesusage)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`getModelCapabilities`](openai-chat-model.md#openaichatmodel#getmodelcapabilities)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`invoke`](openai-chat-model.md#openaichatmodel#invoke)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`invoke`](openai-chat-model.md#openaichatmodel#invoke)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`invoke`](openai-chat-model.md#openaichatmodel#invoke)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`postprocess`](openai-chat-model.md#openaichatmodel#postprocess)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`preprocess`](openai-chat-model.md#openaichatmodel#preprocess)

##### process()

> **process**(`input`): `PromiseOrValue`\<[`AgentProcessResult`](../agents/agent.md#agentprocessresult)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

Process the input and generate a response

###### Parameters

| Parameter | Type                                             | Description          |
| --------- | ------------------------------------------------ | -------------------- |
| `input`   | [`ChatModelInput`](chat-model.md#chatmodelinput) | The input to process |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](../agents/agent.md#agentprocessresult)\<[`ChatModelOutput`](chat-model.md#chatmodeloutput)\>\>

The generated response

###### Inherited from

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`process`](openai-chat-model.md#openaichatmodel#process)

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

[`OpenAIChatModel`](openai-chat-model.md#openaichatmodel).[`shutdown`](openai-chat-model.md#openaichatmodel#shutdown)
