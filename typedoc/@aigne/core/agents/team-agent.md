[Documentation](../../../README.md) / [@aigne/core](../README.md) / agents/team-agent

# agents/team-agent

## Enumerations

### ProcessMode

Defines the processing modes available for a TeamAgent.

The processing mode determines how the agents within a team are executed
and how their outputs are combined.

#### Enumeration Members

| Enumeration Member                   | Value          | Description                                                                                                                                                                                                                  |
| ------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="parallel"></a> `parallel`     | `"parallel"`   | Process all agents in parallel, merging the output of all agents. In parallel mode, all agents execute simultaneously, each receiving the same initial input. Their outputs are then combined based on output key ownership. |
| <a id="sequential"></a> `sequential` | `"sequential"` | Process the agents one by one, passing the output of each agent to the next. In sequential mode, agents execute in order, with each agent receiving the combined output from all previous agents as part of its input.       |

## Classes

### TeamAgent\<I, O\>

TeamAgent coordinates a group of agents working together to accomplish tasks.

A TeamAgent manages a collection of agents (its skills) and orchestrates their
execution according to a specified processing mode. It provides mechanisms for
agents to work either sequentially (one after another) or in parallel (all at once),
with appropriate handling of their outputs.

TeamAgent is particularly useful for:

- Creating agent workflows where output from one agent feeds into another
- Executing multiple agents simultaneously and combining their results
- Building complex agent systems with specialized components working together

#### Example

Here's an example of creating a sequential TeamAgent:

```ts
// Create individual specialized agents
const translatorAgent = FunctionAgent.from({
  name: "translator",
  process: (input: Message) => ({
    translation: `${input.text} (translation)`,
  }),
});

const formatterAgent = FunctionAgent.from({
  name: "formatter",
  process: (input: Message) => ({
    formatted: `[formatted] ${input.translation || input.text}`,
  }),
});

// Create a sequential TeamAgent with specialized agents
const teamAgent = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, formatterAgent],
});

const result = await teamAgent.invoke({ text: "Hello world" });

console.log(result);

// Expected output: {
//   translation: "Hello world (translation)",
//   formatted: "[formatted] Hello world (translation)"
// }
```

#### Extends

- [`Agent`](agent.md#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

#### Constructors

##### Constructor

> **new TeamAgent**\<`I`, `O`\>(`options`): [`TeamAgent`](#teamagent)\<`I`, `O`\>

Create a new TeamAgent instance.

###### Parameters

| Parameter | Type                                                | Description                             |
| --------- | --------------------------------------------------- | --------------------------------------- |
| `options` | [`TeamAgentOptions`](#teamagentoptions)\<`I`, `O`\> | Configuration options for the TeamAgent |

###### Returns

[`TeamAgent`](#teamagent)\<`I`, `O`\>

###### Overrides

[`Agent`](agent.md#agent).[`constructor`](agent.md#agent#constructor)

#### Properties

| Property                                                  | Type                                                                                                                                                                                                             | Description                                                                                                                                                             | Inherited from                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| <a id="description"></a> `description?`                   | `string`                                                                                                                                                                                                         | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              | [`Agent`](agent.md#agent).[`description`](agent.md#agent#description)                   |
| <a id="includeinputinoutput"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                                                                        | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 | [`Agent`](agent.md#agent).[`includeInputInOutput`](agent.md#agent#includeinputinoutput) |
| <a id="memory"></a> `memory?`                             | `AgentMemory`                                                                                                                                                                                                    | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     | [`Agent`](agent.md#agent).[`memory`](agent.md#agent#memory)                             |
| <a id="mode"></a> `mode`                                  | [`ProcessMode`](#processmode)                                                                                                                                                                                    | The processing mode that determines how agents in the team are executed. This can be either sequential (one after another) or parallel (all at once).                   | -                                                                                       |
| <a id="name"></a> `name`                                  | `string`                                                                                                                                                                                                         | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               | [`Agent`](agent.md#agent).[`name`](agent.md#agent#name)                                 |
| <a id="publishtopic"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>                                                                                                                                       | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          | [`Agent`](agent.md#agent).[`publishTopic`](agent.md#agent#publishtopic)                 |
| <a id="skills"></a> `skills`                              | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>; \} | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents | [`Agent`](agent.md#agent).[`skills`](agent.md#agent#skills)                             |
| <a id="subscribetopic"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                                                                    | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         | [`Agent`](agent.md#agent).[`subscribeTopic`](agent.md#agent#subscribetopic)             |

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

[`Agent`](agent.md#agent).[`inputSchema`](agent.md#agent#inputschema)

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

###### Inherited from

[`Agent`](agent.md#agent).[`isInvokable`](agent.md#agent#isinvokable)

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

[`Agent`](agent.md#agent).[`outputSchema`](agent.md#agent#outputschema)

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

[`Agent`](agent.md#agent).[`topic`](agent.md#agent#topic)

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

[`Agent`](agent.md#agent).[`[asyncDispose]`](agent.md#agent#asyncdispose)

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

###### Inherited from

[`Agent`](agent.md#agent).[`[custom]`](agent.md#agent#custom)

##### addSkill()

> **addSkill**(...`skills`): `void`

Add skills (other agents or functions) to this agent

Skills allow agents to reuse functionality from other agents,
building more complex behaviors.

###### Parameters

| Parameter   | Type                                                                                                                                                           | Description                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| ...`skills` | ([`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`FunctionAgentFn`](agent.md#functionagentfn)\<`any`, `any`\>)[] | List of skills to add, can be Agent instances or functions |

###### Returns

`void`

###### Inherited from

[`Agent`](agent.md#agent).[`addSkill`](agent.md#agent#addskill)

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

[`Agent`](agent.md#agent).[`attach`](agent.md#agent#attach)

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

[`Agent`](agent.md#agent).[`checkAgentInvokesUsage`](agent.md#agent#checkagentinvokesusage)

##### invoke()

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<`O`\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                               | Description                                                      |
| ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `input`    | `string` \| `I`                                                                    | Input message to the agent, can be a string or structured object |
| `context?` | [`Context`](../aigne.md#context)                                                   | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

###### Returns

`Promise`\<`O`\>

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

[`Agent`](agent.md#agent).[`invoke`](agent.md#agent#invoke)

###### Call Signature

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<`O`\>\>

Invoke the agent with streaming response

Streaming responses allow the agent to return results incrementally,
suitable for scenarios requiring real-time progress updates, such as
chat bot typing effects.

###### Parameters

| Parameter           | Type                                            | Description                                                      |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `input`             | `string` \| `I`                                 | Input message to the agent, can be a string or structured object |
| `context`           | `undefined` \| [`Context`](../aigne.md#context) | Execution context, providing environment and resource access     |
| `options`           | \{ `streaming`: `true`; \}                      | Invocation options, must set streaming to true for this overload |
| `options.streaming` | `true`                                          | -                                                                |

###### Returns

`Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<`O`\>\>

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

[`Agent`](agent.md#agent).[`invoke`](agent.md#agent#invoke)

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](agent.md#agentresponse)\<`O`\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                                | Description                |
| ---------- | --------------------------------------------------- | -------------------------- |
| `input`    | `string` \| `I`                                     | Input message to the agent |
| `context?` | [`Context`](../aigne.md#context)                    | Execution context          |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](agent.md#agentresponse)\<`O`\>\>

Agent response (streaming or regular)

###### Inherited from

[`Agent`](agent.md#agent).[`invoke`](agent.md#agent#invoke)

##### postprocess()

> `protected` **postprocess**(`input`, `output`, `context`): `void`

Post-processing operations after handling output

Operations performed after the agent produces output, including:

- Checking context status
- Adding interaction records to memory

###### Parameters

| Parameter | Type                             | Description       |
| --------- | -------------------------------- | ----------------- |
| `input`   | `I`                              | Input message     |
| `output`  | `O`                              | Output message    |
| `context` | [`Context`](../aigne.md#context) | Execution context |

###### Returns

`void`

###### Inherited from

[`Agent`](agent.md#agent).[`postprocess`](agent.md#agent#postprocess)

##### preprocess()

> `protected` **preprocess**(`_`, `context`): `void`

Pre-processing operations before handling input

Preparatory work done before executing the agent's main processing logic, including:

- Checking context status
- Verifying invocation limits

###### Parameters

| Parameter | Type                             | Description            |
| --------- | -------------------------------- | ---------------------- |
| `_`       | `I`                              | Input message (unused) |
| `context` | [`Context`](../aigne.md#context) | Execution context      |

###### Returns

`void`

###### Inherited from

[`Agent`](agent.md#agent).[`preprocess`](agent.md#agent#preprocess)

##### process()

> **process**(`input`, `context`): `PromiseOrValue`\<[`AgentProcessResult`](agent.md#agentprocessresult)\<`O`\>\>

Process an input message by routing it through the team's agents.

Depending on the team's processing mode, this will either:

- In sequential mode: Pass input through each agent in sequence, with each agent
  receiving the combined output from previous agents
- In parallel mode: Process input through all agents simultaneously and combine their outputs

###### Parameters

| Parameter | Type                             | Description            |
| --------- | -------------------------------- | ---------------------- |
| `input`   | `I`                              | The message to process |
| `context` | [`Context`](../aigne.md#context) | The execution context  |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](agent.md#agentprocessresult)\<`O`\>\>

A stream of message chunks that collectively form the response

###### Overrides

[`Agent`](agent.md#agent).[`process`](agent.md#agent#process)

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

[`Agent`](agent.md#agent).[`shutdown`](agent.md#agent#shutdown)

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`TeamAgent`](#teamagent)\<`I`, `O`\>

Create a TeamAgent from the provided options.

###### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

###### Parameters

| Parameter | Type                                                | Description                             |
| --------- | --------------------------------------------------- | --------------------------------------- |
| `options` | [`TeamAgentOptions`](#teamagentoptions)\<`I`, `O`\> | Configuration options for the TeamAgent |

###### Returns

[`TeamAgent`](#teamagent)\<`I`, `O`\>

A new TeamAgent instance

###### Examples

Here's an example of creating a sequential TeamAgent:

```ts
// Create individual specialized agents
const translatorAgent = FunctionAgent.from({
  name: "translator",
  process: (input: Message) => ({
    translation: `${input.text} (translation)`,
  }),
});

const formatterAgent = FunctionAgent.from({
  name: "formatter",
  process: (input: Message) => ({
    formatted: `[formatted] ${input.translation || input.text}`,
  }),
});

// Create a sequential TeamAgent with specialized agents
const teamAgent = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, formatterAgent],
});

const result = await teamAgent.invoke({ text: "Hello world" });

console.log(result);

// Expected output: {
//   translation: "Hello world (translation)",
//   formatted: "[formatted] Hello world (translation)"
// }
```

Here's an example of creating a parallel TeamAgent:

```ts
const googleSearch = FunctionAgent.from({
  name: "google-search",
  process: (input: Message) => ({
    googleResults: `Google search results for ${input.query}`,
  }),
});

const braveSearch = FunctionAgent.from({
  name: "brave-search",
  process: (input: Message) => ({
    braveResults: `Brave search results for ${input.query}`,
  }),
});

const teamAgent = TeamAgent.from({
  name: "parallel-team",
  mode: ProcessMode.parallel,
  skills: [googleSearch, braveSearch],
});

const result = await teamAgent.invoke({ query: "AI news" });

console.log(result);

// Expected output: {
//   googleResults: "Google search results for AI news",
//   braveResults: "Brave search results for AI news"
// }
```

## Interfaces

### TeamAgentOptions\<I, O\>

Configuration options for creating a TeamAgent.

These options extend the base AgentOptions and add team-specific settings.

#### Extends

- [`AgentOptions`](agent.md#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

#### Properties

| Property                                                    | Type                                                                                                                                                           | Description                                                                                                                                           | Inherited from                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <a id="description-1"></a> `description?`                   | `string`                                                                                                                                                       | Description of the agent A human-readable description of what the agent does, useful for documentation and debugging                                  | [`AgentOptions`](agent.md#agentoptions).[`description`](agent.md#agentoptions#description-2)                   |
| <a id="disableevents"></a> `disableEvents?`                 | `boolean`                                                                                                                                                      | Whether to disable emitting events for agent actions When true, the agent won't emit events like agentStarted, agentSucceed, or agentFailed           | [`AgentOptions`](agent.md#agentoptions).[`disableEvents`](agent.md#agentoptions#disableevents)                 |
| <a id="includeinputinoutput-1"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                      | Whether to include input in the output When true, the agent will merge input fields into the output object                                            | [`AgentOptions`](agent.md#agentoptions).[`includeInputInOutput`](agent.md#agentoptions#includeinputinoutput-2) |
| <a id="inputschema-1"></a> `inputSchema?`                   | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<`I`\>                                                                                             | Zod schema defining the input message structure Used to validate that input messages conform to the expected format                                   | [`AgentOptions`](agent.md#agentoptions).[`inputSchema`](agent.md#agentoptions#inputschema-2)                   |
| <a id="memory-1"></a> `memory?`                             | `boolean` \| `AgentMemory` \| `AgentMemoryOptions`                                                                                                             | Memory configuration for the agent Can be an AgentMemory instance, configuration options, or simply a boolean to enable/disable with default settings | [`AgentOptions`](agent.md#agentoptions).[`memory`](agent.md#agentoptions#memory-2)                             |
| <a id="mode-1"></a> `mode?`                                 | [`ProcessMode`](#processmode)                                                                                                                                  | The method to process the agents in the team. **Default** `{ProcessMode.sequential}`                                                                  | -                                                                                                              |
| <a id="name-1"></a> `name?`                                 | `string`                                                                                                                                                       | Name of the agent Used for identification and logging. Defaults to the constructor name if not specified                                              | [`AgentOptions`](agent.md#agentoptions).[`name`](agent.md#agentoptions#name-2)                                 |
| <a id="outputschema-1"></a> `outputSchema?`                 | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<`O`\>                                                                                             | Zod schema defining the output message structure Used to validate that output messages conform to the expected format                                 | [`AgentOptions`](agent.md#agentoptions).[`outputSchema`](agent.md#agentoptions#outputschema-2)                 |
| <a id="publishtopic-1"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<`O`\>                                                                                                               | Topics the agent should publish to These topics determine where the agent's output messages will be sent in the system                                | [`AgentOptions`](agent.md#agentoptions).[`publishTopic`](agent.md#agentoptions#publishtopic-2)                 |
| <a id="skills-1"></a> `skills?`                             | ([`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`FunctionAgentFn`](agent.md#functionagentfn)\<`any`, `any`\>)[] | List of skills (other agents or functions) this agent has These skills can be used by the agent to delegate tasks or extend its capabilities          | [`AgentOptions`](agent.md#agentoptions).[`skills`](agent.md#agentoptions#skills-2)                             |
| <a id="subscribetopic-1"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                  | Topics the agent should subscribe to These topics determine which messages the agent will receive from the system                                     | [`AgentOptions`](agent.md#agentoptions).[`subscribeTopic`](agent.md#agentoptions#subscribetopic-2)             |
