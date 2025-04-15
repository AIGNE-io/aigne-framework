# AIGNE CLI

**English** | [中文](cli.zh.md)

The AIGNE Command Line Interface (CLI) provides a set of tools to run and test your AIGNE agents from the command line.

## Installation

The CLI is included as part of the `@aigne/cli` package. You can install it globally:

```bash
npm install -g @aigne/cli
```

Or use it directly with npx:

```bash
npx @aigne/cli [command]
```

## Commands

The AIGNE CLI provides the following commands:

### Global Options

- `--version`: Display the CLI version
- `--help`: Display help information

### `aigne run`

Run a chat loop with a specified agent.

```bash
aigne run [path] [options]
```

#### Arguments

- `path`: Path to the agents directory (defaults to current directory `.`) or URL to a project from AIGNE Studio

#### Options

- `--agent <agent>`: Name of the agent to use (defaults to the first agent found)
- `--help`: Display help for the command

#### Examples

Run an agent in the current directory:

```bash
aigne run
```

Run an agent in a specific directory:

```bash
aigne run ./my-agents
```

Run a specific agent:

```bash
aigne run --agent myAgent
```

Run an agent from an AIGNE Studio project URL:

```bash
aigne run https://www.aigne.io/projects/xxx/xxx.tgz
```

### `aigne create`

Create a new AIGNE project with the required configuration files. The command will interactively prompt for a project name.

```bash
aigne create [path]
```

#### Arguments

- `path`: Optional path to create the project directory (will be used as default project name in prompt)

#### Options

- `--help`: Display help for the command

#### Examples

Create a new AIGNE project by following the interactive prompts:

```bash
aigne create
# You will be prompted to enter a project name
```

Create a new AIGNE project with a suggested name:

```bash
aigne create my-new-agent
# You will be prompted with "my-new-agent" as the default project name
```

### `aigne test`

Run tests in the specified agents directory.

```bash
aigne test [path]
```

#### Arguments

- `path`: Path to the agents directory (defaults to current directory `.`)

#### Options

- `--help`: Display help for the command

#### Examples

Run tests in the current directory:

```bash
aigne test
```

Run tests in a specific directory:

```bash
aigne test ./my-agents
```

### `aigne serve`

Serve the agents in the specified directory as a Model Context Protocol (MCP) server.

```bash
aigne serve [path] [options]
```

#### Arguments

- `path`: Path to the agents directory (defaults to current directory `.`)

#### Options

- `--mcp`: Serve the agents as a MCP server (required at this time)
- `--port <port>`: Port to run the MCP server on (defaults to 3000)
- `--help`: Display help for the command

#### Examples

Serve agents in the current directory as an MCP server on the default port:

```bash
aigne serve --mcp
```

Serve agents in a specific directory with a custom port:

```bash
aigne serve ./my-agents --mcp --port 8080
```

## Usage Examples

### Create and Run an Agent

1. Create a new AIGNE project:

```bash
aigne create my-agent
cd my-agent
```

This will create the directory with the necessary configuration files (`aigne.yaml` and `chat.yaml`).

2. Run the agent:

```bash
aigne run
```

### Run Tests for Your Agent

1. Create test files in your agent directory (must use Node.js test format)

2. Run the tests:

```bash
aigne test
```

## Environment Variables

The AIGNE CLI inherits any environment variables needed by your agents. Make sure to set the required environment variables before running the CLI.

## Additional Resources

For more information about developing agents, refer to the following resources:

- [Agent Development Guide](./agent-development.md): Guide to developing AIGNE agents using YAML/JS configuration files
- [AIGNE Framework Documentation](./cookbook.md): Official framework documentation
