# 示例

本节提供了一系列实用、可直接运行的示例，用于演示 AIGNE 框架的核心功能和工作流模式。通过探索这些演示，您将具体了解如何实现智能聊天机器人、集成外部服务、管理 Agent 内存以及编排复杂的多 Agent 工作流。

这些示例被设计为自包含的，只需最少的设置即可执行，涵盖了从基本对话到高级集成的广泛应用。每个示例都可作为构建您自己的 Agent AI 应用程序的参考实现。

## 快速开始

如果您已安装 Node.js 和 npm，则可以直接运行任何示例，无需本地安装。以下步骤演示了如何使用 `npx` 运行基本的聊天机器人示例。

首先，设置必要的环境变量。大多数示例都需要一个 OpenAI API 密钥。

```bash 设置您的 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

接下来，运行示例。您可以以单次模式执行以获得单个响应，也可以以交互式聊天模式执行。

```bash 以单次模式运行 icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

要进行连续对话，请添加 `--chat` 标志。

```bash 以交互式聊天模式运行 icon=lucide:terminal
npx -y @aigne/example-chat-bot --chat
```

## 示例集合

此集合涵盖了基本概念、模型上下文协议 (MCP) 集成以及高级工作流模式。

### 核心概念

<x-cards data-columns="2">
  <x-card data-title="基本聊天机器人" data-href="/examples/chat-bot" data-icon="lucide:bot">
  演示如何创建并运行一个简单的基于 Agent 的聊天机器人。
  </x-card>
  <x-card data-title="带记忆的聊天机器人" data-href="/examples/memory" data-icon="lucide:database">
  说明如何为 Agent 添加状态化记忆以实现持久对话。
  </x-card>
</x-cards>

### MCP 与集成

<x-cards data-columns="2">
  <x-card data-title="MCP 服务器" data-href="/examples/mcp-server" data-icon="lucide:server">
  展示如何将 AIGNE 框架 Agent 作为模型上下文协议 (MCP) 服务器运行。
  </x-card>
  <x-card data-title="Blocklet 集成" data-href="/examples/mcp-blocklet" data-icon="lucide:box">
  解释如何与 Blocklet 集成并将其功能作为 MCP 技能暴露出来。
  </x-card>
  <x-card data-title="GitHub 集成" data-href="/examples/mcp-github" data-icon="lucide:github">
  一个使用 GitHub MCP 服务器与 GitHub 仓库进行交互的示例。
  </x-card>
  <x-card data-title="网页内容提取" data-href="/examples/mcp-puppeteer" data-icon="lucide:mouse-pointer-click">
  学习如何通过 AIGNE 框架利用 Puppeteer 进行自动化网页抓取。
  </x-card>
  <x-card data-title="智能数据库交互" data-href="/examples/mcp-sqlite" data-icon="lucide:database-zap">
  通过模型上下文协议连接到 SQLite，探索数据库操作。
  </x-card>
</x-cards>

### 高级工作流

<x-cards data-columns="2">
  <x-card data-title="代码执行" data-href="/examples/workflow-code-execution" data-icon="lucide:code-2">
  展示如何在 AI 驱动的工作流中安全地执行动态生成的代码。
  </x-card>
  <x-card data-title="并发处理" data-href="/examples/workflow-concurrency" data-icon="lucide:git-compare-arrows">
  通过并行执行同时处理多个任务来优化性能。
  </x-card>
  <x-card data-title="顺序管道" data-href="/examples/workflow-sequential" data-icon="lucide:git-commit-horizontal">
  构建具有保证执行顺序的逐步处理管道。
  </x-card>
  <x-card data-title="群组聊天" data-href="/examples/workflow-group-chat" data-icon="lucide:messages-square">
  展示如何在群组聊天环境中与多个 Agent 共享消息并进行交互。
  </x-card>
  <x-card data-title="任务交接" data-href="/examples/workflow-handoff" data-icon="lucide:arrow-right-left">
  在专门的 Agent 之间创建无缝过渡，以解决复杂问题。
  </x-card>
  <x-card data-title="智能编排" data-href="/examples/workflow-orchestration" data-icon="lucide:workflow">
  协调多个 Agent 在复杂的处理管道中协同工作。
  </x-card>
  <x-card data-title="反思" data-href="/examples/workflow-reflection" data-icon="lucide:rotate-cw">
  通过输出评估和精炼能力实现自我改进。
  </x-card>
  <x-card data-title="路由器" data-href="/examples/workflow-router" data-icon="lucide:git-fork">
  实现智能路由逻辑，根据内容将请求定向到适当的处理程序。
  </x-card>
</x-cards>

## 高级配置

### 使用不同的大语言模型

通过设置 `MODEL` 环境变量以及相应的 API 密钥，可以将示例配置为使用各种大语言模型。有关支持的提供商的完整列表，请参阅[模型概述](./models-overview.md)。

#### OpenAI

```bash OpenAI 配置 icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

#### Anthropic

```bash Anthropic 配置 icon=lucide:terminal
export MODEL=anthropic:claude-3-opus-20240229
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

#### Google Gemini

```bash Gemini 配置 icon=lucide:terminal
export MODEL=gemini:gemini-1.5-flash
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

#### AWS Bedrock

```bash Bedrock 配置 icon=lucide:terminal
export MODEL=bedrock:us-east-1.anthropic.claude-3-sonnet-20240229-v1:0
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_KEY"
export AWS_REGION="us-east-1"
```

#### Ollama (本地)

```bash Ollama 配置 icon=lucide:terminal
export MODEL=llama3
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"
export OLLAMA_API_KEY=ollama
```

### 输出调试日志

要深入了解 Agent 的内部操作，例如模型调用和响应，您可以通过设置 `DEBUG` 环境变量来启用调试日志记录。

```bash 启用调试日志 icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

此命令将产生详细输出，这对于故障排除和理解 Agent 的执行流程非常有用。

## 总结

这些示例为使用 AIGNE 框架进行构建提供了一个实用的起点。我们建议从[基本聊天机器人](./examples-chat-bot.md)开始，以理解基础知识，然后根据需要探索更复杂的工作流。要获得更深入的理论理解，请参阅[核心概念](./developer-guide-core-concepts.md)文档。