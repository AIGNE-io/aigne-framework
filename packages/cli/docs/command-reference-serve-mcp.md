---
labels: ["Reference"]
---

# aigne serve-mcp

The `aigne serve-mcp` command launches a local HTTP server to expose your AIGNE agents as services compliant with the Model Context Protocol (MCP). This enables seamless integration with external systems, allowing them to invoke your agents as standardized tools.

This command is essential for deploying agents in a service-oriented architecture, where other applications can consume their capabilities over the network.

## How It Works

When you run `aigne serve-mcp`, the CLI performs the following actions:

1.  It loads the AIGNE project configuration from the specified path.
2.  It identifies the agents designated for MCP exposure (typically defined in your `aigne.yaml` file).
3.  It starts an Express.js web server that listens for HTTP requests.
4.  Each designated agent is registered as a "tool" within the MCP server instance.
5.  The server listens for `POST` requests at the configured endpoint (e.g., `/mcp`). When a valid MCP request to use a tool is received, the server invokes the corresponding agent, passes the input, and streams the agent's output back to the client in the MCP format.

Here is a diagram illustrating the request flow:

```mermaid
sequenceDiagram
    participant Client as External System
    participant Server as MCP Server (aigne serve-mcp)
    participant AIGNE as AIGNE Engine
    participant Agent as Target Agent

    Client->>+Server: POST /mcp (MCP request with tool_use)
    Server->>+AIGNE: invoke(agent, input)
    AIGNE->>+Agent: Executes with input
    Agent-->>-AIGNE: Returns result
    AIGNE-->>-Server: Provides result
    Server-->>-Client: Streams MCP response (tool_result)
```

## Usage

```bash
aigne serve-mcp [options]
```

## Options

The following options are available for the `serve-mcp` command:

| Option | Alias | Description | Type | Default |
| --- | --- | --- | --- | --- |
| `--path` | `--url` | Path to the agents directory or a URL to an AIGNE project. | `string` | `.` |
| `--host` | | Host to run the MCP server on. Use `0.0.0.0` to expose the server publicly. | `string` | `localhost` |
| `--port` | | Port to run the MCP server on. If not specified, it uses the `PORT` environment variable or defaults to 3000. | `number` | `3000` |
| `--pathname` | | The URL pathname for the MCP service endpoint. | `string` | `/mcp` |
| `--aigne-hub-url` | | Custom AIGNE Hub service URL. Used for fetching remote agent definitions or models. | `string` | `undefined` |

## Examples

### Start a Server in the Current Directory

To serve the agents defined in the current project directory on the default port (3000), run the command without any options:

```bash
aigne serve-mcp
```

Upon successful startup, you will see a confirmation message:

```
MCP server is running on http://localhost:3000/mcp
```

### Run on a Specific Port and Path

You can specify a different directory for your agents and a custom port using the `--path` and `--port` options.

```bash
aigne serve-mcp --path ./path/to/agents --port 8080
```

This command starts the server for the project located in `./path/to/agents` on port 8080.

```
MCP server is running on http://localhost:8080/mcp
```

### Expose the Server Publicly

To make your MCP server accessible from other machines on your network, set the host to `0.0.0.0`.

```bash
aigne serve-mcp --host 0.0.0.0 --port 3001
```

Now, the server is accessible via your machine's network IP address on port 3001.

```
MCP server is running on http://0.0.0.0:3001/mcp
```

### Serve on a Custom Pathname

To change the service endpoint from `/mcp` to something else, like `/api/agents`, use the `--pathname` option.

```bash
aigne serve-mcp --pathname /api/agents
```

The server will now be listening for requests at the new endpoint.

```
MCP server is running on http://localhost:3000/api/agents
```

## Interacting with the Server

Once the server is running, you can interact with it by sending `POST` requests to the specified endpoint. The body of the request must be a JSON-RPC 2.0 object compliant with the Model Context Protocol.

For example, if you have an agent named `getWeather` that accepts a `city` as input, you can invoke it using `curl`:

```bash
curl -X POST http://localhost:3000/mcp \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "method": "tool_use",
  "params": {
    "name": "getWeather",
    "input": {
      "city": "San Francisco"
    }
  },
  "id": "req-123"
}'
```

The server will stream back the response, which will conclude with a result payload, such as:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "The weather in San Francisco is sunny with a high of 70°F."
      }
    ]
  },
  "id": "req-123"
}
```

This makes it straightforward to integrate your AIGNE agents with any application capable of making HTTP requests.

---

The `serve-mcp` command is a key component for integrating your AIGNE agents into larger applications and services. To learn more about configuring which agents are exposed, see the [Project Configuration (aigne.yaml)](./core-concepts-project-configuration.md) guide.