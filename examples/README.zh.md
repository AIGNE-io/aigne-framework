<p align="center">
  <img src="../logo.svg" alt="AIGNE Logo" width="400"/>
</p>

<p align="center">
  🇬🇧 <a href="./README.md">English</a> | 🇨🇳 <a href="./README.zh.md">中文</a>
</p>

## AIGNE Framework Examples

本目录收录了 AIGNE Framework 的典型应用示例，涵盖智能对话、MCP 协议集成、记忆机制、代码执行、并发/顺序/分流/编排等多种场景。每个子目录为独立 demo，均配有详细说明，支持一键运行和多种自定义参数。

#### 示例列表

- [chat-bot：基础聊天机器人](./chat-bot/README.md)
- [memory：带记忆的聊天机器人](./memory/README.md)
- [mcp-blocklet：与 Blocklet 平台集成](./mcp-blocklet/README.md)
- [mcp-github：与 GitHub 集成](./mcp-github/README.md)
- [mcp-puppeteer：网页内容提取](./mcp-puppeteer/README.md)
- [mcp-sqlite：数据库智能交互](./mcp-sqlite/README.md)
- [workflow-code-execution：AI 代码生成与执行](./workflow-code-execution/README.md)
- [workflow-concurrency：并发分析](./workflow-concurrency/README.md)
- [workflow-group-chat：多 agent 群聊](./workflow-group-chat/README.md)
- [workflow-handoff：多 agent 任务交接](./workflow-handoff/README.md)
- [workflow-orchestrator：多 agent 编排](./workflow-orchestrator/README.md)
- [workflow-reflection：AI 代码 review/reflection](./workflow-reflection/README.md)
- [workflow-router：多 agent 问题分流](./workflow-router/README.md)
- [workflow-sequential：顺序处理链](./workflow-sequential/README.md)

#### 通用用法

1. 配置环境变量（如 `OPENAI_API_KEY`）
2. 进入对应目录，安装依赖：`pnpm install`
3. 运行示例：`pnpm start` 或 `npx -y @aigne/example-xxx`
4. 更多参数和用法详见各子目录 README

所有示例均支持 one-shot、交互式、管道输入等多种模式，便于快速体验和二次开发。