# Run Command

Runs an AIGNE agent locally, supporting interactive chat and multi-agent execution.

## Usage

```bash
aigne run [path] [entry-agent] [options]
```

## Arguments

- `[path]`: Path to the agents directory or URL to an AIGNE project. Defaults to `.` (current directory).
- `[entry-agent]`: Name of the specific agent to run. If not specified, defaults to the first configured agent.

## Options

| Option | Alias | Description | Default |
| :--- | :--- | :--- | :--- |
| `--chat` | | Run the chat loop in the terminal. | `false` |
| `--model` | | Specify the AI model (e.g., `openai:gpt-4`). | |
| `--cache-dir` | | Directory to download packages to (for URL mode). | |
| `--verbose` | | Enable verbose logging. | |
| `--version` | `-v` | Show version number. | |

## Examples

Run agents in the current directory:
```bash
aigne run
```

Run in interactive chat mode:
```bash
aigne run --chat
```

Run a specific agent named "translator":
```bash
aigne run --entry-agent translator
```

Run a remote project:
```bash
aigne run --url https://example.com/aigne-project
```

---
**Related:** [Test Command](/commands/test.md) | [Serve MCP](/commands/serve-mcp.md)
