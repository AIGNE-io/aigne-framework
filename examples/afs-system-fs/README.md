# AFS SystemFS Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to create a chatbot that can interact with your local file system using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example utilizes the `SystemFS` module to provide file system access to AI agents through the AFS (AIGNE File System) interface.

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
npx -y @aigne/example-afs-system-fs --path . --chat

# Mount a specific directory (e.g., your documents)
npx -y @aigne/example-afs-system-fs --path ~/Documents --mount /docs --description "My Documents" --chat

# Ask questions about files without interactive mode
npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/afs-system-fs

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

# Run with a specific directory and custom mount point
pnpm start --path ~/Documents --mount /docs --description "My Documents"

# Run in interactive chat mode
pnpm start --path . --chat
```

## How SystemFS Works

This example uses the `SystemFS` module from `@aigne/afs-system-fs` to mount your local file system into the AFS (AIGNE File System). This allows AI agents to interact with your files through a standardized interface.

### Key Features

* **File Operations**: List, read, write, and search files in mounted directories
* **Recursive Directory Traversal**: Navigate through subdirectories with depth control
* **Fast Text Search**: Uses ripgrep for blazing-fast content search across files
* **Metadata Support**: Access file timestamps, sizes, types, and custom metadata
* **Path Safety**: Sandboxed access limited to mounted directories

### Available Operations

The SystemFS module provides these AFS operations:

#### **list(path, options?)** - List directory contents
```typescript
// List files in root directory
await systemFS.list("")

// List files recursively with depth limit
await systemFS.list("", { recursive: true, maxDepth: 2 })

// List with sorting and limits
await systemFS.list("", { 
  orderBy: [['path', 'asc']], 
  limit: 10 
})
```

#### **read(path)** - Read file or directory
```typescript
// Read file content
const file = await systemFS.read("README.md")
console.log(file.content) // File contents as string

// Read directory metadata
const dir = await systemFS.read("src")
console.log(dir.metadata.type) // "directory"
```

#### **write(path, entry)** - Write or create files
```typescript
// Write a text file
await systemFS.write("notes.txt", {
  content: "My notes",
  summary: "Personal notes file"
})

// Write JSON data
await systemFS.write("config.json", {
  content: { setting: "value" },
  metadata: { format: "json" }
})
```

#### **search(path, query, options?)** - Search file contents
```typescript
// Search for text in files
const results = await systemFS.search("", "TODO")

// Search with regex patterns
const matches = await systemFS.search("", "function\\s+\\w+")

// Limit search results
const limited = await systemFS.search("", "error", { limit: 5 })
```

## Example Usage

Try these commands to explore the file system capabilities:

### Basic File Operations
```bash
# List all files in current directory
npx -y @aigne/example-afs-system-fs --path . --input "List all files in the root directory"

# Read a specific file
npx -y @aigne/example-afs-system-fs --path . --input "Read the contents of package.json"

# Search for specific content
npx -y @aigne/example-afs-system-fs --path . --input "Find all files containing the word 'example'"
```

### Interactive Chat Examples
```bash
# Start interactive mode
npx -y @aigne/example-afs-system-fs --path . --chat
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
# Mount multiple directories or specific paths
npx -y @aigne/example-afs-system-fs --path ~/Projects --mount /projects --description "My coding projects" --chat
```

The chatbot can help you navigate, search, read, and organize files in your mounted directories through natural language commands.
