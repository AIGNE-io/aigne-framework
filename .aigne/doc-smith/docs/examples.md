# Examples

This section provides a collection of practical, ready-to-run examples demonstrating the core features and workflow patterns of the AIGNE Framework. By exploring these demonstrations, you will gain a concrete understanding of how to implement intelligent chatbots, integrate external services, manage agent memory, and orchestrate complex, multi-agent workflows.

The examples are designed to be self-contained and executable with minimal setup, covering a wide range of applications from basic conversations to advanced integrations. Each example serves as a reference implementation for building your own agentic AI applications.

## Quick Start

You can run any example directly without a local installation, provided you have Node.js and npm available. The following steps demonstrate how to run the basic chatbot example using `npx`.

First, set the necessary environment variables. For most examples, an OpenAI API key is required.

```bash Set your OpenAI API key icon=lucide:terminal
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

Next, run the example. You can execute it in a one-shot mode for a single response or in an interactive chat mode.

```bash Run in one-shot mode icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

To engage in a continuous conversation, add the `--chat` flag.

```bash Run in interactive chat mode icon=lucide:terminal
npx -y @aigne/example-chat-bot --chat
```

## Example Collection

This collection covers fundamental concepts, Model Context Protocol (MCP) integrations, and advanced workflow patterns.

### Core Concepts

<x-cards data-columns="2">
  <x-card data-title="Basic Chatbot" data-href="/examples/chat-bot" data-icon="lucide:bot">
  Demonstrates how to create and run a simple agent-based chatbot.
  </x-card>
  <x-card data-title="Chatbot with Memory" data-href="/examples/memory" data-icon="lucide:database">
  Illustrates how to add stateful memory to an agent for persistent conversations.
  </x-card>
</x-cards>

### MCP and Integrations

<x-cards data-columns="2">
  <x-card data-title="MCP Server" data-href="/examples/mcp-server" data-icon="lucide:server">
  Shows how to run AIGNE Framework agents as a Model Context Protocol (MCP) Server.
  </x-card>
  <x-card data-title="Blocklet Integration" data-href="/examples/mcp-blocklet" data-icon="lucide:box">
  Explains how to integrate with a Blocklet and expose its functionalities as MCP skills.
  </x-card>
  <x-card data-title="GitHub Integration" data-href="/examples/mcp-github" data-icon="lucide:github">
  An example of interacting with GitHub repositories using the GitHub MCP Server.
  </x-card>
  <x-card data-title="Web Content Extraction" data-href="/examples/mcp-puppeteer" data-icon="lucide:mouse-pointer-click">
  Learn how to leverage Puppeteer for automated web scraping through the AIGNE Framework.
  </x-card>
  <x-card data-title="Smart Database Interaction" data-href="/examples/mcp-sqlite" data-icon="lucide:database-zap">
  Explore database operations by connecting to SQLite through the Model Context Protocol.
  </x-card>
</x-cards>

### Advanced Workflows

<x-cards data-columns="2">
  <x-card data-title="Code Execution" data-href="/examples/workflow-code-execution" data-icon="lucide:code-2">
  Shows how to safely execute dynamically generated code within AI-driven workflows.
  </x-card>
  <x-card data-title="Concurrent Processing" data-href="/examples/workflow-concurrency" data-icon="lucide:git-compare-arrows">
  Optimize performance by processing multiple tasks simultaneously with parallel execution.
  </x-card>
  <x-card data-title="Sequential Pipeline" data-href="/examples/workflow-sequential" data-icon="lucide:git-commit-horizontal">
  Build step-by-step processing pipelines with guaranteed execution order.
  </x-card>
  <x-card data-title="Group Chat" data-href="/examples/workflow-group-chat" data-icon="lucide:messages-square">
  Shows how to share messages and interact with multiple agents in a group chat environment.
  </x-card>
  <x-card data-title="Task Handoff" data-href="/examples/workflow-handoff" data-icon="lucide:arrow-right-left">
  Create seamless transitions between specialized agents to solve complex problems.
  </x-card>
  <x-card data-title="Smart Orchestration" data-href="/examples/workflow-orchestration" data-icon="lucide:workflow">
  Coordinate multiple agents working together in sophisticated processing pipelines.
  </x-card>
  <x-card data-title="Reflection" data-href="/examples/workflow-reflection" data-icon="lucide:rotate-cw">
  Enable self-improvement through output evaluation and refinement capabilities.
  </x-card>
  <x-card data-title="Router" data-href="/examples/workflow-router" data-icon="lucide:git-fork">
  Implement intelligent routing logic to direct requests to appropriate handlers based on content.
  </x-card>
</x-cards>

## Advanced Configuration

### Using Different Large Language Models

The examples can be configured to use various large language models by setting the `MODEL` environment variable along with the corresponding API key. Refer to the [Models overview](./models-overview.md) for a complete list of supported providers.

#### OpenAI

```bash OpenAI Configuration icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

#### Anthropic

```bash Anthropic Configuration icon=lucide:terminal
export MODEL=anthropic:claude-3-opus-20240229
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

#### Google Gemini

```bash Gemini Configuration icon=lucide:terminal
export MODEL=gemini:gemini-1.5-flash
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

#### AWS Bedrock

```bash Bedrock Configuration icon=lucide:terminal
export MODEL=bedrock:us-east-1.anthropic.claude-3-sonnet-20240229-v1:0
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_KEY"
export AWS_REGION="us-east-1"
```

#### Ollama (Local)

```bash Ollama Configuration icon=lucide:terminal
export MODEL=llama3
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"
export OLLAMA_API_KEY=ollama
```

### Outputting Debug Logs

To gain insight into the internal operations of an agent, such as model calls and responses, you can enable debug logging by setting the `DEBUG` environment variable.

```bash Enable Debug Logging icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

This command will produce verbose output, which is useful for troubleshooting and understanding the agent's execution flow.

## Summary

These examples provide a practical starting point for building with the AIGNE Framework. We recommend beginning with the [Basic Chatbot](./examples-chat-bot.md) to understand the fundamentals and then exploring more complex workflows as needed. For a deeper theoretical understanding, refer to the [Core Concepts](./developer-guide-core-concepts.md) documentation.