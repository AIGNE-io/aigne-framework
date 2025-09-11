---
labels: ["Reference"]
---

# Built-in Apps

AIGNE CLI comes with pre-packaged applications that offer specialized, out-of-the-box functionality. These apps are complete AIGNE projects that you can execute directly, without needing to initialize a local project first.

When you invoke a built-in app for the first time, the CLI automatically fetches its package from the npm registry, installs it into a local cache (`~/.aigne/`), and then executes the requested agent. Subsequent runs use the cached version for faster startup, with periodic checks for new updates.

## Doc Smith (`aigne doc`)

Doc Smith is a powerful built-in application designed to generate and maintain project documentation, powered by AI agents.

**Aliases**: `doc`, `docsmith`

### Usage

You can interact with Doc Smith using the `aigne doc` command. The agents defined within the Doc Smith application are available as subcommands.

For example, to generate documentation for your current project, you would run the `generate` agent:

```bash title="Generate project documentation" icon=lucide:terminal
# Run the 'generate' agent to create or update docs
aigne doc generate
```

### Common Commands

Since built-in apps are full AIGNE projects, they support standard commands like `upgrade` and `serve-mcp`.

#### Upgrade

To ensure you have the latest version of Doc Smith, you can run the `upgrade` command. This will check for a newer version on npm and install it if available.

```bash title="Upgrade Doc Smith" icon=lucide:terminal
aigne doc upgrade
```

#### Serve as MCP Server

You can expose Doc Smith's agents as a standard Model Context Protocol (MCP) service, allowing other applications to interact with them over HTTP.

```bash title="Serve Doc Smith agents" icon=lucide:terminal
aigne doc serve-mcp --port 8080
```

For more details on the server options, see the [`aigne serve-mcp`](./command-reference-serve-mcp.md) command reference.