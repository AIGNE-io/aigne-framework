# AFS System FS

This guide demonstrates how to build a chatbot capable of interacting with your local file system. By following these steps, you will create an agent that can list, read, write, and search files on your machine using the AIGNE File System (AFS) and the `SystemFS` module.

## Overview

This example showcases the integration of a local file system with an AI agent through the AIGNE Framework. The `SystemFS` module acts as a bridge, mounting a specified local directory into the AIGNE File System (AFS). This allows the AI agent to perform file operations using a standardized set of tools, enabling it to answer questions and complete tasks based on the contents of your local files.

The following diagram illustrates how the `SystemFS` module connects the local file system to the AI agent:

```d2
direction: down

AI-Agent: {
  label: "AI Agent"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  AFS: {
    label: "AIGNE File System (AFS)"
    shape: rectangle

    SystemFS-Module: {
      label: "SystemFS Module"
      shape: rectangle
    }
  }
}

Local-File-System: {
  label: "Local File System"
  shape: rectangle

  Local-Directory: {
    label: "Local Directory\n(/path/to/your/project)"
    shape: cylinder
  }
}

AI-Agent <-> AIGNE-Framework.AFS: "3. Performs file operations\n(list, read, write, search)"
AIGNE-Framework.AFS.SystemFS-Module <-> Local-File-System.Local-Directory: "2. Mounts directory"

```

## Prerequisites

Before proceeding, ensure your development environment meets the following requirements:

*   **Node.js**: Version 20.0 or higher.
*   **npm**: Included with Node.js.
*   **OpenAI API Key**: Required for connecting to the language model. You can obtain one from the [OpenAI API keys page](https://platform.openai.com/api-keys).

## Quick Start

You can run this example directly without a local installation using `npx`.

### Run the Example

Execute the following commands in your terminal to mount a directory and interact with the chatbot.

Mount your current directory and start an interactive chat session:

```bash Install aigne deps icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

Mount a specific directory, such as your Documents folder:

```bash Install aigne deps icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path ~/Documents --mount /docs --description "My Documents" --chat
```

Ask a one-off question without entering interactive mode:

```bash Install aigne deps icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"
```

### Connect to an AI Model

The first time you run the example, the CLI will prompt you to connect to an AI model, as no API keys have been configured.

![Initial connection prompt for AIGNE Hub](../../../examples/afs-system-fs/run-example.png)

You have three options to proceed:

1.  **Connect to the official AIGNE Hub**
    This is the recommended option for new users. Your browser will open the AIGNE Hub, where you can authorize the connection. New users receive a complimentary token grant to get started immediately.

    ![Authorization dialog for AIGNE CLI in AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

2.  **Connect via a self-hosted AIGNE Hub**
    If you have a self-hosted AIGNE Hub instance, select this option and enter its URL to complete the connection. You can deploy your own AIGNE Hub from the [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ).

    ![Prompt to enter the URL for a self-hosted AIGNE Hub](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **Connect via a third-party model provider**
    You can configure an API key from a provider like OpenAI directly. Set the appropriate environment variable in your terminal, then run the example again.

    ```bash Set OpenAI API Key icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    For configurations with other providers such as DeepSeek or Google Gemini, refer to the `.env.local.example` file in the project source.

### Debugging with AIGNE Observe

To monitor and analyze the agent's behavior, use the `aigne observe` command. This launches a local web server that provides a detailed view of execution traces, tool calls, and model interactions, which is invaluable for debugging and performance tuning.

First, start the observation server:

```bash Start Observe Server icon=lucide:terminal
aigne observe
```

The terminal will confirm that the server is running and provide a local URL.

![Terminal output showing the AIGNE Observe server has started](../../../examples/images/aigne-observe-execute.png)

After running your agent, you can view a list of recent executions in the web interface.

![AIGNE Observability web interface showing a list of traces](../../../examples/images/aigne-observe-list.png)

## Local Installation

For development purposes, you can clone the repository and run the example locally.

1.  **Clone the Repository**

    ```bash Clone Repository icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **Install Dependencies**
    Navigate to the example directory and install the necessary packages using pnpm.

    ```bash Install Dependencies icon=lucide:terminal
    cd aigne-framework/examples/afs-system-fs
    pnpm install
    ```

3.  **Run the Example**
    Use the `pnpm start` command with the desired flags.

    Run with your current directory:
    ```bash Run with Current Directory icon=lucide:terminal
    pnpm start --path .
    ```

    Run in interactive chat mode:
    ```bash Run in Chat Mode icon=lucide:terminal
    pnpm start --path . --chat
    ```

## How It Works

This example uses the `SystemFS` module to expose a local directory to an AI agent through the AIGNE File System (AFS). This sandboxed environment allows the agent to interact with your files using a standardized interface, ensuring safety and control.

### Core Logic

1.  **Mounting a Directory**: The `SystemFS` class is instantiated with a local `path` and a virtual `mount` point within the AFS.
2.  **Agent Initialization**: An `AIAgent` is configured with the AFS instance, giving it access to file system tools like `afs_list`, `afs_read`, `afs_write`, and `afs_search`.
3.  **Tool Calls**: When the user asks a question (e.g., "What's the purpose of this project?"), the agent determines which AFS tool to use. It might first call `afs_list` to see the directory contents, then `afs_read` to inspect a relevant file like `README.md`.
4.  **Context Building**: The content retrieved from the file system is added to the agent's context.
5.  **Response Generation**: The agent uses the enriched context to formulate a comprehensive answer to the user's original question.

The following code snippet shows how a local directory is mounted into the AFS and provided to an `AIAgent`.

```typescript index.ts icon=logos:typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { AIAgent } from "@aigne/core";

AIAgent.from({
  // ... other configurations
  afs: new AFS().use(
    new SystemFS({ mount: '/source', path: '/PATH/TO/YOUR/PROJECT', description: 'Codebase of the project' }),
  ),
  afsConfig: {
    injectHistory: true,
  },
});
```

### Key Features of SystemFS

*   **File Operations**: Standard list, read, write, and search capabilities.
*   **Recursive Traversal**: Navigate nested directories with depth control.
*   **Fast Content Search**: Leverages `ripgrep` for high-performance text search.
*   **Metadata Access**: Provides file details like size, type, and timestamps.
*   **Path Safety**: Restricts file access to only the mounted directories.

## Example Usage

Once the chatbot is running, you can issue natural language commands to interact with your files.

### Basic Commands

Try these commands to perform simple file operations.

List all files in the mounted directory:
```bash List Files icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "List all files in the root directory"
```

Read the contents of a specific file:
```bash Read a File icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Read the contents of package.json"
```

Search for content across all files:
```bash Search Content icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Find all files containing the word 'example'"
```

### Interactive Chat Prompts

Start an interactive session for a more conversational experience:

```bash Start Interactive Mode icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

Once in chat mode, try asking the following:

*   "What files are in this directory?"
*   "Show me the contents of the README file."
*   "Find all TypeScript files."
*   "Search for functions in the codebase."
*   "Create a new file called `notes.txt` with some content."
*   "List all files recursively with a depth limit of 2."

## Summary

This example provides a practical demonstration of how to extend an AI agent's capabilities to include local file system interactions. By using the `SystemFS` module, you can create powerful chatbots that automate tasks, retrieve information, and organize files based on natural language commands.

For more advanced examples and workflows, you can explore other documentation sections.

<x-cards data-columns="2">
  <x-card data-title="Memory" data-href="/examples/memory" data-icon="lucide:brain-circuit">
  Learn how to give your chatbot a persistent memory.
  </x-card>
  <x-card data-title="Workflow Orchestration" data-href="/examples/workflow-orchestration" data-icon="lucide:milestone">
  Discover how to coordinate multiple agents in complex workflows.
  </x-card>
</x-cards>