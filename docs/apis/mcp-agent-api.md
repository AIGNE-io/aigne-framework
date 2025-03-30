# MCP Agent API Reference

[中文](./mcp-agent-api.zh.md) | **English**

MCP Agent is an Agent implementation for interacting with servers compliant with the Model Context Protocol (MCP). It can call tools, retrieve prompt templates, and access resources provided by MCP servers.

## MCPAgent Class

`MCPAgent` inherits from the `Agent` base class and is specifically designed for interacting with MCP servers.

### Basic Properties

- `client`: `Client` - MCP client instance, used for communicating with the MCP server
- `prompts`: `MCPPrompt[]` - List of prompt templates provided by the MCP server
- `resources`: `MCPResource[]` - List of resources provided by the MCP server
- `isCallable`: `boolean` - Always false, as MCPAgent itself cannot be directly called

### Constructor

```typescript
constructor(options: MCPAgentOptions)
```

#### Parameters

- `options`: `MCPAgentOptions` - MCPAgent configuration options
  - `client`: `Client` - MCP client instance
  - `prompts`: `MCPPrompt[]` - Optional list of prompt templates
  - `resources`: `MCPResource[]` - Optional list of resources

### Static Methods

#### `from`

Factory method for creating an MCPAgent, which can create an instance from server options or MCPAgentOptions.

```typescript
static from(options: MCPServerOptions): Promise<MCPAgent>;
static from(options: MCPAgentOptions): MCPAgent;
```

##### Parameters

- `options`: `MCPServerOptions | MCPAgentOptions` - Server options or MCPAgent configuration
  - When passing `SSEServerParameters`:
    - `url`: `string` - MCP server URL address
    - `autoReconnect`: `boolean` - Optional, whether to enable automatic reconnection, defaults to true
    - `isErrorNeedReconnect`: `(error: Error) => boolean` - Optional, custom function to determine which errors need reconnection, defaults to all errors triggering reconnection
  - When passing `StdioServerParameters`:
    - `command`: `string` - Command to start the MCP server
    - `args`: `string[]` - Optional, list of command arguments
    - `env`: `Record<string, string>` - Optional, environment variable configuration

##### Returns

- `MCPAgent | Promise<MCPAgent>` - Returns the created MCPAgent instance or a Promise for the instance

### Methods

#### `shutdown`

Shuts down the MCPAgent and releases resources.

```typescript
async shutdown()
```

## MCPTool Class

`MCPTool` is an Agent implementation for calling tools provided by an MCP server.

### Basic Properties

- `client`: `Client` - MCP client instance
- `mcpServer`: `string \| undefined` - MCP server name

## MCPPrompt Class

`MCPPrompt` is an Agent implementation for retrieving prompt templates provided by an MCP server.

### Basic Properties

- `client`: `Client` - MCP client instance
- `mcpServer`: `string \| undefined` - MCP server name

## MCPResource Class

`MCPResource` is an Agent implementation for accessing resources provided by an MCP server.

### Basic Properties

- `client`: `Client` - MCP client instance
- `mcpServer`: `string \| undefined` - MCP server name
- `uri`: `string` - Resource URI or URI template

### Constructor

```typescript
constructor(options: MCPResourceOptions)
```

#### Parameters

- `options`: `MCPResourceOptions` - MCPResource configuration options
  - `client`: `Client` - MCP client instance
  - `uri`: `string` - Resource URI or URI template

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
  autoReconnect?: boolean;
  isErrorNeedReconnect?: (error: Error) => boolean;
};
```

- `url`: `string` - MCP server URL address
- `autoReconnect`: `boolean` - Optional, whether to enable automatic reconnection, defaults to true
- `isErrorNeedReconnect`: `(error: Error) => boolean` - Optional, custom function to determine which errors need reconnection; if not provided, all errors will trigger reconnection

### `StdioServerParameters`

Defines the parameters for a standard input/output-based MCP server.

```typescript
interface StdioServerParameters {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}
```

- `command`: `string` - Command to start the MCP server
- `args`: `string[]` - Optional, list of command arguments
- `env`: `Record<string, string>` - Optional, environment variable configuration

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
  OpenAIChatModel,
  ExecutionEngine,
  MCPAgent
} from "@aigne/core";

// Create AI model
const model = new OpenAIChatModel({
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

### Using Other MCP Servers

In addition to the Puppeteer MCP server, you can also use other MCP servers, such as the SQLite MCP server:

```typescript
import { MCPAgent } from "@aigne/core";

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
