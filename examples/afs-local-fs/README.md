# AFS LocalFS Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example shows how to mount your local file system as an AFS module, enabling AI agents to intelligently search, read, and interact with your files. We demonstrate mounting the AIGNE framework documentation.

## What You'll See

**User asks:** "What is AIGNE?"

**Behind the scenes:**
1. LLM calls `afs_search` → searches all files for "AIGNE"
2. Finds `/modules/local-fs/docs/getting-started/what-is-aigne.md`
3. LLM calls `afs_read` → reads the specific file
4. LLM presents: "AIGNE is a framework and runtime engine for building LLM-powered applications..."

**The power:** AI agents intelligently search your file system and retrieve exactly what's needed - no manual navigation required!

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# Mount AIGNE framework docs (clone first)
git clone https://github.com/AIGNE-io/aigne-framework
npx -y @aigne/example-afs-local-fs --path ./aigne-framework --chat

# Or mount any directory
npx -y @aigne/example-afs-local-fs --path ~/Documents --description "My Documents" --chat

# Ask a specific question
npx -y @aigne/example-afs-local-fs --path . --input "What is AIGNE?"
```

## See It In Action

Here's what happens when you ask "What is AIGNE?" with the framework docs mounted:

```
👤 You: "What is AIGNE?"

🤖 Agent thinks: I should search the docs for information about AIGNE...
   → Calls: afs_search(query: "AIGNE")

📁 Found 15 matching files:
   • docs/getting-started/what-is-aigne.md ⭐ (most relevant)
   • README.md
   • docs/core-concepts/overview.md
   ...

🤖 Agent thinks: Let me read the most relevant file...
   → Calls: afs_read("docs/getting-started/what-is-aigne.md")

📄 File loaded (2.4 KB)

🤖 AI: "AIGNE is a framework and runtime engine for building LLM-powered
       applications and AI agents. It provides:

       • A unified Agentic File System (AFS) interface
       • Support for multiple LLM providers (OpenAI, Anthropic, etc.)
       • Tools for building autonomous agents
       • Integration with external services via MCP

       Would you like me to walk you through a quick-start tutorial, or
       would you prefer to see specific examples?"
```

**Key insight:** The agent intelligently searches, finds the right file, reads it, and synthesizes a helpful answer - all automatically!

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/afs-local-fs

pnpm install
```

### Setup Environment Variables

Setup your OpenAI API key in the `.env.local` file:

```bash
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
# Run with your current directory
pnpm start --path .

# Run with a specific directory
pnpm start --path ~/Documents --description "My Documents"

# Run in interactive chat mode
pnpm start --path . --chat
```

## How It Works: 3 Simple Steps

### 1. Create LocalFS Module

```typescript
import { LocalFS } from "@aigne/afs-local-fs";

const localFS = new LocalFS({
  localPath: './aigne-framework',
  description: 'AIGNE framework documentation'
});
```

### 2. Mount It as an AFS Module

```typescript
import { AFS, AFSHistory } from "@aigne/afs";

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } }))
  .mount(localFS);  // Mounted at /modules/local-fs
```

### 3. Create an AI Agent

```typescript
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  instructions: "Help users find and read files from the local file system.",
  inputKey: "message",
  afs,  // Agent gets: afs_list, afs_read, afs_write, afs_search
});
```

**That's it!** The agent can now intelligently search and retrieve files from your local directory.

### What the Agent Can Do

- **`afs_list`** - List files and directories (with recursive depth control)
- **`afs_read`** - Read file contents and metadata
- **`afs_write`** - Create or update files
- **`afs_search`** - Fast full-text search using ripgrep (supports regex)

All operations are sandboxed to the mounted directory for safety.

## Try These Examples

```bash
# Mount AIGNE docs and ask questions
git clone https://github.com/AIGNE-io/aigne-framework
npx -y @aigne/example-afs-local-fs --path ./aigne-framework --input "What is AIGNE?"

# Ask about specific features
npx -y @aigne/example-afs-local-fs --path ./aigne-framework --input "How does AFS work?"

# Search your codebase
npx -y @aigne/example-afs-local-fs --path . --input "Find all TypeScript files with TODO comments"

# Interactive mode - ask follow-up questions
npx -y @aigne/example-afs-local-fs --path ~/Documents --chat
```

**In chat mode, try:**
- "What files are in this directory?"
- "Show me the README"
- "Search for 'authentication' in all files"
- "Find all Python files"
- "What does the config.json file contain?"

## Use Cases

### Documentation Chat
Mount your project docs and let users ask questions:
```typescript
const afs = new AFS()
  .mount(new LocalFS({ localPath: './docs', description: 'Project documentation' }));
// Users can now ask: "How do I configure authentication?"
```

### Codebase Analysis
Give AI agents access to your codebase:
```typescript
const afs = new AFS()
  .mount(new LocalFS({ localPath: './src', description: 'Source code' }));
// Agent can search, read, and explain code
```

### File Organization
Let AI help organize your files:
```typescript
const afs = new AFS()
  .mount(new LocalFS({ localPath: '~/Downloads', description: 'Downloads folder' }));
// Ask: "Find all PDFs from last week" or "Organize these files by type"
```

### Multi-Directory Access
Mount multiple directories simultaneously:
```typescript
const afs = new AFS()
  .mount("/docs", new LocalFS({ localPath: './docs' }))
  .mount("/src", new LocalFS({ localPath: './src' }))
  .mount("/tests", new LocalFS({ localPath: './tests' }));
// Agent can search across all mounted directories
```

## Related Examples

- [AFS Memory Example](../afs-memory/README.md) - Conversational memory with user profiles
- [AFS MCP Server Example](../afs-mcp-server/README.md) - Integration with MCP servers

## Related Packages

- [@aigne/afs](../../afs/README.md) - AFS core package
- [@aigne/afs-local-fs](../../afs/local-fs/README.md) - LocalFS module documentation

## TypeScript Support

This package includes full TypeScript type definitions.

## License

[MIT](../../LICENSE.md)
