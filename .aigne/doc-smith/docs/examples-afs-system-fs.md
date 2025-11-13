I have located the necessary files for the "AFS System FS" example documentation. The primary source will be `/sources/examples/afs-system-fs/README.md`, which will provide the structure, code snippets, and conceptual explanations. The core logic example will be drawn from `/sources/examples/afs-system-fs/index.ts`. I've noted the available image, `/sources/examples/afs-system-fs/run-example.png`, and will address the user's feedback regarding invalid image paths by verifying correct locations or substituting with valid images. My next step is to analyze the `README.md` to begin drafting the document.# AFS System FS

Ever wanted to build a chatbot that could directly and safely interact with your local files? This guide demonstrates how to do just that. You will learn how to use the AIGNE File System (AFS) and the `SystemFS` module to grant an AI agent sandboxed access to read, write, and search files on your machine, enabling powerful, context-aware applications that work with local data.

## Overview

The core of this example is the `SystemFS` module, which acts as a bridge between the AIGNE Framework and your computer's file system. It allows you to "mount" a local directory, making its contents accessible to an AI agent through a standard set of tools like `afs_list`, `afs_read`, `afs_write`, and `afs_search`. The agent can then use these tools to perform file operations based on natural language commands. This enables use cases like summarizing documents, organizing files, or answering questions about a codebase.

The following diagram illustrates the relationship between the user, the AI Agent, the AFS tools, and the local file system:

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  AI-Agent: {
    label: "AI Agent"
    shape: rectangle
  }

  AFS-Tools: {
    label: "AFS Tools"
    shape: rectangle
    grid-columns: 2
    afs_list: { label: "afs_list" }
    afs_read: { label: "afs_read" }
    afs_write: { label: "afs_write" }
    afs_search: { label: "afs_search" }
  }

  SystemFS-Module: {
    label: "SystemFS Module"
    shape: rectangle
  }
}

Local-File-System: {
  label: "Local File System\n(Sandboxed)"
  shape: cylinder
}

User -> AIGNE-Framework.AI-Agent: "Natural Language Command"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS-Tools: "Selects appropriate tool"
AIGNE-Framework.AFS-Tools -> AIGNE-Framework.SystemFS-Module: "Invokes tool operation"
AIGNE-Framework.SystemFS-Module -> Local-File-System: "Performs file I/O"
Local-File-System -> AIGNE-Framework.SystemFS-Module: "Returns file content/status"
AIGNE-Framework.SystemFS-Module -> AIGNE-Framework.AI-Agent: "Returns tool result"
AIGNE-Framework.AI-Agent -> User: "Contextual Response"

```

## Prerequisites

Before you begin, ensure your system meets the following requirements:

*   **Node.js**: Version 20.0 or higher.
*   **npm**: Included with your Node.js installation.
*   **OpenAI API Key**: A valid API key is required for the AI agent to connect to OpenAI's models. You can get a key from the [OpenAI Platform](https://platform.openai.com/api-keys).

If you plan to run this example from the source code, the following are also recommended:

*   **pnpm**: For efficient package management.
*   **Bun**: For running examples and unit tests.

## Quick Start

You can run this example directly from your terminal using `npx` without needing to clone the full repository. This is the fastest way to see it in action.

### Run the Example

Open your terminal and choose one of the following commands.

To mount your current directory and start an interactive chat session:

```bash Run in Chat Mode icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

To mount a specific directory with a custom name and description:

```bash Mount a Specific Directory icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path ~/Documents --mount /docs --description "My Documents" --chat
```

To ask a single question without starting an interactive chat:

```bash Ask a Single Question icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"
```

### Connect to an AI Model

The first time you run the example, you will be prompted to connect to an AI model.

![Connect to an AI model](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-aigne-hub.png)

You have three main options:

1.  **Connect via the official AIGNE Hub**: This is the recommended option. Your browser will open the official AIGNE Hub, where you can sign in. New users receive a free token allocation to get started.
2.  **Connect via a self-hosted AIGNE Hub**: If you run your own AIGNE Hub instance, choose this option and enter its URL.
3.  **Connect via a third-party model provider**: You can connect directly to a provider like OpenAI by setting an environment variable with your API key.

To connect to OpenAI, set the `OPENAI_API_KEY` environment variable in your terminal:

```bash Set OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

After setting the key, run the `npx` command again. For a full list of supported providers and their required environment variables, refer to the example's `.env.local.example` file.

## Installation from Source

If you prefer to examine the source code or make modifications, follow these steps to run the example locally.

### 1. Clone the Repository

```bash Clone the repository icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example's directory and use `pnpm` to install the necessary packages.

```bash Install dependencies icon=lucide:terminal
cd aigne-framework/examples/afs-system-fs
pnpm install
```

### 3. Run the Example

Execute the `pnpm start` command with the desired flags.

To run with your current directory mounted:

```bash Run with Current Directory icon=lucide:terminal
pnpm start --path .
```

To run in interactive chat mode:

```bash Run in Chat Mode icon=lucide:terminal
pnpm start --path . --chat
```

## How It Works

This example initializes an `AIAgent` and grants it access to the local file system using the `SystemFS` module.

### Mounting a Local Directory

The `SystemFS` class is used to mount a local `path` to a virtual `mount` point within the AFS. This configuration is passed to a new `AFS` instance, which is then attached to the `AIAgent`. The agent is instructed to use the mounted file system to answer user queries.

```typescript index.ts icon=logos:typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  name: "afs-system-fs-chatbot",
  instructions:
    "You are a friendly chatbot that can retrieve files from a virtual file system. You should use the provided functions to list, search, and read files as needed to answer user questions. The current folder points to the /fs mount point by default.",
  inputKey: "message",
  afs: new AFS().use(
    new SystemFS({
      mount: '/fs',
      path: './',
      description: 'Mounted file system'
    }),
  ),
  afsConfig: {
    injectHistory: true,
  },
});
```

### Agent Interaction Flow

When a user asks a question, the AI agent autonomously decides which AFS tools to use to find the answer.

1.  **User Input**: A user asks a question like, "What's the purpose of this project?"
2.  **Tool Call (List)**: The agent determines it needs to understand the file structure and calls the `afs_list` tool to see the files in the root directory.
3.  **Tool Call (Read)**: After identifying a relevant file, such as `README.md`, the agent calls the `afs_read` tool to access its contents.
4.  **Contextual Response**: The file's content is added to the agent's context. The agent then uses this new information to construct a detailed answer to the user's original question.

This entire process is autonomous. The agent chains tool calls, gathers context, and formulates a response without manual guidance.

## Example Usage

Once the chatbot is running, you can issue various commands to interact with the mounted files.

### Basic File Operations

```bash List all files icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "List all files in the root directory"
```

```bash Read a specific file icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Read the contents of package.json"
```

```bash Search for content icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Find all files containing the word 'example'"
```

### Interactive Chat

For a more conversational experience, start the interactive mode.

```bash Start Interactive Chat icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

Once inside the chat, try asking questions like:

*   "What files are in this directory?"
*   "Show me the contents of the README file."
*   "Find all TypeScript files."
*   "Create a new file called `notes.txt` with the content 'Finish project documentation'."
*   "List all files recursively with a depth limit of 2."

## Debugging

The AIGNE CLI includes an `observe` command that helps you analyze and debug your agent's behavior. It launches a local web server with an interface for inspecting execution traces, including tool calls, model inputs, and final outputs.

First, start the observation server in your terminal:

```bash Start Observation Server icon=lucide:terminal
aigne observe
```

![Start the AIGNE observation server](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-execute.png)

After running an agent task, you can open the web interface to see a list of recent executions and drill down into the details of each step.

![View a list of recent executions](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-list.png)

## Summary

This example provides a practical guide for extending an AI agent's capabilities to your local file system. Using `SystemFS`, you can build sophisticated applications that are deeply integrated with a user's local data and environment.

For more examples and advanced features, see the following documentation:

<x-cards data-columns="2">
  <x-card data-title="Memory" data-icon="lucide:brain-circuit" data-href="/examples/memory">
  Learn how to create a chatbot with persistent memory using the FSMemory plugin.
  </x-card>
  <x-card data-title="MCP Server" data-icon="lucide:server" data-href="/examples/mcp-server">
  Discover how to run AIGNE agents as a Model Context Protocol (MCP) Server.
  </x-card>
</x-cards>