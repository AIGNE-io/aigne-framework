# Examples

Explore a collection of practical examples that demonstrate the various features and workflow patterns of the AIGNE Framework. This section provides hands-on, executable demos to help you understand intelligent conversation, MCP protocol integration, memory mechanisms, and complex agentic workflows.

## Quick Start

You can run any example directly without a local installation using `npx`. This approach is the fastest way to see the AIGNE Framework in action.

### Prerequisites

- Node.js (version 20.0 or higher) and npm installed.
- An API key for your chosen Large Language Model (LLM) provider (e.g., OpenAI).

### Run an Example

Execute the following commands in your terminal to run a basic chatbot.

1.  **Set your API key:**
    Replace `YOUR_OPENAI_API_KEY` with your actual OpenAI API key.

    ```sh icon=lucide:terminal
    export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

2.  **Run in one-shot mode:**
    The agent will process a default prompt and exit.

    ```sh icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

3.  **Run in interactive mode:**
    Use the `--chat` flag to start an interactive session where you can have a conversation with the agent.

    ```sh icon=lucide:terminal
    npx -y @aigne/example-chat-bot --chat
    ```

### Using Different LLMs

You can specify different models by setting the `MODEL` environment variable along with the corresponding API key. Below are configurations for several popular providers.

| Provider | Environment Variables |
| :--- | :--- |
| **OpenAI** | `export MODEL=openai:gpt-4o`<br/>`export OPENAI_API_KEY=...` |
| **Anthropic** | `export MODEL=anthropic:claude-3-opus-20240229`<br/>`export ANTHROPIC_API_KEY=...` |
| **Google Gemini** | `export MODEL=gemini:gemini-1.5-flash`<br/>`export GEMINI_API_KEY=...` |
| **DeepSeek** | `export MODEL=deepseek/deepseek-chat`<br/>`export DEEPSEEK_API_KEY=...` |
| **AWS Bedrock** | `export MODEL=bedrock:anthropic.claude-3-sonnet-20240229-v1:0`<br/>`export AWS_ACCESS_KEY_ID=...`<br/>`export AWS_SECRET_ACCESS_KEY=...`<br/>`export AWS_REGION=...` |
| **Ollama** | `export MODEL=llama3`<br/>`export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"` |

## Example Library

This section provides a curated list of examples, each demonstrating a specific capability or workflow pattern within the AIGNE Framework. Click on any card to navigate to the detailed guide for that example.

### Core Functionality

<x-cards data-columns="2">
  <x-card data-title="Chatbot" data-icon="lucide:bot" data-href="/examples/chat-bot">
    Build a basic conversational agent that supports both one-shot and interactive modes.
  </x-card>
  <x-card data-title="AFS Local FS" data-icon="lucide:folder-git-2" data-href="/examples/afs-local-fs">
    Create a chatbot that can read, write, and list files on the local file system.
  </x-card>
  <x-card data-title="Memory" data-icon="lucide:brain-circuit" data-href="/examples/memory">
    Implement an agent with persistent memory using the FSMemory plugin.
  </x-card>
  <x-card data-title="Nano Banana" data-icon="lucide:image" data-href="/examples/nano-banana">
    Demonstrates how to create a chatbot with image generation capabilities.
  </x-card>
</x-cards>

### Workflow Patterns

<x-cards data-columns="3">
  <x-card data-title="Sequential" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    Execute a series of agents in a specific, ordered sequence, like an assembly line.
  </x-card>
  <x-card data-title="Concurrency" data-icon="lucide:git-fork" data-href="/examples/workflow-concurrency">
    Run multiple agents simultaneously to perform tasks in parallel and improve efficiency.
  </x-card>
  <x-card data-title="Router" data-icon="lucide:route" data-href="/examples/workflow-router">
    Create a manager agent that intelligently directs tasks to the appropriate specialized agent.
  </x-card>
  <x-card data-title="Handoff" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    Enable seamless transitions where one agent passes its output to another for further processing.
  </x-card>
  <x-card data-title="Reflection" data-icon="lucide:refresh-ccw" data-href="/examples/workflow-reflection">
    Build agents that can review and refine their own output for self-correction and improvement.
  </x-card>
  <x-card data-title="Orchestration" data-icon="lucide:users" data-href="/examples/workflow-orchestration">
    Coordinate multiple agents to solve complex problems that require collaboration.
  </x-card>
  <x-card data-title="Group Chat" data-icon="lucide:messages-square" data-href="/examples/workflow-group-chat">
    Simulate a multi-agent discussion where agents can interact and build upon each other's messages.
  </x-card>
  <x-card data-title="Code Execution" data-icon="lucide:code-2" data-href="/examples/workflow-code-execution">
    Safely execute dynamically generated code within an AI-driven workflow.
  </x-card>
</x-cards>

### MCP and Integrations

<x-cards data-columns="3">
  <x-card data-title="MCP Server" data-icon="lucide:server" data-href="/examples/mcp-server">
    Run AIGNE agents as a Model Context Protocol (MCP) server to expose their skills.
  </x-card>
  <x-card data-title="MCP Blocklet" data-icon="lucide:box" data-href="/examples/mcp-blocklet">
    Integrate with a Blocklet and expose its functionalities as MCP skills.
  </x-card>
  <x-card data-title="MCP GitHub" data-icon="lucide:github" data-href="/examples/mcp-github">
    Interact with GitHub repositories using an agent connected to the GitHub MCP Server.
  </x-card>
  <x-card data-title="MCP Puppeteer" data-icon="lucide:mouse-pointer-2" data-href="/examples/mcp-puppeteer">
    Leverage Puppeteer for automated web scraping and browser interaction.
  </x-card>
  <x-card data-title="MCP SQLite" data-icon="lucide:database" data-href="/examples/mcp-sqlite">
    Connect to an SQLite database to perform smart database operations.
  </x-card>
  <x-card data-title="DID Spaces Memory" data-icon="lucide:key-round" data-href="/examples/memory-did-spaces">
    Persist agent memory using decentralized identity and storage with DID Spaces.
  </x-card>
</x-cards>

## Debugging

To gain insight into an agent's execution, you can enable debug logs or use the AIGNE observation server.

### View Debug Logs

Set the `DEBUG` environment variable to `*` to output detailed logs, which include model calls and responses.

```sh icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

### Use the Observation Server

The `aigne observe` command starts a local web server that provides a user-friendly interface to inspect execution traces, view detailed call information, and understand your agent’s behavior. This is a powerful tool for debugging and performance tuning.

1.  **Install the AIGNE CLI:**

    ```sh icon=lucide:terminal
    npm install -g @aigne/cli
    ```

2.  **Start the observation server:**

    ```sh icon=lucide:terminal
    aigne observe
    ```

    ![A terminal showing the aigne observe command starting the server.](../../../examples/images/aigne-observe-execute.png)

3.  **View Traces:**
    After running an agent, open your browser to `http://localhost:7893` to see a list of recent executions and inspect the details of each run.

    ![The AIGNE observability interface showing a list of traces.](../../../examples/images/aigne-observe-list.png)