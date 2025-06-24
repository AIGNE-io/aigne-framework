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

const result = await agent.invoke({ message: "hello" });

console.log(result); // { text: "Hello, How can I assist you today?" }
```

#### Extended by

- [`FunctionAgent`](#functionagent)
- [`AIAgent`](ai-agent.md#aiagent)
- [`MCPAgent`](mcp-agent.md#mcpagent)
- [`MCPBase`](mcp-agent.md#mcpbase)
- [`TeamAgent`](team-agent.md#teamagent)
- [`UserAgent`](user-agent.md#useragent)
- [`MemoryAgent`](../memory.md#memoryagent)
- [`MemoryRecorder`](../memory.md#memoryrecorder)
- [`MemoryRetriever`](../memory.md#memoryretriever)
- [`OrchestratorAgent`](../../agent-library/orchestrator.md#orchestratoragent)

#### Type Parameters

| Type Parameter                      | Default type          | Description                               |
| ----------------------------------- | --------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | The output message type the agent returns |

#### Indexable

\[`key`: `symbol`\]: () => `string` \| () => `Promise`\<`void`\>

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

##### memories

> `readonly` **memories**: [`MemoryAgent`](../memory.md#memoryagent)[] = `[]`

List of memories this agent can use

##### tag?

> `optional` **tag**: `string`

##### maxRetrieveMemoryCount?

> `optional` **maxRetrieveMemoryCount**: `number`

Maximum number of memory items to retrieve

##### hooks

> `readonly` **hooks**: [`AgentHooks`](#agenthooks-1)

Lifecycle hooks for agent processing.

Hooks enable tracing, logging, monitoring, and custom behavior
without modifying the core agent implementation

###### Example

Here's an example of using hooks:

```ts
const model = new OpenAIChatModel();

const aigne = new AIGNE({ model });

const weather = FunctionAgent.from({
  name: "weather",
  description: "Get the weather of a city",
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    temperature: z.number(),
  }),
  process: async (_input) => {
    return {
      temperature: 25,
    };
  },
});

const agent = AIAgent.from({
  hooks: {
    onStart: (event) => {
      console.log("Agent started:", event.input);
    },
    onEnd: (event) => {
      console.log("Agent ended:", event.input, event.output);
    },
    onSkillStart: (event) => {
      console.log(`Skill ${event.skill.name} started:`, event.input);
    },
    onSkillEnd: (event) => {
      console.log(
        `Skill ${event.skill.name} ended:`,
        event.input,
        event.output,
      );
    },
  },
  skills: [weather],
  inputKey: "message",
});

const result = await aigne.invoke(agent, {
  message: "What is the weather in Paris?",
});

console.log(result);
// Output: { message: "The weather in Paris is 25 degrees." }
```

##### guideRails?

> `readonly` `optional` **guideRails**: [`GuideRailAgent`](guide-rail-agent.md#guiderailagent)[]

List of GuideRail agents applied to this agent

GuideRail agents validate, transform, or control the message flow by:

- Enforcing rules and safety policies
- Validating inputs/outputs against specific criteria
- Implementing business logic validations
- Monitoring and auditing agent behavior

Each GuideRail agent can examine both input and expected output,
and has the ability to abort the process with an explanation

###### Example

Here's an example of using GuideRail agents:

```ts
const model = new OpenAIChatModel();

const legalModel = new OpenAIChatModel();

const aigne = new AIGNE({ model });

const financial = AIAgent.from({
  ...guideRailAgentOptions,
  model: legalModel,
  instructions: `You are a financial assistant. You must ensure that you do not provide cryptocurrency price predictions or forecasts.
<user-input>
{{input}}
</user-input>

<agent-output>
{{output}}
</agent-output>
`,
});

const agent = AIAgent.from({
  guideRails: [financial],
});

const result = await aigne.invoke(agent, {
  message: "What will be the price of Bitcoin next month?",
});

console.log(result);
// Output:
// {
//   "$status": "GuideRailError",
//   "message": "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading."
// }
```

##### name

> `readonly` **name**: `string`

Name of the agent, used for identification and logging

Defaults to the class constructor name if not specified in options

##### description?

> `readonly` `optional` **description**: `string`

Description of the agent's purpose and capabilities

Useful for documentation and when agents need to understand
each other's roles in a multi-agent system

##### includeInputInOutput?

> `readonly` `optional` **includeInputInOutput**: `boolean`

Whether to include the original input in the output

When true, the agent will merge input fields into the output object

##### subscribeTopic?

> `readonly` `optional` **subscribeTopic**: [`SubscribeTopic`](#subscribetopic)

Topics the agent subscribes to for receiving messages

Can be a single topic string or an array of topic strings

##### publishTopic?

> `readonly` `optional` **publishTopic**: [`PublishTopic`](#publishtopic)\<[`Message`](#message)\>

Topics the agent publishes to for sending messages

Can be a string, array of strings, or a function that determines
topics based on the output

##### skills

> `readonly` **skills**: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>[] & \{[`key`: `string`]: [`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\>; \}

Collection of skills (other agents) this agent can use

Skills can be accessed by name or by array index, allowing
the agent to delegate tasks to specialized sub-agents

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

| Parameter | Type                                                | Description          |
| --------- | --------------------------------------------------- | -------------------- |
| `context` | `Pick`\<`Context`\<`UserContext`\>, `"subscribe"`\> | Context to attach to |

###### Returns

`void`

##### subscribeToTopics()

> `protected` **subscribeToTopics**(`context`): `void`

###### Parameters

| Parameter | Type                                                |
| --------- | --------------------------------------------------- |
| `context` | `Pick`\<`Context`\<`UserContext`\>, `"subscribe"`\> |

###### Returns

`void`

##### onMessage()

> **onMessage**(`__namedParameters`): `Promise`\<`void`\>

###### Parameters

| Parameter           | Type             |
| ------------------- | ---------------- |
| `__namedParameters` | `MessagePayload` |

###### Returns

`Promise`\<`void`\>

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

##### retrieveMemories()

> **retrieveMemories**(`input`, `options`): `Promise`\<`Pick`\<[`Memory`](../memory.md#memory), `"content"`\>[]\>

###### Parameters

| Parameter | Type                                                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `input`   | `Pick`\<[`MemoryRetrieverInput`](../memory.md#memoryretrieverinput), `"limit"`\> & \{ `search?`: `string` \| [`Message`](#message); \} |
| `options` | `Pick`\<[`AgentInvokeOptions`](#agentinvokeoptions)\<`UserContext`\>, `"context"`\>                                                    |

###### Returns

`Promise`\<`Pick`\<[`Memory`](../memory.md#memory), `"content"`\>[]\>

##### recordMemories()

> **recordMemories**(`input`, `options`): `Promise`\<`void`\>

###### Parameters

| Parameter | Type                                                                                |
| --------- | ----------------------------------------------------------------------------------- |
| `input`   | [`MemoryRecorderInput`](../memory.md#memoryrecorderinput)                           |
| `options` | `Pick`\<[`AgentInvokeOptions`](#agentinvokeoptions)\<`UserContext`\>, `"context"`\> |

###### Returns

`Promise`\<`void`\>

##### invoke()

###### Call Signature

> **invoke**(`input`, `options?`): `Promise`\<`O`\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                                                     | Description                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `input`    | `I` & [`Message`](#message)                                                                              | Input message to the agent                                     |
| `options?` | `Partial`\<[`AgentInvokeOptions`](#agentinvokeoptions)\<`UserContext`\>\> & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset |

###### Returns

`Promise`\<`O`\>

Final JSON response

###### Example

Here's an example of invoking an agent with regular mode:

```ts
const model = new OpenAIChatModel();

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({
  model,
});

// Create an Agent instance
const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  inputKey: "message",
});

// Invoke the agent
const result = await aigne.invoke(agent, { message: "hello" });

console.log(result); // Output: { message: "Hello, How can I assist you today?" }
```

###### Call Signature

> **invoke**(`input`, `options`): `Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>

Invoke the agent with streaming response

Streaming responses allow the agent to return results incrementally,
suitable for scenarios requiring real-time progress updates, such as
chat bot typing effects.

###### Parameters

| Parameter | Type                                                                                                   | Description                                                      |
| --------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `input`   | `I` & [`Message`](#message)                                                                            | Input message to the agent                                       |
| `options` | `Partial`\<[`AgentInvokeOptions`](#agentinvokeoptions)\<`UserContext`\>\> & \{ `streaming`: `true`; \} | Invocation options, must set streaming to true for this overload |

###### Returns

`Promise`\<[`AgentResponseStream`](#agentresponsestream)\<`O`\>\>

Streaming response object

###### Example

Here's an example of invoking an agent with streaming response:

```ts
const model = new OpenAIChatModel();

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({
  model,
});

// Create an Agent instance
const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  inputKey: "message",
});

// Invoke the agent with streaming enabled
const stream = await aigne.invoke(
  agent,
  { message: "hello" },
  { streaming: true },
);

const chunks: string[] = [];

// Read the stream using an async iterator
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.message;
    if (text) {
      chunks.push(text);
    }
  }
}

console.log(chunks); // Output: ["Hello", ",", " ", "How", " ", "can", " ", "I", " ", "assist", " ", "you", " ", "today", "?"]
```

###### Call Signature

> **invoke**(`input`, `options?`): `Promise`\<[`AgentResponse`](#agentresponse)\<`O`\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                                                      | Description                |
| ---------- | ------------------------------------------------------------------------- | -------------------------- |
| `input`    | `I` & [`Message`](#message)                                               | Input message to the agent |
| `options?` | `Partial`\<[`AgentInvokeOptions`](#agentinvokeoptions)\<`UserContext`\>\> | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](#agentresponse)\<`O`\>\>

Agent response (streaming or regular)

##### invokeSkill()

> `protected` **invokeSkill**\<`I`, `O`\>(`skill`, `input`, `options`): `Promise`\<`O`\>

###### Type Parameters

| Type Parameter                      |
| ----------------------------------- |
| `I` _extends_ [`Message`](#message) |
| `O` _extends_ [`Message`](#message) |

###### Parameters

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `skill`   | [`Agent`](#agent)\<`I`, `O`\>               |
| `input`   | `I` & [`Message`](#message)                 |
| `options` | [`AgentInvokeOptions`](#agentinvokeoptions) |

###### Returns

`Promise`\<`O`\>

##### checkAgentInvokesUsage()

> `protected` **checkAgentInvokesUsage**(`options`): `void`

Check agent invocation usage to prevent exceeding limits

If the context has a maximum invocation limit set, checks if the limit
has been exceeded and increments the invocation counter

###### Parameters

| Parameter | Type                                        | Description                                      |
| --------- | ------------------------------------------- | ------------------------------------------------ |
| `options` | [`AgentInvokeOptions`](#agentinvokeoptions) | Invocation options containing context and limits |

###### Returns

`void`

###### Throws

Error if maximum invocation limit is exceeded

##### preprocess()

> `protected` **preprocess**(`_`, `options`): `Promise`\<`void`\>

Pre-processing operations before handling input

Preparatory work done before executing the agent's main processing logic, including:

- Checking context status
- Verifying invocation limits

###### Parameters

| Parameter | Type                                        | Description                  |
| --------- | ------------------------------------------- | ---------------------------- |
| `_`       | `I`                                         | Input message (unused)       |
| `options` | [`AgentInvokeOptions`](#agentinvokeoptions) | Options for agent invocation |

###### Returns

`Promise`\<`void`\>

##### onGuideRailError()

> `protected` **onGuideRailError**(`error`): `Promise`\<`O` \| [`GuideRailAgentOutput`](guide-rail-agent.md#guiderailagentoutput)\>

Handle errors detected by GuideRail agents

This method is called when a GuideRail agent aborts the process, providing
a way for agents to customize error handling behavior. By default, it simply
returns the original error, but subclasses can override this method to:

- Transform the error into a more specific response
- Apply recovery strategies
- Log or report the error in a custom format
- Return a fallback output instead of an error

###### Parameters

| Parameter | Type                                                               | Description                                                   |
| --------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| `error`   | [`GuideRailAgentOutput`](guide-rail-agent.md#guiderailagentoutput) | The GuideRail agent output containing abort=true and a reason |

###### Returns

`Promise`\<`O` \| [`GuideRailAgentOutput`](guide-rail-agent.md#guiderailagentoutput)\>

Either the original/modified error or a substitute output object
which will be tagged with $status: "GuideRailError"

##### postprocess()

> `protected` **postprocess**(`input`, `output`, `options`): `Promise`\<`void`\>

Post-processing operations after handling output

Operations performed after the agent produces output, including:

- Checking context status
- Adding interaction records to memory

###### Parameters

| Parameter | Type                                        | Description                  |
| --------- | ------------------------------------------- | ---------------------------- |
| `input`   | `I`                                         | Input message                |
| `output`  | `O`                                         | Output message               |
| `options` | [`AgentInvokeOptions`](#agentinvokeoptions) | Options for agent invocation |

###### Returns

`Promise`\<`void`\>

##### publishToTopics()

> `protected` **publishToTopics**(`output`, `options`): `Promise`\<`void`\>

###### Parameters

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `output`  | [`Message`](#message)                       |
| `options` | [`AgentInvokeOptions`](#agentinvokeoptions) |

###### Returns

`Promise`\<`void`\>

##### process()

> `abstract` **process**(`input`, `options`): `PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Core processing method of the agent, must be implemented in subclasses

This is the main functionality implementation of the agent, processing input and
generating output. Can return various types of results:

- Regular object response
- Streaming response
- Async generator
- Another agent instance (transfer agent)

###### Parameters

| Parameter | Type                                        | Description                  |
| --------- | ------------------------------------------- | ---------------------------- |
| `input`   | `I`                                         | Input message                |
| `options` | [`AgentInvokeOptions`](#agentinvokeoptions) | Options for agent invocation |

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
const stream = await agent.invoke({ message: "Hello" }, { streaming: true });

let fullText = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
  }
}

console.log(fullText); // Output: "Hello, This is..."
```

Example of using an async generator:

```ts
class AsyncGeneratorAgent extends Agent {
  async *process(
    _input: Message,
    _options: AgentInvokeOptions,
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
const stream = await agent.invoke({ message: "Hello" }, { streaming: true });

const message: string[] = [];
let json: Message | undefined;

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.message;
    if (text) message.push(text);
    if (chunk.delta.json) json = chunk.delta.json;
  }
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

const result = await aigne.invoke(mainAgent, { message: "technical question" });
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

#### Indexable

\[`key`: `symbol`\]: () => `string` \| () => `Promise`\<`void`\>

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

##### tag

> **tag**: `string` = `"FunctionAgent"`

###### Overrides

[`Agent`](#agent).[`tag`](#tag)

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
  return new ReadableStream<AgentResponseChunk<{ text: string }>>({
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

> **process**(`input`, `options`): `PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Process input implementation, calls the configured processing function

###### Parameters

| Parameter | Type                                        | Description        |
| --------- | ------------------------------------------- | ------------------ |
| `input`   | `I`                                         | Input message      |
| `options` | [`AgentInvokeOptions`](#agentinvokeoptions) | Invocation options |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Processing result

###### Overrides

[`Agent`](#agent).[`process`](#process)

## Interfaces

### Message

Basic message type that can contain any key-value pairs

#### Extends

- `Record`\<`string`, `unknown`\>

#### Extended by

- [`GuideRailAgentInput`](guide-rail-agent.md#guiderailagentinput)
- [`GuideRailAgentOutput`](guide-rail-agent.md#guiderailagentoutput)
- [`TransferAgentOutput`](#transferagentoutput)
- [`MemoryRecorderInput`](../memory.md#memoryrecorderinput)
- [`MemoryRecorderOutput`](../memory.md#memoryrecorderoutput)
- [`MemoryRetrieverInput`](../memory.md#memoryretrieverinput)
- [`MemoryRetrieverOutput`](../memory.md#memoryretrieveroutput)

#### Indexable

\[`key`: `string`\]: `unknown`

#### Properties

| Property                   | Type                           |
| -------------------------- | ------------------------------ |
| <a id="meta"></a> `$meta?` | \{ `usage`: `ContextUsage`; \} |
| `$meta.usage`              | `ContextUsage`                 |

---

### AgentOptions\<I, O\>

Configuration options for an agent

#### Extends

- `Partial`\<`Pick`\<[`Agent`](#agent), `"guideRails"` \| `"hooks"`\>\>

#### Extended by

- [`FunctionAgentOptions`](#functionagentoptions)
- [`AIAgentOptions`](ai-agent.md#aiagentoptions)
- [`MCPAgentOptions`](mcp-agent.md#mcpagentoptions)
- [`MCPBaseOptions`](mcp-agent.md#mcpbaseoptions)
- [`TeamAgentOptions`](team-agent.md#teamagentoptions)
- [`UserAgentOptions`](user-agent.md#useragentoptions)
- [`OrchestratorAgentOptions`](../../agent-library/orchestrator.md#orchestratoragentoptions)

#### Type Parameters

| Type Parameter                      | Default type          | Description                   |
| ----------------------------------- | --------------------- | ----------------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) | The agent input message type  |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) | The agent output message type |

#### Properties

| Property                                                      | Type                                                                                                                           | Description                                                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="subscribetopic-1"></a> `subscribeTopic?`               | [`SubscribeTopic`](#subscribetopic)                                                                                            | Topics the agent should subscribe to These topics determine which messages the agent will receive from the system                            |
| <a id="publishtopic-1"></a> `publishTopic?`                   | [`PublishTopic`](#publishtopic)\<`O`\>                                                                                         | Topics the agent should publish to These topics determine where the agent's output messages will be sent in the system                       |
| <a id="name"></a> `name?`                                     | `string`                                                                                                                       | Name of the agent Used for identification and logging. Defaults to the constructor name if not specified                                     |
| <a id="description"></a> `description?`                       | `string`                                                                                                                       | Description of the agent A human-readable description of what the agent does, useful for documentation and debugging                         |
| <a id="inputschema"></a> `inputSchema?`                       | [`AgentInputOutputSchema`](#agentinputoutputschema)\<`I`\>                                                                     | Zod schema defining the input message structure Used to validate that input messages conform to the expected format                          |
| <a id="outputschema"></a> `outputSchema?`                     | [`AgentInputOutputSchema`](#agentinputoutputschema)\<`O`\>                                                                     | Zod schema defining the output message structure Used to validate that output messages conform to the expected format                        |
| <a id="includeinputinoutput"></a> `includeInputInOutput?`     | `boolean`                                                                                                                      | Whether to include input in the output When true, the agent will merge input fields into the output object                                   |
| <a id="skills"></a> `skills?`                                 | ([`Agent`](#agent)\<[`Message`](#message), [`Message`](#message)\> \| [`FunctionAgentFn`](#functionagentfn)\<`any`, `any`\>)[] | List of skills (other agents or functions) this agent has These skills can be used by the agent to delegate tasks or extend its capabilities |
| <a id="disableevents"></a> `disableEvents?`                   | `boolean`                                                                                                                      | Whether to disable emitting events for agent actions When true, the agent won't emit events like agentStarted, agentSucceed, or agentFailed  |
| <a id="memory"></a> `memory?`                                 | [`MemoryAgent`](../memory.md#memoryagent) \| [`MemoryAgent`](../memory.md#memoryagent)[]                                       | One or more memory agents this agent can use                                                                                                 |
| <a id="maxretrievememorycount"></a> `maxRetrieveMemoryCount?` | `number`                                                                                                                       | Maximum number of memory items to retrieve                                                                                                   |

---

### AgentInvokeOptions\<U\>

#### Type Parameters

| Type Parameter              | Default type  |
| --------------------------- | ------------- |
| `U` _extends_ `UserContext` | `UserContext` |

#### Properties

| Property                                | Type                                                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="context"></a> `context`          | `Context`\<`U`\>                                         | The execution context for the agent The context provides the runtime environment for agent execution, including: - Event emission and subscription management - Inter-agent communication and message passing - Resource usage tracking and limits enforcement - Timeout and status management - Memory and state management across agent invocations Each agent invocation requires a context to coordinate with the broader agent system and maintain proper isolation and resource control. |
| <a id="streaming"></a> `streaming?`     | `boolean`                                                | Whether to enable streaming response When true, the invoke method returns a ReadableStream that emits chunks of the response as they become available, allowing for real-time display of results When false or undefined, the invoke method waits for full completion and returns the final JSON result                                                                                                                                                                                        |
| <a id="usercontext"></a> `userContext?` | `U`                                                      | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| <a id="memories"></a> `memories?`       | `Pick`\<[`Memory`](../memory.md#memory), `"content"`\>[] | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

---

### AgentHooks\<I, O\>

Lifecycle hooks for agent execution

Hooks provide a way to intercept and extend agent behavior at key points during
the agent's lifecycle, enabling custom functionality like logging, monitoring,
tracing, error handling, and more.

#### Type Parameters

| Type Parameter                      | Default type          |
| ----------------------------------- | --------------------- |
| `I` _extends_ [`Message`](#message) | [`Message`](#message) |
| `O` _extends_ [`Message`](#message) | [`Message`](#message) |

#### Properties

| Property                                  | Type                                    | Description                                                                                                                                                                                                                                       |
| ----------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="onstart"></a> `onStart?`           | (`event`) => `PromiseOrValue`\<`void`\> | Called when agent processing begins This hook runs before the agent processes input, allowing for setup operations, logging, or input transformations.                                                                                            |
| <a id="onend"></a> `onEnd?`               | (`event`) => `PromiseOrValue`\<`void`\> | Called when agent processing completes or fails This hook runs after processing finishes, receiving either the output or an error if processing failed. Useful for cleanup operations, logging results, or error handling.                        |
| <a id="onskillstart"></a> `onSkillStart?` | (`event`) => `PromiseOrValue`\<`void`\> | Called before a skill (sub-agent) is invoked This hook runs when the agent delegates work to a skill, allowing for tracking skill usage or transforming input to the skill.                                                                       |
| <a id="onskillend"></a> `onSkillEnd?`     | (`event`) => `PromiseOrValue`\<`void`\> | Called after a skill (sub-agent) completes or fails This hook runs when a skill finishes execution, receiving either the output or an error if the skill failed. Useful for monitoring skill performance or handling skill-specific errors.       |
| <a id="onhandoff"></a> `onHandoff?`       | (`event`) => `PromiseOrValue`\<`void`\> | Called when an agent hands off processing to another agent This hook runs when a source agent transfers control to a target agent, allowing for tracking of handoffs between agents and monitoring the flow of processing in multi-agent systems. |

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
| <a id="delta"></a> `delta` | \{ `text?`: `Partial`\<\{ \[key in string \| number \| symbol as Extract\<T\[key\], string\> extends string ? key : never\]: string \}\> \| `Partial`\<\{[`key`: `string`]: `string`; \}\>; `json?`: [`TransferAgentOutput`](#transferagentoutput) \| `Partial`\<`T`\>; \} |
| `delta.text?`              | `Partial`\<\{ \[key in string \| number \| symbol as Extract\<T\[key\], string\> extends string ? key : never\]: string \}\> \| `Partial`\<\{[`key`: `string`]: `string`; \}\>                                                                                             |
| `delta.json?`              | [`TransferAgentOutput`](#transferagentoutput) \| `Partial`\<`T`\>                                                                                                                                                                                                          |

---

### AgentResponseProgress

#### Properties

| Property                         | Type                                                                                                                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <a id="progress"></a> `progress` | \{ `event`: `"agentStarted"`; `input`: [`Message`](#message); \} \| \{ `event`: `"agentSucceed"`; `output`: [`Message`](#message); \} \| \{ `event`: `"agentFailed"`; `error`: `Error`; \} & `Omit`\<`AgentEvent`, `"agent"`\> & \{ `agent`: \{ `name`: `string`; \}; \} |

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

> **AgentResponse**\<`T`\> = `T` \| [`AgentResponseStream`](#agentresponsestream)\<`T`\> \| [`TransferAgentOutput`](#transferagentoutput) \| [`GuideRailAgentOutput`](guide-rail-agent.md#guiderailagentoutput)

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

> **AgentResponseChunk**\<`T`\> = [`AgentResponseDelta`](#agentresponsedelta)\<`T`\> \| [`AgentResponseProgress`](#agentresponseprogress)

Data chunk type for streaming responses

#### Type Parameters

| Type Parameter | Description        |
| -------------- | ------------------ |
| `T`            | Response data type |

---

### AgentProcessAsyncGenerator\<O\>

> **AgentProcessAsyncGenerator**\<`O`\> = `AsyncGenerator`\<[`AgentResponseChunk`](#agentresponsechunk)\<`O`\>, `Partial`\<`O`\> \| [`TransferAgentOutput`](#transferagentoutput) \| `undefined` \| `void`\>

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

> **FunctionAgentFn**\<`I`, `O`\> = (`input`, `options`) => `PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Function type for function agents

Defines the function signature for processing messages in a function agent

#### Type Parameters

| Type Parameter                      | Default type | Description               |
| ----------------------------------- | ------------ | ------------------------- |
| `I` _extends_ [`Message`](#message) | `any`        | Agent input message type  |
| `O` _extends_ [`Message`](#message) | `any`        | Agent output message type |

#### Parameters

| Parameter | Type                                        | Description   |
| --------- | ------------------------------------------- | ------------- |
| `input`   | `I`                                         | Input message |
| `options` | [`AgentInvokeOptions`](#agentinvokeoptions) | -             |

#### Returns

`PromiseOrValue`\<[`AgentProcessResult`](#agentprocessresult)\<`O`\>\>

Processing result, can be synchronous or asynchronous

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

### isAgentResponseDelta()

> **isAgentResponseDelta**\<`T`\>(`chunk`): `chunk is AgentResponseDelta<T>`

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Parameters

| Parameter | Type                                               |
| --------- | -------------------------------------------------- |
| `chunk`   | [`AgentResponseChunk`](#agentresponsechunk)\<`T`\> |

#### Returns

`chunk is AgentResponseDelta<T>`

---

### isAgentResponseProgress()

> **isAgentResponseProgress**\<`T`\>(`chunk`): `chunk is AgentResponseProgress`

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Parameters

| Parameter | Type                                               |
| --------- | -------------------------------------------------- |
| `chunk`   | [`AgentResponseChunk`](#agentresponsechunk)\<`T`\> |

#### Returns

`chunk is AgentResponseProgress`

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
| `jsonDelta` | `NonNullable`\<`undefined` \| [`TransferAgentOutput`](#transferagentoutput) \| `Partial`\<`T`\>\> | The JSON data to include in the delta update |

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
