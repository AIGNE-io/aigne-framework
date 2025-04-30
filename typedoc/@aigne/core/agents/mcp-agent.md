[Documentation](../../../README.md) / [@aigne/core](../README.md) / agents/mcp-agent

# agents/mcp-agent

## Classes

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

- [`Agent`](agent.md#agent)

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

[`Agent`](agent.md#agent).[`constructor`](agent.md#agent#constructor)

#### Properties

| Property                                                  | Type                                                                                                                                                                                                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Inherited from                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| <a id="client"></a> `client`                              | `Client`                                                                                                                                                                                                         | The MCP client instance used for communication with the MCP server. This client manages the connection to the MCP server and provides methods for interacting with server-provided functionality.                                                                                                                                                                                                                                                           | -                                                                                       |
| <a id="description"></a> `description?`                   | `string`                                                                                                                                                                                                         | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system                                                                                                                                                                                                                                                                                                  | [`Agent`](agent.md#agent).[`description`](agent.md#agent#description)                   |
| <a id="includeinputinoutput"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                                                                        | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                                                                                                                                                                                                                                                                                                     | [`Agent`](agent.md#agent).[`includeInputInOutput`](agent.md#agent#includeinputinoutput) |
| <a id="memory"></a> `memory?`                             | `AgentMemory`                                                                                                                                                                                                    | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing                                                                                                                                                                                                                                                                                         | [`Agent`](agent.md#agent).[`memory`](agent.md#agent#memory)                             |
| <a id="name"></a> `name`                                  | `string`                                                                                                                                                                                                         | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                                                                                                                                                                                                                                                                                                                   | [`Agent`](agent.md#agent).[`name`](agent.md#agent#name)                                 |
| <a id="prompts"></a> `prompts`                            | [`MCPPrompt`](#mcpprompt)[] & \{[`key`: `string`]: [`MCPPrompt`](#mcpprompt); \}                                                                                                                                 | Array of MCP prompts available from the connected server. Prompts can be accessed by index or by name. **Example** Here's an example of accessing prompts: `await using mcpAgent = await MCPAgent.from({ url: `http://localhost:${port}/mcp`, transport: "streamableHttp", }); const echo = mcpAgent.prompts.echo; if (!echo) throw new Error("Prompt not found"); const result = await echo.invoke({ message: "Hello!" }); console.log(result);`           | -                                                                                       |
| <a id="publishtopic"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>                                                                                                                                       | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                                                                                                                                                                                                                                                                                                              | [`Agent`](agent.md#agent).[`publishTopic`](agent.md#agent#publishtopic)                 |
| <a id="resources"></a> `resources`                        | [`MCPResource`](#mcpresource)[] & \{[`key`: `string`]: [`MCPResource`](#mcpresource); \}                                                                                                                         | Array of MCP resources available from the connected server. Resources can be accessed by index or by name. **Example** Here's an example of accessing resources: `await using mcpAgent = await MCPAgent.from({ url: `http://localhost:${port}/mcp`, transport: "streamableHttp", }); const echo = mcpAgent.resources.echo; if (!echo) throw new Error("Resource not found"); const result = await echo.invoke({ message: "Hello!" }); console.log(result);` | -                                                                                       |
| <a id="skills"></a> `skills`                              | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>; \} | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents                                                                                                                                                                                                                                                                                     | [`Agent`](agent.md#agent).[`skills`](agent.md#agent#skills)                             |
| <a id="subscribetopic"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                                                                    | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                                                                                                                                                                                                                                                                                                             | [`Agent`](agent.md#agent).[`subscribeTopic`](agent.md#agent#subscribetopic)             |

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

Check if the agent is invokable.

MCPAgent itself is not directly invokable as it acts as a container
for tools, prompts, and resources. Always returns false.

###### Returns

`boolean`

###### Overrides

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

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`Message`](agent.md#message)\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                               | Description                                                      |
| ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `input`    | `string` \| [`Message`](agent.md#message)                                          | Input message to the agent, can be a string or structured object |
| `context?` | [`Context`](../aigne.md#context)                                                   | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

###### Returns

`Promise`\<[`Message`](agent.md#message)\>

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

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<[`Message`](agent.md#message)\>\>

Invoke the agent with streaming response

Streaming responses allow the agent to return results incrementally,
suitable for scenarios requiring real-time progress updates, such as
chat bot typing effects.

###### Parameters

| Parameter           | Type                                            | Description                                                      |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `input`             | `string` \| [`Message`](agent.md#message)       | Input message to the agent, can be a string or structured object |
| `context`           | `undefined` \| [`Context`](../aigne.md#context) | Execution context, providing environment and resource access     |
| `options`           | \{ `streaming`: `true`; \}                      | Invocation options, must set streaming to true for this overload |
| `options.streaming` | `true`                                          | -                                                                |

###### Returns

`Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<[`Message`](agent.md#message)\>\>

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

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](agent.md#agentresponse)\<[`Message`](agent.md#message)\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                                | Description                |
| ---------- | --------------------------------------------------- | -------------------------- |
| `input`    | `string` \| [`Message`](agent.md#message)           | Input message to the agent |
| `context?` | [`Context`](../aigne.md#context)                    | Execution context          |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](agent.md#agentresponse)\<[`Message`](agent.md#message)\>\>

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
| `input`   | [`Message`](agent.md#message)    | Input message     |
| `output`  | [`Message`](agent.md#message)    | Output message    |
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
| `_`       | [`Message`](agent.md#message)    | Input message (unused) |
| `context` | [`Context`](../aigne.md#context) | Execution context      |

###### Returns

`void`

###### Inherited from

[`Agent`](agent.md#agent).[`preprocess`](agent.md#agent#preprocess)

##### process()

> **process**(`_input`, `_context?`): `Promise`\<[`Message`](agent.md#message)\>

Process method required by Agent interface.

Since MCPAgent itself is not directly invokable, this method
throws an error if called.

###### Parameters

| Parameter   | Type                             | Description                |
| ----------- | -------------------------------- | -------------------------- |
| `_input`    | [`Message`](agent.md#message)    | Input message (unused)     |
| `_context?` | [`Context`](../aigne.md#context) | Execution context (unused) |

###### Returns

`Promise`\<[`Message`](agent.md#message)\>

###### Throws

Error This method always throws an error since MCPAgent is not directly invokable

###### Overrides

[`Agent`](agent.md#agent).[`process`](agent.md#agent#process)

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

[`Agent`](agent.md#agent).[`shutdown`](agent.md#agent#shutdown)

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

- [`Agent`](agent.md#agent)\<`I`, `O`\>

#### Extended by

- [`MCPTool`](#mcptool)
- [`MCPPrompt`](#mcpprompt)
- [`MCPResource`](#mcpresource)

#### Type Parameters

| Type Parameter                              | Description                               |
| ------------------------------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](agent.md#message) | The output message type the agent returns |

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

[`Agent`](agent.md#agent).[`constructor`](agent.md#agent#constructor)

#### Properties

| Property                                                    | Type                                                                                                                                                                                                             | Description                                                                                                                                                             | Inherited from                                                                          |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| <a id="client-1"></a> `client`                              | `ClientWithReconnect`                                                                                                                                                                                            | -                                                                                                                                                                       | -                                                                                       |
| <a id="description-1"></a> `description?`                   | `string`                                                                                                                                                                                                         | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              | [`Agent`](agent.md#agent).[`description`](agent.md#agent#description)                   |
| <a id="includeinputinoutput-1"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                                                                        | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 | [`Agent`](agent.md#agent).[`includeInputInOutput`](agent.md#agent#includeinputinoutput) |
| <a id="memory-1"></a> `memory?`                             | `AgentMemory`                                                                                                                                                                                                    | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     | [`Agent`](agent.md#agent).[`memory`](agent.md#agent#memory)                             |
| <a id="name-1"></a> `name`                                  | `string`                                                                                                                                                                                                         | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               | [`Agent`](agent.md#agent).[`name`](agent.md#agent#name)                                 |
| <a id="publishtopic-1"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>                                                                                                                                       | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          | [`Agent`](agent.md#agent).[`publishTopic`](agent.md#agent#publishtopic)                 |
| <a id="skills-1"></a> `skills`                              | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>; \} | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents | [`Agent`](agent.md#agent).[`skills`](agent.md#agent#skills)                             |
| <a id="subscribetopic-1"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                                                                    | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         | [`Agent`](agent.md#agent).[`subscribeTopic`](agent.md#agent#subscribetopic)             |

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

> `abstract` **process**(`input`, `context`): `PromiseOrValue`\<[`AgentProcessResult`](agent.md#agentprocessresult)\<`O`\>\>

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

`PromiseOrValue`\<[`AgentProcessResult`](agent.md#agentprocessresult)\<`O`\>\>

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

#### Constructors

##### Constructor

> **new MCPPrompt**(`options`): [`MCPPrompt`](#mcpprompt)

###### Parameters

| Parameter | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options` | [`MCPBaseOptions`](#mcpbaseoptions)\<[`MCPPromptInput`](#mcppromptinput), \{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]; \}\> |

###### Returns

[`MCPPrompt`](#mcpprompt)

###### Inherited from

[`MCPBase`](#mcpbase).[`constructor`](#constructor-1)

#### Properties

| Property                                                    | Type                                                                                                                                                                                                             | Description                                                                                                                                                             | Inherited from                                                          |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| <a id="client-2"></a> `client`                              | `ClientWithReconnect`                                                                                                                                                                                            | -                                                                                                                                                                       | [`MCPBase`](#mcpbase).[`client`](#client-1)                             |
| <a id="description-2"></a> `description?`                   | `string`                                                                                                                                                                                                         | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              | [`MCPBase`](#mcpbase).[`description`](#description-1)                   |
| <a id="includeinputinoutput-2"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                                                                        | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 | [`MCPBase`](#mcpbase).[`includeInputInOutput`](#includeinputinoutput-1) |
| <a id="memory-2"></a> `memory?`                             | `AgentMemory`                                                                                                                                                                                                    | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     | [`MCPBase`](#mcpbase).[`memory`](#memory-1)                             |
| <a id="name-2"></a> `name`                                  | `string`                                                                                                                                                                                                         | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               | [`MCPBase`](#mcpbase).[`name`](#name-1)                                 |
| <a id="publishtopic-2"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>                                                                                                                                       | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          | [`MCPBase`](#mcpbase).[`publishTopic`](#publishtopic-1)                 |
| <a id="skills-2"></a> `skills`                              | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>; \} | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents | [`MCPBase`](#mcpbase).[`skills`](#skills-1)                             |
| <a id="subscribetopic-2"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                                                                    | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         | [`MCPBase`](#mcpbase).[`subscribeTopic`](#subscribetopic-1)             |

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

[`MCPBase`](#mcpbase).[`inputSchema`](#inputschema-1)

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

###### Inherited from

[`MCPBase`](#mcpbase).[`isInvokable`](#isinvokable-1)

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

[`MCPBase`](#mcpbase).[`outputSchema`](#outputschema-1)

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

[`MCPBase`](#mcpbase).[`topic`](#topic-1)

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

[`MCPBase`](#mcpbase).[`[asyncDispose]`](#asyncdispose-2)

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

###### Inherited from

[`MCPBase`](#mcpbase).[`[custom]`](#custom-2)

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

[`MCPBase`](#mcpbase).[`addSkill`](#addskill-2)

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

[`MCPBase`](#mcpbase).[`attach`](#attach-2)

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

[`MCPBase`](#mcpbase).[`checkAgentInvokesUsage`](#checkagentinvokesusage-2)

##### invoke()

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]; \}\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                               | Description                                                      |
| ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `input`    | `string` \| [`MCPPromptInput`](#mcppromptinput)                                    | Input message to the agent, can be a string or structured object |
| `context?` | [`Context`](../aigne.md#context)                                                   | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

###### Returns

`Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]; \}\>

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

[`MCPBase`](#mcpbase).[`invoke`](#invoke-4)

###### Call Signature

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]; \}\>\>

Invoke the agent with streaming response

Streaming responses allow the agent to return results incrementally,
suitable for scenarios requiring real-time progress updates, such as
chat bot typing effects.

###### Parameters

| Parameter           | Type                                            | Description                                                      |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `input`             | `string` \| [`MCPPromptInput`](#mcppromptinput) | Input message to the agent, can be a string or structured object |
| `context`           | `undefined` \| [`Context`](../aigne.md#context) | Execution context, providing environment and resource access     |
| `options`           | \{ `streaming`: `true`; \}                      | Invocation options, must set streaming to true for this overload |
| `options.streaming` | `true`                                          | -                                                                |

###### Returns

`Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]; \}\>\>

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

[`MCPBase`](#mcpbase).[`invoke`](#invoke-4)

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](agent.md#agentresponse)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]; \}\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                                | Description                |
| ---------- | --------------------------------------------------- | -------------------------- |
| `input`    | `string` \| [`MCPPromptInput`](#mcppromptinput)     | Input message to the agent |
| `context?` | [`Context`](../aigne.md#context)                    | Execution context          |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](agent.md#agentresponse)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]; \}\>\>

Agent response (streaming or regular)

###### Inherited from

[`MCPBase`](#mcpbase).[`invoke`](#invoke-4)

##### postprocess()

> `protected` **postprocess**(`input`, `output`, `context`): `void`

Post-processing operations after handling output

Operations performed after the agent produces output, including:

- Checking context status
- Adding interaction records to memory

###### Parameters

| Parameter             | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Description                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `input`               | [`MCPPromptInput`](#mcppromptinput)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Input message                                                                                                                   |
| `output`              | \{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]; \} | Output message                                                                                                                  |
| `output._meta?`       | \{[`key`: `string`]: `unknown`; \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses. |
| `output.description?` | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | An optional description for the prompt.                                                                                         |
| `output.messages`     | \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]                                                                                                                         | -                                                                                                                               |
| `context`             | [`Context`](../aigne.md#context)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Execution context                                                                                                               |

###### Returns

`void`

###### Inherited from

[`MCPBase`](#mcpbase).[`postprocess`](#postprocess-2)

##### preprocess()

> `protected` **preprocess**(`_`, `context`): `void`

Pre-processing operations before handling input

Preparatory work done before executing the agent's main processing logic, including:

- Checking context status
- Verifying invocation limits

###### Parameters

| Parameter | Type                                | Description            |
| --------- | ----------------------------------- | ---------------------- |
| `_`       | [`MCPPromptInput`](#mcppromptinput) | Input message (unused) |
| `context` | [`Context`](../aigne.md#context)    | Execution context      |

###### Returns

`void`

###### Inherited from

[`MCPBase`](#mcpbase).[`preprocess`](#preprocess-2)

##### process()

> **process**(`input`): `Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]; \}\>

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

`Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `description?`: `string`; `messages`: \{[`key`: `string`]: `unknown`; `content`: \{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \}; `role`: `"user"` \| `"assistant"`; \}[]; \}\>

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

[`MCPBase`](#mcpbase).[`process`](#process-2)

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

[`MCPBase`](#mcpbase).[`shutdown`](#shutdown-2)

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

[`MCPBase`](#mcpbase).[`constructor`](#constructor-1)

#### Properties

| Property                                                    | Type                                                                                                                                                                                                             | Description                                                                                                                                                             | Inherited from                                                          |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| <a id="client-3"></a> `client`                              | `ClientWithReconnect`                                                                                                                                                                                            | -                                                                                                                                                                       | [`MCPBase`](#mcpbase).[`client`](#client-1)                             |
| <a id="description-3"></a> `description?`                   | `string`                                                                                                                                                                                                         | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              | [`MCPBase`](#mcpbase).[`description`](#description-1)                   |
| <a id="includeinputinoutput-3"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                                                                        | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 | [`MCPBase`](#mcpbase).[`includeInputInOutput`](#includeinputinoutput-1) |
| <a id="memory-3"></a> `memory?`                             | `AgentMemory`                                                                                                                                                                                                    | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     | [`MCPBase`](#mcpbase).[`memory`](#memory-1)                             |
| <a id="name-3"></a> `name`                                  | `string`                                                                                                                                                                                                         | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               | [`MCPBase`](#mcpbase).[`name`](#name-1)                                 |
| <a id="publishtopic-3"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>                                                                                                                                       | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          | [`MCPBase`](#mcpbase).[`publishTopic`](#publishtopic-1)                 |
| <a id="skills-3"></a> `skills`                              | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>; \} | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents | [`MCPBase`](#mcpbase).[`skills`](#skills-1)                             |
| <a id="subscribetopic-3"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                                                                    | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         | [`MCPBase`](#mcpbase).[`subscribeTopic`](#subscribetopic-1)             |
| <a id="uri"></a> `uri`                                      | `string`                                                                                                                                                                                                         | -                                                                                                                                                                       | -                                                                       |

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

[`MCPBase`](#mcpbase).[`inputSchema`](#inputschema-1)

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

###### Inherited from

[`MCPBase`](#mcpbase).[`isInvokable`](#isinvokable-1)

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

[`MCPBase`](#mcpbase).[`outputSchema`](#outputschema-1)

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

[`MCPBase`](#mcpbase).[`topic`](#topic-1)

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

[`MCPBase`](#mcpbase).[`[asyncDispose]`](#asyncdispose-2)

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

###### Inherited from

[`MCPBase`](#mcpbase).[`[custom]`](#custom-2)

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

[`MCPBase`](#mcpbase).[`addSkill`](#addskill-2)

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

[`MCPBase`](#mcpbase).[`attach`](#attach-2)

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

[`MCPBase`](#mcpbase).[`checkAgentInvokesUsage`](#checkagentinvokesusage-2)

##### invoke()

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \}\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                               | Description                                                      |
| ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `input`    | `string` \| [`MCPPromptInput`](#mcppromptinput)                                    | Input message to the agent, can be a string or structured object |
| `context?` | [`Context`](../aigne.md#context)                                                   | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

###### Returns

`Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \}\>

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

[`MCPBase`](#mcpbase).[`invoke`](#invoke-4)

###### Call Signature

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \}\>\>

Invoke the agent with streaming response

Streaming responses allow the agent to return results incrementally,
suitable for scenarios requiring real-time progress updates, such as
chat bot typing effects.

###### Parameters

| Parameter           | Type                                            | Description                                                      |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `input`             | `string` \| [`MCPPromptInput`](#mcppromptinput) | Input message to the agent, can be a string or structured object |
| `context`           | `undefined` \| [`Context`](../aigne.md#context) | Execution context, providing environment and resource access     |
| `options`           | \{ `streaming`: `true`; \}                      | Invocation options, must set streaming to true for this overload |
| `options.streaming` | `true`                                          | -                                                                |

###### Returns

`Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \}\>\>

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

[`MCPBase`](#mcpbase).[`invoke`](#invoke-4)

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](agent.md#agentresponse)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \}\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                                | Description                |
| ---------- | --------------------------------------------------- | -------------------------- |
| `input`    | `string` \| [`MCPPromptInput`](#mcppromptinput)     | Input message to the agent |
| `context?` | [`Context`](../aigne.md#context)                    | Execution context          |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](agent.md#agentresponse)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \}\>\>

Agent response (streaming or regular)

###### Inherited from

[`MCPBase`](#mcpbase).[`invoke`](#invoke-4)

##### postprocess()

> `protected` **postprocess**(`input`, `output`, `context`): `void`

Post-processing operations after handling output

Operations performed after the agent produces output, including:

- Checking context status
- Adding interaction records to memory

###### Parameters

| Parameter         | Type                                                                                                                                                                                                                                                                                           | Description                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `input`           | [`MCPPromptInput`](#mcppromptinput)                                                                                                                                                                                                                                                            | Input message                                                                                                                   |
| `output`          | \{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \} | Output message                                                                                                                  |
| `output._meta?`   | \{[`key`: `string`]: `unknown`; \}                                                                                                                                                                                                                                                             | This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses. |
| `output.contents` | (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]                                                                                               | -                                                                                                                               |
| `context`         | [`Context`](../aigne.md#context)                                                                                                                                                                                                                                                               | Execution context                                                                                                               |

###### Returns

`void`

###### Inherited from

[`MCPBase`](#mcpbase).[`postprocess`](#postprocess-2)

##### preprocess()

> `protected` **preprocess**(`_`, `context`): `void`

Pre-processing operations before handling input

Preparatory work done before executing the agent's main processing logic, including:

- Checking context status
- Verifying invocation limits

###### Parameters

| Parameter | Type                                | Description            |
| --------- | ----------------------------------- | ---------------------- |
| `_`       | [`MCPPromptInput`](#mcppromptinput) | Input message (unused) |
| `context` | [`Context`](../aigne.md#context)    | Execution context      |

###### Returns

`void`

###### Inherited from

[`MCPBase`](#mcpbase).[`preprocess`](#preprocess-2)

##### process()

> **process**(`input`): `Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \}\>

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

`Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \}\>

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

[`MCPBase`](#mcpbase).[`process`](#process-2)

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

[`MCPBase`](#mcpbase).[`shutdown`](#shutdown-2)

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

- [`MCPBase`](#mcpbase)\<[`Message`](agent.md#message), `CallToolResult`\>

#### Constructors

##### Constructor

> **new MCPTool**(`options`): [`MCPTool`](#mcptool)

###### Parameters

| Parameter | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options` | [`MCPBaseOptions`](#mcpbaseoptions)\<[`Message`](agent.md#message), \{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]; `isError?`: `boolean`; \}\> |

###### Returns

[`MCPTool`](#mcptool)

###### Inherited from

[`MCPBase`](#mcpbase).[`constructor`](#constructor-1)

#### Properties

| Property                                                    | Type                                                                                                                                                                                                             | Description                                                                                                                                                             | Inherited from                                                          |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| <a id="client-4"></a> `client`                              | `ClientWithReconnect`                                                                                                                                                                                            | -                                                                                                                                                                       | [`MCPBase`](#mcpbase).[`client`](#client-1)                             |
| <a id="description-4"></a> `description?`                   | `string`                                                                                                                                                                                                         | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system              | [`MCPBase`](#mcpbase).[`description`](#description-1)                   |
| <a id="includeinputinoutput-4"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                                                                        | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                 | [`MCPBase`](#mcpbase).[`includeInputInOutput`](#includeinputinoutput-1) |
| <a id="memory-4"></a> `memory?`                             | `AgentMemory`                                                                                                                                                                                                    | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing     | [`MCPBase`](#mcpbase).[`memory`](#memory-1)                             |
| <a id="name-4"></a> `name`                                  | `string`                                                                                                                                                                                                         | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                               | [`MCPBase`](#mcpbase).[`name`](#name-1)                                 |
| <a id="publishtopic-4"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>                                                                                                                                       | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                          | [`MCPBase`](#mcpbase).[`publishTopic`](#publishtopic-1)                 |
| <a id="skills-4"></a> `skills`                              | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>; \} | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents | [`MCPBase`](#mcpbase).[`skills`](#skills-1)                             |
| <a id="subscribetopic-4"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                                                                    | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                         | [`MCPBase`](#mcpbase).[`subscribeTopic`](#subscribetopic-1)             |

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

[`MCPBase`](#mcpbase).[`inputSchema`](#inputschema-1)

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

###### Inherited from

[`MCPBase`](#mcpbase).[`isInvokable`](#isinvokable-1)

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

[`MCPBase`](#mcpbase).[`outputSchema`](#outputschema-1)

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

[`MCPBase`](#mcpbase).[`topic`](#topic-1)

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

[`MCPBase`](#mcpbase).[`[asyncDispose]`](#asyncdispose-2)

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

###### Inherited from

[`MCPBase`](#mcpbase).[`[custom]`](#custom-2)

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

[`MCPBase`](#mcpbase).[`addSkill`](#addskill-2)

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

[`MCPBase`](#mcpbase).[`attach`](#attach-2)

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

[`MCPBase`](#mcpbase).[`checkAgentInvokesUsage`](#checkagentinvokesusage-2)

##### invoke()

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]; `isError?`: `boolean`; \}\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                               | Description                                                      |
| ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `input`    | `string` \| [`Message`](agent.md#message)                                          | Input message to the agent, can be a string or structured object |
| `context?` | [`Context`](../aigne.md#context)                                                   | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

###### Returns

`Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]; `isError?`: `boolean`; \}\>

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

[`MCPBase`](#mcpbase).[`invoke`](#invoke-4)

###### Call Signature

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]; `isError?`: `boolean`; \}\>\>

Invoke the agent with streaming response

Streaming responses allow the agent to return results incrementally,
suitable for scenarios requiring real-time progress updates, such as
chat bot typing effects.

###### Parameters

| Parameter           | Type                                            | Description                                                      |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `input`             | `string` \| [`Message`](agent.md#message)       | Input message to the agent, can be a string or structured object |
| `context`           | `undefined` \| [`Context`](../aigne.md#context) | Execution context, providing environment and resource access     |
| `options`           | \{ `streaming`: `true`; \}                      | Invocation options, must set streaming to true for this overload |
| `options.streaming` | `true`                                          | -                                                                |

###### Returns

`Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]; `isError?`: `boolean`; \}\>\>

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

[`MCPBase`](#mcpbase).[`invoke`](#invoke-4)

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](agent.md#agentresponse)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]; `isError?`: `boolean`; \}\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                                | Description                |
| ---------- | --------------------------------------------------- | -------------------------- |
| `input`    | `string` \| [`Message`](agent.md#message)           | Input message to the agent |
| `context?` | [`Context`](../aigne.md#context)                    | Execution context          |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](agent.md#agentresponse)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]; `isError?`: `boolean`; \}\>\>

Agent response (streaming or regular)

###### Inherited from

[`MCPBase`](#mcpbase).[`invoke`](#invoke-4)

##### postprocess()

> `protected` **postprocess**(`input`, `output`, `context`): `void`

Post-processing operations after handling output

Operations performed after the agent produces output, including:

- Checking context status
- Adding interaction records to memory

###### Parameters

| Parameter         | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Description                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `input`           | [`Message`](agent.md#message)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Input message                                                                                                                   |
| `output`          | \{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]; `isError?`: `boolean`; \} | Output message                                                                                                                  |
| `output._meta?`   | \{[`key`: `string`]: `unknown`; \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses. |
| `output.content`  | (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]                                                                                                                     | -                                                                                                                               |
| `output.isError?` | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | -                                                                                                                               |
| `context`         | [`Context`](../aigne.md#context)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Execution context                                                                                                               |

###### Returns

`void`

###### Inherited from

[`MCPBase`](#mcpbase).[`postprocess`](#postprocess-2)

##### preprocess()

> `protected` **preprocess**(`_`, `context`): `void`

Pre-processing operations before handling input

Preparatory work done before executing the agent's main processing logic, including:

- Checking context status
- Verifying invocation limits

###### Parameters

| Parameter | Type                             | Description            |
| --------- | -------------------------------- | ---------------------- |
| `_`       | [`Message`](agent.md#message)    | Input message (unused) |
| `context` | [`Context`](../aigne.md#context) | Execution context      |

###### Returns

`void`

###### Inherited from

[`MCPBase`](#mcpbase).[`preprocess`](#preprocess-2)

##### process()

> **process**(`input`): `Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]; `isError?`: `boolean`; \}\>

Core processing method of the agent, must be implemented in subclasses

This is the main functionality implementation of the agent, processing input and
generating output. Can return various types of results:

- Regular object response
- Streaming response
- Async generator
- Another agent instance (transfer agent)

###### Parameters

| Parameter | Type                          | Description   |
| --------- | ----------------------------- | ------------- |
| `input`   | [`Message`](agent.md#message) | Input message |

###### Returns

`Promise`\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `content`: (\{[`key`: `string`]: `unknown`; `text`: `string`; `type`: `"text"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"image"`; \} \| \{[`key`: `string`]: `unknown`; `data`: `string`; `mimeType`: `string`; `type`: `"audio"`; \} \| \{[`key`: `string`]: `unknown`; `resource`: \{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \}; `type`: `"resource"`; \})[]; `isError?`: `boolean`; \}\>

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

[`MCPBase`](#mcpbase).[`process`](#process-2)

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

[`MCPBase`](#mcpbase).[`shutdown`](#shutdown-2)

## Interfaces

### ClientWithReconnectOptions

#### Properties

| Property                                          | Type                                  |
| ------------------------------------------------- | ------------------------------------- |
| <a id="maxreconnects"></a> `maxReconnects?`       | `number`                              |
| <a id="shouldreconnect"></a> `shouldReconnect?`   | (`error`) => `boolean`                |
| <a id="timeout"></a> `timeout?`                   | `number`                              |
| <a id="transportcreator"></a> `transportCreator?` | () => `PromiseOrValue`\<`Transport`\> |

---

### MCPAgentOptions

Configuration options for an agent

#### Extends

- [`AgentOptions`](agent.md#agentoptions)

#### Properties

| Property                                                    | Type                                                                                                                                                           | Description                                                                                                                                           | Inherited from                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <a id="client-5"></a> `client`                              | `Client`                                                                                                                                                       | -                                                                                                                                                     | -                                                                                                              |
| <a id="description-5"></a> `description?`                   | `string`                                                                                                                                                       | Description of the agent A human-readable description of what the agent does, useful for documentation and debugging                                  | [`AgentOptions`](agent.md#agentoptions).[`description`](agent.md#agentoptions#description-2)                   |
| <a id="disableevents"></a> `disableEvents?`                 | `boolean`                                                                                                                                                      | Whether to disable emitting events for agent actions When true, the agent won't emit events like agentStarted, agentSucceed, or agentFailed           | [`AgentOptions`](agent.md#agentoptions).[`disableEvents`](agent.md#agentoptions#disableevents)                 |
| <a id="includeinputinoutput-5"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                      | Whether to include input in the output When true, the agent will merge input fields into the output object                                            | [`AgentOptions`](agent.md#agentoptions).[`includeInputInOutput`](agent.md#agentoptions#includeinputinoutput-2) |
| <a id="inputschema-5"></a> `inputSchema?`                   | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<[`Message`](agent.md#message)\>                                                                   | Zod schema defining the input message structure Used to validate that input messages conform to the expected format                                   | [`AgentOptions`](agent.md#agentoptions).[`inputSchema`](agent.md#agentoptions#inputschema-2)                   |
| <a id="memory-5"></a> `memory?`                             | `boolean` \| `AgentMemory` \| `AgentMemoryOptions`                                                                                                             | Memory configuration for the agent Can be an AgentMemory instance, configuration options, or simply a boolean to enable/disable with default settings | [`AgentOptions`](agent.md#agentoptions).[`memory`](agent.md#agentoptions#memory-2)                             |
| <a id="name-5"></a> `name?`                                 | `string`                                                                                                                                                       | Name of the agent Used for identification and logging. Defaults to the constructor name if not specified                                              | [`AgentOptions`](agent.md#agentoptions).[`name`](agent.md#agentoptions#name-2)                                 |
| <a id="outputschema-5"></a> `outputSchema?`                 | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<[`Message`](agent.md#message)\>                                                                   | Zod schema defining the output message structure Used to validate that output messages conform to the expected format                                 | [`AgentOptions`](agent.md#agentoptions).[`outputSchema`](agent.md#agentoptions#outputschema-2)                 |
| <a id="prompts-1"></a> `prompts?`                           | [`MCPPrompt`](#mcpprompt)[]                                                                                                                                    | -                                                                                                                                                     | -                                                                                                              |
| <a id="publishtopic-5"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>                                                                                     | Topics the agent should publish to These topics determine where the agent's output messages will be sent in the system                                | [`AgentOptions`](agent.md#agentoptions).[`publishTopic`](agent.md#agentoptions#publishtopic-2)                 |
| <a id="resources-1"></a> `resources?`                       | [`MCPResource`](#mcpresource)[]                                                                                                                                | -                                                                                                                                                     | -                                                                                                              |
| <a id="skills-5"></a> `skills?`                             | ([`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`FunctionAgentFn`](agent.md#functionagentfn)\<`any`, `any`\>)[] | List of skills (other agents or functions) this agent has These skills can be used by the agent to delegate tasks or extend its capabilities          | [`AgentOptions`](agent.md#agentoptions).[`skills`](agent.md#agentoptions#skills-2)                             |
| <a id="subscribetopic-5"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                  | Topics the agent should subscribe to These topics determine which messages the agent will receive from the system                                     | [`AgentOptions`](agent.md#agentoptions).[`subscribeTopic`](agent.md#agentoptions#subscribetopic-2)             |

---

### MCPBaseOptions\<I, O\>

Configuration options for an agent

#### Extends

- [`AgentOptions`](agent.md#agentoptions)\<`I`, `O`\>

#### Extended by

- [`MCPResourceOptions`](#mcpresourceoptions)

#### Type Parameters

| Type Parameter                              | Default type                  | Description                   |
| ------------------------------------------- | ----------------------------- | ----------------------------- |
| `I` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The agent input message type  |
| `O` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The agent output message type |

#### Properties

| Property                                                    | Type                                                                                                                                                           | Description                                                                                                                                           | Inherited from                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <a id="client-6"></a> `client`                              | `ClientWithReconnect`                                                                                                                                          | -                                                                                                                                                     | -                                                                                                              |
| <a id="description-6"></a> `description?`                   | `string`                                                                                                                                                       | Description of the agent A human-readable description of what the agent does, useful for documentation and debugging                                  | [`AgentOptions`](agent.md#agentoptions).[`description`](agent.md#agentoptions#description-2)                   |
| <a id="disableevents-1"></a> `disableEvents?`               | `boolean`                                                                                                                                                      | Whether to disable emitting events for agent actions When true, the agent won't emit events like agentStarted, agentSucceed, or agentFailed           | [`AgentOptions`](agent.md#agentoptions).[`disableEvents`](agent.md#agentoptions#disableevents)                 |
| <a id="includeinputinoutput-6"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                      | Whether to include input in the output When true, the agent will merge input fields into the output object                                            | [`AgentOptions`](agent.md#agentoptions).[`includeInputInOutput`](agent.md#agentoptions#includeinputinoutput-2) |
| <a id="inputschema-6"></a> `inputSchema?`                   | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<`I`\>                                                                                             | Zod schema defining the input message structure Used to validate that input messages conform to the expected format                                   | [`AgentOptions`](agent.md#agentoptions).[`inputSchema`](agent.md#agentoptions#inputschema-2)                   |
| <a id="memory-6"></a> `memory?`                             | `boolean` \| `AgentMemory` \| `AgentMemoryOptions`                                                                                                             | Memory configuration for the agent Can be an AgentMemory instance, configuration options, or simply a boolean to enable/disable with default settings | [`AgentOptions`](agent.md#agentoptions).[`memory`](agent.md#agentoptions#memory-2)                             |
| <a id="name-6"></a> `name?`                                 | `string`                                                                                                                                                       | Name of the agent Used for identification and logging. Defaults to the constructor name if not specified                                              | [`AgentOptions`](agent.md#agentoptions).[`name`](agent.md#agentoptions#name-2)                                 |
| <a id="outputschema-6"></a> `outputSchema?`                 | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<`O`\>                                                                                             | Zod schema defining the output message structure Used to validate that output messages conform to the expected format                                 | [`AgentOptions`](agent.md#agentoptions).[`outputSchema`](agent.md#agentoptions#outputschema-2)                 |
| <a id="publishtopic-6"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<`O`\>                                                                                                               | Topics the agent should publish to These topics determine where the agent's output messages will be sent in the system                                | [`AgentOptions`](agent.md#agentoptions).[`publishTopic`](agent.md#agentoptions#publishtopic-2)                 |
| <a id="skills-6"></a> `skills?`                             | ([`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`FunctionAgentFn`](agent.md#functionagentfn)\<`any`, `any`\>)[] | List of skills (other agents or functions) this agent has These skills can be used by the agent to delegate tasks or extend its capabilities          | [`AgentOptions`](agent.md#agentoptions).[`skills`](agent.md#agentoptions#skills-2)                             |
| <a id="subscribetopic-6"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                  | Topics the agent should subscribe to These topics determine which messages the agent will receive from the system                                     | [`AgentOptions`](agent.md#agentoptions).[`subscribeTopic`](agent.md#agentoptions#subscribetopic-2)             |

---

### MCPPromptInput

Basic message type that can contain any key-value pairs

#### Extends

- [`Message`](agent.md#message)

#### Indexable

\[`key`: `string`\]: `string`

---

### MCPResourceOptions

Configuration options for an agent

#### Extends

- [`MCPBaseOptions`](#mcpbaseoptions)\<[`MCPPromptInput`](#mcppromptinput), `ReadResourceResult`\>

#### Properties

| Property                                                    | Type                                                                                                                                                                                                                                                                                                                                                          | Description                                                                                                                                           | Inherited from                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| <a id="client-7"></a> `client`                              | `ClientWithReconnect`                                                                                                                                                                                                                                                                                                                                         | -                                                                                                                                                     | [`MCPBaseOptions`](#mcpbaseoptions).[`client`](#client-6)                             |
| <a id="description-7"></a> `description?`                   | `string`                                                                                                                                                                                                                                                                                                                                                      | Description of the agent A human-readable description of what the agent does, useful for documentation and debugging                                  | [`MCPBaseOptions`](#mcpbaseoptions).[`description`](#description-6)                   |
| <a id="disableevents-2"></a> `disableEvents?`               | `boolean`                                                                                                                                                                                                                                                                                                                                                     | Whether to disable emitting events for agent actions When true, the agent won't emit events like agentStarted, agentSucceed, or agentFailed           | [`MCPBaseOptions`](#mcpbaseoptions).[`disableEvents`](#disableevents-1)               |
| <a id="includeinputinoutput-7"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                                                                                                                                                                                                                     | Whether to include input in the output When true, the agent will merge input fields into the output object                                            | [`MCPBaseOptions`](#mcpbaseoptions).[`includeInputInOutput`](#includeinputinoutput-6) |
| <a id="inputschema-7"></a> `inputSchema?`                   | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<[`MCPPromptInput`](#mcppromptinput)\>                                                                                                                                                                                                                                                            | Zod schema defining the input message structure Used to validate that input messages conform to the expected format                                   | [`MCPBaseOptions`](#mcpbaseoptions).[`inputSchema`](#inputschema-6)                   |
| <a id="memory-7"></a> `memory?`                             | `boolean` \| `AgentMemory` \| `AgentMemoryOptions`                                                                                                                                                                                                                                                                                                            | Memory configuration for the agent Can be an AgentMemory instance, configuration options, or simply a boolean to enable/disable with default settings | [`MCPBaseOptions`](#mcpbaseoptions).[`memory`](#memory-6)                             |
| <a id="name-7"></a> `name?`                                 | `string`                                                                                                                                                                                                                                                                                                                                                      | Name of the agent Used for identification and logging. Defaults to the constructor name if not specified                                              | [`MCPBaseOptions`](#mcpbaseoptions).[`name`](#name-6)                                 |
| <a id="outputschema-7"></a> `outputSchema?`                 | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \}\> | Zod schema defining the output message structure Used to validate that output messages conform to the expected format                                 | [`MCPBaseOptions`](#mcpbaseoptions).[`outputSchema`](#outputschema-6)                 |
| <a id="publishtopic-7"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<\{[`key`: `string`]: `unknown`; `_meta?`: \{[`key`: `string`]: `unknown`; \}; `contents`: (\{[`key`: `string`]: `unknown`; `mimeType?`: `string`; `text`: `string`; `uri`: `string`; \} \| \{[`key`: `string`]: `unknown`; `blob`: `string`; `mimeType?`: `string`; `uri`: `string`; \})[]; \}\>                   | Topics the agent should publish to These topics determine where the agent's output messages will be sent in the system                                | [`MCPBaseOptions`](#mcpbaseoptions).[`publishTopic`](#publishtopic-6)                 |
| <a id="skills-7"></a> `skills?`                             | ([`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`FunctionAgentFn`](agent.md#functionagentfn)\<`any`, `any`\>)[]                                                                                                                                                                                                | List of skills (other agents or functions) this agent has These skills can be used by the agent to delegate tasks or extend its capabilities          | [`MCPBaseOptions`](#mcpbaseoptions).[`skills`](#skills-6)                             |
| <a id="subscribetopic-7"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                                                                                                                                                                                                                 | Topics the agent should subscribe to These topics determine which messages the agent will receive from the system                                     | [`MCPBaseOptions`](#mcpbaseoptions).[`subscribeTopic`](#subscribetopic-6)             |
| <a id="uri-1"></a> `uri`                                    | `string`                                                                                                                                                                                                                                                                                                                                                      | -                                                                                                                                                     | -                                                                                     |

## Type Aliases

### MCPServerOptions

> **MCPServerOptions** = [`SSEServerParameters`](#sseserverparameters) \| `StdioServerParameters`

---

### SSEServerParameters

> **SSEServerParameters** = \{ `maxReconnects?`: `number`; `opts?`: `SSEClientTransportOptions` \| `StreamableHTTPClientTransportOptions`; `shouldReconnect?`: (`error`) => `boolean`; `timeout?`: `number`; `transport?`: `"sse"` \| `"streamableHttp"`; `url`: `string`; \}

#### Properties

| Property                                          | Type                                                                  | Description                                                                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="maxreconnects-1"></a> `maxReconnects?`     | `number`                                                              | Whether to automatically reconnect to the server if the connection is lost. **Default** `10 set to 0 to disable automatic reconnection` |
| <a id="opts"></a> `opts?`                         | `SSEClientTransportOptions` \| `StreamableHTTPClientTransportOptions` | Additional options to pass to the SSEClientTransport or StreamableHTTPClientTransport.                                                  |
| <a id="shouldreconnect-1"></a> `shouldReconnect?` | (`error`) => `boolean`                                                | A function that determines whether to reconnect to the server based on the error. default to reconnect on all errors.                   |
| <a id="timeout-1"></a> `timeout?`                 | `number`                                                              | The timeout for requests to the server, in milliseconds. **Default** `60000`                                                            |
| <a id="transport"></a> `transport?`               | `"sse"` \| `"streamableHttp"`                                         | Whether to use the StreamableHTTPClientTransport instead of the SSEClientTransport. **Default** `"sse"`                                 |
| <a id="url"></a> `url`                            | `string`                                                              | -                                                                                                                                       |
