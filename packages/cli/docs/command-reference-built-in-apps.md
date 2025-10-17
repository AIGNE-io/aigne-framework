---
labels: ["Reference"]
---

# Built-in Apps

AIGNE CLI comes with pre-packaged applications that offer specialized, out-of-the-box functionality. These apps are complete AIGNE projects that you can execute directly, without needing to initialize a local project first.

When you invoke a built-in app for the first time, the CLI automatically fetches its package from the npm registry, installs it into a local cache (`~/.aigne/`), and then runs it. Subsequent runs use the cached version for faster startup, with periodic checks for new updates to ensure you have the latest features.

## Available Apps

Here are the currently available built-in applications:

| Command | Aliases | Description |
|---|---|---|
| `doc` | `docsmith` | Generate and maintain project docs — powered by agents. |
| `web` | `websmith` | Generate and maintain project website pages — powered by agents. |

## Doc Smith (`aigne doc`)

Doc Smith is a powerful application designed to automate the generation and maintenance of project documentation using AI agents.

### Usage

You can interact with Doc Smith using the `aigne doc` command. The agents defined within the Doc Smith application are available as subcommands.

For example, to generate documentation for your current project, you would run its `generate` agent:

```bash title="Generate project documentation" icon=lucide:terminal
# Run the 'generate' agent to create or update docs
aigne doc generate
```

## Web Smith (`aigne web`)

Web Smith is an application focused on generating and maintaining web pages for your project, such as landing pages, feature showcases, or blogs.

### Usage

Similar to Doc Smith, you use the `aigne web` command followed by the name of an agent within the Web Smith application.

For example, to generate a new web page:

```bash title="Generate a new web page" icon=lucide:terminal
# Run an agent to create a new page
aigne web generate
```

## Common Commands

Since built-in apps are full AIGNE projects, they support standard commands that you can apply to them directly.

### Upgrade

To ensure you have the latest version of an application, you can run the `upgrade` command. This will check for a newer version on npm and install it if available.

```bash title="Upgrade Doc Smith" icon=lucide:terminal
aigne doc upgrade
```

### Serve as MCP Server

You can expose an application's agents as a standard Model Context Protocol (MCP) service, allowing other systems to interact with them over HTTP.

```bash title="Serve Doc Smith agents" icon=lucide:terminal
aigne doc serve-mcp
```

For a full list of server options, see the [`aigne serve-mcp`](./command-reference-serve-mcp.md) command reference.
