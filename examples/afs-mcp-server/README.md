# AFS MCP Server Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to mount an [MCP (Model Context Protocol)](https://www.anthropic.com/news/model-context-protocol) server as an AFS module using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework). The example integrates the GitHub MCP Server, allowing AI agents to interact with GitHub repositories through the **Agentic File System (AFS)** interface.

**Agentic File System (AFS)** is a virtual file system abstraction that provides AI agents with unified access to various storage backends. For comprehensive documentation, see [AFS Documentation](../../afs/README.md).

## Overview

This example showcases the powerful integration between AIGNE and MCP servers by:
- Mounting the GitHub MCP Server as an AFS module at `/modules/github-mcp-server`
- Providing AI agents with GitHub capabilities through the AFS interface
- Demonstrating how to bridge external protocols (MCP) with AIGNE's unified file system

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* [Docker](https://www.docker.com/) installed and running
* A [GitHub Personal Access Token](https://github.com/settings/tokens) for GitHub API access
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

```bash
# Set your GitHub Personal Access Token
export GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here

# Set your OpenAI API key
export OPENAI_API_KEY=your_openai_api_key_here

# Run in interactive chat mode
npx -y @aigne/example-afs-mcp-server --chat

# Ask a specific question
npx -y @aigne/example-afs-mcp-server --input "What are the recent issues in the AIGNE repository?"
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/afs-mcp-server

pnpm install
```

### Setup Environment Variables

Setup your API keys in the `.env.local` file:

```bash
GITHUB_PERSONAL_ACCESS_TOKEN="" # Set your GitHub Personal Access Token here
OPENAI_API_KEY="" # Set your OpenAI API key here
```

#### Using Different Models

You can use different AI models by setting the `MODEL` environment variable along with the corresponding API key. The framework supports multiple providers:

* **OpenAI**: `MODEL="openai:gpt-4.1"` with `OPENAI_API_KEY`
* **Anthropic**: `MODEL="anthropic:claude-3-7-sonnet-latest"` with `ANTHROPIC_API_KEY`
* **Google Gemini**: `MODEL="gemini:gemini-2.0-flash"` with `GEMINI_API_KEY`
* **AWS Bedrock**: `MODEL="bedrock:us.amazon.nova-premier-v1:0"` with AWS credentials
* **DeepSeek**: `MODEL="deepseek:deepseek-chat"` with `DEEPSEEK_API_KEY`
* **OpenRouter**: `MODEL="openrouter:openai/gpt-4o"` with `OPEN_ROUTER_API_KEY`
* **xAI**: `MODEL="xai:grok-2-latest"` with `XAI_API_KEY`
* **Ollama**: `MODEL="ollama:llama3.2"` with `OLLAMA_DEFAULT_BASE_URL`

For detailed configuration examples, please refer to the `.env.local.example` file in this directory.

### Run the Example

```bash
# Run in interactive chat mode
pnpm start --chat

# Run with a single message
pnpm start --input "What are the recent issues in the AIGNE repository?"
```

## How MCP Integration Works

This example uses `MCPAgent` from `@aigne/core` to mount an MCP server as an AFS module. The GitHub MCP Server runs in a Docker container and communicates with AIGNE through the MCP protocol.

### Key Components

#### 1. MCPAgent - Protocol Bridge

The `MCPAgent` class bridges MCP servers with AIGNE's AFS interface:

```typescript
import { MCPAgent } from "@aigne/core";

// Create an MCPAgent that runs the GitHub MCP Server in Docker
const mcpAgent = await MCPAgent.from({
  command: "docker",
  args: [
    "run",
    "-i",
    "--rm",
    "-e",
    `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
    "ghcr.io/github/github-mcp-server",
  ],
});
```

#### 2. Mounting as AFS Module

The MCP server is mounted just like any other AFS module:

```typescript
import { AFS, AFSHistory } from "@aigne/afs";

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } }))
  .mount("/github-mcp-server", mcpAgent);
```

This makes the GitHub MCP Server accessible at `/modules/github-mcp-server` in the AFS virtual file system.

#### 3. AI Agent Integration

The AI agent can now interact with GitHub through AFS tools:

```typescript
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  instructions: "You are a friendly chatbot that can help users interact with a github repository via github-mcp-server mounted on AFS.",
  inputKey: "message",
  afs,
});
```

### Available GitHub Operations

Through the mounted GitHub MCP Server, the AI agent can:

- **List repositories**: Browse user and organization repositories
- **Read issues**: View issue details, comments, and status
- **Create issues**: Open new issues with descriptions
- **Search code**: Find code snippets across repositories
- **View pull requests**: Access PR information and reviews
- **Repository information**: Get repository details, stars, forks, etc.

## Example Usage

Try these commands to explore GitHub through the MCP server:

### Basic GitHub Queries

```bash
# Ask about recent issues
npx -y @aigne/example-afs-mcp-server --input "What are the recent open issues in the AIGNE-io/aigne-framework repository?"

# Search for code
npx -y @aigne/example-afs-mcp-server --input "Find examples of using MCPAgent in the codebase"

# Get repository information
npx -y @aigne/example-afs-mcp-server --input "Tell me about the AIGNE framework repository"
```

### Interactive Chat Examples

```bash
# Start interactive mode
npx -y @aigne/example-afs-mcp-server --chat
```

Then try asking:
- "What are the most starred repositories for AIGNE-io?"
- "Show me the latest pull requests in the aigne-framework repository"
- "Create a new issue in my repository about improving documentation"
- "Search for code examples of AFS modules"
- "What repositories does the AIGNE organization have?"

## How This Example Works

### 1. MCP Server Initialization

The GitHub MCP Server is launched in a Docker container:

```typescript
await MCPAgent.from({
  command: "docker",
  args: [
    "run",
    "-i",
    "--rm",
    "-e",
    `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
    "ghcr.io/github/github-mcp-server",
  ],
});
```

### 2. Protocol Translation

The `MCPAgent` translates between:
- **AFS operations** (list, read, write, exec) ↔ **MCP protocol** (resources, tools, prompts)
- AIGNE's standardized interface ↔ GitHub-specific MCP commands

### 3. Agent Tool Calls

When you ask a question, the AI agent uses AFS tools to interact with GitHub:

```json
{
  "toolCalls": [
    {
      "type": "function",
      "function": {
        "name": "afs_exec",
        "arguments": {
          "path": "/modules/github-mcp-server",
          "args": {
            "tool": "list_issues",
            "repository": "AIGNE-io/aigne-framework"
          }
        }
      }
    }
  ]
}
```

The MCP server processes this request and returns GitHub data, which the AI agent then presents in natural language.

## Understanding MCP Integration

### What is MCP?

MCP (Model Context Protocol) is a standardized protocol for connecting AI models with external tools and data sources. It defines:
- **Resources**: Data and content sources (files, databases, APIs)
- **Tools**: Actions the AI can perform (create, update, search)
- **Prompts**: Pre-defined interaction patterns

### Why Mount MCP as AFS?

Mounting MCP servers as AFS modules provides:

1. **Unified Interface**: All external services accessible through the same AFS API
2. **Composability**: Mix MCP servers with file systems, databases, and custom modules
3. **Standard Tools**: AI agents use familiar `afs_list`, `afs_read`, `afs_exec` tools
4. **Path-Based Organization**: Multiple MCP servers can coexist at different paths

### Example: Multiple MCP Servers

You can mount multiple MCP servers simultaneously:

```typescript
const afs = new AFS()
  .mount("/github", await MCPAgent.from({ /* GitHub MCP config */ }))
  .mount("/slack", await MCPAgent.from({ /* Slack MCP config */ }))
  .mount("/notion", await MCPAgent.from({ /* Notion MCP config */ }));

// Now the agent can interact with all three services!
```

## Extending This Example

### Using Other MCP Servers

Replace the GitHub MCP Server with any other MCP-compatible server:

```typescript
// Example: Slack MCP Server
.mount("/slack-mcp", await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-slack"],
  env: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  },
}))

// Example: File System MCP Server
.mount("/filesystem-mcp", await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"],
}))
```

### Combining with Other AFS Modules

Mix MCP servers with other AFS modules:

```typescript
import { LocalFS } from "@aigne/afs-local-fs";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: "file:./memory.sqlite3" } }))
  .mount(new LocalFS({ localPath: "./docs", description: "Documentation" }))
  .mount(new UserProfileMemory({ context: aigne.newContext() }))
  .mount("/github-mcp", await MCPAgent.from({ /* GitHub MCP config */ }));

// Now your agent has access to:
// - Conversation history (/modules/history)
// - Local files (/modules/local-fs)
// - User profiles (/modules/user-profile-memory)
// - GitHub API (/modules/github-mcp)
```

## Related Examples

- [AFS Memory Example](../afs-memory/README.md) - Conversational memory with user profiles
- [AFS LocalFS Example](../afs-local-fs/README.md) - File system access with AI agents

## MCP Resources

- [Model Context Protocol Official Site](https://www.anthropic.com/news/model-context-protocol)
- [GitHub MCP Server](https://github.com/github/mcp-server)
- [MCP Servers List](https://github.com/modelcontextprotocol/servers)

## TypeScript Support

This package includes full TypeScript type definitions.

## License

[MIT](../../LICENSE.md)
