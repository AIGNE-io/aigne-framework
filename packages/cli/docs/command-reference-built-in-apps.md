---
labels: ["Reference"]
---

# Built-in Apps

Built-in applications are pre-packaged AIGNE projects designed for specialized tasks. They can be invoked directly from the CLI without requiring a local `aigne.yaml` file. The CLI automatically downloads, caches, and manages these applications from the npm registry, making agent-driven tools readily accessible.

## Available Apps

Currently, the following built-in application is available:

| Command | Aliases | Description |
|---|---|---|
| `doc-smith` | `docsmith`, `doc` | Generate and maintain project docs — powered by agents. |

## Usage

To use a built-in app, you follow the pattern `aigne [app-name] [subcommand] [options]`. Each app functions as a self-contained AIGNE project, exposing its defined agents as subcommands and including standard commands for management.

### App-Specific Agents

The core functionality of an app is provided through its agents, which are exposed as subcommands. To see a list of available agents and their options, run the app command with the `--help` flag.

```bash
# Get help and see available agents for doc-smith
aigne doc-smith --help
```

To run a specific agent, append its name after the app name. For example, to use the `generate` agent within `doc-smith`:

```bash
# Run the 'generate' agent from the doc-smith app
aigne doc generate
```

Many apps also define a default agent that runs when no subcommand is specified. You can run this agent using the app's name or any of its aliases.

```bash
# Run the default agent for doc-smith
aigne doc-smith

# You can also use an alias
aigne doc
```

### Common Management Commands

Built-in apps also come with standard subcommands for updates and serving.

#### `upgrade`

This command checks for and installs the latest version of the application from the npm registry.

```bash
aigne doc-smith upgrade
```

#### `serve-mcp`

This command exposes the app's agents through a Model Context Protocol (MCP) server, allowing integration with other systems. For more details, see the [`aigne serve-mcp`](./command-reference-serve-mcp.md) command reference.

```bash
# Serve the doc-smith agents on the default host and port
aigne doc-smith serve-mcp
```

![Running an MCP server for a built-in app](../assets/run-mcp-service.png)

## Execution and Caching Flow

When you run a built-in app for the first time, the CLI downloads it from the npm registry (e.g., `@aigne/doc-smith`) and caches it locally in `~/.aigne/registry.npmjs.org/`. Subsequent runs use the cached version. The cache is checked for updates once every 24 hours.

```d2
direction: down

start: {
  label: "User runs 'aigne doc-smith'"
  shape: oval
}

check_cache: {
  label: "Is app cached and\nrecent (< 24h)?"
  shape: diamond
}

load_from_cache: {
  label: "Load app from local cache"
  shape: rectangle
}

install_flow: {
  label: "Download and Install"
  shape: package

  fetch_metadata: { label: "Fetch '@aigne/doc-smith' metadata" }
  download: { label: "Download and extract package" }
  install_deps: { label: "Install dependencies" }

  fetch_metadata -> download -> install_deps
}

execute: {
  label: "Execute agent command"
  shape: oval
}

start -> check_cache
check_cache -> load_from_cache: "Yes"
check_cache -> install_flow: "No"
install_flow -> load_from_cache
load_from_cache -> execute
```

This process ensures that you are always using a functional and up-to-date version of the application with minimal overhead.