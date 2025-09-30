# MCP Agent

The `MCPAgent` is a specialized agent that acts as a client to connect with other AI agents and services that follow the Model Context Protocol (MCP). Think of it as a bridge that allows your AIGNE application to communicate with and use the capabilities of external agents, whether they're running on a remote server or as a separate program on your local machine.

Unlike other agents that perform tasks directly, the `MCPAgent`'s primary role is to expose the functionality of a remote agent—such as its tools (skills), prompts, and resources—making them accessible within your project as if they were native components. The `MCPAgent` itself is not invokable; you interact with the skills and resources it imports.

Key features include:
- **Interoperability**: Connects to any MCP-compliant AI service.
- **Multiple Transports**: Supports connections over the web (HTTP/SSE) and to local command-line applications (stdio).
- **Automatic Discovery**: Automatically identifies and integrates the remote agent's skills, prompts, and resources.
- **Resilient Connection**: Includes automatic reconnection logic to handle temporary network issues.

## Creating an MCPAgent

You can create an `MCPAgent` instance using the static `MCPAgent.from()` method. The method accepts different options depending on how you want to connect to the remote agent.

### Connecting to a Web Server (HTTP/SSE)

Use this method to connect to an agent that is accessible via a URL. This is common for services hosted on the web or your local network. It supports both Server-Sent Events (SSE) and a streamable HTTP transport.

**Parameters**

<x-field-group>
  <x-field data-name="url" data-type="string" data-required="true" data-desc="The URL of the MCP server."></x-field>
  <x-field data-name="transport" data-type="'sse' | 'streamableHttp'" data-default="sse" data-required="false">
    <x-field-desc markdown>Specifies the transport protocol. Use `'sse'` for Server-Sent Events or `'streamableHttp'` for streamable HTTP.</x-field-desc>
  </x-field>
  <x-field data-name="maxReconnects" data-type="number" data-default="10" data-required="false" data-desc="The maximum number of times to attempt reconnection if the connection is lost. Set to 0 to disable."></x-field>
  <x-field data-name="timeout" data-type="number" data-default="60000" data-required="false" data-desc="Request timeout in milliseconds."></x-field>
</x-field-group>

**Example**

```javascript Connecting to an SSE Server icon=logos:javascript
import { MCPAgent } from "@aigne/core";

// Create an MCPAgent using an SSE server connection
const mcpAgent = await MCPAgent.from({
  url: `http://localhost:8080/sse`,
  transport: "sse",
});

console.log('Connected to:', mcpAgent.name); // Output: "example-server"

// The agent is automatically cleaned up when it goes out of scope
await using agent = mcpAgent;
```

### Connecting to a Local Program (Stdio)

This method allows you to connect to an agent that runs as a command-line application on the same machine. AIGNE will start the process and communicate with it over its standard input/output (stdio).

**Parameters**

<x-field-group>
  <x-field data-name="command" data-type="string" data-required="true" data-desc="The command to execute to start the agent process (e.g., 'bun', 'node')."></x-field>
  <x-field data-name="args" data-type="string[]" data-required="false" data-desc="An array of command-line arguments to pass to the script."></x-field>
  <x-field data-name="env" data-type="Record<string, string>" data-required="false" data-desc="Additional environment variables for the subprocess."></x-field>
</x-field-group>

**Example**

```javascript Connecting to a Local Script icon=logos:javascript
import { MCPAgent } from "@aigne/core";
import { join } from "node:path";

// Create an MCPAgent from a command-line server
const mcpAgent = await MCPAgent.from({
  command: "bun",
  args: [join(import.meta.dir, "./mock-mcp-server.ts")],
});

console.log('Connected to:', mcpAgent.name); // Output: "example-server"

// Clean up the agent connection
await mcpAgent.shutdown();
```

### Using a Pre-configured Client

For advanced use cases, you can instantiate an MCP `Client` yourself and pass it directly to the `MCPAgent`. This gives you full control over the client's configuration.

**Example**

```javascript Using a Client Instance icon=logos:javascript
import { MCPAgent } from "@aigne/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join } from "node:path";

// Create and configure the client manually
const client = new Client({ name: "test-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: "bun",
  args: [join(import.meta.dir, "./mock-mcp-server.ts")],
});
await client.connect(transport);

// Create an MCPAgent from the existing client instance
await using mcpAgent = MCPAgent.from({
  name: client.getServerVersion()?.name,
  client,
});

console.log('Connected to:', mcpAgent.name); // Output: "example-server"
```

## Accessing Remote Capabilities

Once connected, the `MCPAgent` populates its `skills`, `prompts`, and `resources` properties based on what the remote agent offers.

### Accessing Skills

Remote tools are exposed as skills. You can access them by name from the `skills` property and invoke them.

```javascript Invoking a Remote Skill icon=logos:javascript
// Assuming mcpAgent is an initialized MCPAgent instance
const echoSkill = mcpAgent.skills.echo;

if (echoSkill) {
  const result = await echoSkill.invoke({ message: "Hello, MCP!" });
  console.log(result);
  // Output:
  // {
  //   content: [ { type: 'text', text: 'Tool echo: Hello, MCP!' } ]
  // }
}
```

### Accessing Prompts

Remote prompts are available on the `prompts` property and can be invoked to get a set of messages based on a template.

```javascript Accessing a Remote Prompt icon=logos:javascript
// Assuming mcpAgent is an initialized MCPAgent instance
const echoPrompt = mcpAgent.prompts.echo;

if (echoPrompt) {
  const result = await echoPrompt.invoke({ message: "Hello, Prompt!" });
  console.log(result);
  // Output:
  // {
  //   messages: [
  //     { role: 'user', content: { type: 'text', text: 'Please process this message: Hello, Prompt!' } }
  //   ]
  // }
}
```

### Accessing Resources

Remote resources can be read via the `resources` property.

```javascript Reading a Remote Resource icon=logos:javascript
// Assuming mcpAgent is an initialized MCPAgent instance
const echoResource = mcpAgent.resources.echo;

if (echoResource) {
  const result = await echoResource.invoke({ message: "Hello, Resource!" });
  console.log(result);
  // Output:
  // {
  //   contents: [
  //     { uri: 'echo://Hello, Resource!', text: 'Resource echo: Hello, Resource!' }
  //   ]
  // }
}
```

## Shutting Down the Connection

It's important to properly close the connection to the MCP server to release resources. You can do this manually or by using the `await using` syntax for automatic cleanup.

### Manual Shutdown

You can explicitly call the `shutdown()` method on the agent instance.

```javascript Manual Shutdown icon=logos:javascript
import { MCPAgent } from "@aigne/core";

const mcpAgent = await MCPAgent.from({
  url: `http://localhost:8080/mcp`,
  transport: "streamableHttp",
});

// ... use the agent

// Manually close the connection
await mcpAgent.shutdown();
console.log("Connection closed.");
```

### Automatic Shutdown with `await using`

The `MCPAgent` is compatible with the [Explicit Resource Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using) feature in modern JavaScript. This automatically calls the shutdown logic when the variable goes out of scope.

```javascript Automatic Shutdown icon=logos:javascript
import { MCPAgent } from "@aigne/core";

async function connectAndUseAgent() {
  // The connection will be automatically shut down at the end of this function
  await using mcpAgent = await MCPAgent.from({
    url: `http://localhost:8080/mcp`,
    transport: "streamableHttp",
  });

  console.log(`Using agent: ${mcpAgent.name}`);
  // ... interact with mcpAgent.skills, .prompts, etc.
}

await connectAndUseAgent();
console.log("Agent has been shut down.");
```