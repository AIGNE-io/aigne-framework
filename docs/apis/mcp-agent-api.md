# MCP Agent API Reference

[中文](./mcp-agent-api.zh.md) | **English**

MCP Agent is an Agent implementation for interacting with servers compliant with the Model Context Protocol (MCP). It can invoke tools, retrieve prompt templates, and access resources provided by MCP servers.

## MCPAgent Class

`MCPAgent` inherits from the `Agent` base class and is specifically designed for interacting with MCP servers.

### Basic Properties

- `client`: `Client` - MCP client instance, used for communicating with the MCP server
- `prompts`: `MCPPrompt[]` - List of prompt templates provided by the MCP server
- `resources`: `MCPResource[]` - List of resources provided by the MCP server
- `isInvokable`: `boolean` - Always false, as MCPAgent itself cannot be directly invoked

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
    - `maxReconnects`: `number` - Optional, maximum number of reconnection attempts, defaults to 10, set to 0 to disable automatic reconnection
    - `shouldReconnect`: `(error: Error) => boolean` - Optional, custom function to determine which errors need reconnection, defaults to all errors triggering reconnection
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

## MCPBase Class

`MCPBase` is a base class for `MCPTool`, `MCPPrompt`, and `MCPResource`, providing common functionality for interacting with MCP servers.

### Basic Properties

- `client`: `ClientWithReconnect` - MCP client instance with automatic reconnection support
- `mcpServer`: `string \| undefined` - MCP server name

### Constructor

```typescript
constructor(options: MCPBaseOptions<I, O>)
```

#### Parameters

- `options`: `MCPBaseOptions<I, O>` - MCPBase configuration options
  - `client`: `ClientWithReconnect` - MCP client instance with automatic reconnection support

## MCPTool Class

`MCPTool` inherits from `MCPBase` and is used for invoking tools provided by an MCP server.

## MCPPrompt Class

`MCPPrompt` inherits from `MCPBase` and is used for retrieving prompt templates provided by an MCP server.

## MCPResource Class

`MCPResource` inherits from `MCPBase` and is used for accessing resources provided by an MCP server.

### Basic Properties

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
  maxReconnects?: number;
  shouldReconnect?: (error: Error) => boolean;
};
```

- `url`: `string` - MCP server URL address
- `maxReconnects`: `number` - Optional, maximum number of reconnection attempts, defaults to 10, set to 0 to disable automatic reconnection
- `shouldReconnect`: `(error: Error) => boolean` - Optional, custom function to determine which errors need reconnection; if not provided, all errors will trigger reconnection

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
interface MCPResourceOptions extends MCPBaseOptions<MCPPromptInput, ReadResourceResult> {
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
  AIGNE,
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

// Create AIGNE and add Puppeteer MCP Agent as a skill
const aigne = new AIGNE({
  model,
  skills: [puppeteerMCPAgent]
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
const result = await aigne.invoke(
  agent,
  "extract content from https://www.arcblock.io"
);

console.log(result);
// Example output:
// {
//   text: "The content extracted from the website [ArcBlock](https://www.arcblock.io) is as follows:\n\n---\n\n**Redefining Software Architect and Ecosystems**\n\nA total solution for building decentralized applications ..."
// }

// Shut down the AIGNE
await aigne.shutdown();
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
console.log("Available tools:", sqliteMCPAgent.skills.map(skill => skill.name));

// Use query skill
const querySkill = sqliteMCPAgent.skills.query;
if (querySkill ) {
  const result = await querySkill.invoke({
    query: "SELECT * FROM users LIMIT 5"
  });
  console.log("Query results:", result);
}

// Close MCP client
await sqliteMCPAgent.shutdown();
