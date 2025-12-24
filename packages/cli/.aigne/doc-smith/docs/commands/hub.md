# Hub Command

Manages connections to the AIGNE Hub, allowing you to switch between official and custom hubs, and view your connection status.

## Usage

```bash
aigne hub <command>
```

## Subcommands

| Command | Alias | Description |
| :--- | :--- | :--- |
| `list` | `ls` | List all connected AIGNE Hubs. |
| `connect [url]` | | Connect to an AIGNE Hub. |
| `use` | | Switch to a different AIGNE Hub. |
| `status` | `st` | Show details of a connected hub (user, credits, etc.). |
| `remove` | `rm` | Remove a connected hub. |

## Examples

Connect to the official hub (interactive):
```bash
aigne hub connect
```

List all connected hubs:
```bash
aigne hub list
```

Check your status (credits, DID):
```bash
aigne hub status
```

Switch to a different hub:
```bash
aigne hub use
```

---
**Related:** [Serve MCP](/commands/serve-mcp.md)
