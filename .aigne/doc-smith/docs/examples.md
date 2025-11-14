# Examples

Ready to see the AIGNE Framework in action? This section provides a comprehensive collection of practical examples that demonstrate various features and workflow patterns. Skip the complex setup and dive straight into running functional agents with one-click commands.

## Overview

The AIGNE Framework examples offer hands-on demonstrations for a range of applications, from intelligent chatbots to complex, multi-agent workflows. Each example is a self-contained, executable demo designed to illustrate a specific capability of the framework. You can explore topics such as Model Context Protocol (MCP) integration, memory persistence, concurrent and sequential task processing, and dynamic code execution.

For detailed information on a specific feature or workflow, please refer to the corresponding example document:

<x-cards data-columns="3">
  <x-card data-title="Chatbot" data-icon="lucide:bot" data-href="/examples/chat-bot">Demonstrates how to create and run an agent-based chatbot.</x-card>
  <x-card data-title="AFS System FS" data-icon="lucide:folder-git-2" data-href="/examples/afs-system-fs">Shows how to build a chatbot that can interact with the local file system.</x-card>
  <x-card data-title="Memory" data-icon="lucide:database" data-href="/examples/memory">Illustrates how to create a chatbot with persistent memory.</x-card>
  <x-card data-title="MCP Server" data-icon="lucide:server" data-href="/examples/mcp-server">Shows how to run AIGNE agents as an MCP Server.</x-card>
  <x-card data-title="MCP Integrations" data-icon="lucide:plug" data-href="/examples/mcp-blocklet">Explore integrations with Blocklet, GitHub, Puppeteer, and SQLite.</x-card>
  <x-card data-title="Code Execution" data-icon="lucide:terminal" data-href="/examples/workflow-code-execution">Learn to safely execute dynamically generated code within workflows.</x-card>
  <x-card data-title="Concurrency" data-icon="lucide:git-compare-arrows" data-href="/examples/workflow-concurrency">Optimize performance by processing multiple tasks in parallel.</x-card>
  <x-card data-title="Group Chat" data-icon="lucide:messages-square" data-href="/examples/workflow-group-chat">Build environments where multiple agents can interact and share messages.</x-card>
  <x-card data-title="Sequential" data-icon="lucide:arrow-right" data-href="/examples/workflow-sequential">Build step-by-step processing pipelines with guaranteed execution order.</x-card>
</x-cards>

## Quick Start

You can run any example directly from your terminal using `npx` without needing to clone the repository or perform a local installation.

### Prerequisites

Ensure you have Node.js and npm installed on your system.

### Running an Example

To run an example, you need to set the necessary environment variables, such as an API key for a large language model provider.

1.  **Set your API key:**

    ```bash Set your OpenAI API key icon=lucide:key-round
    export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

2.  **Run the chatbot example:**

    The following command executes the basic chatbot example in one-shot mode, where it takes a default prompt and exits.

    ```bash Run in one-shot mode icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

    To have an interactive conversation with the agent, add the `--chat` flag.

    ```bash Run in interactive mode icon=lucide:terminal
    npx -y @aigne/example-chat-bot --chat
    ```

## Configuring Language Models

The examples can be configured to use various large language models by setting the `MODEL` environment variable along with the corresponding API key. The `MODEL` variable follows the format `provider:model-name`.

### OpenAI

```bash OpenAI Configuration icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

### Anthropic

```bash Anthropic Configuration icon=lucide:terminal
export MODEL=anthropic:claude-3-5-sonnet-20240620
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

### Google Gemini

```bash Google Gemini Configuration icon=lucide:terminal
export MODEL=gemini:gemini-1.5-flash
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### AWS Bedrock

```bash AWS Bedrock Configuration icon=lucide:terminal
export MODEL=bedrock:anthropic.claude-3-sonnet-20240229-v1:0
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="us-east-1"
```

### DeepSeek

```bash DeepSeek Configuration icon=lucide:terminal
export MODEL=deepseek:deepseek-chat
export DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY
```

### Doubao

```bash Doubao Configuration icon=lucide:terminal
export MODEL=doubao:Doubao-pro-128k
export DOUBAO_API_KEY=YOUR_DOUBAO_API_KEY
```

### xAI (Grok)

```bash xAI Configuration icon=lucide:terminal
export MODEL=xai:grok-1.5-flash
export XAI_API_KEY=YOUR_XAI_API_KEY
```

### Ollama (Local Models)

```bash Ollama Configuration icon=lucide:terminal
export MODEL=ollama:llama3
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434"
```

### LMStudio (Local Models)

```bash LMStudio Configuration icon=lucide:terminal
export MODEL=lmstudio:local-model/llama-3.1-8b-instruct-gguf
export LM_STUDIO_DEFAULT_BASE_URL="http://localhost:1234/v1"
```

For a complete list of supported models and their configuration details, please refer to the [Models](./models-overview.md) section.

## Debugging

To gain insight into the agent's execution flow, including model calls and responses, you can enable debug logging by setting the `DEBUG` environment variable.

```bash Enable Debug Logs icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

This command will print detailed logs to your terminal, which is useful for understanding the internal operations of the agent and troubleshooting its behavior.