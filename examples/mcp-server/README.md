# MCP Server Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to use the [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md) to run agents from the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) as an [MCP (Model Context Protocol) Server](https://modelcontextprotocol.io). The MCP server can be consumed by Claude Desktop, Claude Code, or other clients that support the MCP protocol.

## What is MCP?

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that enables AI assistants to securely connect to data sources and tools. By running AIGNE agents as MCP servers, you can extend the capabilities of MCP-compatible clients with custom agents and their skills.

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services

## Quick Start (No Installation Required)

### Run the Example

```bash
# Start the MCP server
npx -y @aigne/example-mcp-server serve-mcp --port 3456

# Output
# Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
# MCP server is running on http://localhost:3456/mcp
```

This command will start the MCP server with the agents defined in this example

### Connect to an AI Model

As an example, running `npx -y @aigne/example-mcp-server serve-mcp --port 3456` requires an AI model. If this is your first run, you need to connect one.

![run example](./run-example.png)

- Connect via the official AIGNE Hub

Choose the first option and your browser will open the official AIGNE Hub page. Follow the prompts to complete the connection. If you're a new user, the system automatically grants 400,000 tokens for you to use.

![connect to official aigne hub](../images/connect-to-aigne-hub.png)

- Connect via a self-hosted AIGNE Hub

Choose the second option, enter the URL of your self-hosted AIGNE Hub, and follow the prompts to complete the connection. If you need to set up a self-hosted AIGNE Hub, visit the App Store to install and deploy it: [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes).

![connect to self hosted aigne hub](../images/connect-to-self-hosted-aigne-hub.png)

- Connect via a third-party model provider

Using OpenAI as an example, you can configure the provider's API key via environment variables. After configuration, run the example again:

```bash
export OPENAI_API_KEY="" # Set your OpenAI API key here
```
For more details on third-party model configuration (e.g., OpenAI, DeepSeek, Google Gemini), see [.env.local.example](./.env.local.example).

After configuration, run the example again.

### Debugging

The `aigne observe` command starts a local web server to monitor and analyze agent execution data. It provides a user-friendly interface to inspect traces, view detailed call information, and understand your agent’s behavior during runtime. This tool is essential for debugging, performance tuning, and gaining insight into how your agent processes information and interacts with tools and models.

Start the observation server.

![aigne-observe-execute](../images/aigne-observe-execute.png)

View a list of recent executions.

![aigne-observe-list](../images/aigne-observe-list.png)

## Available Agents

This example includes several agents that will be exposed as MCP tools:

* **Current Time Agent** (`agents/current-time.js`) - Provides current time information
* **Poet Agent** (`agents/poet.yaml`) - Generates poetry and creative content
* **System Info Agent** (`agents/system-info.js`) - Provides system information

## Connecting to MCP Clients

### Claude Code

**Ensure you have [Claude Code](https://claude.ai/code) installed.**

You can add the MCP server as follows:

```bash
claude mcp add -t http test http://localhost:3456/mcp
```

Usage: invoke the system info agent from Claude Code:

![System Info](https://www.arcblock.io/image-bin/uploads/4824b6bf01f393a064fb36ca91feefcc.gif)

Usage: invoke the poet agent from Claude Code:

![Poet Agent](https://www.arcblock.io/image-bin/uploads/d4b49b880c246f55e0809cdc712a5bdb.gif)

## Observe Agents

As the MCP server runs, you can observe the agents' interactions and performance metrics using the AIGNE observability tools. You can run the observability server with:

```bash
npx aigne observe --port 7890
```

Open your browser and navigate to `http://localhost:7890` to view the observability dashboard. This will allow you to monitor the agents' performance, interactions, and other metrics in real-time.

![Poem Trace](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)
