# MCP Agent API Reference

[中文](./mcp-agent-api.zh.md) | **English**

MCP Agent is an Agent implementation for interacting with servers compliant with the Model Context Protocol (MCP). It can call tools, retrieve prompt templates, and access resources provided by MCP servers.

## MCPAgent Class

`MCPAgent` inherits from the `Agent` base class and is specifically designed for interacting with MCP servers.

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `client` | `Client` | MCP client instance, used for communicating with the MCP server |
| `prompts` | `MCPPrompt[]` | List of prompt templates provided by the MCP server |
| `resources` | `MCPResource[]` | List of resources provided by the MCP server |
| `isCallable` | `boolean` | Always false, as MCPAgent itself cannot be directly called |

### Constructor

```typescript
constructor(options: MCPAgentOptions)
```

#### Parameters

- `options`: `MCPAgentOptions` - MCPAgent configuration options

  | Option | Type | Description |
  |--------|------|-------------|
  | `client` | `Client` | MCP client instance |
  | `prompts` | `MCPPrompt[]` | Optional list of prompt templates |
  | `resources` | `MCPResource[]` | Optional list of resources |

### Static Methods

#### `from`

Factory method for creating an MCPAgent, which can create an instance from server options or MCPAgentOptions.

```typescript
static from(options: MCPServerOptions): Promise<MCPAgent>;
static from(options: MCPAgentOptions): MCPAgent;
```

##### Parameters

- `options`: `MCPServerOptions | MCPAgentOptions` - Server options or MCPAgent configuration

##### Returns

- `MCPAgent | Promise<MCPAgent>` - Returns the created MCPAgent instance or a Promise for the instance

#### `fromTransport`

Private static method for creating an MCPAgent from a transport interface.

```typescript
private static async fromTransport(transport: Transport): Promise<MCPAgent>
```

##### Parameters

- `transport`: `Transport` - MCP transport interface

##### Returns

- `Promise<MCPAgent>` - Returns the created MCPAgent instance

### Methods

#### `process`

MCPAgent itself does not support processing, so this method always throws an error.

```typescript
async process(_input: AgentInput, _context?: Context): Promise<AgentOutput>
```

##### Parameters

- `_input`: `AgentInput` - Input data (unused)
- `_context`: `Context` (optional) - Execution context (unused)

##### Returns

- Always throws an error, does not return a value

#### `shutdown`

Shuts down the MCPAgent and releases resources.

```typescript
async shutdown()
```

## MCPTool Class

`MCPTool` is an Agent implementation for calling tools provided by an MCP server.

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `client` | `Client` | MCP client instance |
| `mcpServer` | `string \| undefined` | MCP server name |

### Methods

#### `process`

Calls an MCP tool and returns the result.

```typescript
async process(input: AgentInput): Promise<CallToolResult>
```

##### Parameters

- `input`: `AgentInput` - Input data, which will be passed as arguments to the MCP tool

##### Returns

- `Promise<CallToolResult>` - Returns the result of the MCP tool call

## MCPPrompt Class

`MCPPrompt` is an Agent implementation for retrieving prompt templates provided by an MCP server.

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `client` | `Client` | MCP client instance |
| `mcpServer` | `string \| undefined` | MCP server name |

### Methods

#### `process`

Retrieves an MCP prompt template and returns the result.

```typescript
async process(input: AgentInput): Promise<GetPromptResult>
```

##### Parameters

- `input`: `AgentInput` - Input data, which will be passed as arguments to the MCP prompt template

##### Returns

- `Promise<GetPromptResult>` - Returns the result of the MCP prompt template

## MCPResource Class

`MCPResource` is an Agent implementation for accessing resources provided by an MCP server.

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `client` | `Client` | MCP client instance |
| `mcpServer` | `string \| undefined` | MCP server name |
| `uri` | `string` | Resource URI or URI template |

### Constructor

```typescript
constructor(options: MCPResourceOptions)
```

#### Parameters

- `options`: `MCPResourceOptions` - MCPResource configuration options

  | Option | Type | Description |
  |--------|------|-------------|
  | `client` | `Client` | MCP client instance |
  | `uri` | `string` | Resource URI or URI template |

### Methods

#### `process`

Reads an MCP resource and returns the result.

```typescript
async process(input: { [key: string]: string }): Promise<ReadResourceResult>
```

##### Parameters

- `input`: `{ [key: string]: string }` - Key-value pairs for expanding the URI template

##### Returns

- `Promise<ReadResourceResult>` - Returns the read MCP resource

## Related Types

### `MCPAgentOptions`

Defines the configuration options for MCPAgent.

```typescript
interface MCPAgentOptions extends AgentOptions {
  client: Client;
  prompts?: MCPPrompt[];
  resources?: MCPResource[];
}
```

### `MCPServerOptions`

Defines the configuration options for an MCP server.

```typescript
type MCPServerOptions = SSEServerParameters | StdioServerParameters;
```

### `SSEServerParameters`

Defines the parameters for an SSE-based MCP server.

```typescript
type SSEServerParameters = {
  url: string;
};
```

### `StdioServerParameters`

Defines the parameters for a standard input/output-based MCP server.

```typescript
interface StdioServerParameters {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}
```

### `MCPResourceOptions`

Defines the configuration options for MCPResource.

```typescript
interface MCPResourceOptions extends MCPToolBaseOptions<{ [key: string]: never }, ReadResourceResult> {
  uri: string;
}
```

## Examples

### Using Puppeteer MCP Server to Extract Website Content

The following example demonstrates how to use the AIGNE framework and Puppeteer MCP Server to extract content from a website:

```typescript
import {
  AIAgent,
  ChatModelOpenAI,
  ExecutionEngine,
  MCPAgent
} from "@aigne/core-next";

// Create AI model
const model = new ChatModelOpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Connect to Puppeteer MCP server via npx command
const puppeteerMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"]
});

// Create execution engine and add Puppeteer MCP Agent as a tool
const engine = new ExecutionEngine({
  model,
  tools: [puppeteerMCPAgent]
});

// Create AI Agent with instructions for extracting website content
const agent = AIAgent.from({
  instructions: `\
## Steps to extract content from a website
1. navigate to the url
2. evaluate document.body.innerText to get the content
`
});

// Run Agent to extract content from specified website
const result = await engine.call(
  agent,
  "extract content from https://www.arcblock.io"
);

console.log(result);
// Example output:
// {
//   text: "The content extracted from the website [ArcBlock](https://www.arcblock.io) is as follows:\n\n---\n\n**Redefining Software Architect and Ecosystems**\n\nA total solution for building decentralized applications ..."
// }

// Shut down the execution engine
await engine.shutdown();
```

### Workflow

The basic workflow for using Puppeteer MCP Agent to extract website content is as follows:

1. Create a ChatModelOpenAI instance
2. Use MCPAgent.from method to connect to the Puppeteer MCP server
3. Create an ExecutionEngine and add the Puppeteer MCP Agent as a tool
4. Create an AIAgent and set instructions for extracting website content
5. Use engine.call method to run the Agent, passing in the Agent and the request to extract website content
6. The AI Agent will use the tools provided by the Puppeteer MCP Agent to perform the following operations:
   - Navigate to the specified URL
   - Use JavaScript to extract the page content
   - Return the extracted content
7. Finally, shut down the execution engine

### Using Other MCP Servers

In addition to the Puppeteer MCP server, you can also use other MCP servers, such as the SQLite MCP server:

```typescript
import { MCPAgent } from "@aigne/core-next";

// Connect to SQLite MCP server
const sqliteMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-sqlite"]
});

// Get list of available tools
console.log("Available tools:", sqliteMCPAgent.tools.map(tool => tool.name));

// Use query tool
const queryTool = sqliteMCPAgent.tools.query;
if (queryTool) {
  const result = await queryTool.call({
    query: "SELECT * FROM users LIMIT 5"
  });
  console.log("Query results:", result);
}

// Close MCP client
await sqliteMCPAgent.shutdown();
