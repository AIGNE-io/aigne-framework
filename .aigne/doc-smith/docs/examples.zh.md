# 示例

准备好看看 AIGNE 框架的实际应用了吗？本节提供了全面的实践示例集合，展示了各种功能和工作流模式。您可以跳过复杂的设置，直接通过一键式命令运行功能齐全的 Agent。

## 概述

AIGNE 框架示例为从智能聊天机器人到复杂的多 Agent 工作流等一系列应用提供了实践演示。每个示例都是一个自包含、可执行的演示，旨在说明框架的特定功能。您可以探索诸如模型上下文协议 (MCP) 集成、内存持久化、并发和顺序任务处理以及动态代码执行等主题。

有关特定功能或工作流的详细信息，请参阅相应的示例文档：

<x-cards data-columns="3">
  <x-card data-title="聊天机器人" data-icon="lucide:bot" data-href="/examples/chat-bot">演示如何创建和运行一个基于 Agent 的聊天机器人。</x-card>
  <x-card data-title="AFS 系统 FS" data-icon="lucide:folder-git-2" data-href="/examples/afs-system-fs">展示如何构建一个能与本地文件系统交互的聊天机器人。</x-card>
  <x-card data-title="内存" data-icon="lucide:database" data-href="/examples/memory">说明如何创建一个具有持久化内存的聊天机器人。</x-card>
  <x-card data-title="MCP 服务器" data-icon="lucide:server" data-href="/examples/mcp-server">展示如何将 AIGNE Agent 作为 MCP 服务器运行。</x-card>
  <x-card data-title="MCP 集成" data-icon="lucide:plug" data-href="/examples/mcp-blocklet">探索与 Blocklet、GitHub、Puppeteer 和 SQLite 的集成。</x-card>
  <x-card data-title="代码执行" data-icon="lucide:terminal" data-href="/examples/workflow-code-execution">学习如何在工作流中安全地执行动态生成的代码。</x-card>
  <x-card data-title="并发" data-icon="lucide:git-compare-arrows" data-href="/examples/workflow-concurrency">通过并行处理多个任务来优化性能。</x-card>
  <x-card data-title="群聊" data-icon="lucide:messages-square" data-href="/examples/workflow-group-chat">构建多个 Agent 可以交互和共享消息的环境。</x-card>
  <x-card data-title="顺序" data-icon="lucide:arrow-right" data-href="/examples/workflow-sequential">构建具有保证执行顺序的逐步处理流程。</x-card>
</x-cards>

## 快速开始（无需安装）

您可以使用 `npx` 直接从终端运行任何示例，无需克隆代码仓库或进行本地安装。

### 前提条件

确保您的系统已安装 Node.js（20.0 或更高版本）和 npm。

### 运行示例

以下命令以一次性模式执行基本的聊天机器人示例，它会接收一个默认提示，提供一个响应，然后退出。

```bash 以一次性模式运行 icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

要与 Agent 进行交互式对话，请添加 `--chat` 标志。

```bash 以交互模式运行 icon=lucide:terminal
npx -y @aigne/example-chat-bot --chat
```

您也可以直接将输入通过管道传递给 Agent。

```bash 使用管道输入 icon=lucide:terminal
echo "Tell me about AIGNE Framework" | npx -y @aigne/example-chat-bot
```

## 连接到 AI 模型

运行示例需要连接到 AI 模型。如果您在没有任何先前配置的情况下运行命令，系统将提示您进行连接。

![未配置模型时的初始连接提示](../../../examples/chat-bot/run-example.png)

您有三种方式建立连接：

### 1. 连接到官方 AIGNE Hub

这是推荐给新用户的选项。AIGNE Hub 提供了无缝的连接体验，并为新用户提供免费的令牌以便立即开始使用。

-   在提示中选择第一个选项。
-   您的浏览器将打开官方 AIGNE Hub 页面。
-   按照屏幕上的说明授权 AIGNE CLI。

![授权 AIGNE CLI 连接到 AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

### 2. 连接到自托管的 AIGNE Hub

如果您的组织运行着 AIGNE Hub 的私有实例，您可以直接连接到它。

-   在提示中选择第二个选项。
-   输入您的自托管 AIGNE Hub 的 URL，并按照提示完成连接。

![输入自托管 AIGNE Hub 的 URL](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

如果您需要部署自己的 AIGNE Hub，可以从 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 进行部署。

### 3. 通过第三方模型提供商连接

您可以通过设置相应的环境变量直接连接到第三方 AI 模型提供商。退出交互式提示并为您选择的提供商配置 API 密钥。

例如，要使用 OpenAI，请设置 `OPENAI_API_KEY` 环境变量：

```bash 设置您的 OpenAI API 密钥 icon=lucide:key-round
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

设置密钥后，再次运行示例命令。

## 配置语言模型

通过设置 `MODEL` 环境变量以及相应的 API 密钥，可以将示例配置为使用各种大型语言模型。`MODEL` 变量遵循 `provider:model-name` 的格式。

### OpenAI

```bash OpenAI 配置 icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

### Anthropic

```bash Anthropic 配置 icon=lucide:terminal
export MODEL=anthropic:claude-3-5-sonnet-20240620
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

### Google Gemini

```bash Google Gemini 配置 icon=lucide:terminal
export MODEL=gemini:gemini-1.5-flash
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### AWS Bedrock

```bash AWS Bedrock 配置 icon=lucide:terminal
export MODEL=bedrock:anthropic.claude-3-sonnet-20240229-v1:0
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="us-east-1"
```

### DeepSeek

```bash DeepSeek 配置 icon=lucide:terminal
export MODEL=deepseek:deepseek-chat
export DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY
```

### Doubao

```bash 豆包配置 icon=lucide:terminal
export MODEL=doubao:Doubao-pro-128k
export DOUBAO_API_KEY=YOUR_DOUBAO_API_KEY
```

### xAI (Grok)

```bash xAI 配置 icon=lucide:terminal
export MODEL=xai:grok-1.5-flash
export XAI_API_KEY=YOUR_XAI_API_KEY
```

### Ollama (本地模型)

```bash Ollama 配置 icon=lucide:terminal
export MODEL=ollama:llama3
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434"
```

### LMStudio (本地模型)

```bash LMStudio 配置 icon=lucide:terminal
export MODEL=lmstudio:local-model/llama-3.1-8b-instruct-gguf
export LM_STUDIO_DEFAULT_BASE_URL="http://localhost:1234/v1"
```

有关支持的模型及其配置详情的完整列表，请参阅[模型概述](./models-overview.md)部分。

## 调试与观测

要深入了解 Agent 的执行流程，您可以使用两种主要方法：用于实时终端输出的调试日志，以及用于更详细、基于 Web 的分析的 AIGNE 可观测性服务器。

### 调试日志

通过设置 `DEBUG` 环境变量来启用调试日志。这会将有关模型调用、响应和其他内部操作的详细信息直接打印到您的终端。

```bash 启用调试日志 icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

### AIGNE Observe

`aigne observe` 命令会启动一个本地 Web 服务器，用于监控和分析 Agent 的执行数据。这个工具对于调试、性能调优和理解您的 Agent 如何处理信息至关重要。

1.  **安装 AIGNE CLI：**

    ```bash 安装 AIGNE CLI icon=lucide:terminal
    npm install -g @aigne/cli
    ```

2.  **启动观测服务器：**

    ```bash 启动观测服务器 icon=lucide:terminal
    aigne observe
    ```

    ![AIGNE 可观测性服务器在终端中启动](../../../examples/images/aigne-observe-execute.png)

3.  **查看追踪信息：**

    运行示例后，在浏览器中打开 `http://localhost:7893` 来检查追踪信息、查看详细的调用信息，并了解您的 Agent 的运行时行为。

    ![AIGNE Observe UI 中最近的 Agent 执行列表](../../../examples/images/aigne-observe-list.png)