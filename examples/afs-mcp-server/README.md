# AFS MCP Server Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example shows how to mount any [MCP (Model Context Protocol)](https://www.anthropic.com/news/model-context-protocol) server as an AFS module, making it accessible to AI agents through a unified file system interface. We use the GitHub MCP Server as a real-world demonstration.

## What You'll See

**User asks:** "Search for a repo named aigne"

**Behind the scenes:**
1. LLM calls `afs_exec` → `/modules/github-mcp-server/search_repositories`
2. MCP server searches GitHub and returns JSON results
3. LLM presents results naturally: "Found 89 repositories. Notable matches: aigne-framework..."

**The power:** AI agents can access GitHub (or any MCP server) through a simple, unified AFS interface - just like accessing files!

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
npx -y @aigne/example-afs-mcp-server --input "Search for a repo named aigne"
```

## See It In Action

Here's what happens when you ask to search for a repository:

```
👤 You: "Search for a repo named aigne"

🤖 Agent thinks: I need to search GitHub repositories...
   → Calls: afs_exec("/modules/github-mcp-server/search_repositories")

📡 GitHub MCP Server:
   ✓ Found 89 repositories matching "aigne"

🤖 AI: "I searched GitHub for 'aigne'. Results: 89 repositories found.

       Notable matches:
       • aigne-framework (AIGNE-io/aigne-framework) - ⭐ 150 stars
       • aigne-examples (user/aigne-examples) - ⭐ 12 stars
       ...

       Would you like me to open any of these repos or see more details?"
```

**Key insight:** The agent treats the GitHub MCP Server like any other AFS module - no special integration code needed!

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

## How It Works: 3 Simple Steps

### 1. Launch the MCP Server

```typescript
import { MCPAgent } from "@aigne/core";

const mcpAgent = await MCPAgent.from({
  command: "docker",
  args: [
    "run", "-i", "--rm",
    "-e", `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
    "ghcr.io/github/github-mcp-server",
  ],
});
```

### 2. Mount It as an AFS Module

```typescript
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } }))
  .mount(mcpAgent);  // Mounted at /modules/github-mcp-server
```

### 3. Create an AI Agent

```typescript
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  instructions: "Help users interact with GitHub via the github-mcp-server module.",
  inputKey: "message",
  afs,  // Agent automatically gets access to all mounted modules
});
```

**That's it!** The agent can now call `/modules/github-mcp-server/search_repositories`, `/modules/github-mcp-server/list_issues`, and all other GitHub MCP tools through the AFS interface.

## Try These Examples

```bash
# Search for repositories
npx -y @aigne/example-afs-mcp-server --input "Search for a repo named aigne"

# Get repository information
npx -y @aigne/example-afs-mcp-server --input "Tell me about the AIGNE-io/aigne-framework repository"

# Check recent issues
npx -y @aigne/example-afs-mcp-server --input "What are the recent open issues in AIGNE-io/aigne-framework?"

# Interactive mode - ask follow-up questions naturally
npx -y @aigne/example-afs-mcp-server --chat
```

**In chat mode, try:**
- "Show me the most popular AIGNE repositories"
- "Search for repos about AI agents"
- "What pull requests are open in aigne-framework?"
- "Find code examples of MCPAgent usage"

## Why Mount MCP as AFS?

**The Problem:** Each MCP server has its own protocol and tools. AI agents need custom code to work with each one.

**The Solution:** Mount all MCP servers as AFS modules:

```typescript
const afs = new AFS()
  .mount("/github", await MCPAgent.from({ /* GitHub MCP */ }))
  .mount("/slack", await MCPAgent.from({ /* Slack MCP */ }))
  .mount("/notion", await MCPAgent.from({ /* Notion MCP */ }));

// Now the agent uses ONE interface (afs_exec) to access ALL services!
```

**Benefits:**
- **Unified Interface**: All MCP servers accessible through `afs_list`, `afs_read`, `afs_exec`
- **Composability**: Mix MCP servers with file systems, databases, custom modules
- **Path-Based**: Multiple MCP servers coexist at different paths
- **No Rewiring**: AI agents work with any mounted MCP server automatically

## Use Any MCP Server

Replace GitHub with **any** MCP server:

```typescript
// Slack MCP Server
.mount(await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-slack"],
  env: { SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN },
}))

// File System MCP Server
.mount(await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/files"],
}))

// Postgres MCP Server
.mount(await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-postgres"],
  env: { POSTGRES_CONNECTION_STRING: process.env.DATABASE_URL },
}))
```

## Mix MCP with Other AFS Modules

```typescript
import { LocalFS } from "@aigne/afs-local-fs";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } }))
  .mount(new LocalFS({ localPath: "./docs" }))
  .mount(new UserProfileMemory({ context }))
  .mount(await MCPAgent.from({ /* GitHub MCP */ }))
  .mount(await MCPAgent.from({ /* Slack MCP */ }));

// Agent now has: history, local files, user profiles, GitHub, Slack!
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
