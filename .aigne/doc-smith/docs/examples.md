# Examples

Ready to see the AIGNE Framework in action? This section provides a comprehensive collection of practical examples that demonstrate various features and workflow patterns. You can skip the complex setup and dive straight into running functional agents with one-click commands.

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

## Quick Start (No Installation Required)

You can run any example directly from your terminal using `npx` without needing to clone the repository or perform a local installation.

### Prerequisites

Ensure you have Node.js (version 20.0 or higher) and npm installed on your system.

### Running an Example

The following command executes the basic chatbot example in one-shot mode, where it takes a default prompt, provides a response, and then exits.

```bash Run in one-shot mode icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

To have an interactive conversation with the agent, add the `--chat` flag.

```bash Run in interactive mode icon=lucide:terminal
npx -y @aigne/example-chat-bot --chat
```

You can also pipe input directly to the agent.

```bash Use pipeline input icon=lucide:terminal
echo "Tell me about AIGNE Framework" | npx -y @aigne/example-chat-bot
```

## Connecting to an AI Model

Running an example requires a connection to an AI model. If you run a command without any prior configuration, you will be prompted to connect.

![Initial connection prompt when no model is configured](../../../examples/chat-bot/run-example.png)

You have three options to establish a connection:

### 1. Connect to the Official AIGNE Hub

This is the recommended option for new users. The AIGNE Hub provides a seamless connection experience and grants new users free tokens to get started immediately.

-   Select the first option in the prompt.
-   Your browser will open the official AIGNE Hub page.
-   Follow the on-screen instructions to authorize the AIGNE CLI.

![Authorize AIGNE CLI to connect to the AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

### 2. Connect to a Self-Hosted AIGNE Hub

If your organization runs a private instance of the AIGNE Hub, you can connect to it directly.

-   Select the second option in the prompt.
-   Enter the URL of your self-hosted AIGNE Hub and follow the prompts to complete the connection.

![Enter the URL for a self-hosted AIGNE Hub](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

If you need to deploy your own AIGNE Hub, you can do so from the [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ).

### 3. Connect via Third-Party Model Provider

You can connect directly to a third-party AI model provider by setting the appropriate environment variables. Exit the interactive prompt and configure the API key for your chosen provider.

For example, to use OpenAI, set the `OPENAI_API_KEY` environment variable:

```bash Set your OpenAI API key icon=lucide:key-round
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

After setting the key, run the example command again.

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

For a complete list of supported models and their configuration details, please refer to the [Models Overview](./models-overview.md) section.

## Debugging and Observation

To gain insight into an agent's execution flow, you can use two primary methods: debug logs for real-time terminal output and the AIGNE observability server for a more detailed, web-based analysis.

### Debug Logs

Enable debug logging by setting the `DEBUG` environment variable. This will print detailed information about model calls, responses, and other internal operations directly to your terminal.

```bash Enable Debug Logs icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

### AIGNE Observe

The `aigne observe` command starts a local web server to monitor and analyze agent execution data. This tool is essential for debugging, performance tuning, and understanding how your agent processes information.

1.  **Install AIGNE CLI:**

    ```bash Install AIGNE CLI icon=lucide:terminal
    npm install -g @aigne/cli
    ```

2.  **Start the observation server:**

    ```bash Start observation server icon=lucide:terminal
    aigne observe
    ```

    ![AIGNE observability server starting in the terminal](../../../examples/images/aigne-observe-execute.png)

3.  **View traces:**

    After running an example, open your browser to `http://localhost:7893` to inspect traces, view detailed call information, and understand your agent’s runtime behavior.

    ![List of recent agent executions in the AIGNE Observe UI](../../../examples/images/aigne-observe-list.png)