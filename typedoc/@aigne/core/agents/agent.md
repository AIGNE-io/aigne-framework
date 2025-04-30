[Documentation](../../../README.md) / [@aigne/core](../README.md) / agents/agent

# agents/agent

## Classes

### `abstract` Agent\<I, O\>

Agent is the base class for all agents.
It provides a mechanism for defining input/output schemas and implementing processing logic,
serving as the foundation of the entire agent system.

By extending the Agent class and implementing the process method, you can create custom agents
with various capabilities:

- Process structured input and output data
- Validate data formats using schemas
- Communicate between agents through contexts
- Support streaming or non-streaming responses
- Maintain memory of past interactions
- Output in multiple formats (JSON/text)
- Forward tasks to other agents

#### Example

Here's an example of how to create a custom agent:

```ts
class MyAgent extends Agent {
  process(input: Message): Message {
    console.log(input);
    return {
      text: "Hello, How can I assist you today?",
    };
  }
}

const agent = new MyAgent();

const result = await agent.invoke("hello");

console.log(result); // { text: "Hello, How can I assist you today?" }

expect(result).toEqual({ text: "Hello, How can I assist you today?" });
```

#### Extended by

- [`FunctionAgent`](#functionagent)
- [`AIAgent`](ai-agent.md#aiagent)
- [`MCPAgent`](mcp-agent.md#mcpagent)
- [`MCPBase`](mcp-agent.md#mcpbase)
- [`TeamAgent`](team-agent.md#teamagent)
- [`UserAgent`](user-agent.md#useragent)
- [`ChatModel`](../models/chat-model.md#chatmodel)

#### Type Parameters

| Type Parameter                      | Default type          | Description                               |
| ----------------------------------- | --------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | The output message type the agent returns |

#### Constructors

##### Constructor

> **new Agent**\<`I`, `O`\>(`options`): [`Agent`](#agent)\<`I`, `O`\>

###### Parameters

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `options` | [`AgentOptions`](#agentoptions)\<`I`, `O`\> |

###### Returns

[`Agent`](#agent)\<`I`, `O`\>

#### Properties

| Property                                                  | Type                                                                                                                                                             | Description                                                                                                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="description"></a> `description?`                   | `string`                                                                                                                                                         | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              |
| <a id="includeinputinoutput"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                        | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 |
| <a id="memory"></a> `memory?`                             | `AgentMemory`                                                                                                                                                    | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     |
| <a id="name"></a> `name`                                  | `string`                                                                                                                                                         | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               |
| <a id="publishtopic"></a> `publishTopic?`                 | [`PublishTopic`](#publishtopic-4)\<[`Message`](#message)\>                                                                                                       | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          |
| <a id="skills"></a> `skills`                              | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[] & \{[`key`: `string`]: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>; \} | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents |
| <a id="subscribetopic"></a> `subscribeTopic?`             | [`SubscribeTopic`](#subscribetopic-4)                                                                                                                            | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         |

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

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

##### outputSchema

###### Get Signature

> **get** **outputSchema**(): `ZodType`\<`O`\>

Get the output data schema for this agent

Used to validate that output messages conform to required format
If no output schema is set, returns an empty object schema by default

###### Returns

`ZodType`\<`O`\>

The Zod type definition for output data

##### topic

###### Get Signature

> **get** **topic**(): `string`

Default topic this agent subscribes to

Each agent has a default topic in the format "$agent\_[agent name]"
The agent automatically subscribes to this topic to receive messages

###### Returns

`string`

The default topic string

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

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

##### addSkill()

> **addSkill**(...`skills`): `void`

Add skills (other agents or functions) to this agent

Skills allow agents to reuse functionality from other agents,
building more complex behaviors.

###### Parameters

| Parameter   | Type                                                                                                                           | Description                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| ...`skills` | ([`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| [`FunctionAgentFn`](#functionagentfn)\<`any`, `any`\>)[] | List of skills to add, can be Agent instances or functions |

###### Returns

`void`

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

##### invoke()

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<`O`\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                       | Description                                                      |
| ---------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `input`    | `string` \| `I`                                                            | Input message to the agent, can be a string or structured object |
| `context?` | [`Context`](../aigne.md#context)                                           | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

###### Returns

`Promise`\<`O`\>

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

###### Call Signature

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>

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

`Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>

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

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](#agentresponse)\<`O`\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                        | Description                |
| ---------- | ------------------------------------------- | -------------------------- |
| `input`    | `string` \| `I`                             | Input message to the agent |
| `context?` | [`Context`](../aigne.md#context)            | Execution context          |
| `options?` | [`AgentInvokeOptions`](#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](#agentresponse)\<`O`\>\>

Agent response (streaming or regular)

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

##### process()

> `abstract` **process**(`input`, `context`): `PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Core processing method of the agent, must be implemented in subclasses

This is the main functionality implementation of the agent, processing input and
generating output. Can return various types of results:

- Regular object response
- Streaming response
- Async generator
- Another agent instance (transfer agent)

###### Parameters

| Parameter | Type                             | Description       |
| --------- | -------------------------------- | ----------------- |
| `input`   | `I`                              | Input message     |
| `context` | [`Context`](../aigne.md#context) | Execution context |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

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

expect(result).toEqual({
  text: expect.stringContaining("Hello, I received your message:"),
  confidence: 0.95,
  timestamp: expect.any(String),
});
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

expect(fullText).toBe("Hello, This is...");
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

expect(message).toEqual(["This", ",", " ", "This", " ", "is", "..."]);

expect(json).toEqual({ time: expect.any(String) });
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

expect(result).toEqual({
  response: "This is a specialist response",
  expertise: "technical",
});
```

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

---

### FunctionAgent\<I, O\>

Function agent class, implements agent logic through a function

Provides a convenient way to create agents using functions without
needing to extend the Agent class

#### Example

Here's an example of creating a function agent:

```ts
const agent = FunctionAgent.from(({ name }: { name: string }) => {
  return {
    greeting: `Hello, ${name}!`,
  };
});

const result = await agent.invoke({ name: "Alice" });

console.log(result); // Output: { greeting: "Hello, Alice!" }

expect(result).toEqual({ greeting: "Hello, Alice!" });
```

#### Extends

- [`Agent`](#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                      | Default type          | Description               |
| ----------------------------------- | --------------------- | ------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | Agent input message type  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | Agent output message type |

#### Constructors

##### Constructor

> **new FunctionAgent**\<`I`, `O`\>(`options`): [`FunctionAgent`](#functionagent)\<`I`, `O`\>

Create a function agent instance

###### Parameters

| Parameter | Type                                                        | Description                          |
| --------- | ----------------------------------------------------------- | ------------------------------------ |
| `options` | [`FunctionAgentOptions`](#functionagentoptions)\<`I`, `O`\> | Function agent configuration options |

###### Returns

[`FunctionAgent`](#functionagent)\<`I`, `O`\>

###### Overrides

[`Agent`](#agent).[`constructor`](#constructor)

#### Properties

| Property                                                    | Type                                                                                                                                                             | Description                                                                                                                                                             | Inherited from                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| <a id="description-1"></a> `description?`                   | `string`                                                                                                                                                         | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              | [`Agent`](#agent).[`description`](#description)                   |
| <a id="includeinputinoutput-1"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                        | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 | [`Agent`](#agent).[`includeInputInOutput`](#includeinputinoutput) |
| <a id="memory-1"></a> `memory?`                             | `AgentMemory`                                                                                                                                                    | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     | [`Agent`](#agent).[`memory`](#memory)                             |
| <a id="name-1"></a> `name`                                  | `string`                                                                                                                                                         | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               | [`Agent`](#agent).[`name`](#name)                                 |
| <a id="publishtopic-1"></a> `publishTopic?`                 | [`PublishTopic`](#publishtopic-4)\<[`Message`](#message)\>                                                                                                       | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          | [`Agent`](#agent).[`publishTopic`](#publishtopic)                 |
| <a id="skills-1"></a> `skills`                              | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[] & \{[`key`: `string`]: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>; \} | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents | [`Agent`](#agent).[`skills`](#skills)                             |
| <a id="subscribetopic-1"></a> `subscribeTopic?`             | [`SubscribeTopic`](#subscribetopic-4)                                                                                                                            | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         | [`Agent`](#agent).[`subscribeTopic`](#subscribetopic)             |

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

[`Agent`](#agent).[`inputSchema`](#inputschema)

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

###### Inherited from

[`Agent`](#agent).[`isInvokable`](#isinvokable)

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

[`Agent`](#agent).[`outputSchema`](#outputschema)

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

[`Agent`](#agent).[`topic`](#topic)

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

[`Agent`](#agent).[`[asyncDispose]`](#asyncdispose)

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

###### Inherited from

[`Agent`](#agent).[`[custom]`](#custom)

##### addSkill()

> **addSkill**(...`skills`): `void`

Add skills (other agents or functions) to this agent

Skills allow agents to reuse functionality from other agents,
building more complex behaviors.

###### Parameters

| Parameter   | Type                                                                                                                           | Description                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| ...`skills` | ([`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| [`FunctionAgentFn`](#functionagentfn)\<`any`, `any`\>)[] | List of skills to add, can be Agent instances or functions |

###### Returns

`void`

###### Inherited from

[`Agent`](#agent).[`addSkill`](#addskill)

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

[`Agent`](#agent).[`attach`](#attach)

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

[`Agent`](#agent).[`checkAgentInvokesUsage`](#checkagentinvokesusage)

##### invoke()

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<`O`\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                       | Description                                                      |
| ---------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `input`    | `string` \| `I`                                                            | Input message to the agent, can be a string or structured object |
| `context?` | [`Context`](../aigne.md#context)                                           | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

###### Returns

`Promise`\<`O`\>

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

[`Agent`](#agent).[`invoke`](#invoke)

###### Call Signature

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>

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

`Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>

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

[`Agent`](#agent).[`invoke`](#invoke)

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](#agentresponse)\<`O`\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                        | Description                |
| ---------- | ------------------------------------------- | -------------------------- |
| `input`    | `string` \| `I`                             | Input message to the agent |
| `context?` | [`Context`](../aigne.md#context)            | Execution context          |
| `options?` | [`AgentInvokeOptions`](#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](#agentresponse)\<`O`\>\>

Agent response (streaming or regular)

###### Inherited from

[`Agent`](#agent).[`invoke`](#invoke)

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

[`Agent`](#agent).[`postprocess`](#postprocess)

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

[`Agent`](#agent).[`preprocess`](#preprocess)

##### process()

> **process**(`input`, `context`): `PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Process input implementation, calls the configured processing function

###### Parameters

| Parameter | Type                             | Description       |
| --------- | -------------------------------- | ----------------- |
| `input`   | `I`                              | Input message     |
| `context` | [`Context`](../aigne.md#context) | Execution context |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Processing result

###### Overrides

[`Agent`](#agent).[`process`](#process)

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

[`Agent`](#agent).[`shutdown`](#shutdown)

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`FunctionAgent`](#functionagent)\<`I`, `O`\>

Create a function agent from a function or options

Provides a convenient factory method to create an agent directly from a function

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

###### Parameters

| Parameter | Type                                                                                                             | Description                        |
| --------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `options` | [`FunctionAgentOptions`](#functionagentoptions)\<`I`, `O`\> \| [`FunctionAgentFn`](#functionagentfn)\<`I`, `O`\> | Function agent options or function |

###### Returns

[`FunctionAgent`](#functionagent)\<`I`, `O`\>

New function agent instance

###### Examples

Here's an example of creating a function agent from a function:

```ts
const agent = FunctionAgent.from(({ a, b }: { a: number; b: number }) => {
  return { sum: a + b };
});

const result = await agent.invoke({ a: 5, b: 10 });

console.log(result); // Output: { sum: 15 }

expect(result).toEqual({ sum: 15 });
```

Here's an example of creating a function agent without basic agent options:

```ts
const agent = FunctionAgent.from(({ name }: { name: string }) => {
  return {
    greeting: `Hello, ${name}!`,
  };
});

const result = await agent.invoke({ name: "Alice" });

console.log(result); // Output: { greeting: "Hello, Alice!" }

expect(result).toEqual({ greeting: "Hello, Alice!" });
```

Here's an example of creating a function agent from a function returning a stream:

```ts
const agent = FunctionAgent.from(({ name }: { name: string }) => {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(textDelta({ text: "Hello" }));
      controller.enqueue(textDelta({ text: ", " }));
      controller.enqueue(textDelta({ text: name }));
      controller.enqueue(textDelta({ text: "!" }));
      controller.close();
    },
  });
});

const result = await agent.invoke({ name: "Alice" });

console.log(result); // Output: { text: "Hello, Alice!" }

expect(result).toEqual({ text: "Hello, Alice!" });
```

Here's an example of creating a function agent from a function returning an async generator:

```ts
const agent = FunctionAgent.from(async function* ({ name }: { name: string }) {
  yield textDelta({ text: "Hello" });
  yield textDelta({ text: ", " });
  yield textDelta({ text: name });
  yield textDelta({ text: "!" });
});

const result = await agent.invoke({ name: "Alice" });

console.log(result); // Output: { text: "Hello, Alice!" }

expect(result).toEqual({ text: "Hello, Alice!" });
```

## Interfaces

### AgentInvokeOptions

Options for invoking an agent

#### Extended by

- [`InvokeOptions`](../aigne.md#invokeoptions)
- [`AIGNEClientInvokeOptions`](../client.md#aigneclientinvokeoptions)

#### Properties

| Property                            | Type      | Description                                                                                                                                                                                                                                                                                             |
| ----------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="streaming"></a> `streaming?` | `boolean` | Whether to enable streaming response When true, the invoke method returns a ReadableStream that emits chunks of the response as they become available, allowing for real-time display of results When false or undefined, the invoke method waits for full completion and returns the final JSON result |

---

### AgentOptions\<I, O\>

Configuration options for an agent

#### Extended by

- [`FunctionAgentOptions`](#functionagentoptions)
- [`AIAgentOptions`](ai-agent.md#aiagentoptions)
- [`MCPAgentOptions`](mcp-agent.md#mcpagentoptions)
- [`MCPBaseOptions`](mcp-agent.md#mcpbaseoptions)
- [`TeamAgentOptions`](team-agent.md#teamagentoptions)
- [`UserAgentOptions`](user-agent.md#useragentoptions)

#### Type Parameters

| Type Parameter                      | Default type          | Description                   |
| ----------------------------------- | --------------------- | ----------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | The agent input message type  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | The agent output message type |

#### Properties

| Property                                                    | Type                                                                                                                           | Description                                                                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="description-2"></a> `description?`                   | `string`                                                                                                                       | Description of the agent A human-readable description of what the agent does, useful for documentation and debugging                                  |
| <a id="disableevents"></a> `disableEvents?`                 | `boolean`                                                                                                                      | Whether to disable emitting events for agent actions When true, the agent won't emit events like agentStarted, agentSucceed, or agentFailed           |
| <a id="includeinputinoutput-2"></a> `includeInputInOutput?` | `boolean`                                                                                                                      | Whether to include input in the output When true, the agent will merge input fields into the output object                                            |
| <a id="inputschema-2"></a> `inputSchema?`                   | [`AgentInputOutputSchema`](#agentinputoutputschema)\<`I`\>                                                                     | Zod schema defining the input message structure Used to validate that input messages conform to the expected format                                   |
| <a id="memory-2"></a> `memory?`                             | `boolean` \| `AgentMemory` \| `AgentMemoryOptions`                                                                             | Memory configuration for the agent Can be an AgentMemory instance, configuration options, or simply a boolean to enable/disable with default settings |
| <a id="name-2"></a> `name?`                                 | `string`                                                                                                                       | Name of the agent Used for identification and logging. Defaults to the constructor name if not specified                                              |
| <a id="outputschema-2"></a> `outputSchema?`                 | [`AgentInputOutputSchema`](#agentinputoutputschema)\<`O`\>                                                                     | Zod schema defining the output message structure Used to validate that output messages conform to the expected format                                 |
| <a id="publishtopic-2"></a> `publishTopic?`                 | [`PublishTopic`](#publishtopic-4)\<`O`\>                                                                                       | Topics the agent should publish to These topics determine where the agent's output messages will be sent in the system                                |
| <a id="skills-2"></a> `skills?`                             | ([`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| [`FunctionAgentFn`](#functionagentfn)\<`any`, `any`\>)[] | List of skills (other agents or functions) this agent has These skills can be used by the agent to delegate tasks or extend its capabilities          |
| <a id="subscribetopic-2"></a> `subscribeTopic?`             | [`SubscribeTopic`](#subscribetopic-4)                                                                                          | Topics the agent should subscribe to These topics determine which messages the agent will receive from the system                                     |

---

### AgentResponseDelta\<T\>

Incremental data structure for agent responses

Used to represent a single incremental update in a streaming response

#### Type Parameters

| Type Parameter | Description        |
| -------------- | ------------------ |
| `T`            | Response data type |

#### Properties

| Property                   | Type                                                                                                                                                                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="delta"></a> `delta` | \{ `json?`: `Partial`\<[`TransferAgentOutput`](#transferagentoutput) \| `T`\>; `text?`: `Partial`\<\{ \[key in string \| number \| symbol as Extract\<T\[key\], string\> extends string ? key : never\]: string \}\> \| `Partial`\<\{[`key`: `string`]: `string`; \}\>; \} |
| `delta.json?`              | `Partial`\<[`TransferAgentOutput`](#transferagentoutput) \| `T`\>                                                                                                                                                                                                          |
| `delta.text?`              | `Partial`\<\{ \[key in string \| number \| symbol as Extract\<T\[key\], string\> extends string ? key : never\]: string \}\> \| `Partial`\<\{[`key`: `string`]: `string`; \}\>                                                                                             |

---

### FunctionAgentOptions\<I, O\>

Configuration options for a function agent

Extends the base agent options and adds function implementation

#### Extends

- [`AgentOptions`](#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                      | Default type          | Description               |
| ----------------------------------- | --------------------- | ------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | Agent input message type  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | Agent output message type |

#### Properties

| Property                                                    | Type                                                                                                                           | Description                                                                                                                                           | Inherited from                                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <a id="description-3"></a> `description?`                   | `string`                                                                                                                       | Description of the agent A human-readable description of what the agent does, useful for documentation and debugging                                  | [`AgentOptions`](#agentoptions).[`description`](#description-2)                   |
| <a id="disableevents-1"></a> `disableEvents?`               | `boolean`                                                                                                                      | Whether to disable emitting events for agent actions When true, the agent won't emit events like agentStarted, agentSucceed, or agentFailed           | [`AgentOptions`](#agentoptions).[`disableEvents`](#disableevents)                 |
| <a id="includeinputinoutput-3"></a> `includeInputInOutput?` | `boolean`                                                                                                                      | Whether to include input in the output When true, the agent will merge input fields into the output object                                            | [`AgentOptions`](#agentoptions).[`includeInputInOutput`](#includeinputinoutput-2) |
| <a id="inputschema-3"></a> `inputSchema?`                   | [`AgentInputOutputSchema`](#agentinputoutputschema)\<`I`\>                                                                     | Zod schema defining the input message structure Used to validate that input messages conform to the expected format                                   | [`AgentOptions`](#agentoptions).[`inputSchema`](#inputschema-2)                   |
| <a id="memory-3"></a> `memory?`                             | `boolean` \| `AgentMemory` \| `AgentMemoryOptions`                                                                             | Memory configuration for the agent Can be an AgentMemory instance, configuration options, or simply a boolean to enable/disable with default settings | [`AgentOptions`](#agentoptions).[`memory`](#memory-2)                             |
| <a id="name-3"></a> `name?`                                 | `string`                                                                                                                       | Name of the agent Used for identification and logging. Defaults to the constructor name if not specified                                              | [`AgentOptions`](#agentoptions).[`name`](#name-2)                                 |
| <a id="outputschema-3"></a> `outputSchema?`                 | [`AgentInputOutputSchema`](#agentinputoutputschema)\<`O`\>                                                                     | Zod schema defining the output message structure Used to validate that output messages conform to the expected format                                 | [`AgentOptions`](#agentoptions).[`outputSchema`](#outputschema-2)                 |
| <a id="process-4"></a> `process`                            | [`FunctionAgentFn`](#functionagentfn)\<`I`, `O`\>                                                                              | Function implementing the agent's processing logic This function is called by the process method to handle input and generate output                  | -                                                                                 |
| <a id="publishtopic-3"></a> `publishTopic?`                 | [`PublishTopic`](#publishtopic-4)\<`O`\>                                                                                       | Topics the agent should publish to These topics determine where the agent's output messages will be sent in the system                                | [`AgentOptions`](#agentoptions).[`publishTopic`](#publishtopic-2)                 |
| <a id="skills-3"></a> `skills?`                             | ([`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| [`FunctionAgentFn`](#functionagentfn)\<`any`, `any`\>)[] | List of skills (other agents or functions) this agent has These skills can be used by the agent to delegate tasks or extend its capabilities          | [`AgentOptions`](#agentoptions).[`skills`](#skills-2)                             |
| <a id="subscribetopic-3"></a> `subscribeTopic?`             | [`SubscribeTopic`](#subscribetopic-4)                                                                                          | Topics the agent should subscribe to These topics determine which messages the agent will receive from the system                                     | [`AgentOptions`](#agentoptions).[`subscribeTopic`](#subscribetopic-2)             |

---

### TransferAgentOutput

Basic message type that can contain any key-value pairs

#### Extends

- [`Message`](#message)

#### Indexable

\[`key`: `string`\]: `unknown`

#### Properties

| Property                                        | Type                              |
| ----------------------------------------------- | --------------------------------- |
| <a id="transferagentto"></a> `$transferAgentTo` | \{ `agent`: [`Agent`](#agent); \} |
| `$transferAgentTo.agent`                        | [`Agent`](#agent)                 |

## Type Aliases

### AgentInputOutputSchema\<I\>

> **AgentInputOutputSchema**\<`I`\> = `ZodType`\<`I`\> \| (`agent`) => `ZodType`\<`I`\>

Schema definition type for agent input/output

Can be a Zod type definition or a function that returns a Zod type

#### Type Parameters

| Type Parameter                      | Default type          | Description                     |
| ----------------------------------- | --------------------- | ------------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | Agent input/output message type |

---

### AgentProcessAsyncGenerator\<O\>

> **AgentProcessAsyncGenerator**\<`O`\> = `AsyncGenerator`\<[`AgentResponseChunk`](#agentresponsechunk)\<`O`\>, `Partial`\<`O` \| [`TransferAgentOutput`](#transferagentoutput)\> \| `undefined` \| `void`\>

Async generator type for agent processing

Used to generate streaming response data

#### Type Parameters

| Type Parameter                      | Description               |
| ----------------------------------- | ------------------------- |
| `O` _extends_ [`Message`](#message) | Agent output message type |

---

### AgentProcessResult\<O\>

> **AgentProcessResult**\<`O`\> = [`AgentResponse`](#agentresponse)\<`O`\> \| [`AgentProcessAsyncGenerator`](#agentprocessasyncgenerator)\<`O`\> \| [`Agent`](#agent)

Result type for agent processing method, can be:

- Direct or streaming response
- Async generator
- Another agent instance (for task forwarding)

#### Type Parameters

| Type Parameter                      | Description               |
| ----------------------------------- | ------------------------- |
| `O` _extends_ [`Message`](#message) | Agent output message type |

---

### AgentResponse\<T\>

> **AgentResponse**\<`T`\> = `T` \| [`TransferAgentOutput`](#transferagentoutput) \| [`AgentResponseStream`](#agentresponsestream)\<`T`\>

Response type for an agent, can be:

- Direct response object
- Output transferred to another agent
- Streaming response

#### Type Parameters

| Type Parameter | Description        |
| -------------- | ------------------ |
| `T`            | Response data type |

---

### AgentResponseChunk\<T\>

> **AgentResponseChunk**\<`T`\> = [`AgentResponseDelta`](#agentresponsedelta)\<`T`\>

Data chunk type for streaming responses

#### Type Parameters

| Type Parameter | Description        |
| -------------- | ------------------ |
| `T`            | Response data type |

---

### AgentResponseStream\<T\>

> **AgentResponseStream**\<`T`\> = `ReadableStream`\<[`AgentResponseChunk`](#agentresponsechunk)\<`T`\>\>

Streaming response type for an agent

#### Type Parameters

| Type Parameter | Description        |
| -------------- | ------------------ |
| `T`            | Response data type |

---

### FunctionAgentFn()\<I, O\>

> **FunctionAgentFn**\<`I`, `O`\> = (`input`, `context`) => `PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Function type for function agents

Defines the function signature for processing messages in a function agent

#### Type Parameters

| Type Parameter                      | Default type | Description               |
| ----------------------------------- | ------------ | ------------------------- |
| `I` _extends_ [`Message`](#message) | `any`        | Agent input message type  |
| `O` _extends_ [`Message`](#message) | `any`        | Agent output message type |

#### Parameters

| Parameter | Type                             | Description       |
| --------- | -------------------------------- | ----------------- |
| `input`   | `I`                              | Input message     |
| `context` | [`Context`](../aigne.md#context) | Execution context |

#### Returns

`PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Processing result, can be synchronous or asynchronous

---

### Message

> **Message** = `Record`\<`string`, `unknown`\>

Basic message type that can contain any key-value pairs

---

### PublishTopic\<O\>

> **PublishTopic**\<`O`\> = `string` \| `string`[] \| (`output`) => `PromiseOrValue`\<`Nullish`\<`string` \| `string`[]\>\>

Topics the agent publishes to, can be:

- A single topic string
- An array of topic strings
- A function that receives the output and returns topic(s)

#### Type Parameters

| Type Parameter                      | Description                   |
| ----------------------------------- | ----------------------------- |
| `O` _extends_ [`Message`](#message) | The agent output message type |

---

### SubscribeTopic

> **SubscribeTopic** = `string` \| `string`[]

Topics the agent subscribes to, can be a single topic string or an array of topic strings

## Variables

### agentOptionsSchema

> `const` **agentOptionsSchema**: `ZodObject`\<`{ [key in keyof AgentOptions]: ZodType<AgentOptions[key]> }`\>

---

### transferAgentOutputKey

> `const` **transferAgentOutputKey**: `"$transferAgentTo"` = `"$transferAgentTo"`

## Functions

### isEmptyChunk()

> **isEmptyChunk**\<`T`\>(`chunk`): `boolean`

Check if a response chunk is empty

#### Type Parameters

| Type Parameter | Description        |
| -------------- | ------------------ |
| `T`            | Response data type |

#### Parameters

| Parameter | Type                                               | Description                 |
| --------- | -------------------------------------------------- | --------------------------- |
| `chunk`   | [`AgentResponseChunk`](#agentresponsechunk)\<`T`\> | The response chunk to check |

#### Returns

`boolean`

True if the chunk is empty

---

### isTransferAgentOutput()

> **isTransferAgentOutput**(`output`): `output is TransferAgentOutput`

#### Parameters

| Parameter | Type                  |
| --------- | --------------------- |
| `output`  | [`Message`](#message) |

#### Returns

`output is TransferAgentOutput`

---

### jsonDelta()

> **jsonDelta**\<`T`\>(`jsonDelta`): [`AgentResponseDelta`](#agentresponsedelta)\<`T`\>

Creates a JSON delta for streaming responses

This utility function creates an AgentResponseDelta object with only the JSON part,
useful for incrementally building structured data responses in streaming mode.

#### Type Parameters

| Type Parameter                      | Description                          |
| ----------------------------------- | ------------------------------------ |
| `T` _extends_ [`Message`](#message) | Agent message type extending Message |

#### Parameters

| Parameter   | Type                                                                                              | Description                                  |
| ----------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `jsonDelta` | `NonNullable`\<`undefined` \| `Partial`\<[`TransferAgentOutput`](#transferagentoutput) \| `T`\>\> | The JSON data to include in the delta update |

#### Returns

[`AgentResponseDelta`](#agentresponsedelta)\<`T`\>

An AgentResponseDelta with the JSON delta wrapped in the expected structure

---

### replaceTransferAgentToName()

> **replaceTransferAgentToName**(`output`): [`Message`](#message)

#### Parameters

| Parameter | Type                  |
| --------- | --------------------- |
| `output`  | [`Message`](#message) |

#### Returns

[`Message`](#message)

---

### textDelta()

> **textDelta**\<`T`\>(`textDelta`): [`AgentResponseDelta`](#agentresponsedelta)\<`T`\>

Creates a text delta for streaming responses

This utility function creates an AgentResponseDelta object with only the text part,
useful for incrementally building streaming text responses in agents.

#### Type Parameters

| Type Parameter                      | Description                          |
| ----------------------------------- | ------------------------------------ |
| `T` _extends_ [`Message`](#message) | Agent message type extending Message |

#### Parameters

| Parameter   | Type                                                                                                                                                                                                           | Description                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `textDelta` | `NonNullable`\<`undefined` \| `Partial`\<\{[`key`: `string`]: `string`; \}\> \| `Partial`\<\{ \[key in string \| number \| symbol as Extract\<T\[key\], string\> extends string ? key : never\]: string \}\>\> | The text content to include in the delta update |

#### Returns

[`AgentResponseDelta`](#agentresponsedelta)\<`T`\>

An AgentResponseDelta with the text delta wrapped in the expected structure

---

### transferToAgentOutput()

> **transferToAgentOutput**(`agent`): [`TransferAgentOutput`](#transferagentoutput)

#### Parameters

| Parameter | Type              |
| --------- | ----------------- |
| `agent`   | [`Agent`](#agent) |

#### Returns

[`TransferAgentOutput`](#transferagentoutput)
