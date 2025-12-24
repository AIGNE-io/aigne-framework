# Serve MCP Command

Serves the agents in the specified directory as a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server.

## Usage

```bash
aigne serve-mcp [options]
```

## Options

| Option | Description | Default |
| :--- | :--- | :--- |
| `--path` | Path to the agents directory or URL to an AIGNE project. | `.` |
| `--host` | Host to run the MCP server on. Use `0.0.0.0` to expose publicly. | `localhost` |
| `--port` | Port to run the MCP server on. | `3000` (or env `PORT`) |
| `--pathname` | Pathname to the service. | `/mcp` |
| `--aigne-hub-url` | Custom AIGNE Hub service URL. | |

## Description

The `serve-mcp` command enables your agents to communicate with other MCP-compliant tools and interfaces. It starts an HTTP server that exposes your agents via the MCP protocol.

## Examples

Start MCP server on default port (3000):
```bash
aigne serve-mcp
```

Start on a specific port:
```bash
aigne serve-mcp --port 8080
```

Serve a specific project path:
```bash
aigne serve-mcp --path ./my-agents
```

---
**Related:** [Run Command](/commands/run.md)
