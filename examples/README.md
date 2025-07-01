<p align="center">
  <img src="../logo.svg" alt="AIGNE Logo" width="400"/>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh.md">中文</a>
</p>

## AIGNE Framework Examples

This directory contains typical application examples of the AIGNE Framework, covering intelligent conversation, MCP protocol integration, memory mechanism, code execution, concurrency/sequential/routing/orchestration workflows, and more. Each subdirectory is an independent demo with detailed documentation, supporting one-click execution and various custom parameters.

#### Example List

- [@aigne/example-chat-bot: Basic chatbot](./chat-bot/README.md)
- [@aigne/example-mcp-server: AIGNE CLI serve MCP service](./mcp-server/README.md)
- [@aigne/example-memory: Chatbot with memory](./memory/README.md)
- [@aigne/example-mcp-blocklet: Integration with Blocklet platform](./mcp-blocklet/README.md)
- [@aigne/example-mcp-github: Integration with GitHub](./mcp-github/README.md)
- [@aigne/example-mcp-puppeteer: Web content extraction](./mcp-puppeteer/README.md)
- [@aigne/example-mcp-sqlite: Smart database interaction](./mcp-sqlite/README.md)
- [@aigne/example-workflow-code-execution: Code execution](./workflow-code-execution/README.md)
- [@aigne/example-workflow-concurrency: Concurrency](./workflow-concurrency/README.md)
- [@aigne/example-workflow-sequential: Pipeline](./workflow-sequential/README.md)
- [@aigne/example-workflow-group-chat: Group chat](./workflow-group-chat/README.md)
- [@aigne/example-workflow-handoff: Task handoff](./workflow-handoff/README.md)
- [@aigne/example-workflow-orchestrator: Smart orchestration](./workflow-orchestrator/README.md)
- [@aigne/example-workflow-reflection: Reflection](./workflow-reflection/README.md)
- [@aigne/example-workflow-router: Router](./workflow-router/README.md)

## Quick Start (No Installation Required)

1. Make sure you have Node.js and npm installed
2. Set necessary environment variables, such as OpenAI API key
3. Run examples via `npx`

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

# Run in one-shot mode
npx -y @aigne/example-chat-bot

# Or add `--chat` parameter to enter interactive chat mode
npx -y @aigne/example-chat-bot --chat
```

### Using Different Large Language Models

Using OpenAI models

```bash
export MODEL=openai:gpt-4.1 # Set model to OpenAI's gpt-4.1
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key
```

Using Anthropic Claude models

```bash
export MODEL=anthropic:claude-3-7-sonnet-latest # Set model to Anthropic's latest version
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY # Set your Anthropic API key
```

Using Bedrock Nova models

```bash
export MODEL=bedrock:us.amazon.nova-premier-v1:0 # Set model to AWS Bedrock's Nova Premier
export AWS_ACCESS_KEY_ID="" # Set AWS access key ID
export AWS_SECRET_ACCESS_KEY="" # Set AWS credentials
export AWS_REGION="" # Set AWS region, e.g., us-west-2
```

### Output Debug Logs

By setting the `DEBUG` environment variable, you can output debug logs to help you understand the model's call and response details.

```bash
DEBUG=* npx -y @aigne/example-chat-bot --chat
```
