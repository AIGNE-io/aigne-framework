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
await using mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/sse`,
  transport: "sse",
});

console.log(mcpAgent.name); // Output: "example-server"

const echo = mcpAgent.skills.echo;
if (!echo) throw new Error("Skill not found");

const result = await echo.invoke({ message: "Hello!" });
console.log(result);
// {
//   "content": [
//     {
//       "text": "Tool echo: Hello!",
//       "type": "text",
//     },
//   ],
// }
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

##### client

> **client**: `Client`

The MCP client instance used for communication with the MCP server.

This client manages the connection to the MCP server and provides
methods for interacting with server-provided functionality.

##### prompts

> `readonly` **prompts**: [`MCPPrompt`](#mcpprompt)[] & \{[`key`: `string`]: [`MCPPrompt`](#mcpprompt); \}

Array of MCP prompts available from the connected server.

Prompts can be accessed by index or by name.

###### Example

Here's an example of accessing prompts:

```ts
await using mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/mcp`,
  transport: "streamableHttp",
});

const echo = mcpAgent.prompts.echo;
if (!echo) throw new Error("Prompt not found");

const result = await echo.invoke({ message: "Hello!" });
console.log(result);
// {
//   "messages": [
//     {
//       "content": {
//         "text": "Please process this message: Hello!",
//         "type": "text",
//       },
//       "role": "user",
//     },
//     ...
//   ],
// }
```

##### resources

> `readonly` **resources**: [`MCPResource`](#mcpresource)[] & \{[`key`: `string`]: [`MCPResource`](#mcpresource); \}

Array of MCP resources available from the connected server.

Resources can be accessed by index or by name.

###### Example

Here's an example of accessing resources:

```ts
await using mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/mcp`,
  transport: "streamableHttp",
});

const echo = mcpAgent.resources.echo;
if (!echo) throw new Error("Resource not found");

const result = await echo.invoke({ message: "Hello!" });
console.log(result);
// {
//   "contents": [
//     {
//       "text": "Resource echo: Hello!",
//       "uri": "echo://Hello!",
//     },
//   ],
// }
```

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

[`Agent`](agent.md#agent).[`isInvokable`](agent.md#agent#isinvokable)

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
await using mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/mcp`,
  transport: "streamableHttp",
});

console.log(mcpAgent.name); // Output: "example-server-streamable-http"

const echo = mcpAgent.skills.echo;
if (!echo) throw new Error("Skill not found");

const result = await echo.invoke({ message: "Hello!" });
console.log(result);
// {
//   "content": [
//     {
//       "text": "Tool echo: Hello!",
//       "type": "text",
//     },
//   ],
// }
```

Here's an example of creating an MCPAgent with SSE transport:

```ts
await using mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/sse`,
  transport: "sse",
});

console.log(mcpAgent.name); // Output: "example-server"

const echo = mcpAgent.skills.echo;
if (!echo) throw new Error("Skill not found");

const result = await echo.invoke({ message: "Hello!" });
console.log(result);
// {
//   "content": [
//     {
//       "text": "Tool echo: Hello!",
//       "type": "text",
//     },
//   ],
// }
```

Here's an example of creating an MCPAgent with Stdio transport:

```ts
await using mcpAgent = await MCPAgent.from({
  command: "bun",
  args: [join(import.meta.dir, "../../test/_mocks/mock-mcp-server.ts")],
});

console.log(mcpAgent.name); // Output: "example-server"

const echo = mcpAgent.skills.echo;
if (!echo) throw new Error("Skill not found");

const result = await echo.invoke({ message: "Hello!" });
console.log(result);
// {
//   "content": [
//     {
//       "text": "Tool echo: Hello!",
//       "type": "text",
//     },
//   ],
// }
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

> **process**(`_input`, `_context?`): `Promise`\<[`Message`](agent.md#message)\>

Process method required by Agent interface.

Since MCPAgent itself is not directly invokable, this method
throws an error if called.

###### Parameters

| Parameter   | Type                          | Description                |
| ----------- | ----------------------------- | -------------------------- |
| `_input`    | [`Message`](agent.md#message) | Input message (unused)     |
| `_context?` | `Context`                     | Execution context (unused) |

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

const close = spyOn(mcpAgent.client, "close");

await mcpAgent.shutdown();
```

Here's an example of shutting down an MCPAgent by using statement:

```ts
await using _mcpAgent = await MCPAgent.from({
  url: `http://localhost:${port}/mcp`,
  transport: "streamableHttp",
});

const close = spyOn(_mcpAgent.client, "close");
```

###### Overrides

[`Agent`](agent.md#agent).[`shutdown`](agent.md#agent#shutdown)

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

##### client

> `protected` **client**: `ClientWithReconnect`

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

| Parameter | Type                          | Description   |
| --------- | ----------------------------- | ------------- |
| `input`   | [`Message`](agent.md#message) | Input message |

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

[`MCPBase`](#mcpbase).[`constructor`](#constructor-1)

#### Properties

##### uri

> **uri**: `string`

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

## Interfaces

### MCPAgentOptions

Configuration options for an agent

#### Extends

- [`AgentOptions`](agent.md#agentoptions)

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

- [`AgentOptions`](agent.md#agentoptions)\<`I`, `O`\>

#### Extended by

- [`MCPResourceOptions`](#mcpresourceoptions)

#### Type Parameters

| Type Parameter                              | Default type                  | Description                   |
| ------------------------------------------- | ----------------------------- | ----------------------------- |
| `I` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The agent input message type  |
| `O` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The agent output message type |

#### Properties

| Property                       | Type                  |
| ------------------------------ | --------------------- |
| <a id="client-2"></a> `client` | `ClientWithReconnect` |

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

| Property               | Type     |
| ---------------------- | -------- |
| <a id="uri"></a> `uri` | `string` |

## Type Aliases

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
