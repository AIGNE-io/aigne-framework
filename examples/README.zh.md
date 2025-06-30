<p align="center">
  <img src="../logo.svg" alt="AIGNE Logo" width="400"/>
</p>

<p align="center">
  🇬🇧 <a href="./README.md">English</a> | 🇨🇳 <a href="./README.zh.md">中文</a>
</p>

## AIGNE Framework Examples

本目录收录了 AIGNE Framework 的典型应用示例，涵盖智能对话、MCP 协议集成、记忆机制、代码执行、并发/顺序/分流/编排等多种场景。每个子目录为独立 demo，均配有详细说明，支持一键运行和多种自定义参数。

#### 示例列表

- [@aigne/example-chat-bot：基础聊天机器人](./chat-bot/README.md)
- [@aigne/example-memory：带记忆的聊天机器人](./memory/README.md)
- [@aigne/example-mcp-blocklet：与 Blocklet 平台集成](./mcp-blocklet/README.md)
- [@aigne/example-mcp-github：与 GitHub 集成](./mcp-github/README.md)
- [@aigne/example-mcp-puppeteer：网页内容提取](./mcp-puppeteer/README.md)
- [@aigne/example-mcp-sqlite：数据库智能交互](./mcp-sqlite/README.md)
- [@aigne/example-workflow-code-execution：代码执行](./workflow-code-execution/README.md)
- [@aigne/example-workflow-concurrency：并发](./workflow-concurrency/README.md)
- [@aigne/example-workflow-sequential：管道](./workflow-sequential/README.md)
- [@aigne/example-workflow-group-chat：群聊](./workflow-group-chat/README.md)
- [@aigne/example-workflow-handoff：任务交接](./workflow-handoff/README.md)
- [@aigne/example-workflow-orchestrator：智能编排](./workflow-orchestrator/README.md)
- [@aigne/example-workflow-reflection：反思](./workflow-reflection/README.md)
- [@aigne/example-workflow-router：路由](./workflow-router/README.md)

## 快速体验（无需安装）

1. 确保你已安装 Node.js 和 npm
2. 设置必要的环境变量，如 OpenAI API 密钥等
3. 通过 `npx` 运行示例

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # 设置你的 OpenAI API 密钥

# One-shot 模式运行
npx -y @aigne/example-chat-bot

# 或者加入 `--chat` 参数进入交互式聊天模式
npx -y @aigne/example-chat-bot --chat
```

### 使用不同的大语言模型

使用 OpenAI 模型

```bash
export MODEL=openai:gpt-4.1 # 设置模型为 OpenAI 的 gpt-4.1
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # 设置你的 OpenAI API 密钥
```

使用 Anthropic claude 模型

```bash
export MODEL=anthropic:claude-3-7-sonnet-latest # 设置模型为 Anthropic 的最新版本
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY # 设置你的 Anthropic API 密钥
```

使用 Bedrock nova 模型

```bash
export MODEL=bedrock:us.amazon.nova-premier-v1:0 # 设置模型为 AWS Bedrock 的 Nova Premier
export AWS_ACCESS_KEY_ID="" # 设置 AWS 访问密钥 ID
export AWS_SECRET_ACCESS_KEY="" # 设置 AWS 凭证
export AWS_REGION="" # 设置 AWS 区域，如 us-west-2
```

### 输出调试日志

通过设置 `DEBUG` 环境变量，可以输出调试日志，帮助你了解模型的调用和响应细节。

```bash
DEBUG=* npx -y @aigne/example-chat-bot --chat
```
