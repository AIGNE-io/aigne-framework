# Observe Command

Starts the observability server to monitor agent activities and performance.

## Usage

```bash
aigne observe [options]
```

## Options

| Option | Description | Default |
| :--- | :--- | :--- |
| `--host` | Host to run the observability server on. | `localhost` |
| `--port` | Port to run the observability server on. | `7890` (or env `PORT`) |

## Description

The `observe` command launches a local server that provides a dashboard or API for inspecting the runtime behavior of your agents, including traces, logs, and performance metrics.

## Examples

Start observability server on default port (7890):
```bash
aigne observe
```

Start on a specific port:
```bash
aigne observe --port 3001
```

---
**Related:** [Serve MCP](/commands/serve-mcp.md)
