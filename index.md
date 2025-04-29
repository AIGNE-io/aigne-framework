[**@aigne/core**](README.md)

---

[@aigne/core](README.md) / index

# index

## Enumerations

### AIAgentToolChoice

Tool choice options for AI agents

Controls how the agent decides to use tools during execution

#### Enumeration Members

| Enumeration Member               | Value        | Description                                      |
| -------------------------------- | ------------ | ------------------------------------------------ |
| <a id="auto"></a> `auto`         | `"auto"`     | Let the model decide when to use tools           |
| <a id="none"></a> `none`         | `"none"`     | Disable tool usage                               |
| <a id="required"></a> `required` | `"required"` | Force tool usage                                 |
| <a id="router"></a> `router`     | `"router"`   | Choose exactly one tool and route directly to it |

---

### ProcessMode

Defines the processing modes available for a TeamAgent.

The processing mode determines how the agents within a team are executed
and how their outputs are combined.

#### Enumeration Members

| Enumeration Member                   | Value          | Description                                                                                                                                                                                                                  |
| ------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="sequential"></a> `sequential` | `"sequential"` | Process the agents one by one, passing the output of each agent to the next. In sequential mode, agents execute in order, with each agent receiving the combined output from all previous agents as part of its input.       |
| <a id="parallel"></a> `parallel`     | `"parallel"`   | Process all agents in parallel, merging the output of all agents. In parallel mode, all agents execute simultaneously, each receiving the same initial input. Their outputs are then combined based on output key ownership. |

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
```

#### Extended by

- [`ChatModel`](models/chat-model.md#chatmodel)
- [`FunctionAgent`](#functionagent)
- [`AIAgent`](#aiagent)
- [`MCPAgent`](#mcpagent)
- [`MCPBase`](#mcpbase)
- [`TeamAgent`](#teamagent)
- [`UserAgent`](#useragent)

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

| Property                                                    | Type                                                                                                                                                             | Description                                                                                                                                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="memory-1"></a> `memory?`                             | [`AgentMemory`](#agentmemory-1)                                                                                                                                  | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     |
| <a id="name-1"></a> `name`                                  | `string`                                                                                                                                                         | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               |
| <a id="description-1"></a> `description?`                   | `string`                                                                                                                                                         | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              |
| <a id="includeinputinoutput-1"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                        | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 |
| <a id="subscribetopic-2"></a> `subscribeTopic?`             | [`SubscribeTopic`](#subscribetopic)                                                                                                                              | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         |
| <a id="publishtopic-2"></a> `publishTopic?`                 | [`PublishTopic`](#publishtopic)\<[`Message`](#message)\>                                                                                                         | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          |
| <a id="skills-1"></a> `skills`                              | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[] & \{[`key`: `string`]: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>; \} | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents |

#### Accessors

##### topic

###### Get Signature

> **get** **topic**(): `string`

Default topic this agent subscribes to

Each agent has a default topic in the format "$agent\_[agent name]"
The agent automatically subscribes to this topic to receive messages

###### Returns

`string`

The default topic string

##### inputSchema

###### Get Signature

> **get** **inputSchema**(): `ZodType`\<`I`\>

Get the input data schema for this agent

Used to validate that input messages conform to required format
If no input schema is set, returns an empty object schema by default

###### Returns

`ZodType`\<`I`\>

The Zod type definition for input data

##### outputSchema

###### Get Signature

> **get** **outputSchema**(): `ZodType`\<`O`\>

Get the output data schema for this agent

Used to validate that output messages conform to required format
If no output schema is set, returns an empty object schema by default

###### Returns

`ZodType`\<`O`\>

The Zod type definition for output data

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

#### Methods

##### attach()

> **attach**(`context`): `void`

Attach agent to context:

- Subscribe to topics and invoke process method when messages are received
- Subscribe to memory topics if memory is enabled

Agents can receive messages and respond through the topic subscription system,
enabling inter-agent communication.

###### Parameters

| Parameter | Type                                             | Description          |
| --------- | ------------------------------------------------ | -------------------- |
| `context` | `Pick`\<[`Context`](#context-2), `"subscribe"`\> | Context to attach to |

###### Returns

`void`

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
| `context?` | [`Context`](#context-2)                                                    | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

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

###### Call Signature

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>

Invoke the agent with streaming response

Streaming responses allow the agent to return results incrementally,
suitable for scenarios requiring real-time progress updates, such as
chat bot typing effects.

###### Parameters

| Parameter           | Type                                   | Description                                                      |
| ------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `input`             | `string` \| `I`                        | Input message to the agent, can be a string or structured object |
| `context`           | `undefined` \| [`Context`](#context-2) | Execution context, providing environment and resource access     |
| `options`           | \{ `streaming`: `true`; \}             | Invocation options, must set streaming to true for this overload |
| `options.streaming` | `true`                                 | -                                                                |

###### Returns

`Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>

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

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](#agentresponse)\<`O`\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                        | Description                |
| ---------- | ------------------------------------------- | -------------------------- |
| `input`    | `string` \| `I`                             | Input message to the agent |
| `context?` | [`Context`](#context-2)                     | Execution context          |
| `options?` | [`AgentInvokeOptions`](#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](#agentresponse)\<`O`\>\>

Agent response (streaming or regular)

##### checkAgentInvokesUsage()

> `protected` **checkAgentInvokesUsage**(`context`): `void`

Check agent invocation usage to prevent exceeding limits

If the context has a maximum invocation limit set, checks if the limit
has been exceeded and increments the invocation counter

###### Parameters

| Parameter | Type                    | Description       |
| --------- | ----------------------- | ----------------- |
| `context` | [`Context`](#context-2) | Execution context |

###### Returns

`void`

###### Throws

Error if maximum invocation limit is exceeded

##### preprocess()

> `protected` **preprocess**(`_`, `context`): `void`

Pre-processing operations before handling input

Preparatory work done before executing the agent's main processing logic, including:

- Checking context status
- Verifying invocation limits

###### Parameters

| Parameter | Type                    | Description            |
| --------- | ----------------------- | ---------------------- |
| `_`       | `I`                     | Input message (unused) |
| `context` | [`Context`](#context-2) | Execution context      |

###### Returns

`void`

##### postprocess()

> `protected` **postprocess**(`input`, `output`, `context`): `void`

Post-processing operations after handling output

Operations performed after the agent produces output, including:

- Checking context status
- Adding interaction records to memory

###### Parameters

| Parameter | Type                    | Description       |
| --------- | ----------------------- | ----------------- |
| `input`   | `I`                     | Input message     |
| `output`  | `O`                     | Output message    |
| `context` | [`Context`](#context-2) | Execution context |

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

| Parameter | Type                    | Description       |
| --------- | ----------------------- | ----------------- |
| `input`   | `I`                     | Input message     |
| `context` | [`Context`](#context-2) | Execution context |

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

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

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

#### Methods

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
```

##### process()

> **process**(`input`, `context`): `PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Process input implementation, calls the configured processing function

###### Parameters

| Parameter | Type                    | Description       |
| --------- | ----------------------- | ----------------- |
| `input`   | `I`                     | Input message     |
| `context` | [`Context`](#context-2) | Execution context |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Processing result

###### Overrides

[`Agent`](#agent).[`process`](#process)

---

### AIAgent\<I, O\>

AI-powered agent that leverages language models

AIAgent connects to language models to process inputs and generate responses,
with support for streaming, function calling, and tool usage.

Key features:

- Connect to any language model
- Use customizable instructions and prompts
- Execute tools/function calls
- Support streaming responses
- Router mode for specialized agents

#### Example

Basic AIAgent creation:

```ts
// Create a simple AIAgent with minimal configuration
const model = new OpenAIChatModel();

const agent = AIAgent.from({
  model,
  name: "assistant",
  description: "A helpful assistant",
});

const result = await agent.invoke("What is the weather today?");

console.log(result); // Expected output: { $message: "Hello, How can I help you?" }
```

#### Extends

- [`Agent`](#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                      | Default type          | Description                               |
| ----------------------------------- | --------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | The output message type the agent returns |

#### Constructors

##### Constructor

> **new AIAgent**\<`I`, `O`\>(`options`): [`AIAgent`](#aiagent)\<`I`, `O`\>

Create an AIAgent instance

###### Parameters

| Parameter | Type                                            | Description                            |
| --------- | ----------------------------------------------- | -------------------------------------- |
| `options` | [`AIAgentOptions`](#aiagentoptions)\<`I`, `O`\> | Configuration options for the AI agent |

###### Returns

[`AIAgent`](#aiagent)\<`I`, `O`\>

###### Overrides

[`Agent`](#agent).[`constructor`](#constructor)

#### Properties

| Property                                   | Type                                                                                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="model-1"></a> `model?`              | [`ChatModel`](models/chat-model.md#chatmodel)                                                                  | The language model used by this agent If not set on the agent, the model from the context will be used                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| <a id="instructions-1"></a> `instructions` | [`PromptBuilder`](#promptbuilder)                                                                              | Instructions for the language model Contains system messages, user templates, and other prompt elements that guide the model's behavior **Example** Custom prompt builder: `const model = new OpenAIChatModel(); // Create a custom prompt template const systemMessage = SystemMessageTemplate.from("You are a technical support specialist."); const userMessage = UserMessageTemplate.from("Please help me troubleshoot this issue: {{issue}}"); const promptTemplate = ChatMessagesTemplate.from([systemMessage, userMessage]); // Create a PromptBuilder with the template const promptBuilder = new PromptBuilder({ instructions: promptTemplate, }); // Create an AIAgent with the custom PromptBuilder const agent = AIAgent.from({ model, name: "support", description: "Technical support specialist", instructions: promptBuilder, }); const result = await agent.invoke({ issue: "My computer won't start." }); console.log(result); // Expected output: { $message: "Is there any message on the screen?" }` |
| <a id="outputkey-1"></a> `outputKey?`      | `string`                                                                                                       | Custom key to use for text output in the response **Example** Setting a custom output key: `const model = new OpenAIChatModel(); // Create an AIAgent with a custom output key const agent = AIAgent.from({ model, outputKey: "greeting", }); const result = await agent.invoke("What is the weather today?"); console.log(result); // Expected output: { greeting: "Hello, How can I help you?" }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <a id="toolchoice-1"></a> `toolChoice?`    | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| [`AIAgentToolChoice`](#aiagenttoolchoice) | Controls how the agent uses tools during execution **Examples** Automatic tool choice: `const model = new OpenAIChatModel(); // Create function agents to serve as tools const calculator = FunctionAgent.from({ name: "calculator", inputSchema: z.object({ a: z.number(), b: z.number(), operation: z.enum(["add", "subtract", "multiply", "divide"]), }), outputSchema: z.object({ result: z.union([z.number(), z.string()]), }), process: ({ a, b, operation }: { a: number; b: number; operation: string; }) => { let result: number                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | string; switch (operation) { case "add": result = a + b; break; case "subtract": result = a - b; break; case "multiply": result = a \* b; break; case "divide": result = a / b; break; default: result = "Unknown operation"; } return { result }; }, }); const weatherService = FunctionAgent.from({ name: "weather", inputSchema: z.object({ location: z.string(), }), outputSchema: z.object({ forecast: z.string(), }), process: ({ location }: { location: string; }) => { return { forecast: `Weather forecast for ${location}: Sunny, 75°F`, }; }, }); // Create an AIAgent that can use tools automatically const agent = AIAgent.from({ model, name: "assistant", description: "A helpful assistant with tool access", toolChoice: AIAgentToolChoice.auto, // Let the model decide when to use tools skills: [calculator, weatherService], }); const result1 = await agent.invoke("What is the weather in San Francisco?"); console.log(result1); // Expected output: { $message: "Weather forecast for San Francisco: Sunny, 75°F" } const result2 = await agent.invoke("Calculate 5 + 3"); console.log(result2); // Expected output: { $message: "The result of 5 + 3 is 8" }`Router tool choice:`const model = new OpenAIChatModel(); // Create specialized function agents const weatherAgent = FunctionAgent.from({ name: "weather", inputSchema: z.object({ location: z.string(), }), outputSchema: z.object({ forecast: z.string(), }), process: ({ location }: { location: string; }) => ({ forecast: `Weather in ${location}: Sunny, 75°F`, }), }); const translator = FunctionAgent.from({ name: "translator", inputSchema: z.object({ text: z.string(), language: z.string(), }), outputSchema: z.object({ translation: z.string(), }), process: ({ text, language }: { text: string; language: string; }) => ({ translation: `Translated ${text} to ${language}`, }), }); // Create an AIAgent with router tool choice const agent = AIAgent.from({ model, name: "router-assistant", description: "Assistant that routes to specialized agents", toolChoice: AIAgentToolChoice.router, // Use the router mode skills: [weatherAgent, translator], }); const result = await agent.invoke("What's the weather in San Francisco?"); console.log(result); // Expected output: { forecast: "Weather in San Francisco: Sunny, 75°F" }` |

#### Methods

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`AIAgent`](#aiagent)\<`I`, `O`\>

Create an AIAgent with the specified options

Factory method that provides a convenient way to create new AI agents

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

###### Parameters

| Parameter | Type                                            | Description                            |
| --------- | ----------------------------------------------- | -------------------------------------- |
| `options` | [`AIAgentOptions`](#aiagentoptions)\<`I`, `O`\> | Configuration options for the AI agent |

###### Returns

[`AIAgent`](#aiagent)\<`I`, `O`\>

A new AIAgent instance

###### Example

AI agent with custom instructions:

```ts
const model = new OpenAIChatModel();

// Create an AIAgent with custom instructions
const agent = AIAgent.from({
  model,
  name: "tutor",
  description: "A math tutor",
  instructions:
    "You are a math tutor who helps students understand concepts clearly.",
});

const result = await agent.invoke("What is 10 factorial?");

console.log(result); // Expected output: { $message: "10 factorial is 3628800." }
```

##### process()

> `protected` **process**(`input`, `context`): [`AgentProcessAsyncGenerator`](#agentprocessasyncgenerator)\<`O`\>

Process an input message and generate a response

###### Parameters

| Parameter | Type                    |
| --------- | ----------------------- |
| `input`   | `I`                     |
| `context` | [`Context`](#context-2) |

###### Returns

[`AgentProcessAsyncGenerator`](#agentprocessasyncgenerator)\<`O`\>

###### Overrides

[`Agent`](#agent).[`process`](#process)

##### \_processRouter()

> `protected` **\_processRouter**(`input`, `model`, `modelInput`, `context`, `toolsMap`): [`AgentProcessAsyncGenerator`](#agentprocessasyncgenerator)\<`O`\>

Process router mode requests

In router mode, the agent sends a single request to the model to determine
which tool to use, then routes the request directly to that tool

###### Parameters

| Parameter    | Type                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| `input`      | `I`                                                                                  |
| `model`      | [`ChatModel`](models/chat-model.md#chatmodel)                                        |
| `modelInput` | [`ChatModelInput`](models/chat-model.md#chatmodelinput)                              |
| `context`    | [`Context`](#context-2)                                                              |
| `toolsMap`   | `Map`\<`string`, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\> |

###### Returns

[`AgentProcessAsyncGenerator`](#agentprocessasyncgenerator)\<`O`\>

---

### MCPAgent

MCPAgent is a specialized agent for interacting with MCP (Model Context Protocol) servers.
It provides the ability to connect to remote MCP servers using different transport methods,
and access their tools, prompts, and resources.

MCPAgent serves as a bridge between your application and MCP servers, allowing you to:

- Connect to MCP servers over HTTP/SSE or stdio
- Access server tools as agent skills
- Utilize server prompts and resources
- Manage server connections with automatic reconnection

#### Example

Here's an example of creating an MCPAgent with SSE transport:

```ts
// Create an MCPAgent using a SSE server connection
await using mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/sse`,
  transport: "sse",
});

console.log(mcpAgent.name); // Output: "example-server"

const echo = mcpAgent.skills.echo;

if (!echo) throw new Error("Skill not found");

const result = await echo.invoke({ message: "Hello!" });

console.log(result);
```

#### Extends

- [`Agent`](#agent)

#### Constructors

##### Constructor

> **new MCPAgent**(`options`): [`MCPAgent`](#mcpagent)

Create an MCPAgent instance directly with a configured client.

###### Parameters

| Parameter | Type                                  | Description                                               |
| --------- | ------------------------------------- | --------------------------------------------------------- |
| `options` | [`MCPAgentOptions`](#mcpagentoptions) | MCPAgent configuration options, including client instance |

###### Returns

[`MCPAgent`](#mcpagent)

###### Example

Here's an example of creating an MCPAgent with an existing client:

```ts
// Create a client instance
const client = new Client({ name: "test-client", version: "1.0.0" });

const transport = new StdioClientTransport({
  command: "bun",
  args: [join(import.meta.dir, "../../test/_mocks/mock-mcp-server.ts")],
});

await client.connect(transport);

// Create an MCPAgent directly from client instance
await using mcpAgent = MCPAgent.from({
  name: client.getServerVersion()?.name,
  client,
});

console.log(mcpAgent.name); // Output: "example-server"
```

###### Overrides

[`Agent`](#agent).[`constructor`](#constructor)

#### Properties

| Property                             | Type                                                                                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="client-1"></a> `client`       | `Client`                                                                                 | The MCP client instance used for communication with the MCP server. This client manages the connection to the MCP server and provides methods for interacting with server-provided functionality.                                                                                                                                                                                                                                                           |
| <a id="prompts-1"></a> `prompts`     | [`MCPPrompt`](#mcpprompt)[] & \{[`key`: `string`]: [`MCPPrompt`](#mcpprompt); \}         | Array of MCP prompts available from the connected server. Prompts can be accessed by index or by name. **Example** Here's an example of accessing prompts: `await using mcpAgent = await MCPAgent.from({ url: `http://localhost:${port}/mcp`, transport: "streamableHttp", }); const echo = mcpAgent.prompts.echo; if (!echo) throw new Error("Prompt not found"); const result = await echo.invoke({ message: "Hello!" }); console.log(result);`           |
| <a id="resources-1"></a> `resources` | [`MCPResource`](#mcpresource)[] & \{[`key`: `string`]: [`MCPResource`](#mcpresource); \} | Array of MCP resources available from the connected server. Resources can be accessed by index or by name. **Example** Here's an example of accessing resources: `await using mcpAgent = await MCPAgent.from({ url: `http://localhost:${port}/mcp`, transport: "streamableHttp", }); const echo = mcpAgent.resources.echo; if (!echo) throw new Error("Resource not found"); const result = await echo.invoke({ message: "Hello!" }); console.log(result);` |

#### Accessors

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable.

MCPAgent itself is not directly invokable as it acts as a container
for tools, prompts, and resources. Always returns false.

###### Returns

`boolean`

###### Overrides

[`Agent`](#agent).[`isInvokable`](#isinvokable)

#### Methods

##### from()

###### Call Signature

> `static` **from**(`options`): `Promise`\<[`MCPAgent`](#mcpagent)\>

Create an MCPAgent from a connection to an SSE server.

This overload establishes a Server-Sent Events connection to an MCP server
and automatically discovers its available tools, prompts, and resources.

###### Parameters

| Parameter | Type                                    | Description                      |
| --------- | --------------------------------------- | -------------------------------- |
| `options` | [`MCPServerOptions`](#mcpserveroptions) | SSE server connection parameters |

###### Returns

`Promise`\<[`MCPAgent`](#mcpagent)\>

Promise resolving to a new MCPAgent instance

###### Examples

Here's an example of creating an MCPAgent with StreamableHTTP transport:

```ts
// Create an MCPAgent using a streamable http server connection
await using mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/mcp`,
  transport: "streamableHttp",
});

console.log(mcpAgent.name); // Output: "example-server-streamable-http"

const echo = mcpAgent.skills.echo;

if (!echo) throw new Error("Skill not found");

const result = await echo.invoke({ message: "Hello!" });

console.log(result);
```

Here's an example of creating an MCPAgent with SSE transport:

```ts
// Create an MCPAgent using a SSE server connection
await using mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/sse`,
  transport: "sse",
});

console.log(mcpAgent.name); // Output: "example-server"

const echo = mcpAgent.skills.echo;

if (!echo) throw new Error("Skill not found");

const result = await echo.invoke({ message: "Hello!" });

console.log(result);
```

Here's an example of creating an MCPAgent with Stdio transport:

```ts
// Create an MCPAgent using a command-line (stdio) server
await using mcpAgent = await MCPAgent.from({
  command: "bun",
  args: [join(import.meta.dir, "../../test/_mocks/mock-mcp-server.ts")],
});

console.log(mcpAgent.name); // Output: "example-server"

const echo = mcpAgent.skills.echo;

if (!echo) throw new Error("Skill not found");

const result = await echo.invoke({ message: "Hello!" });

console.log(result);
```

###### Call Signature

> `static` **from**(`options`): [`MCPAgent`](#mcpagent)

Create an MCPAgent from a pre-configured MCP client.

This overload uses an existing MCP client instance and optionally
pre-defined prompts and resources.

###### Parameters

| Parameter | Type                                  | Description                                 |
| --------- | ------------------------------------- | ------------------------------------------- |
| `options` | [`MCPAgentOptions`](#mcpagentoptions) | MCPAgent configuration with client instance |

###### Returns

[`MCPAgent`](#mcpagent)

A new MCPAgent instance

###### Example

Here's an example of creating an MCPAgent with a client instance:

```ts
// Create a client instance
const client = new Client({ name: "test-client", version: "1.0.0" });

const transport = new StdioClientTransport({
  command: "bun",
  args: [join(import.meta.dir, "../../test/_mocks/mock-mcp-server.ts")],
});

await client.connect(transport);

// Create an MCPAgent directly from client instance
await using mcpAgent = MCPAgent.from({
  name: client.getServerVersion()?.name,
  client,
});

console.log(mcpAgent.name); // Output: "example-server"
```

##### process()

> **process**(`_input`, `_context?`): `Promise`\<[`Message`](#message)\>

Process method required by Agent interface.

Since MCPAgent itself is not directly invokable, this method
throws an error if called.

###### Parameters

| Parameter   | Type                    | Description                |
| ----------- | ----------------------- | -------------------------- |
| `_input`    | [`Message`](#message)   | Input message (unused)     |
| `_context?` | [`Context`](#context-2) | Execution context (unused) |

###### Returns

`Promise`\<[`Message`](#message)\>

###### Throws

Error This method always throws an error since MCPAgent is not directly invokable

###### Overrides

[`Agent`](#agent).[`process`](#process)

##### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Shut down the agent and close the MCP connection.

This method cleans up resources and closes the connection
to the MCP server.

###### Returns

`Promise`\<`void`\>

###### Examples

Here's an example of shutting down an MCPAgent:

```ts
const mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/mcp`,
  transport: "streamableHttp",
});

await mcpAgent.shutdown();
```

Here's an example of shutting down an MCPAgent by using statement:

```ts
// MCP will be shutdown when the variable goes out of scope
await using _mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/mcp`,
  transport: "streamableHttp",
});
```

###### Overrides

[`Agent`](#agent).[`shutdown`](#shutdown)

---

### `abstract` MCPBase\<I, O\>

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
```

#### Extends

- [`Agent`](#agent)\<`I`, `O`\>

#### Extended by

- [`MCPTool`](#mcptool)
- [`MCPPrompt`](#mcpprompt)
- [`MCPResource`](#mcpresource)

#### Type Parameters

| Type Parameter                      | Description                               |
| ----------------------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](#message) | The output message type the agent returns |

#### Constructors

##### Constructor

> **new MCPBase**\<`I`, `O`\>(`options`): [`MCPBase`](#mcpbase)\<`I`, `O`\>

###### Parameters

| Parameter | Type                                            |
| --------- | ----------------------------------------------- |
| `options` | [`MCPBaseOptions`](#mcpbaseoptions)\<`I`, `O`\> |

###### Returns

[`MCPBase`](#mcpbase)\<`I`, `O`\>

###### Overrides

[`Agent`](#agent).[`constructor`](#constructor)

#### Properties

| Property                       | Type                  |
| ------------------------------ | --------------------- |
| <a id="client-3"></a> `client` | `ClientWithReconnect` |

---

### MCPTool

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
```

#### Extends

- [`MCPBase`](#mcpbase)\<[`Message`](#message), `CallToolResult`\>

#### Methods

##### process()

> **process**(`input`): `Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `type`: `"text"`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"image"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"audio"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"resource"`; `resource`: \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `blob`: `string`; \}; \})[]; `isError?`: `boolean`; \}\>

Core processing method of the agent, must be implemented in subclasses

This is the main functionality implementation of the agent, processing input and
generating output. Can return various types of results:

- Regular object response
- Streaming response
- Async generator
- Another agent instance (transfer agent)

###### Parameters

| Parameter | Type                  | Description   |
| --------- | --------------------- | ------------- |
| `input`   | [`Message`](#message) | Input message |

###### Returns

`Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `type`: `"text"`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"image"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"audio"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"resource"`; `resource`: \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `blob`: `string`; \}; \})[]; `isError?`: `boolean`; \}\>

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

###### Overrides

`MCPBase.process`

---

### MCPPrompt

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
```

#### Extends

- [`MCPBase`](#mcpbase)\<[`MCPPromptInput`](#mcppromptinput), `GetPromptResult`\>

#### Methods

##### process()

> **process**(`input`): `Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `role`: `"user"` \| `"assistant"`; `content`: \{[`key`: `string`]: `unknown`; `type`: `"text"`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"image"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"audio"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"resource"`; `resource`: \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `blob`: `string`; \}; \}; \}[]; \}\>

Core processing method of the agent, must be implemented in subclasses

This is the main functionality implementation of the agent, processing input and
generating output. Can return various types of results:

- Regular object response
- Streaming response
- Async generator
- Another agent instance (transfer agent)

###### Parameters

| Parameter | Type                                | Description   |
| --------- | ----------------------------------- | ------------- |
| `input`   | [`MCPPromptInput`](#mcppromptinput) | Input message |

###### Returns

`Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `role`: `"user"` \| `"assistant"`; `content`: \{[`key`: `string`]: `unknown`; `type`: `"text"`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"image"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"audio"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"resource"`; `resource`: \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `blob`: `string`; \}; \}; \}[]; \}\>

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

###### Overrides

`MCPBase.process`

---

### MCPResource

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
```

#### Extends

- [`MCPBase`](#mcpbase)\<[`MCPPromptInput`](#mcppromptinput), `ReadResourceResult`\>

#### Constructors

##### Constructor

> **new MCPResource**(`options`): [`MCPResource`](#mcpresource)

###### Parameters

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `options` | [`MCPResourceOptions`](#mcpresourceoptions) |

###### Returns

[`MCPResource`](#mcpresource)

###### Overrides

[`MCPBase`](#mcpbase).[`constructor`](#constructor-4)

#### Properties

| Property                 | Type     |
| ------------------------ | -------- |
| <a id="uri-1"></a> `uri` | `string` |

#### Methods

##### process()

> **process**(`input`): `Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `blob`: `string`; \})[]; \}\>

Core processing method of the agent, must be implemented in subclasses

This is the main functionality implementation of the agent, processing input and
generating output. Can return various types of results:

- Regular object response
- Streaming response
- Async generator
- Another agent instance (transfer agent)

###### Parameters

| Parameter | Type                                | Description   |
| --------- | ----------------------------------- | ------------- |
| `input`   | [`MCPPromptInput`](#mcppromptinput) | Input message |

###### Returns

`Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `blob`: `string`; \})[]; \}\>

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

###### Overrides

`MCPBase.process`

---

### AgentMemory

#### Constructors

##### Constructor

> **new AgentMemory**(`options`): [`AgentMemory`](#agentmemory-1)

###### Parameters

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `options` | [`AgentMemoryOptions`](#agentmemoryoptions) |

###### Returns

[`AgentMemory`](#agentmemory-1)

#### Properties

| Property                                              | Type                    | Default value |
| ----------------------------------------------------- | ----------------------- | ------------- |
| <a id="enabled-1"></a> `enabled?`                     | `boolean`               | `undefined`   |
| <a id="subscribetopic-4"></a> `subscribeTopic?`       | `string` \| `string`[]  | `undefined`   |
| <a id="maxmemoriesinchat-1"></a> `maxMemoriesInChat?` | `number`                | `undefined`   |
| <a id="memories"></a> `memories`                      | [`Memory`](#memory-2)[] | `[]`          |

#### Methods

##### addMemory()

> **addMemory**(`memory`): `void`

###### Parameters

| Parameter | Type                  |
| --------- | --------------------- |
| `memory`  | [`Memory`](#memory-2) |

###### Returns

`void`

##### attach()

> **attach**(`context`): `void`

###### Parameters

| Parameter | Type                                             |
| --------- | ------------------------------------------------ |
| `context` | `Pick`\<[`Context`](#context-2), `"subscribe"`\> |

###### Returns

`void`

##### detach()

> **detach**(): `void`

###### Returns

`void`

---

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

- [`Agent`](#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

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

[`Agent`](#agent).[`constructor`](#constructor)

#### Properties

| Property                   | Type                          | Description                                                                                                                                           |
| -------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="mode-1"></a> `mode` | [`ProcessMode`](#processmode) | The processing mode that determines how agents in the team are executed. This can be either sequential (one after another) or parallel (all at once). |

#### Methods

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`TeamAgent`](#teamagent)\<`I`, `O`\>

Create a TeamAgent from the provided options.

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

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

##### process()

> **process**(`input`, `context`): `PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Process an input message by routing it through the team's agents.

Depending on the team's processing mode, this will either:

- In sequential mode: Pass input through each agent in sequence, with each agent
  receiving the combined output from previous agents
- In parallel mode: Process input through all agents simultaneously and combine their outputs

###### Parameters

| Parameter | Type                    | Description            |
| --------- | ----------------------- | ---------------------- |
| `input`   | `I`                     | The message to process |
| `context` | [`Context`](#context-2) | The execution context  |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

A stream of message chunks that collectively form the response

###### Overrides

[`Agent`](#agent).[`process`](#process)

---

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
```

#### Extends

- [`Agent`](#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                      | Default type          | Description                               |
| ----------------------------------- | --------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | The output message type the agent returns |

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

[`Agent`](#agent).[`constructor`](#constructor)

#### Properties

| Property                               | Type                                                                                                                                                                                                                                                                                                                                                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Overrides                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| <a id="context-1"></a> `context`       | [`Context`](#context-2)                                                                                                                                                                                                                                                                                                                                          | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                     |
| <a id="invoke-4"></a> `invoke`         | \{(`input`, `context?`, `options?`): `Promise`\<`O`\>; (`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>; (`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](#agentresponse)\<`O`\>\>; \}                                                                                                          | Invoke the agent with regular (non-streaming) response Regular mode waits for the agent to complete processing and return the final result, suitable for scenarios where a complete result is needed at once. **Param** Input message to the agent, can be a string or structured object **Param** Execution context, providing environment and resource access **Param** Invocation options, must set streaming to false or leave unset **Example** Here's an example of invoking an agent with regular mode: `// Create a chat model const model = new OpenAIChatModel(); // AIGNE: Main execution engine of AIGNE Framework. const aigne = new AIGNE({ model, }); // Create an Agent instance const agent = AIAgent.from({ name: "chat", description: "A chat agent", }); // Invoke the agent const result = await aigne.invoke(agent, "hello"); console.log(result); // Output: { $message: "Hello, How can I assist you today?" }` | [`Agent`](#agent).[`invoke`](#invoke) |
| <a id="publish"></a> `publish`         | (`topic`, `payload`) => `void`                                                                                                                                                                                                                                                                                                                                   | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                     |
| <a id="subscribe"></a> `subscribe`     | \{(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\>; (`topic`, `listener`): [`Unsubscribe`](#unsubscribe-5); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5); \} | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                     |
| <a id="unsubscribe"></a> `unsubscribe` | (`topic`, `listener`) => `void`                                                                                                                                                                                                                                                                                                                                  | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                     |

#### Accessors

##### stream

###### Get Signature

> **get** **stream**(): `ReadableStream`\<[`MessagePayload`](#messagepayload) & \{ `topic`: `string`; \}\>

###### Returns

`ReadableStream`\<[`MessagePayload`](#messagepayload) & \{ `topic`: `string`; \}\>

#### Methods

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`UserAgent`](#useragent)\<`I`, `O`\>

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

###### Parameters

| Parameter | Type                                                |
| --------- | --------------------------------------------------- |
| `options` | [`UserAgentOptions`](#useragentoptions)\<`I`, `O`\> |

###### Returns

[`UserAgent`](#useragent)\<`I`, `O`\>

##### process()

> **process**(`input`, `context`): `Promise`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Core processing method of the agent, must be implemented in subclasses

This is the main functionality implementation of the agent, processing input and
generating output. Can return various types of results:

- Regular object response
- Streaming response
- Async generator
- Another agent instance (transfer agent)

###### Parameters

| Parameter | Type                    | Description       |
| --------- | ----------------------- | ----------------- |
| `input`   | `I`                     | Input message     |
| `context` | [`Context`](#context-2) | Execution context |

###### Returns

`Promise`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

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

###### Overrides

[`Agent`](#agent).[`process`](#process)

##### checkAgentInvokesUsage()

> `protected` **checkAgentInvokesUsage**(`_context`): `void`

Check agent invocation usage to prevent exceeding limits

If the context has a maximum invocation limit set, checks if the limit
has been exceeded and increments the invocation counter

###### Parameters

| Parameter  | Type                    |
| ---------- | ----------------------- |
| `_context` | [`Context`](#context-2) |

###### Returns

`void`

###### Throws

Error if maximum invocation limit is exceeded

###### Overrides

[`Agent`](#agent).[`checkAgentInvokesUsage`](#checkagentinvokesusage)

---

### AIGNE

AIGNE is a class that orchestrates multiple agents to build complex AI applications.
It serves as the central coordination point for agent interactions, message passing, and execution flow.

#### Examples

Here's a simple example of how to use AIGNE:

```ts
const model = new OpenAIChatModel();

const aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

const result = await aigne.invoke(agent, "hello");

console.log(result); // { $message: "Hello, How can I assist you today?" }
```

Here's an example of how to use AIGNE with streaming response:

```ts
const model = new OpenAIChatModel();

const aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

let text = "";

const stream = await aigne.invoke(agent, "hello", { streaming: true });

for await (const chunk of readableStreamToAsyncIterator(stream)) {
  if (chunk.delta.text?.$message) text += chunk.delta.text.$message;
}

console.log(text);
```

#### Constructors

##### Constructor

> **new AIGNE**(`options?`): [`AIGNE`](#aigne)

Creates a new AIGNE instance with the specified options.

###### Parameters

| Parameter  | Type                            | Description                                                                                  |
| ---------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| `options?` | [`AIGNEOptions`](#aigneoptions) | Configuration options for the AIGNE instance including name, description, model, and agents. |

###### Returns

[`AIGNE`](#aigne)

#### Properties

| Property                                  | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="name-3"></a> `name?`               | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Optional name identifier for this AIGNE instance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| <a id="description-3"></a> `description?` | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Optional description of this AIGNE instance's purpose or functionality.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| <a id="model-3"></a> `model?`             | [`ChatModel`](models/chat-model.md#chatmodel)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Global model to use for all agents that don't specify their own model.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| <a id="limits-1"></a> `limits?`           | [`ContextLimits`](#contextlimits-1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Usage limits applied to this AIGNE instance's execution.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <a id="messagequeue"></a> `messageQueue`  | [`MessageQueue`](#messagequeue-1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Message queue for handling inter-agent communication.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| <a id="skills-3"></a> `skills`            | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[] & \{[`key`: `string`]: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>; \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Collection of skill agents available to this AIGNE instance. Provides indexed access by skill name.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| <a id="agents-1"></a> `agents`            | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[] & \{[`key`: `string`]: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>; \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Collection of primary agents managed by this AIGNE instance. Provides indexed access by agent name.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| <a id="invoke-5"></a> `invoke`            | \{\<`I`, `O`\>(`agent`): [`UserAgent`](#useragent)\<`I`, `O`\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[`O`, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\]\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[[`AgentResponseStream`](#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\>\]\>; \<`I`, `O`\>(`agent`, `message`, `options?`): `Promise`\<`O`\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>; \<`I`, `O`\>(`agent`, `message?`, `options?`): [`UserAgent`](#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](#agentresponse)\<`O`\> \| \[[`AgentResponse`](#agentresponse)\<`O`\>, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\]\>; \} | Invokes an agent with the specified input and options. This is a shorthand method that creates a new context and immediately invokes an agent. **Param** Arguments passed to the Context's invoke method. **Examples** Here's a simple example of how to invoke an agent: `const model = new OpenAIChatModel(); const aigne = new AIGNE({ model, }); const agent = AIAgent.from({ name: "chat", description: "A chat agent", }); const result = await aigne.invoke(agent, "hello"); console.log(result); // { $message: "Hello, How can I assist you today?" }` Here's an example of how to invoke an agent with streaming response: `const model = new OpenAIChatModel(); const aigne = new AIGNE({ model, }); const agent = AIAgent.from({ name: "chat", description: "A chat agent", }); let text = ""; const stream = await aigne.invoke(agent, "hello", { streaming: true }); for await (const chunk of readableStreamToAsyncIterator(stream)) { if (chunk.delta.text?.$message) text += chunk.delta.text.$message; } console.log(text);` |
| <a id="publish-1"></a> `publish`          | (`topic`, `payload`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Publishes a message to the message queue. This is a shorthand method that creates a new context and publishes a message. **Param** Arguments passed to the Context's publish method.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| <a id="subscribe-1"></a> `subscribe`      | \{(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\>; (`topic`, `listener`): [`Unsubscribe`](#unsubscribe-5); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5); \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Subscribes to messages in the message queue. This allows for receiving messages from agents and other components. **Param** Arguments passed to the MessageQueue's subscribe method.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| <a id="unsubscribe-1"></a> `unsubscribe`  | (`topic`, `listener`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Unsubscribes from messages in the message queue. This cancels a previous subscription to stop receiving messages.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

#### Methods

##### load()

> `static` **load**(`path`, `options?`): `Promise`\<[`AIGNE`](#aigne)\>

Loads an AIGNE instance from a directory containing an aigne.yaml file and agent definitions.
This static method provides a convenient way to initialize an AIGNE system from configuration files.

###### Parameters

| Parameter  | Type                            | Description                                           |
| ---------- | ------------------------------- | ----------------------------------------------------- |
| `path`     | `string`                        | Path to the directory containing the aigne.yaml file. |
| `options?` | [`AIGNEOptions`](#aigneoptions) | Options to override the loaded configuration.         |

###### Returns

`Promise`\<[`AIGNE`](#aigne)\>

A fully initialized AIGNE instance with configured agents and skills.

##### addAgent()

> **addAgent**(...`agents`): `void`

Adds one or more agents to this AIGNE instance.
Each agent is attached to this AIGNE instance, allowing it to access the AIGNE's resources.

###### Parameters

| Parameter   | Type                                                                | Description                                       |
| ----------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| ...`agents` | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[] | One or more Agent instances to add to this AIGNE. |

###### Returns

`void`

##### newContext()

> **newContext**(): [`AIGNEContext`](#aignecontext)

Creates a new execution context for this AIGNE instance.
Contexts isolate state for different flows or conversations.

###### Returns

[`AIGNEContext`](#aignecontext)

A new AIGNEContext instance bound to this AIGNE.

##### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Gracefully shuts down the AIGNE instance and all its agents and skills.
This ensures proper cleanup of resources before termination.

###### Returns

`Promise`\<`void`\>

A promise that resolves when shutdown is complete.

###### Examples

Here's an example of shutdown an AIGNE instance:

```ts
const model = new OpenAIChatModel();

const aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

await aigne.invoke(agent, "hello");

await aigne.shutdown();
```

Here's an example of using async dispose:

```ts
const model = new OpenAIChatModel();

await using aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

await aigne.invoke(agent, "hello");

// aigne will be automatically shutdown when exiting the using block
```

##### \[asyncDispose\]()

> **\[asyncDispose\]**(): `Promise`\<`void`\>

Asynchronous dispose method for the AIGNE instance.

###### Returns

`Promise`\<`void`\>

###### Example

Here's an example of using async dispose:

```ts
const model = new OpenAIChatModel();

await using aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

await aigne.invoke(agent, "hello");

// aigne will be automatically shutdown when exiting the using block
```

---

### AIGNEContext

#### Implements

- [`Context`](#context-2)

#### Constructors

##### Constructor

> **new AIGNEContext**(`parent?`): [`AIGNEContext`](#aignecontext)

###### Parameters

| Parameter | Type                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `parent?` | `Pick`\<[`Context`](#context-2), `"skills"` \| `"limits"` \| `"model"`\> & \{ `messageQueue?`: [`MessageQueue`](#messagequeue-1); \} |

###### Returns

[`AIGNEContext`](#aignecontext)

#### Properties

| Property                                 | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Description                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| <a id="parentid"></a> `parentId?`        | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                                                              |
| <a id="id"></a> `id`                     | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                                                              |
| <a id="internal"></a> `internal`         | `AIGNEContextInternal`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | -                                                                              |
| <a id="invoke-13"></a> `invoke`          | \{\<`I`, `O`\>(`agent`): [`UserAgent`](#useragent)\<`I`, `O`\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[`O`, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\]\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[[`AgentResponseStream`](#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\>\]\>; \<`I`, `O`\>(`agent`, `message`, `options?`): `Promise`\<`O`\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>; \<`I`, `O`\>(`agent`, `message?`, `options?`): [`UserAgent`](#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](#agentresponse)\<`O`\> \| \[[`AgentResponse`](#agentresponse)\<`O`\>, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\]\>; \} | Create a user agent to consistently invoke an agent **Param** Agent to invoke  |
| <a id="publish-4"></a> `publish`         | (`topic`, `payload`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Publish a message to a topic, the aigne will invoke the listeners of the topic |
| <a id="subscribe-7"></a> `subscribe`     | \{(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\>; (`topic`, `listener`): [`Unsubscribe`](#unsubscribe-5); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5); \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | -                                                                              |
| <a id="unsubscribe-4"></a> `unsubscribe` | (`topic`, `listener`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | -                                                                              |

#### Accessors

##### model

###### Get Signature

> **get** **model**(): `undefined` \| [`ChatModel`](models/chat-model.md#chatmodel)

###### Returns

`undefined` \| [`ChatModel`](models/chat-model.md#chatmodel)

###### Implementation of

[`Context`](#context-2).[`model`](#model-4)

##### skills

###### Get Signature

> **get** **skills**(): `undefined` \| [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[]

###### Returns

`undefined` \| [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[]

###### Implementation of

[`Context`](#context-2).[`skills`](#skills-4)

##### limits

###### Get Signature

> **get** **limits**(): `undefined` \| [`ContextLimits`](#contextlimits-1)

###### Returns

`undefined` \| [`ContextLimits`](#contextlimits-1)

###### Implementation of

[`Context`](#context-2).[`limits`](#limits-2)

##### status

###### Get Signature

> **get** **status**(): `"normal"` \| `"timeout"`

###### Returns

`"normal"` \| `"timeout"`

###### Implementation of

[`Context`](#context-2).[`status`](#status)

##### usage

###### Get Signature

> **get** **usage**(): [`ContextUsage`](#contextusage-1)

###### Returns

[`ContextUsage`](#contextusage-1)

###### Implementation of

[`Context`](#context-2).[`usage`](#usage)

#### Methods

##### newContext()

> **newContext**(`options`): [`AIGNEContext`](#aignecontext)

Create a child context with the same configuration as the parent context.
If `reset` is true, the child context will have a new state (such as: usage).

###### Parameters

| Parameter        | Type                       | Description                                              |
| ---------------- | -------------------------- | -------------------------------------------------------- |
| `options`        | \{ `reset?`: `boolean`; \} |                                                          |
| `options.reset?` | `boolean`                  | create a new context with initial state (such as: usage) |

###### Returns

[`AIGNEContext`](#aignecontext)

new context

###### Implementation of

[`Context`](#context-2).[`newContext`](#newcontext-2)

##### emit()

> **emit**\<`K`\>(`eventName`, ...`args`): `boolean`

###### Type Parameters

| Type Parameter                                            |
| --------------------------------------------------------- |
| `K` _extends_ keyof [`ContextEventMap`](#contexteventmap) |

###### Parameters

| Parameter   | Type                                                         |
| ----------- | ------------------------------------------------------------ |
| `eventName` | `K`                                                          |
| ...`args`   | `Args`\<`K`, [`ContextEmitEventMap`](#contextemiteventmap)\> |

###### Returns

`boolean`

###### Implementation of

`Context.emit`

##### on()

> **on**\<`K`\>(`eventName`, `listener`): `this`

###### Type Parameters

| Type Parameter                                            |
| --------------------------------------------------------- |
| `K` _extends_ keyof [`ContextEventMap`](#contexteventmap) |

###### Parameters

| Parameter   | Type                                                     |
| ----------- | -------------------------------------------------------- |
| `eventName` | `K`                                                      |
| `listener`  | `Listener`\<`K`, [`ContextEventMap`](#contexteventmap)\> |

###### Returns

`this`

###### Implementation of

`Context.on`

##### once()

> **once**\<`K`\>(`eventName`, `listener`): `this`

###### Type Parameters

| Type Parameter                                            |
| --------------------------------------------------------- |
| `K` _extends_ keyof [`ContextEventMap`](#contexteventmap) |

###### Parameters

| Parameter   | Type                                                     |
| ----------- | -------------------------------------------------------- |
| `eventName` | `K`                                                      |
| `listener`  | `Listener`\<`K`, [`ContextEventMap`](#contexteventmap)\> |

###### Returns

`this`

###### Implementation of

`Context.once`

##### off()

> **off**\<`K`\>(`eventName`, `listener`): `this`

###### Type Parameters

| Type Parameter                                            |
| --------------------------------------------------------- |
| `K` _extends_ keyof [`ContextEventMap`](#contexteventmap) |

###### Parameters

| Parameter   | Type                                                     |
| ----------- | -------------------------------------------------------- |
| `eventName` | `K`                                                      |
| `listener`  | `Listener`\<`K`, [`ContextEventMap`](#contexteventmap)\> |

###### Returns

`this`

###### Implementation of

`Context.off`

---

### MessageQueue

#### Constructors

##### Constructor

> **new MessageQueue**(): [`MessageQueue`](#messagequeue-1)

###### Returns

[`MessageQueue`](#messagequeue-1)

#### Properties

| Property                     | Type                                |
| ---------------------------- | ----------------------------------- |
| <a id="events"></a> `events` | `EventEmitter`\<`DefaultEventMap`\> |

#### Methods

##### publish()

> **publish**(`topic`, `payload`): `void`

###### Parameters

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `topic`   | `string` \| `string`[]              |
| `payload` | [`MessagePayload`](#messagepayload) |

###### Returns

`void`

##### error()

> **error**(`error`): `void`

###### Parameters

| Parameter | Type    |
| --------- | ------- |
| `error`   | `Error` |

###### Returns

`void`

##### subscribe()

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\>

###### Parameters

| Parameter   | Type        |
| ----------- | ----------- |
| `topic`     | `string`    |
| `listener?` | `undefined` |

###### Returns

`Promise`\<[`MessagePayload`](#messagepayload)\>

###### Call Signature

> **subscribe**(`topic`, `listener`): [`Unsubscribe`](#unsubscribe-5)

###### Parameters

| Parameter  | Type                                            |
| ---------- | ----------------------------------------------- |
| `topic`    | `string`                                        |
| `listener` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

[`Unsubscribe`](#unsubscribe-5)

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5)

###### Parameters

| Parameter   | Type                                            |
| ----------- | ----------------------------------------------- |
| `topic`     | `string`                                        |
| `listener?` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

`Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5)

##### unsubscribe()

> **unsubscribe**(`topic`, `listener`): `void`

###### Parameters

| Parameter  | Type                                            |
| ---------- | ----------------------------------------------- |
| `topic`    | `string`                                        |
| `listener` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

`void`

---

### PromptBuilder

#### Constructors

##### Constructor

> **new PromptBuilder**(`options?`): [`PromptBuilder`](#promptbuilder)

###### Parameters

| Parameter  | Type                                            |
| ---------- | ----------------------------------------------- |
| `options?` | [`PromptBuilderOptions`](#promptbuilderoptions) |

###### Returns

[`PromptBuilder`](#promptbuilder)

#### Properties

| Property                                    | Type                                                        |
| ------------------------------------------- | ----------------------------------------------------------- |
| <a id="instructions-3"></a> `instructions?` | `string` \| [`ChatMessagesTemplate`](#chatmessagestemplate) |

#### Methods

##### from()

###### Call Signature

> `static` **from**(`instructions`): [`PromptBuilder`](#promptbuilder)

###### Parameters

| Parameter      | Type     |
| -------------- | -------- |
| `instructions` | `string` |

###### Returns

[`PromptBuilder`](#promptbuilder)

###### Call Signature

> `static` **from**(`instructions`): [`PromptBuilder`](#promptbuilder)

###### Parameters

| Parameter                   | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Description                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `instructions`              | \{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `role`: `"user"` \| `"assistant"`; `content`: \{[`key`: `string`]: `unknown`; `type`: `"text"`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"image"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"audio"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"resource"`; `resource`: \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `blob`: `string`; \}; \}; \}[]; \} | -                                                                                                                               |
| `instructions._meta?`       | \{[`key`: `string`]: `unknown`; \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses. |
| `instructions.description?` | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | An optional description for the prompt.                                                                                         |
| `instructions.messages`     | \{[`key`: `string`]: `unknown`; `role`: `"user"` \| `"assistant"`; `content`: \{[`key`: `string`]: `unknown`; `type`: `"text"`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"image"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"audio"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"resource"`; `resource`: \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `blob`: `string`; \}; \}; \}[]                                                                                                                         | -                                                                                                                               |

###### Returns

[`PromptBuilder`](#promptbuilder)

###### Call Signature

> `static` **from**(`instructions`): `Promise`\<[`PromptBuilder`](#promptbuilder)\>

###### Parameters

| Parameter           | Type                    |
| ------------------- | ----------------------- |
| `instructions`      | \{ `path`: `string`; \} |
| `instructions.path` | `string`                |

###### Returns

`Promise`\<[`PromptBuilder`](#promptbuilder)\>

###### Call Signature

> `static` **from**(`instructions`): [`PromptBuilder`](#promptbuilder) \| `Promise`\<[`PromptBuilder`](#promptbuilder)\>

###### Parameters

| Parameter      | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instructions` | `string` \| \{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `role`: `"user"` \| `"assistant"`; `content`: \{[`key`: `string`]: `unknown`; `type`: `"text"`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"image"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"audio"`; `data`: `string`; `mimeType`: `string`; \} \| \{[`key`: `string`]: `unknown`; `type`: `"resource"`; `resource`: \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `text`: `string`; \} \| \{[`key`: `string`]: `unknown`; `uri`: `string`; `mimeType?`: `string`; `blob`: `string`; \}; \}; \}[]; \} \| \{ `path`: `string`; \} |

###### Returns

[`PromptBuilder`](#promptbuilder) \| `Promise`\<[`PromptBuilder`](#promptbuilder)\>

##### build()

> **build**(`options`): `Promise`\<[`ChatModelInput`](models/chat-model.md#chatmodelinput) & \{ `toolAgents?`: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[]; \}\>

###### Parameters

| Parameter | Type                                                      |
| --------- | --------------------------------------------------------- |
| `options` | [`PromptBuilderBuildOptions`](#promptbuilderbuildoptions) |

###### Returns

`Promise`\<[`ChatModelInput`](models/chat-model.md#chatmodelinput) & \{ `toolAgents?`: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[]; \}\>

---

### PromptTemplate

#### Constructors

##### Constructor

> **new PromptTemplate**(`template`): [`PromptTemplate`](#prompttemplate)

###### Parameters

| Parameter  | Type     |
| ---------- | -------- |
| `template` | `string` |

###### Returns

[`PromptTemplate`](#prompttemplate)

#### Properties

| Property                         | Type     |
| -------------------------------- | -------- |
| <a id="template"></a> `template` | `string` |

#### Methods

##### from()

> `static` **from**(`template`): [`PromptTemplate`](#prompttemplate)

###### Parameters

| Parameter  | Type     |
| ---------- | -------- |
| `template` | `string` |

###### Returns

[`PromptTemplate`](#prompttemplate)

##### format()

> **format**(`variables?`): `string`

###### Parameters

| Parameter    | Type                            |
| ------------ | ------------------------------- |
| `variables?` | `Record`\<`string`, `unknown`\> |

###### Returns

`string`

---

### ChatMessageTemplate

#### Extended by

- [`SystemMessageTemplate`](#systemmessagetemplate)
- [`UserMessageTemplate`](#usermessagetemplate)
- [`AgentMessageTemplate`](#agentmessagetemplate)
- [`ToolMessageTemplate`](#toolmessagetemplate)

#### Constructors

##### Constructor

> **new ChatMessageTemplate**(`role`, `content?`, `name?`): [`ChatMessageTemplate`](#chatmessagetemplate)

###### Parameters

| Parameter  | Type                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| `role`     | `"agent"` \| `"user"` \| `"system"` \| `"tool"`                                       |
| `content?` | [`ChatModelInputMessageContent`](models/chat-model.md#chatmodelinputmessagecontent-1) |
| `name?`    | `string`                                                                              |

###### Returns

[`ChatMessageTemplate`](#chatmessagetemplate)

#### Properties

| Property                          | Type                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| <a id="role-3"></a> `role`        | `"agent"` \| `"user"` \| `"system"` \| `"tool"`                                       |
| <a id="content-1"></a> `content?` | [`ChatModelInputMessageContent`](models/chat-model.md#chatmodelinputmessagecontent-1) |
| <a id="name-4"></a> `name?`       | `string`                                                                              |

#### Methods

##### format()

> **format**(`variables?`): [`ChatModelInputMessage`](models/chat-model.md#chatmodelinputmessage)

###### Parameters

| Parameter    | Type                            |
| ------------ | ------------------------------- |
| `variables?` | `Record`\<`string`, `unknown`\> |

###### Returns

[`ChatModelInputMessage`](models/chat-model.md#chatmodelinputmessage)

---

### SystemMessageTemplate

#### Extends

- [`ChatMessageTemplate`](#chatmessagetemplate)

#### Methods

##### from()

> `static` **from**(`content`, `name?`): [`SystemMessageTemplate`](#systemmessagetemplate)

###### Parameters

| Parameter | Type     |
| --------- | -------- |
| `content` | `string` |
| `name?`   | `string` |

###### Returns

[`SystemMessageTemplate`](#systemmessagetemplate)

---

### UserMessageTemplate

#### Extends

- [`ChatMessageTemplate`](#chatmessagetemplate)

#### Methods

##### from()

> `static` **from**(`template`, `name?`): [`UserMessageTemplate`](#usermessagetemplate)

###### Parameters

| Parameter  | Type                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| `template` | [`ChatModelInputMessageContent`](models/chat-model.md#chatmodelinputmessagecontent-1) |
| `name?`    | `string`                                                                              |

###### Returns

[`UserMessageTemplate`](#usermessagetemplate)

---

### AgentMessageTemplate

#### Extends

- [`ChatMessageTemplate`](#chatmessagetemplate)

#### Constructors

##### Constructor

> **new AgentMessageTemplate**(`content?`, `toolCalls?`, `name?`): [`AgentMessageTemplate`](#agentmessagetemplate)

###### Parameters

| Parameter    | Type                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| `content?`   | [`ChatModelInputMessageContent`](models/chat-model.md#chatmodelinputmessagecontent-1) |
| `toolCalls?` | [`ChatModelOutputToolCall`](models/chat-model.md#chatmodeloutputtoolcall)[]           |
| `name?`      | `string`                                                                              |

###### Returns

[`AgentMessageTemplate`](#agentmessagetemplate)

###### Overrides

[`ChatMessageTemplate`](#chatmessagetemplate).[`constructor`](#constructor-14)

#### Properties

| Property                            | Type                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------- |
| <a id="toolcalls"></a> `toolCalls?` | [`ChatModelOutputToolCall`](models/chat-model.md#chatmodeloutputtoolcall)[] |

#### Methods

##### from()

> `static` **from**(`template?`, `toolCalls?`, `name?`): [`AgentMessageTemplate`](#agentmessagetemplate)

###### Parameters

| Parameter    | Type                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| `template?`  | [`ChatModelInputMessageContent`](models/chat-model.md#chatmodelinputmessagecontent-1) |
| `toolCalls?` | [`ChatModelOutputToolCall`](models/chat-model.md#chatmodeloutputtoolcall)[]           |
| `name?`      | `string`                                                                              |

###### Returns

[`AgentMessageTemplate`](#agentmessagetemplate)

##### format()

> **format**(`variables?`): \{ `role`: [`Role`](models/chat-model.md#role); `content?`: [`ChatModelInputMessageContent`](models/chat-model.md#chatmodelinputmessagecontent-1); `toolCallId?`: `string`; `name?`: `string`; `toolCalls`: `undefined` \| [`ChatModelOutputToolCall`](models/chat-model.md#chatmodeloutputtoolcall)[]; \}

###### Parameters

| Parameter    | Type                            |
| ------------ | ------------------------------- |
| `variables?` | `Record`\<`string`, `unknown`\> |

###### Returns

| Name          | Type                                                                                       | Description                                                          |
| ------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `role`        | [`Role`](models/chat-model.md#role)                                                        | Role of the message (system, user, agent, or tool)                   |
| `content?`    | [`ChatModelInputMessageContent`](models/chat-model.md#chatmodelinputmessagecontent-1)      | Message content, can be text or multimodal content array             |
| `toolCallId?` | `string`                                                                                   | For tool response messages, specifies the corresponding tool call ID |
| `name?`       | `string`                                                                                   | Name of the message sender (for multi-agent scenarios)               |
| `toolCalls`   | `undefined` \| [`ChatModelOutputToolCall`](models/chat-model.md#chatmodeloutputtoolcall)[] | -                                                                    |

###### Overrides

[`ChatMessageTemplate`](#chatmessagetemplate).[`format`](#format-2)

---

### ToolMessageTemplate

#### Extends

- [`ChatMessageTemplate`](#chatmessagetemplate)

#### Constructors

##### Constructor

> **new ToolMessageTemplate**(`content`, `toolCallId`, `name?`): [`ToolMessageTemplate`](#toolmessagetemplate)

###### Parameters

| Parameter    | Type                 |
| ------------ | -------------------- |
| `content`    | `string` \| `object` |
| `toolCallId` | `string`             |
| `name?`      | `string`             |

###### Returns

[`ToolMessageTemplate`](#toolmessagetemplate)

###### Overrides

[`ChatMessageTemplate`](#chatmessagetemplate).[`constructor`](#constructor-14)

#### Properties

| Property                             | Type     |
| ------------------------------------ | -------- |
| <a id="toolcallid"></a> `toolCallId` | `string` |

#### Methods

##### from()

> `static` **from**(`content`, `toolCallId`, `name?`): [`ToolMessageTemplate`](#toolmessagetemplate)

###### Parameters

| Parameter    | Type                 |
| ------------ | -------------------- |
| `content`    | `string` \| `object` |
| `toolCallId` | `string`             |
| `name?`      | `string`             |

###### Returns

[`ToolMessageTemplate`](#toolmessagetemplate)

##### format()

> **format**(`variables?`): \{ `role`: [`Role`](models/chat-model.md#role); `content?`: [`ChatModelInputMessageContent`](models/chat-model.md#chatmodelinputmessagecontent-1); `toolCalls?`: \{ `id`: `string`; `type`: `"function"`; `function`: \{ `name`: `string`; `arguments`: [`Message`](#message); \}; \}[]; `name?`: `string`; `toolCallId`: `string`; \}

###### Parameters

| Parameter    | Type                            |
| ------------ | ------------------------------- |
| `variables?` | `Record`\<`string`, `unknown`\> |

###### Returns

| Name         | Type                                                                                                                   | Description                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `role`       | [`Role`](models/chat-model.md#role)                                                                                    | Role of the message (system, user, agent, or tool)           |
| `content?`   | [`ChatModelInputMessageContent`](models/chat-model.md#chatmodelinputmessagecontent-1)                                  | Message content, can be text or multimodal content array     |
| `toolCalls?` | \{ `id`: `string`; `type`: `"function"`; `function`: \{ `name`: `string`; `arguments`: [`Message`](#message); \}; \}[] | Tool call details when the agent wants to execute tool calls |
| `name?`      | `string`                                                                                                               | Name of the message sender (for multi-agent scenarios)       |
| `toolCallId` | `string`                                                                                                               | -                                                            |

###### Overrides

[`ChatMessageTemplate`](#chatmessagetemplate).[`format`](#format-2)

---

### ChatMessagesTemplate

#### Constructors

##### Constructor

> **new ChatMessagesTemplate**(`messages`): [`ChatMessagesTemplate`](#chatmessagestemplate)

###### Parameters

| Parameter  | Type                                            |
| ---------- | ----------------------------------------------- |
| `messages` | [`ChatMessageTemplate`](#chatmessagetemplate)[] |

###### Returns

[`ChatMessagesTemplate`](#chatmessagestemplate)

#### Properties

| Property                         | Type                                            |
| -------------------------------- | ----------------------------------------------- |
| <a id="messages"></a> `messages` | [`ChatMessageTemplate`](#chatmessagetemplate)[] |

#### Methods

##### from()

> `static` **from**(`messages`): [`ChatMessagesTemplate`](#chatmessagestemplate)

###### Parameters

| Parameter  | Type                                                        |
| ---------- | ----------------------------------------------------------- |
| `messages` | `string` \| [`ChatMessageTemplate`](#chatmessagetemplate)[] |

###### Returns

[`ChatMessagesTemplate`](#chatmessagestemplate)

##### format()

> **format**(`variables?`): [`ChatModelInputMessage`](models/chat-model.md#chatmodelinputmessage)[]

###### Parameters

| Parameter    | Type                            |
| ------------ | ------------------------------- |
| `variables?` | `Record`\<`string`, `unknown`\> |

###### Returns

[`ChatModelInputMessage`](models/chat-model.md#chatmodelinputmessage)[]

## Interfaces

### AgentOptions\<I, O\>

Configuration options for an agent

#### Extended by

- [`FunctionAgentOptions`](#functionagentoptions)
- [`AIAgentOptions`](#aiagentoptions)
- [`MCPAgentOptions`](#mcpagentoptions)
- [`MCPBaseOptions`](#mcpbaseoptions)
- [`TeamAgentOptions`](#teamagentoptions)
- [`UserAgentOptions`](#useragentoptions)

#### Type Parameters

| Type Parameter                      | Default type          | Description                   |
| ----------------------------------- | --------------------- | ----------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | The agent input message type  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | The agent output message type |

#### Properties

| Property                                                  | Type                                                                                                                           | Description                                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="subscribetopic-1"></a> `subscribeTopic?`           | [`SubscribeTopic`](#subscribetopic)                                                                                            | Topics the agent should subscribe to These topics determine which messages the agent will receive from the system                                     |
| <a id="publishtopic-1"></a> `publishTopic?`               | [`PublishTopic`](#publishtopic)\<`O`\>                                                                                         | Topics the agent should publish to These topics determine where the agent's output messages will be sent in the system                                |
| <a id="name"></a> `name?`                                 | `string`                                                                                                                       | Name of the agent Used for identification and logging. Defaults to the constructor name if not specified                                              |
| <a id="description"></a> `description?`                   | `string`                                                                                                                       | Description of the agent A human-readable description of what the agent does, useful for documentation and debugging                                  |
| <a id="inputschema"></a> `inputSchema?`                   | [`AgentInputOutputSchema`](#agentinputoutputschema)\<`I`\>                                                                     | Zod schema defining the input message structure Used to validate that input messages conform to the expected format                                   |
| <a id="outputschema"></a> `outputSchema?`                 | [`AgentInputOutputSchema`](#agentinputoutputschema)\<`O`\>                                                                     | Zod schema defining the output message structure Used to validate that output messages conform to the expected format                                 |
| <a id="includeinputinoutput"></a> `includeInputInOutput?` | `boolean`                                                                                                                      | Whether to include input in the output When true, the agent will merge input fields into the output object                                            |
| <a id="skills"></a> `skills?`                             | ([`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| [`FunctionAgentFn`](#functionagentfn)\<`any`, `any`\>)[] | List of skills (other agents or functions) this agent has These skills can be used by the agent to delegate tasks or extend its capabilities          |
| <a id="disableevents"></a> `disableEvents?`               | `boolean`                                                                                                                      | Whether to disable emitting events for agent actions When true, the agent won't emit events like agentStarted, agentSucceed, or agentFailed           |
| <a id="memory"></a> `memory?`                             | `boolean` \| [`AgentMemory`](#agentmemory-1) \| [`AgentMemoryOptions`](#agentmemoryoptions)                                    | Memory configuration for the agent Can be an AgentMemory instance, configuration options, or simply a boolean to enable/disable with default settings |

---

### AgentInvokeOptions

Options for invoking an agent

#### Extended by

- [`InvokeOptions`](#invokeoptions)
- [`AIGNEClientInvokeOptions`](client.md#aigneclientinvokeoptions)

#### Properties

| Property                            | Type      | Description                                                                                                                                                                                                                                                                                             |
| ----------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="streaming"></a> `streaming?` | `boolean` | Whether to enable streaming response When true, the invoke method returns a ReadableStream that emits chunks of the response as they become available, allowing for real-time display of results When false or undefined, the invoke method waits for full completion and returns the final JSON result |

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
| <a id="delta"></a> `delta` | \{ `text?`: `Partial`\<\{ \[key in string \| number \| symbol as Extract\<T\[key\], string\> extends string ? key : never\]: string \}\> \| `Partial`\<\{[`key`: `string`]: `string`; \}\>; `json?`: `Partial`\<[`TransferAgentOutput`](#transferagentoutput) \| `T`\>; \} |
| `delta.text?`              | `Partial`\<\{ \[key in string \| number \| symbol as Extract\<T\[key\], string\> extends string ? key : never\]: string \}\> \| `Partial`\<\{[`key`: `string`]: `string`; \}\>                                                                                             |
| `delta.json?`              | `Partial`\<[`TransferAgentOutput`](#transferagentoutput) \| `T`\>                                                                                                                                                                                                          |

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

| Property                         | Type                                              | Description                                                                                                                          |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| <a id="process-2"></a> `process` | [`FunctionAgentFn`](#functionagentfn)\<`I`, `O`\> | Function implementing the agent's processing logic This function is called by the process method to handle input and generate output |

---

### AIAgentOptions\<I, O\>

Configuration options for an AI Agent

These options extend the base agent options with AI-specific parameters
like model configuration, prompt instructions, and tool choice.

#### Extends

- [`AgentOptions`](#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                      | Default type          | Description                               |
| ----------------------------------- | --------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | The output message type the agent returns |

#### Properties

| Property                                  | Type                                                                                                           | Description                                                                                                                             |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="model"></a> `model?`               | [`ChatModel`](models/chat-model.md#chatmodel)                                                                  | The language model to use for this agent If not provided, the agent will use the model from the context                                 |
| <a id="instructions"></a> `instructions?` | `string` \| [`PromptBuilder`](#promptbuilder)                                                                  | Instructions to guide the AI model's behavior Can be a simple string or a full PromptBuilder instance for more complex prompt templates |
| <a id="outputkey"></a> `outputKey?`       | `string`                                                                                                       | Custom key to use for text output in the response Defaults to $message if not specified                                                 |
| <a id="toolchoice"></a> `toolChoice?`     | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| [`AIAgentToolChoice`](#aiagenttoolchoice) | Controls how the agent uses tools during execution **Default** `AIAgentToolChoice.auto`                                                 |

---

### MCPAgentOptions

Configuration options for an agent

#### Extends

- [`AgentOptions`](#agentoptions)

#### Properties

| Property                            | Type                            |
| ----------------------------------- | ------------------------------- |
| <a id="client"></a> `client`        | `Client`                        |
| <a id="prompts"></a> `prompts?`     | [`MCPPrompt`](#mcpprompt)[]     |
| <a id="resources"></a> `resources?` | [`MCPResource`](#mcpresource)[] |

---

### ClientWithReconnectOptions

#### Properties

| Property                                          | Type                                  |
| ------------------------------------------------- | ------------------------------------- |
| <a id="transportcreator"></a> `transportCreator?` | () => `PromiseOrValue`\<`Transport`\> |
| <a id="timeout-1"></a> `timeout?`                 | `number`                              |
| <a id="maxreconnects-1"></a> `maxReconnects?`     | `number`                              |
| <a id="shouldreconnect-1"></a> `shouldReconnect?` | (`error`) => `boolean`                |

---

### MCPBaseOptions\<I, O\>

Configuration options for an agent

#### Extends

- [`AgentOptions`](#agentoptions)\<`I`, `O`\>

#### Extended by

- [`MCPResourceOptions`](#mcpresourceoptions)

#### Type Parameters

| Type Parameter                      | Default type          | Description                   |
| ----------------------------------- | --------------------- | ----------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | The agent input message type  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | The agent output message type |

#### Properties

| Property                       | Type                  |
| ------------------------------ | --------------------- |
| <a id="client-2"></a> `client` | `ClientWithReconnect` |

---

### MCPPromptInput

Basic message type that can contain any key-value pairs

#### Extends

- [`Message`](#message)

#### Indexable

\[`key`: `string`\]: `string`

---

### MCPResourceOptions

Configuration options for an agent

#### Extends

- [`MCPBaseOptions`](#mcpbaseoptions)\<[`MCPPromptInput`](#mcppromptinput), `ReadResourceResult`\>

#### Properties

| Property               | Type     |
| ---------------------- | -------- |
| <a id="uri"></a> `uri` | `string` |

---

### AgentMemoryOptions

#### Properties

| Property                                            | Type                   | Description                    |
| --------------------------------------------------- | ---------------------- | ------------------------------ |
| <a id="enabled"></a> `enabled?`                     | `boolean`              | Enable memory, default is true |
| <a id="subscribetopic-3"></a> `subscribeTopic?`     | `string` \| `string`[] | -                              |
| <a id="maxmemoriesinchat"></a> `maxMemoriesInChat?` | `number`               | -                              |

---

### Memory

#### Properties

| Property                       | Type                  |
| ------------------------------ | --------------------- |
| <a id="role"></a> `role`       | `"agent"` \| `"user"` |
| <a id="content"></a> `content` | [`Message`](#message) |
| <a id="source"></a> `source?`  | `string`              |

---

### TeamAgentOptions\<I, O\>

Configuration options for creating a TeamAgent.

These options extend the base AgentOptions and add team-specific settings.

#### Extends

- [`AgentOptions`](#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

#### Properties

| Property                  | Type                          | Description                                                                          |
| ------------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| <a id="mode"></a> `mode?` | [`ProcessMode`](#processmode) | The method to process the agents in the team. **Default** `{ProcessMode.sequential}` |

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

---

### UserAgentOptions\<I, O\>

Configuration options for an agent

#### Extends

- [`AgentOptions`](#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                      | Default type          | Description                   |
| ----------------------------------- | --------------------- | ----------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | The agent input message type  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | The agent output message type |

#### Properties

| Property                                | Type                                                              |
| --------------------------------------- | ----------------------------------------------------------------- |
| <a id="context"></a> `context`          | [`Context`](#context-2)                                           |
| <a id="process-17"></a> `process?`      | [`FunctionAgentFn`](#functionagentfn)\<`I`, `O`\>                 |
| <a id="activeagent"></a> `activeAgent?` | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> |

---

### AIGNEOptions

Options for the AIGNE class.

#### Properties

| Property                                  | Type                                                                | Description                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <a id="name-2"></a> `name?`               | `string`                                                            | The name of the AIGNE instance.                                                   |
| <a id="description-2"></a> `description?` | `string`                                                            | The description of the AIGNE instance.                                            |
| <a id="model-2"></a> `model?`             | [`ChatModel`](models/chat-model.md#chatmodel)                       | Global model to use for all agents not specifying a model.                        |
| <a id="skills-2"></a> `skills?`           | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[] | Skills to use for the AIGNE instance.                                             |
| <a id="agents"></a> `agents?`             | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[] | Agents to use for the AIGNE instance.                                             |
| <a id="limits"></a> `limits?`             | [`ContextLimits`](#contextlimits-1)                                 | Limits for the AIGNE instance, such as timeout, max tokens, max invocations, etc. |

---

### AgentEvent

#### Properties

| Property                                        | Type              |
| ----------------------------------------------- | ----------------- |
| <a id="parentcontextid"></a> `parentContextId?` | `string`          |
| <a id="contextid"></a> `contextId`              | `string`          |
| <a id="timestamp"></a> `timestamp`              | `number`          |
| <a id="agent-1"></a> `agent`                    | [`Agent`](#agent) |

---

### ContextEventMap

#### Properties

| Property                                 | Type                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| <a id="agentstarted"></a> `agentStarted` | \[[`AgentEvent`](#agentevent) & \{ `input`: [`Message`](#message); \}\]  |
| <a id="agentsucceed"></a> `agentSucceed` | \[[`AgentEvent`](#agentevent) & \{ `output`: [`Message`](#message); \}\] |
| <a id="agentfailed"></a> `agentFailed`   | \[[`AgentEvent`](#agentevent) & \{ `error`: `Error`; \}\]                |

---

### InvokeOptions

Options for invoking an agent

#### Extends

- [`AgentInvokeOptions`](#agentinvokeoptions)

#### Properties

| Property                                            | Type      |
| --------------------------------------------------- | --------- |
| <a id="returnactiveagent"></a> `returnActiveAgent?` | `boolean` |
| <a id="disabletransfer"></a> `disableTransfer?`     | `boolean` |

---

### Context

#### Extends

- `TypedEventEmitter`\<[`ContextEventMap`](#contexteventmap), [`ContextEmitEventMap`](#contextemiteventmap)\>

#### Properties

| Property                        | Type                                                                |
| ------------------------------- | ------------------------------------------------------------------- |
| <a id="model-4"></a> `model?`   | [`ChatModel`](models/chat-model.md#chatmodel)                       |
| <a id="skills-4"></a> `skills?` | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[] |
| <a id="usage"></a> `usage`      | [`ContextUsage`](#contextusage-1)                                   |
| <a id="limits-2"></a> `limits?` | [`ContextLimits`](#contextlimits-1)                                 |
| <a id="status"></a> `status?`   | `"normal"` \| `"timeout"`                                           |

#### Methods

##### invoke()

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`): [`UserAgent`](#useragent)\<`I`, `O`\>

Create a user agent to consistently invoke an agent

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

###### Parameters

| Parameter | Type                          | Description     |
| --------- | ----------------------------- | --------------- |
| `agent`   | [`Agent`](#agent)\<`I`, `O`\> | Agent to invoke |

###### Returns

[`UserAgent`](#useragent)\<`I`, `O`\>

User agent

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[`O`, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\]\>

Invoke an agent with a message and return the output and the active agent

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

###### Parameters

| Parameter | Type                                                                                          | Description                  |
| --------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| `agent`   | [`Agent`](#agent)\<`I`, `O`\>                                                                 | Agent to invoke              |
| `message` | `string` \| `I`                                                                               | Message to pass to the agent |
| `options` | [`InvokeOptions`](#invokeoptions) & \{ `returnActiveAgent`: `true`; `streaming?`: `false`; \} | -                            |

###### Returns

`Promise`\<\[`O`, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\]\>

the output of the agent and the final active agent

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[[`AgentResponseStream`](#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\>\]\>

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

###### Parameters

| Parameter | Type                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- |
| `agent`   | [`Agent`](#agent)\<`I`, `O`\>                                                               |
| `message` | `string` \| `I`                                                                             |
| `options` | [`InvokeOptions`](#invokeoptions) & \{ `returnActiveAgent`: `true`; `streaming`: `true`; \} |

###### Returns

`Promise`\<\[[`AgentResponseStream`](#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\>\]\>

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options?`): `Promise`\<`O`\>

Invoke an agent with a message

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

###### Parameters

| Parameter  | Type                                                             | Description                  |
| ---------- | ---------------------------------------------------------------- | ---------------------------- |
| `agent`    | [`Agent`](#agent)\<`I`, `O`\>                                    | Agent to invoke              |
| `message`  | `string` \| `I`                                                  | Message to pass to the agent |
| `options?` | [`InvokeOptions`](#invokeoptions) & \{ `streaming?`: `false`; \} | -                            |

###### Returns

`Promise`\<`O`\>

the output of the agent

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

###### Parameters

| Parameter | Type                                                           |
| --------- | -------------------------------------------------------------- |
| `agent`   | [`Agent`](#agent)\<`I`, `O`\>                                  |
| `message` | `string` \| `I`                                                |
| `options` | [`InvokeOptions`](#invokeoptions) & \{ `streaming`: `true`; \} |

###### Returns

`Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message?`, `options?`): [`UserAgent`](#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](#agentresponse)\<`O`\> \| \[[`AgentResponse`](#agentresponse)\<`O`\>, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\]\>

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

###### Parameters

| Parameter  | Type                              |
| ---------- | --------------------------------- |
| `agent`    | [`Agent`](#agent)\<`I`, `O`\>     |
| `message?` | `string` \| `I`                   |
| `options?` | [`InvokeOptions`](#invokeoptions) |

###### Returns

[`UserAgent`](#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](#agentresponse)\<`O`\> \| \[[`AgentResponse`](#agentresponse)\<`O`\>, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\]\>

##### publish()

> **publish**(`topic`, `payload`): `void`

Publish a message to a topic, the aigne will invoke the listeners of the topic

###### Parameters

| Parameter | Type                                                       | Description                            |
| --------- | ---------------------------------------------------------- | -------------------------------------- |
| `topic`   | `string` \| `string`[]                                     | topic name, or an array of topic names |
| `payload` | `Omit`\<[`MessagePayload`](#messagepayload), `"context"`\> | message to publish                     |

###### Returns

`void`

##### subscribe()

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\>

###### Parameters

| Parameter   | Type        |
| ----------- | ----------- |
| `topic`     | `string`    |
| `listener?` | `undefined` |

###### Returns

`Promise`\<[`MessagePayload`](#messagepayload)\>

###### Call Signature

> **subscribe**(`topic`, `listener`): [`Unsubscribe`](#unsubscribe-5)

###### Parameters

| Parameter  | Type                                            |
| ---------- | ----------------------------------------------- |
| `topic`    | `string`                                        |
| `listener` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

[`Unsubscribe`](#unsubscribe-5)

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5)

###### Parameters

| Parameter   | Type                                            |
| ----------- | ----------------------------------------------- |
| `topic`     | `string`                                        |
| `listener?` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

`Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5)

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5)

###### Parameters

| Parameter   | Type                                            |
| ----------- | ----------------------------------------------- |
| `topic`     | `string`                                        |
| `listener?` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

`Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-5)

##### unsubscribe()

> **unsubscribe**(`topic`, `listener`): `void`

###### Parameters

| Parameter  | Type                                            |
| ---------- | ----------------------------------------------- |
| `topic`    | `string`                                        |
| `listener` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

`void`

##### newContext()

> **newContext**(`options?`): [`Context`](#context-2)

Create a child context with the same configuration as the parent context.
If `reset` is true, the child context will have a new state (such as: usage).

###### Parameters

| Parameter        | Type                       | Description                                              |
| ---------------- | -------------------------- | -------------------------------------------------------- |
| `options?`       | \{ `reset?`: `boolean`; \} |                                                          |
| `options.reset?` | `boolean`                  | create a new context with initial state (such as: usage) |

###### Returns

[`Context`](#context-2)

new context

---

### MessagePayload

#### Properties

| Property                         | Type                    |
| -------------------------------- | ----------------------- |
| <a id="role-1"></a> `role`       | `"agent"` \| `"user"`   |
| <a id="source-1"></a> `source?`  | `string`                |
| <a id="message-1"></a> `message` | [`Message`](#message)   |
| <a id="context-3"></a> `context` | [`Context`](#context-2) |

---

### ContextUsage

#### Properties

| Property                                 | Type     |
| ---------------------------------------- | -------- |
| <a id="inputtokens"></a> `inputTokens`   | `number` |
| <a id="outputtokens"></a> `outputTokens` | `number` |
| <a id="agentcalls"></a> `agentCalls`     | `number` |

---

### ContextLimits

#### Properties

| Property                                        | Type     |
| ----------------------------------------------- | -------- |
| <a id="maxtokens"></a> `maxTokens?`             | `number` |
| <a id="maxagentinvokes"></a> `maxAgentInvokes?` | `number` |
| <a id="timeout-2"></a> `timeout?`               | `number` |

---

### PromptBuilderOptions

#### Properties

| Property                                    | Type                                                        |
| ------------------------------------------- | ----------------------------------------------------------- |
| <a id="instructions-2"></a> `instructions?` | `string` \| [`ChatMessagesTemplate`](#chatmessagestemplate) |

---

### PromptBuilderBuildOptions

#### Properties

| Property                                    | Type                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| <a id="memory-3"></a> `memory?`             | [`AgentMemory`](#agentmemory-1)                                         |
| <a id="context-4"></a> `context?`           | [`Context`](#context-2)                                                 |
| <a id="agent-2"></a> `agent?`               | [`AIAgent`](#aiagent)\<[`Message`](#message), [`Message`](#message)\>   |
| <a id="input"></a> `input?`                 | [`Message`](#message)                                                   |
| <a id="model-6"></a> `model?`               | [`ChatModel`](models/chat-model.md#chatmodel)                           |
| <a id="outputschema-2"></a> `outputSchema?` | `ZodType`\<[`Message`](#message), `ZodTypeDef`, [`Message`](#message)\> |

## Type Aliases

### Message

> **Message** = `Record`\<`string`, `unknown`\>

Basic message type that can contain any key-value pairs

---

### SubscribeTopic

> **SubscribeTopic** = `string` \| `string`[]

Topics the agent subscribes to, can be a single topic string or an array of topic strings

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

### AgentResponseStream\<T\>

> **AgentResponseStream**\<`T`\> = `ReadableStream`\<[`AgentResponseChunk`](#agentresponsechunk)\<`T`\>\>

Streaming response type for an agent

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

### AgentInputOutputSchema\<I\>

> **AgentInputOutputSchema**\<`I`\> = `ZodType`\<`I`\> \| (`agent`) => `ZodType`\<`I`\>

Schema definition type for agent input/output

Can be a Zod type definition or a function that returns a Zod type

#### Type Parameters

| Type Parameter                      | Default type          | Description                     |
| ----------------------------------- | --------------------- | ------------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | Agent input/output message type |

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

| Parameter | Type                    | Description       |
| --------- | ----------------------- | ----------------- |
| `input`   | `I`                     | Input message     |
| `context` | [`Context`](#context-2) | Execution context |

#### Returns

`PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Processing result, can be synchronous or asynchronous

---

### MCPServerOptions

> **MCPServerOptions** = [`SSEServerParameters`](#sseserverparameters) \| `StdioServerParameters`

---

### SSEServerParameters

> **SSEServerParameters** = \{ `url`: `string`; `transport?`: `"sse"` \| `"streamableHttp"`; `opts?`: `SSEClientTransportOptions` \| `StreamableHTTPClientTransportOptions`; `timeout?`: `number`; `maxReconnects?`: `number`; `shouldReconnect?`: (`error`) => `boolean`; \}

#### Properties

| Property                                        | Type                                                                  | Description                                                                                                                             |
| ----------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="url"></a> `url`                          | `string`                                                              | -                                                                                                                                       |
| <a id="transport"></a> `transport?`             | `"sse"` \| `"streamableHttp"`                                         | Whether to use the StreamableHTTPClientTransport instead of the SSEClientTransport. **Default** `"sse"`                                 |
| <a id="opts"></a> `opts?`                       | `SSEClientTransportOptions` \| `StreamableHTTPClientTransportOptions` | Additional options to pass to the SSEClientTransport or StreamableHTTPClientTransport.                                                  |
| <a id="timeout"></a> `timeout?`                 | `number`                                                              | The timeout for requests to the server, in milliseconds. **Default** `60000`                                                            |
| <a id="maxreconnects"></a> `maxReconnects?`     | `number`                                                              | Whether to automatically reconnect to the server if the connection is lost. **Default** `10 set to 0 to disable automatic reconnection` |
| <a id="shouldreconnect"></a> `shouldReconnect?` | (`error`) => `boolean`                                                | A function that determines whether to reconnect to the server based on the error. default to reconnect on all errors.                   |

---

### ContextEmitEventMap

> **ContextEmitEventMap** = \{ \[K in keyof ContextEventMap\]: OmitPropertiesFromArrayFirstElement\<ContextEventMap\[K\], "contextId" \| "parentContextId" \| "timestamp"\> \}

---

### MessageQueueListener()

> **MessageQueueListener** = (`message`) => `void`

#### Parameters

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `message` | [`MessagePayload`](#messagepayload) |

#### Returns

`void`

---

### Unsubscribe()

> **Unsubscribe** = () => `void`

#### Returns

`void`

## Variables

### agentOptionsSchema

> `const` **agentOptionsSchema**: `ZodObject`\<`{ [key in keyof AgentOptions]: ZodType<AgentOptions[key]> }`\>

---

### aiAgentToolChoiceSchema

> `const` **aiAgentToolChoiceSchema**: `ZodUnion`\<\[`ZodLiteral`\<`"auto"`\>, `ZodLiteral`\<`"none"`\>, `ZodLiteral`\<`"required"`\>, `ZodLiteral`\<`"router"`\>, `ZodType`\<[`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>, `ZodTypeDef`, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\>\]\>

Zod schema for validating AIAgentToolChoice values

Used to ensure that toolChoice receives valid values

---

### aiAgentOptionsSchema

> `const` **aiAgentOptionsSchema**: `ZodObject`\<\{ `subscribeTopic?`: `ZodType`\<`undefined` \| [`SubscribeTopic`](#subscribetopic), `ZodTypeDef`, `undefined` \| [`SubscribeTopic`](#subscribetopic)\>; `publishTopic?`: `ZodType`\<`undefined` \| [`PublishTopic`](#publishtopic)\<[`Message`](#message)\>, `ZodTypeDef`, `undefined` \| [`PublishTopic`](#publishtopic)\<[`Message`](#message)\>\>; `name?`: `ZodType`\<`undefined` \| `string`, `ZodTypeDef`, `undefined` \| `string`\>; `description?`: `ZodType`\<`undefined` \| `string`, `ZodTypeDef`, `undefined` \| `string`\>; `inputSchema?`: `ZodType`\<`undefined` \| [`AgentInputOutputSchema`](#agentinputoutputschema)\<[`Message`](#message)\>, `ZodTypeDef`, `undefined` \| [`AgentInputOutputSchema`](#agentinputoutputschema)\<[`Message`](#message)\>\>; `outputSchema?`: `ZodType`\<`undefined` \| [`AgentInputOutputSchema`](#agentinputoutputschema)\<[`Message`](#message)\>, `ZodTypeDef`, `undefined` \| [`AgentInputOutputSchema`](#agentinputoutputschema)\<[`Message`](#message)\>\>; `includeInputInOutput?`: `ZodType`\<`undefined` \| `boolean`, `ZodTypeDef`, `undefined` \| `boolean`\>; `skills?`: `ZodType`\<`undefined` \| ([`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| [`FunctionAgentFn`](#functionagentfn)\<`any`, `any`\>)[], `ZodTypeDef`, `undefined` \| ([`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| [`FunctionAgentFn`](#functionagentfn)\<`any`, `any`\>)[]\>; `disableEvents?`: `ZodType`\<`undefined` \| `boolean`, `ZodTypeDef`, `undefined` \| `boolean`\>; `memory?`: `ZodType`\<`undefined` \| `boolean` \| [`AgentMemory`](#agentmemory-1) \| [`AgentMemoryOptions`](#agentmemoryoptions), `ZodTypeDef`, `undefined` \| `boolean` \| [`AgentMemory`](#agentmemory-1) \| [`AgentMemoryOptions`](#agentmemoryoptions)\>; \} & \{ `model`: `ZodOptional`\<`ZodType`\<[`ChatModel`](models/chat-model.md#chatmodel), `ZodTypeDef`, [`ChatModel`](models/chat-model.md#chatmodel)\>\>; `instructions`: `ZodOptional`\<`ZodUnion`\<\[`ZodString`, `ZodType`\<[`PromptBuilder`](#promptbuilder), `ZodTypeDef`, [`PromptBuilder`](#promptbuilder)\>\]\>\>; `outputKey`: `ZodOptional`\<`ZodString`\>; `toolChoice`: `ZodOptional`\<`ZodUnion`\<\[`ZodLiteral`\<`"auto"`\>, `ZodLiteral`\<`"none"`\>, `ZodLiteral`\<`"required"`\>, `ZodLiteral`\<`"router"`\>, `ZodType`\<[`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>, `ZodTypeDef`, [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>\>\]\>\>; \}, `UnknownKeysParam`, `ZodTypeAny`, \{ `subscribeTopic?`: `unknown`; `publishTopic?`: `unknown`; `name?`: `unknown`; `description?`: `unknown`; `inputSchema?`: `unknown`; `outputSchema?`: `unknown`; `includeInputInOutput?`: `unknown`; `skills?`: `unknown`; `disableEvents?`: `unknown`; `memory?`: `unknown`; `model?`: [`ChatModel`](models/chat-model.md#chatmodel); `instructions?`: `string` \| [`PromptBuilder`](#promptbuilder); `outputKey?`: `string`; `toolChoice?`: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| `"auto"` \| `"none"` \| `"required"` \| `"router"`; \}, \{ `subscribeTopic?`: `unknown`; `publishTopic?`: `unknown`; `name?`: `unknown`; `description?`: `unknown`; `inputSchema?`: `unknown`; `outputSchema?`: `unknown`; `includeInputInOutput?`: `unknown`; `skills?`: `unknown`; `disableEvents?`: `unknown`; `memory?`: `unknown`; `model?`: [`ChatModel`](models/chat-model.md#chatmodel); `instructions?`: `string` \| [`PromptBuilder`](#promptbuilder); `outputKey?`: `string`; `toolChoice?`: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| `"auto"` \| `"none"` \| `"required"` \| `"router"`; \}\>

Zod schema for validating AIAgentOptions

Extends the base agent options schema with AI-specific parameters

---

### transferAgentOutputKey

> `const` **transferAgentOutputKey**: `"$transferAgentTo"` = `"$transferAgentTo"`

---

### UserInputTopic

> `const` **UserInputTopic**: `"UserInputTopic"` = `"UserInputTopic"`

---

### UserOutputTopic

> `const` **UserOutputTopic**: `"UserOutputTopic"` = `"UserOutputTopic"`

---

### MESSAGE_KEY

> `const` **MESSAGE_KEY**: `"$message"` = `"$message"`

---

### DEFAULT_MAX_HISTORY_MESSAGES

> `const` **DEFAULT_MAX_HISTORY_MESSAGES**: `10` = `10`

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

### transferToAgentOutput()

> **transferToAgentOutput**(`agent`): [`TransferAgentOutput`](#transferagentoutput)

#### Parameters

| Parameter | Type              |
| --------- | ----------------- |
| `agent`   | [`Agent`](#agent) |

#### Returns

[`TransferAgentOutput`](#transferagentoutput)

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

### replaceTransferAgentToName()

> **replaceTransferAgentToName**(`output`): [`Message`](#message)

#### Parameters

| Parameter | Type                  |
| --------- | --------------------- |
| `output`  | [`Message`](#message) |

#### Returns

[`Message`](#message)

---

### createPublishMessage()

> **createPublishMessage**(`message`, `from?`): `Omit`\<[`MessagePayload`](#messagepayload), `"context"`\>

#### Parameters

| Parameter | Type                                                              |
| --------- | ----------------------------------------------------------------- |
| `message` | `string` \| [`Message`](#message)                                 |
| `from?`   | [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> |

#### Returns

`Omit`\<[`MessagePayload`](#messagepayload), `"context"`\>

---

### newEmptyContextUsage()

> **newEmptyContextUsage**(): [`ContextUsage`](#contextusage-1)

#### Returns

[`ContextUsage`](#contextusage-1)

---

### createMessage()

> **createMessage**\<`I`\>(`message`): `I`

#### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |

#### Parameters

| Parameter | Type            |
| --------- | --------------- |
| `message` | `string` \| `I` |

#### Returns

`I`

---

### getMessage()

> **getMessage**(`input`): `undefined` \| `string`

#### Parameters

| Parameter | Type                  |
| --------- | --------------------- |
| `input`   | [`Message`](#message) |

#### Returns

`undefined` \| `string`

---

### parseChatMessages()

> **parseChatMessages**(`messages`): `undefined` \| [`ChatMessageTemplate`](#chatmessagetemplate)[]

#### Parameters

| Parameter  | Type      |
| ---------- | --------- |
| `messages` | `unknown` |

#### Returns

`undefined` \| [`ChatMessageTemplate`](#chatmessagetemplate)[]

## References

### ChatModel

Re-exports [ChatModel](models/chat-model.md#chatmodel)

---

### ChatModelInput

Re-exports [ChatModelInput](models/chat-model.md#chatmodelinput)

---

### Role

Re-exports [Role](models/chat-model.md#role)

---

### ChatModelInputMessage

Re-exports [ChatModelInputMessage](models/chat-model.md#chatmodelinputmessage)

---

### ChatModelInputMessageContent

Re-exports [ChatModelInputMessageContent](models/chat-model.md#chatmodelinputmessagecontent-1)

---

### TextContent

Re-exports [TextContent](models/chat-model.md#textcontent)

---

### ImageUrlContent

Re-exports [ImageUrlContent](models/chat-model.md#imageurlcontent)

---

### ChatModelInputResponseFormat

Re-exports [ChatModelInputResponseFormat](models/chat-model.md#chatmodelinputresponseformat-1)

---

### ChatModelInputTool

Re-exports [ChatModelInputTool](models/chat-model.md#chatmodelinputtool)

---

### ChatModelInputToolChoice

Re-exports [ChatModelInputToolChoice](models/chat-model.md#chatmodelinputtoolchoice-1)

---

### ChatModelOptions

Re-exports [ChatModelOptions](models/chat-model.md#chatmodeloptions)

---

### ChatModelOutput

Re-exports [ChatModelOutput](models/chat-model.md#chatmodeloutput)

---

### ChatModelOutputToolCall

Re-exports [ChatModelOutputToolCall](models/chat-model.md#chatmodeloutputtoolcall)

---

### ChatModelOutputUsage

Re-exports [ChatModelOutputUsage](models/chat-model.md#chatmodeloutputusage-1)
