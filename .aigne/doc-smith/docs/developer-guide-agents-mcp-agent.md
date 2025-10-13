# MCPAgent

The `MCPAgent` is a specialized agent designed to interact with servers that implement the Model Context Protocol (MCP). It acts as a bridge between your application and MCP servers, allowing you to seamlessly connect to them, discover their capabilities, and utilize their tools, prompts, and resources.

This agent simplifies the integration of external services by providing a standardized interface for communication, whether the server is running as a local command-line process or is available over the network via HTTP.

## Architecture Overview

`MCPAgent` extends the base `Agent` class and encapsulates an MCP `Client` to manage the connection and communication with the remote server. It automatically discovers the server's offerings and represents them as native AIGNE components like skills, prompts, and resources.

# MCPAgent

The `MCPAgent` is a specialized agent designed to interact with servers that implement the Model Context Protocol (MCP). It acts as a bridge between your application and MCP servers, allowing you to seamlessly connect to them, discover their capabilities, and utilize their tools, prompts, and resources.

This agent simplifies the integration of external services by providing a standardized interface for communication, whether the server is running as a local command-line process or is available over the network via HTTP.

## Architecture Overview

`MCPAgent` extends the base `Agent` class and encapsulates an MCP `Client` to manage the connection and communication with the remote server. It automatically discovers the server's offerings and represents them as native AIGNE components like skills, prompts, and resources.
```d2
direction: down

Application: {
  label: "Your Application"
  shape: rectangle
}

MCPAgent: {
  label: "MCPAgent"
  shape: rectangle

  MCP-Client: {
    label: "MCP Client\n(Manages Connection)"
  }
}

Agent-Base: {
  label: "Agent (Base Class)"
}

MCP-Server: {
  label: "MCP Server\n(Local CLI or Remote HTTP)"
  shape: rectangle
  style.stroke-dash: 4

  Server-Offerings: {
    label: "Server Offerings"
    grid-columns: 3
    Skills: {}
    Prompts: {}
    Resources: {}
  }
}

Application -> MCPAgent: "1. Uses"
MCPAgent -> Agent-Base: "extends" {
  style.stroke-dash: 2
}
MCPAgent.MCP-Client -> MCP-Server: "2. Connects & Communicates"
MCP-Server.Server-Offerings -> MCPAgent: "3. Discovers" {
  style.stroke-dash: 2
}
MCPAgent -> Application: "4. Provides components\n(Skills, Prompts, Resources)"

```

## Creating an MCPAgent

There are two primary ways to create an `MCPAgent`: by establishing a new connection to an MCP server or by using a pre-configured MCP client instance.

### 1. From a Server Connection

The static `MCPAgent.from()` method is the most common way to create an agent. It handles the connection process and automatically discovers the server's capabilities.

#### Using SSE Transport

You can connect to a remote MCP server using Server-Sent Events (SSE). This is the default transport mechanism when a URL is provided.

**Parameters**

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true" data-desc="The URL of the remote MCP server."></x-field>
  <x-field data-name="transport" data-type="'sse' | 'streamableHttp'" data-default="'sse'" data-desc="Specifies the transport protocol. Defaults to 'sse'."></x-field>
  <x-field data-name="timeout" data-type="number" data-default="60000" data-desc="Request timeout in milliseconds."></x-field>
  <x-field data-name="maxReconnects" data-type="number" data-default="10" data-desc="The maximum number of automatic reconnection attempts if the connection is lost. Set to 0 to disable."></x-field>
  <x-field data-name="shouldReconnect" data-type="(error: Error) => boolean" data-desc="A function to determine if a reconnect should be attempted based on the error received. Defaults to true for all errors."></x-field>
  <x-field data-name="opts" data-type="SSEClientTransportOptions" data-desc="Additional options to pass to the underlying SSEClientTransport."></x-field>
</x-field-group>

**Example**

```typescript
import { MCPAgent } from "@aigne/core";

// Example of creating an MCPAgent with SSE transport
const agent = await MCPAgent.from({
  url: "http://example.com/mcp-server",
});

console.log("MCPAgent created from SSE server:", agent.name);
```

#### Using StreamableHTTP Transport

For servers that support it, you can use the `streamableHttp` transport, which can offer performance benefits.

**Example**

```typescript
import { MCPAgent } from "@aigne/core";

// Example of creating an MCPAgent with StreamableHTTP transport
const agent = await MCPAgent.from({
  url: "http://example.com/mcp-server",
  transport: "streamableHttp",
});

console.log("MCPAgent created from StreamableHTTP server:", agent.name);
```

#### Using Stdio Transport

To connect to a local MCP server that communicates over standard input/output (stdio), you can specify the command to execute.

**Parameters**

<x-field-group>
    <x-field data-name="command" data-type="string" data-required="true" data-desc="The command to execute to start the MCP server process."></x-field>
    <x-field data-name="args" data-type="string[]" data-desc="An array of string arguments to pass to the command."></x-field>
    <x-field data-name="env" data-type="Record<string, string>" data-desc="Environment variables to set for the process."></x-field>
</x-field-group>

**Example**

```typescript
import { MCPAgent } from "@aigne/core";

// Example of creating an MCPAgent with Stdio transport
const agent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});

console.log("MCPAgent created from stdio server:", agent.name);
```

### 2. From a Pre-configured Client

If you have an existing MCP `Client` instance, you can pass it directly to the `MCPAgent` constructor. This is useful for scenarios where you need to manage the client's lifecycle or configuration separately.

**Parameters**

<x-field-group>
    <x-field data-name="client" data-type="Client" data-required="true" data-desc="A pre-configured MCP Client instance."></x-field>
    <x-field data-name="prompts" data-type="MCPPrompt[]" data-desc="An optional array of pre-defined MCP prompts."></x-field>
    <x-field data-name="resources" data-type="MCPResource[]" data-desc="An optional array of pre-defined MCP resources."></x-field>
</x-field-group>

**Example**

```typescript
import { MCPAgent } from "@aigne/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// Example of creating an MCPAgent with a direct client instance
const client = new Client({ name: "MyClient", version: "1.0.0" });
await client.connect(new SSEClientTransport(new URL("http://example.com/mcp-server")));

const agent = new MCPAgent({
  name: "MyDirectAgent",
  client,
});

console.log("MCPAgent created from direct client:", agent.name);
```

## Properties

An `MCPAgent` instance provides access to the server's capabilities through several properties.

### `client`

The underlying `Client` instance used for all communication with the MCP server.

<x-field data-name="client" data-type="Client" data-desc="The MCP client instance."></x-field>

### `skills`

The tools exposed by the MCP server are automatically discovered and made available as an array of `Agent` instances in the `skills` property. You can access skills by their index or by their name.

<x-field data-name="skills" data-type="Agent[]" data-desc="An array of invokable skills discovered from the server."></x-field>

**Example: Accessing Skills**

```typescript
// List all available skill names
const skillNames = agent.skills.map(skill => skill.name);
console.log("Available skills:", skillNames);

// Access a specific skill by its name
const getTickerSkill = agent.skills["get-ticker"];
if (getTickerSkill) {
  console.log("Found skill:", getTickerSkill.description);
}
```

### `prompts`

Prompts available from the server can be accessed via the `prompts` array.

<x-field data-name="prompts" data-type="MCPPrompt[]" data-desc="Array of MCP prompts available from the server."></x-field>

**Example: Accessing Prompts**

```typescript
// Access a prompt by name
const examplePrompt = agent.prompts['example-prompt'];

if (examplePrompt) {
    const result = await examplePrompt.invoke({
        variable1: "value1"
    });
    console.log(result.content);
}
```

### `resources`

Resources, including resource templates, are available in the `resources` array.

<x-field data-name="resources" data-type="MCPResource[]" data-desc="Array of MCP resources available from the server."></x-field>

**Example: Accessing Resources**

```typescript
// Access a resource by name
const userDataResource = agent.resources['user-data'];

if (userDataResource) {
    const result = await userDataResource.invoke({
        userId: "123"
    });
    console.log(result.content);
}
```

## Methods

### `shutdown()`

This method cleanly shuts down the agent by closing its connection to the MCP server. It's crucial to call this method to release resources when you are finished with the agent.

**Example: Shutting Down an Agent**

```typescript
// It's recommended to use a finally block to ensure shutdown is called
try {
  // Use the agent...
  const ticker = await agent.skills['get-ticker'].invoke({
    exchange: "coinbase",
    symbol: "BTC/USD",
  });
  console.log(ticker);
} finally {
  await agent.shutdown();
  console.log("Agent has been shut down.");
}
```

The `MCPAgent` also supports the `Symbol.asyncDispose` method, allowing you to use it with the `using` statement for automatic resource management.

**Example: Using `await using` for Automatic Shutdown**

```typescript
import { MCPAgent } from "@aigne/core";

async function main() {
    await using agent = await MCPAgent.from({
        url: "http://example.com/mcp-server",
    });
    
    // The agent will be automatically shut down at the end of this block
    const skills = agent.skills.map(s => s.name);
    console.log("Available skills:", skills);
}

main();
```