---
labels: ["Reference"]
---

# aigne serve-mcp

Serves the agents in a specified AIGNE project as a Model Context Protocol (MCP) server. This command exposes your agents over a streamable HTTP endpoint, allowing for seamless integration with external systems and applications that support the MCP standard.

Internally, `aigne serve-mcp` starts a lightweight Express server that listens for POST requests on a configurable path. When a request is received, it invokes the corresponding agent and streams the response back according to the MCP specification.

![Running the MCP Service](../assets/run-mcp-service.png)

## Usage

```bash
aigne serve-mcp [options]
```

## Options

The `serve-mcp` command accepts the following options to customize the server's behavior:

| Option | Alias | Description | Type | Default |
| :--- | :--- | :--- | :--- | :--- |
| `--path` | `--url` | Path to the local agents directory or a URL to a remote AIGNE project. | `string` | `.` |
| `--host` | | Host to run the MCP server on. Use `0.0.0.0` to expose the server publicly. | `string` | `localhost` |
| `--port` | | Port for the MCP server. It respects the `PORT` environment variable, falling back to 3000 if unset. | `number` | `3000` |
| `--pathname` | | The URL path for the MCP service endpoint. | `string` | `/mcp` |
| `--aigne-hub-url` | | A custom AIGNE Hub service URL, used for fetching remote agent definitions or models. | `string` | | 

## Examples

### Start a Server for a Local Project

To serve agents from the current working directory, run the command without any options. The server will start on the default host and port.

```bash
aigne serve-mcp
```

**Expected Output:**

```text
MCP server is running on http://localhost:3000/mcp
```

### Serve Agents on a Specific Port and Path

You can specify a different port and provide an explicit path to your AIGNE project directory.

```bash
aigne serve-mcp --path ./my-ai-project --port 8080
```

**Expected Output:**

```text
MCP server is running on http://localhost:8080/mcp
```

### Expose the Server to the Network

To make your MCP server accessible from other machines on your network, set the host to `0.0.0.0`.

```bash
aigne serve-mcp --host 0.0.0.0
```

**Expected Output:**

```text
MCP server is running on http://0.0.0.0:3000/mcp
```

## Next Steps

After exposing your agents via the MCP server, you might want to deploy them for production use.

<x-cards>
  <x-card data-title="aigne deploy Command" data-icon="lucide:ship" data-href="/command-reference/deploy">
    Learn how to deploy your AIGNE application as a Blocklet.
  </x-card>
  <x-card data-title="Deploying Agents Guide" data-icon="lucide:book-open-check" data-href="/guides/deploying-agents">
    Follow a step-by-step tutorial for deploying your agents.
  </x-card>
</x-cards>