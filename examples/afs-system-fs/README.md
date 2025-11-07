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

### Run the Example

```bash
# Mount your current directory and chat with the bot about your files
npx -y @aigne/example-afs-system-fs --path . --chat

# Mount a specific directory (e.g., your documents)
npx -y @aigne/example-afs-system-fs --path ~/Documents --mount /docs --description "My Documents" --chat

# Ask questions about files without interactive mode
npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"
```

### Connect to an AI Model

As an example, running `npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"` requires an AI model. If this is your first run, you need to connect one.

![run example](./run-example.png)

- Connect via the official AIGNE Hub

Choose the first option and your browser will open the official AIGNE Hub page. Follow the prompts to complete the connection. If you're a new user, the system automatically grants 400,000 tokens for you to use.

![connect to official aigne hub](../images/connect-to-aigne-hub.png)

- Connect via a self-hosted AIGNE Hub

Choose the second option, enter the URL of your self-hosted AIGNE Hub, and follow the prompts to complete the connection. If you need to set up a self-hosted AIGNE Hub, visit the Blocklet Store to install and deploy it: [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes).

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

## How this Example Works

### Mount a local directory as an AFS module

Just following code snippet shows how to mount a local directory using `SystemFS`:

```typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { AIAgent } from "@aigne/core";

AIAgent.from({
  ...,
  afs: new AFS().use(
    new SystemFS({ mount: '/source', path: '/PATH/TO/Bitcoin/Project', description: 'Codebase of Bitcoin project' }),
  ),
  afsConfig: {
    injectHistory: true,
  },
}),
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
          "path": "/",
          "options": {
            "recursive": false
          }
        }
      }
    }
  ]
}
```

The agent will call the `afs_list` tool to list the files in the root directory

```json
{
  "status": "success",
  "tool": "afs_list",
  "options": {
    "recursive": false
  },
  "list": [
    {
      "id": "/README.md",
      "path": "/source/README.md",
      "createdAt": "2025-10-30T14:03:49.961Z",
      "updatedAt": "2025-10-30T14:03:49.961Z",
      "metadata": {
        "type": "file",
        "size": 3489,
        "mode": 33188
      }
    },
    // ... other files
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
          "path": "/source/README.md"
        }
      }
    }
  ]
}
```

Finally, prompt builder will combine the retrieved file content and construct the final message for the agent to answer the user question.

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are an ...",
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What's the purpose of this project?"
        }
      ]
    },
    {
      "role": "agent",
      "toolCalls": [
        {
          "id": "call_TLvilbEhXqg3WFsFAKqm69W9",
          "type": "function",
          "function": {
            "name": "afs_list",
            "arguments": {
              "path": "/source",
              "options": {
                "recursive": false
              }
            }
          }
        }
      ]
    },
    {
      "role": "tool",
      "content": "... list result ...", // Here would be the actual list result
      "toolCallId": "call_TLvilbEhXqg3WFsFAKqm69W9"
    },
    {
      "role": "agent",
      "toolCalls": [
        {
          "id": "call_73i8vwuHKXt2igXGdyeEws7F",
          "type": "function",
          "function": {
            "name": "afs_read",
            "arguments": {
              "path": "/source/README.md"
            }
          }
        }
      ]
    },
    {
      "role": "tool",
      "content": "... read file content ...", // Here would be the actual file content
      "toolCallId": "call_73i8vwuHKXt2igXGdyeEws7F"
    }
  ]
}
```

The final answer from the agent would be:

```markdown
This repository is Bitcoin Core — the reference implementation of the Bitcoin protocol. Its purpose is to provide a full-node Bitcoin client that:

    * Connects to the Bitcoin peer-to-peer network, downloads blocks and transactions, and fully validates them against consensus rules (so you don’t have to trust others).
    * Acts as a reference implementation of Bitcoin protocol behavior used by wallets, services, and other implementations.
    * Includes an optional wallet and a GUI (and an RPC interface) for interacting with the node.
    * Provides developer tooling, tests (unit, integration, regression), and documentation to maintain security and correctness.

For an overview see the README (https://bitcoincore.org) and to get ready-to-run binaries use https://bitcoincore.org/en/download/. The project is released under the MIT license.
```
