# AFS LocalFS Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to create a chatbot that can interact with your local file system using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example utilizes the `LocalFS` module to provide file system access to AI agents through the **Agentic File System (AFS)** interface.

**Agentic File System (AFS)** is a virtual file system abstraction that provides AI agents with unified access to various storage backends. For comprehensive documentation, see [AFS Documentation](../../afs/README.md).

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

# Mount your current directory and chat with the bot about your files
npx -y @aigne/example-afs-local-fs --path . --chat

# Mount a specific directory (e.g., your documents)
npx -y @aigne/example-afs-local-fs --path ~/Documents --description "My Documents" --chat

# Ask questions about files without interactive mode
npx -y @aigne/example-afs-local-fs --path . --input "What files are in the current directory?"
```

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

## How LocalFS Works

This example uses the `LocalFS` module from `@aigne/afs-local-fs` to mount your local file system into the **Agentic File System (AFS)**. This allows AI agents to interact with your files through a standardized interface.

### Key Features

* **File Operations**: List, read, write, and search files in mounted directories
* **Recursive Directory Traversal**: Navigate through subdirectories with depth control
* **Fast Text Search**: Uses ripgrep for blazing-fast content search across files
* **Metadata Support**: Access file timestamps, sizes, types, and custom metadata
* **Path Safety**: Sandboxed access limited to mounted directories

### Available Operations

The LocalFS module provides these AFS operations:

#### **list(path, options?)** - List directory contents
```typescript
// List files in mounted directory
await afs.list('/modules/local-fs')

// List files recursively with depth limit
await afs.list('/modules/local-fs', { maxDepth: 2 })
```

#### **read(path)** - Read file or directory
```typescript
// Read file content
const { result } = await afs.read('/modules/local-fs/README.md')
console.log(result.content) // File contents as string

// Read directory metadata
const { result: dir } = await afs.read('/modules/local-fs/src')
console.log(dir.metadata.type) // "directory"
```

#### **write(path, entry)** - Write or create files
```typescript
// Write a text file
await afs.write('/modules/local-fs/notes.txt', {
  content: "My notes",
  summary: "Personal notes file"
})

// Write JSON data
await afs.write('/modules/local-fs/config.json', {
  content: { setting: "value" },
  metadata: { format: "json" }
})
```

#### **search(path, query, options?)** - Search file contents
```typescript
// Search for text in files
const { list } = await afs.search('/modules/local-fs', 'TODO')

// Search with regex patterns
const { list: matches } = await afs.search('/modules/local-fs', 'function\\s+\\w+')
```

## Example Usage

Try these commands to explore the file system capabilities:

### Basic File Operations
```bash
# List all files in current directory
npx -y @aigne/example-afs-local-fs --path . --input "List all files in the root directory"

# Read a specific file
npx -y @aigne/example-afs-local-fs --path . --input "Read the contents of package.json"

# Search for specific content
npx -y @aigne/example-afs-local-fs --path . --input "Find all files containing the word 'example'"
```

### Interactive Chat Examples
```bash
# Start interactive mode
npx -y @aigne/example-afs-local-fs --path . --chat
```

Then try asking:
- "What files are in this directory?"
- "Show me the contents of the README file"
- "Find all TypeScript files"
- "Search for functions in the codebase"
- "Create a new file called notes.txt with some content"
- "List all files recursively with a depth limit of 2"

### Advanced Usage
```bash
# Mount specific directories
npx -y @aigne/example-afs-local-fs --path ~/Projects --description "My coding projects" --chat
```

The chatbot can help you navigate, search, read, and organize files in your mounted directories through natural language commands.

## How this Example Works

### Mount a local directory as an AFS module

The following code snippet shows how to mount a local directory using `LocalFS`:

```typescript
import { AFS, AFSHistory } from "@aigne/afs";
import { LocalFS } from "@aigne/afs-local-fs";
import { AIAgent } from "@aigne/core";

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } }))
  .mount(new LocalFS({
    localPath: '/path/to/directory',
    description: 'My project files'
  }));

const agent = AIAgent.from({
  instructions: "You are a friendly chatbot that can retrieve files from a virtual file system.",
  inputKey: "message",
  afs,
});
```

### Call AFS tools to retrieve context

User Question: What's the purpose of this project?

```json
{
  "toolCalls": [
    {
      "id": "call_nBAfMjqt6ufoR22ToRvwbvQ6",
      "type": "function",
      "function": {
        "name": "afs_list",
        "arguments": {
          "path": "/modules/local-fs"
        }
      }
    }
  ]
}
```

The agent will call the `afs_list` tool to list the files in the mounted directory

```json
{
  "list": [
    {
      "id": "/README.md",
      "path": "/modules/local-fs/README.md",
      "createdAt": "2025-10-30T14:03:49.961Z",
      "updatedAt": "2025-10-30T14:03:49.961Z",
      "metadata": {
        "type": "file",
        "size": 3489,
        "mode": 33188
      }
    }
  ]
}
```

Then use `afs_read` to read specific file content

```json
{
  "toolCalls": [
    {
      "id": "call_73i8vwuHKXt2igXGdyeEws7F",
      "type": "function",
      "function": {
        "name": "afs_read",
        "arguments": {
          "path": "/modules/local-fs/README.md"
        }
      }
    }
  ]
}
```

The agent combines the retrieved file content to answer the user's question naturally.

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
