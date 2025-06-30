<p align="center">
  <img src="../logo.svg" alt="AIGNE Logo" width="400"/>
</p>

<p align="center">
  🇬🇧 <a href="./README.md">English</a> | 🇨🇳 <a href="./README.zh.md">中文</a>
</p>


## AIGNE Framework Examples

This directory contains typical application examples of the AIGNE Framework, covering intelligent conversation, MCP protocol integration, memory mechanism, code execution, concurrency/sequential/routing/orchestration workflows, and more. Each subdirectory is an independent demo with detailed documentation, supporting one-click execution and various custom parameters.

#### Example List

- [chat-bot: Basic chatbot](./chat-bot/README.md)
- [memory: Chatbot with memory](./memory/README.md)
- [mcp-blocklet: Integration with Blocklet platform](./mcp-blocklet/README.md)
- [mcp-github: Integration with GitHub](./mcp-github/README.md)
- [mcp-puppeteer: Web content extraction](./mcp-puppeteer/README.md)
- [mcp-sqlite: Smart database interaction](./mcp-sqlite/README.md)
- [workflow-code-execution: AI code generation and execution](./workflow-code-execution/README.md)
- [workflow-concurrency: Concurrent analysis](./workflow-concurrency/README.md)
- [workflow-group-chat: Multi-agent group chat](./workflow-group-chat/README.md)
- [workflow-handoff: Multi-agent task handoff](./workflow-handoff/README.md)
- [workflow-orchestrator: Multi-agent orchestration](./workflow-orchestrator/README.md)
- [workflow-reflection: AI code review/reflection](./workflow-reflection/README.md)
- [workflow-router: Multi-agent routing](./workflow-router/README.md)
- [workflow-sequential: Sequential processing chain](./workflow-sequential/README.md)

#### General Usage

1. Set environment variables (e.g., `OPENAI_API_KEY`)
2. Enter the corresponding directory and install dependencies: `pnpm install`
3. Run the example: `pnpm start` or `npx -y @aigne/example-xxx`
4. For more parameters and usage, see each subdirectory's README

All examples support one-shot, interactive, and pipeline input modes for quick experience and secondary development.
