---
labels: ["Reference"]
---

# aigne serve-mcp

Serves the agents in an AIGNE project as a Model Context Protocol (MCP) server. This command exposes your agents over a streamable HTTP endpoint, enabling seamless integration with external systems and applications that support the MCP standard.

Internally, `aigne serve-mcp` starts a lightweight Express server. When a POST request is received on the configured endpoint, it invokes the corresponding agent and streams the response back according to the MCP specification.

![Running the MCP Service](../assets/run-mcp-service.png)

## Usage

```bash Basic Usage icon=lucide:terminal
aigne serve-mcp [options]
```

## Options

The `serve-mcp` command accepts the following options to customize the server's behavior:

<x-field data-name="--path, --url" data-type="string" data-default="." data-desc="Path to the local agents directory or a URL to a remote AIGNE project."></x-field>

<x-field data-name="--host" data-type="string" data-default="localhost" data-desc="Host to run the MCP server on. Use `0.0.0.0` to expose the server publicly to the network."></x-field>

<x-field data-name="--port" data-type="number" data-default="3000" data-desc="Port for the MCP server. The command respects the `PORT` environment variable if set; otherwise, it defaults to 3000."></x-field>

<x-field data-name="--pathname" data-type="string" data-default="/mcp" data-desc="The URL path for the MCP service endpoint."></x-field>

<x-field data-name="--aigne-hub-url" data-type="string" data-desc="A custom AIGNE Hub service URL, used for fetching remote agent definitions or models."></x-field>

## Examples

### Start a Server for a Local Project

To serve agents from the current directory, run the command without any options. The server will start on the default host and port.

```bash Start Server in Current Directory icon=lucide:play-circle
aigne serve-mcp
```

**Expected Output:**

```text Console Output icon=lucide:server
MCP server is running on http://localhost:3000/mcp
```

### Serve Agents on a Specific Port and Path

You can specify a different port and provide an explicit path to your AIGNE project directory.

```bash Start Server with Custom Port and Path icon=lucide:play-circle
aigne serve-mcp --path ./my-ai-project --port 8080
```

**Expected Output:**

```text Console Output icon=lucide:server
MCP server is running on http://localhost:8080/mcp
```

### Expose the Server to the Network

To make your MCP server accessible from other machines on your network, set the host to `0.0.0.0`.

```bash Expose Server Publicly icon=lucide:play-circle
aigne serve-mcp --host 0.0.0.0
```

**Expected Output:**

```text Console Output icon=lucide:server
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