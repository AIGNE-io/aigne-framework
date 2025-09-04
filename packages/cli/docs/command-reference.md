---
labels: ["Reference"]
---

# Command Reference

This section provides a detailed reference for all `@aigne/cli` commands. The CLI is your primary tool for creating, running, testing, and managing AIGNE projects. Each command is documented on its own page with comprehensive examples and parameter descriptions.

## Command Overview

The `aigne` command-line tool is organized into several subcommands, each responsible for a specific stage of the agent development lifecycle.

```d2
direction: down

"aigne": {
  shape: hexagon
  style.fill: "#fce7c6"
}

"Commands": {
  grid-columns: 4
  "create": "Scaffolds a new project"
  "run": "Executes an agent"
  "test": "Runs automated tests"
  "serve-mcp": "Serves agents as an MCP server"
  "observe": "Starts observability server"
  "hub": "Manages AIGNE Hub connection"
  "deploy": "Deploys application as a Blocklet"
  "app": "Executes built-in apps"
}

"aigne" -> "Commands"
```

Here is a summary of the primary commands. Select a command to view its detailed documentation, including all available options and usage examples.

| Command                                                   | Description                                                                                                   | Preview |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------- |
| [`aigne create`](./command-reference-create.md)               | Scaffolds a new AIGNE project from a template.                                                                | ![Creating a project with the default template](../assets/create/create-project-using-default-template-success-message.png) |
| [`aigne run`](./command-reference-run.md)                     | Executes an agent locally or from a remote URL, with options for chat mode, model selection, and input handling. | ![Running a project in chat mode](../assets/run/run-default-template-project-in-chat-mode.png) |
| [`aigne serve-mcp`](./command-reference-serve-mcp.md)         | Serves agents as a Model Context Protocol (MCP) server for integration with external systems.                 | ![Running the MCP server](../assets/run-mcp-service.png) |
| [`aigne hub`](./command-reference-hub.md)                     | Manages connections to the AIGNE Hub, allowing you to switch accounts, check status, and use Hub-provided models. |         |
| [`aigne observe`](./command-reference-observe.md)             | Starts a local server to view and analyze agent execution traces and observability data.                      | ![Viewing call details in the observability UI](../assets/observe/observe-view-call-details.png) |
| [`aigne test`](./command-reference-test.md)                   | Runs automated tests for your agents and skills.                                                              |         |
| [`aigne deploy`](./command-reference-deploy.md)               | Deploys an AIGNE application as a Blocklet to a specified endpoint.                                           |         |
| [`aigne app`](./command-reference-built-in-apps.md)           | Execute pre-packaged applications like `doc-smith` for specialized, out-of-the-box agent functionality.       |         |

## Global Options

These options can be used with any command:

| Option      | Alias | Description                                  |
| ----------- | ----- | -------------------------------------------- |
| `--help`    | `-h`  | Display help information for a command.      |
| `--version` | `-v`  | Display the current version of `@aigne/cli`. |

---

For practical, task-oriented examples of how to combine these commands in your development workflow, please see the [Guides](./guides.md) section.