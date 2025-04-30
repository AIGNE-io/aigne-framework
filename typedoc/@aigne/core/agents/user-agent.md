[Documentation](../../../README.md) / [@aigne/core](../README.md) / agents/user-agent

# agents/user-agent

## Classes

### UserAgent\<I, O\>

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

#### Extends

- [`Agent`](agent.md#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              | Default type                  | Description                               |
| ------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The output message type the agent returns |

#### Constructors

##### Constructor

> **new UserAgent**\<`I`, `O`\>(`options`): [`UserAgent`](#useragent)\<`I`, `O`\>

###### Parameters

| Parameter | Type                                                |
| --------- | --------------------------------------------------- |
| `options` | [`UserAgentOptions`](#useragentoptions)\<`I`, `O`\> |

###### Returns

[`UserAgent`](#useragent)\<`I`, `O`\>

###### Overrides

[`Agent`](agent.md#agent).[`constructor`](agent.md#agent#constructor)

#### Properties

| Property                                                  | Type                                                                                                                                                                                                                                                                                                                                                                                                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Overrides                                                   | Inherited from                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| <a id="context"></a> `context`                            | [`Context`](../aigne.md#context)                                                                                                                                                                                                                                                                                                                                                                                                   | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | -                                                           | -                                                                                       |
| <a id="description"></a> `description?`                   | `string`                                                                                                                                                                                                                                                                                                                                                                                                                           | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | -                                                           | [`Agent`](agent.md#agent).[`description`](agent.md#agent#description)                   |
| <a id="includeinputinoutput"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                          | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | -                                                           | [`Agent`](agent.md#agent).[`includeInputInOutput`](agent.md#agent#includeinputinoutput) |
| <a id="invoke"></a> `invoke`                              | \{(`input`, `context?`, `options?`): `Promise`\<`O`\>; (`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<`O`\>\>; (`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](agent.md#agentresponse)\<`O`\>\>; \}                                                                                                                                                            | Invoke the agent with regular (non-streaming) response Regular mode waits for the agent to complete processing and return the final result, suitable for scenarios where a complete result is needed at once. **Param** Input message to the agent, can be a string or structured object **Param** Execution context, providing environment and resource access **Param** Invocation options, must set streaming to false or leave unset **Example** Here's an example of invoking an agent with regular mode: `// Create a chat model const model = new OpenAIChatModel(); spyOn(model, "process").mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Hello, How can I assist you today?"))); // AIGNE: Main execution engine of AIGNE Framework. const aigne = new AIGNE({ model, }); // Create an Agent instance const agent = AIAgent.from({ name: "chat", description: "A chat agent", }); // Invoke the agent const result = await aigne.invoke(agent, "hello"); console.log(result); // Output: { $message: "Hello, How can I assist you today?" } expect(result).toEqual({ $message: "Hello, How can I assist you today?" });` | [`Agent`](agent.md#agent).[`invoke`](agent.md#agent#invoke) | -                                                                                       |
| <a id="memory"></a> `memory?`                             | `AgentMemory`                                                                                                                                                                                                                                                                                                                                                                                                                      | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | -                                                           | [`Agent`](agent.md#agent).[`memory`](agent.md#agent#memory)                             |
| <a id="name"></a> `name`                                  | `string`                                                                                                                                                                                                                                                                                                                                                                                                                           | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | -                                                           | [`Agent`](agent.md#agent).[`name`](agent.md#agent#name)                                 |
| <a id="publish"></a> `publish`                            | (`topic`, `payload`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                     | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | -                                                           | -                                                                                       |
| <a id="publishtopic"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>                                                                                                                                                                                                                                                                                                                                                         | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                                           | [`Agent`](agent.md#agent).[`publishTopic`](agent.md#agent#publishtopic)                 |
| <a id="skills"></a> `skills`                              | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>; \}                                                                                                                                                                                                                   | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | -                                                           | [`Agent`](agent.md#agent).[`skills`](agent.md#agent#skills)                             |
| <a id="subscribe"></a> `subscribe`                        | \{(`topic`, `listener?`): `Promise`\<[`MessagePayload`](../aigne.md#messagepayload)\>; (`topic`, `listener`): [`Unsubscribe`](../aigne.md#unsubscribe-6); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](../aigne.md#messagepayload)\> \| [`Unsubscribe`](../aigne.md#unsubscribe-6); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](../aigne.md#messagepayload)\> \| [`Unsubscribe`](../aigne.md#unsubscribe-6); \} | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | -                                                           | -                                                                                       |
| <a id="subscribetopic"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                                                                                                                                                                                                                                                                                      | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | -                                                           | [`Agent`](agent.md#agent).[`subscribeTopic`](agent.md#agent#subscribetopic)             |
| <a id="unsubscribe"></a> `unsubscribe`                    | (`topic`, `listener`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                    | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | -                                                           | -                                                                                       |

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

##### stream

###### Get Signature

> **get** **stream**(): `ReadableStream`\<[`MessagePayload`](../aigne.md#messagepayload) & \{ `topic`: `string`; \}\>

###### Returns

`ReadableStream`\<[`MessagePayload`](../aigne.md#messagepayload) & \{ `topic`: `string`; \}\>

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

const shutdown = spyOn(agent, "shutdown");

expect(shutdown).not.toHaveBeenCalled();
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

> `protected` **checkAgentInvokesUsage**(`_context`): `void`

Check agent invocation usage to prevent exceeding limits

If the context has a maximum invocation limit set, checks if the limit
has been exceeded and increments the invocation counter

###### Parameters

| Parameter  | Type                             |
| ---------- | -------------------------------- |
| `_context` | [`Context`](../aigne.md#context) |

###### Returns

`void`

###### Throws

Error if maximum invocation limit is exceeded

###### Overrides

[`Agent`](agent.md#agent).[`checkAgentInvokesUsage`](agent.md#agent#checkagentinvokesusage)

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

> **process**(`input`, `context`): `Promise`\<[`AgentProcessResult`](agent.md#agentprocessresult)\<`O`\>\>

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

`Promise`\<[`AgentProcessResult`](agent.md#agentprocessresult)\<`O`\>\>

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

[`Agent`](agent.md#agent).[`shutdown`](agent.md#agent#shutdown)

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`UserAgent`](#useragent)\<`I`, `O`\>

###### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

###### Parameters

| Parameter | Type                                                |
| --------- | --------------------------------------------------- |
| `options` | [`UserAgentOptions`](#useragentoptions)\<`I`, `O`\> |

###### Returns

[`UserAgent`](#useragent)\<`I`, `O`\>

## Interfaces

### UserAgentOptions\<I, O\>

Configuration options for an agent

#### Extends

- [`AgentOptions`](agent.md#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              | Default type                  | Description                   |
| ------------------------------------------- | ----------------------------- | ----------------------------- |
| `I` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The agent input message type  |
| `O` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The agent output message type |

#### Properties

| Property                                                    | Type                                                                                                                                                           | Description                                                                                                                                           | Inherited from                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <a id="activeagent"></a> `activeAgent?`                     | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>                                                                      | -                                                                                                                                                     | -                                                                                                              |
| <a id="context-1"></a> `context`                            | [`Context`](../aigne.md#context)                                                                                                                               | -                                                                                                                                                     | -                                                                                                              |
| <a id="description-1"></a> `description?`                   | `string`                                                                                                                                                       | Description of the agent A human-readable description of what the agent does, useful for documentation and debugging                                  | [`AgentOptions`](agent.md#agentoptions).[`description`](agent.md#agentoptions#description-2)                   |
| <a id="disableevents"></a> `disableEvents?`                 | `boolean`                                                                                                                                                      | Whether to disable emitting events for agent actions When true, the agent won't emit events like agentStarted, agentSucceed, or agentFailed           | [`AgentOptions`](agent.md#agentoptions).[`disableEvents`](agent.md#agentoptions#disableevents)                 |
| <a id="includeinputinoutput-1"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                      | Whether to include input in the output When true, the agent will merge input fields into the output object                                            | [`AgentOptions`](agent.md#agentoptions).[`includeInputInOutput`](agent.md#agentoptions#includeinputinoutput-2) |
| <a id="inputschema-1"></a> `inputSchema?`                   | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<`I`\>                                                                                             | Zod schema defining the input message structure Used to validate that input messages conform to the expected format                                   | [`AgentOptions`](agent.md#agentoptions).[`inputSchema`](agent.md#agentoptions#inputschema-2)                   |
| <a id="memory-1"></a> `memory?`                             | `boolean` \| `AgentMemory` \| `AgentMemoryOptions`                                                                                                             | Memory configuration for the agent Can be an AgentMemory instance, configuration options, or simply a boolean to enable/disable with default settings | [`AgentOptions`](agent.md#agentoptions).[`memory`](agent.md#agentoptions#memory-2)                             |
| <a id="name-1"></a> `name?`                                 | `string`                                                                                                                                                       | Name of the agent Used for identification and logging. Defaults to the constructor name if not specified                                              | [`AgentOptions`](agent.md#agentoptions).[`name`](agent.md#agentoptions#name-2)                                 |
| <a id="outputschema-1"></a> `outputSchema?`                 | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<`O`\>                                                                                             | Zod schema defining the output message structure Used to validate that output messages conform to the expected format                                 | [`AgentOptions`](agent.md#agentoptions).[`outputSchema`](agent.md#agentoptions#outputschema-2)                 |
| <a id="process-2"></a> `process?`                           | [`FunctionAgentFn`](agent.md#functionagentfn)\<`I`, `O`\>                                                                                                      | -                                                                                                                                                     | -                                                                                                              |
| <a id="publishtopic-1"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<`O`\>                                                                                                               | Topics the agent should publish to These topics determine where the agent's output messages will be sent in the system                                | [`AgentOptions`](agent.md#agentoptions).[`publishTopic`](agent.md#agentoptions#publishtopic-2)                 |
| <a id="skills-1"></a> `skills?`                             | ([`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`FunctionAgentFn`](agent.md#functionagentfn)\<`any`, `any`\>)[] | List of skills (other agents or functions) this agent has These skills can be used by the agent to delegate tasks or extend its capabilities          | [`AgentOptions`](agent.md#agentoptions).[`skills`](agent.md#agentoptions#skills-2)                             |
| <a id="subscribetopic-1"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                  | Topics the agent should subscribe to These topics determine which messages the agent will receive from the system                                     | [`AgentOptions`](agent.md#agentoptions).[`subscribeTopic`](agent.md#agentoptions#subscribetopic-2)             |
