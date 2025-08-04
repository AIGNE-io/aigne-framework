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

```bash
OPENAI_API_KEY="" # Set your OpenAI API key here

# Start the MCP server
npx -y @aigne/example-mcp-server serve-mcp --port 3456

# Output
# Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
# MCP server is running on http://localhost:3456/mcp
```

This command will start the MCP server with the agents defined in this example

### Using Different Models

You can use different AI models by setting the `MODEL` environment variable along with the corresponding API key. The framework supports multiple providers:

* **OpenAI**: `MODEL="openai:gpt-4.1"` with `OPENAI_API_KEY`
* **Anthropic**: `MODEL="anthropic:claude-3-7-sonnet-latest"` with `ANTHROPIC_API_KEY`
* **Google Gemini**: `MODEL="gemini:gemini-2.0-flash"` with `GEMINI_API_KEY`
* **AWS Bedrock**: `MODEL="bedrock:us.amazon.nova-premier-v1:0"` with AWS credentials
* **DeepSeek**: `MODEL="deepseek:deepseek-chat"` with `DEEPSEEK_API_KEY`
* **OpenRouter**: `MODEL="openrouter:openai/gpt-4o"` with `OPEN_ROUTER_API_KEY`
* **xAI**: `MODEL="xai:grok-2-latest"` with `XAI_API_KEY`
* **Ollama**: `MODEL="ollama:llama3.2"` with `OLLAMA_DEFAULT_BASE_URL`

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
