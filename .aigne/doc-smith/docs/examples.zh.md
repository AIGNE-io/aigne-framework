# 示例

浏览一系列实际示例，了解 AIGNE 框架的各种功能和工作流模式。本节提供可动手执行的演示，帮助您理解智能对话、MCP 协议集成、记忆机制以及复杂的 Agent 工作流。

## 快速入门

您可以使用 `npx` 直接运行任何示例，无需本地安装。这是体验 AIGNE 框架最快的方法。

### 前提条件

- 已安装 Node.js（版本 20.0 或更高）和 npm。
- 您所选的大语言模型（LLM）提供商的 API 密钥（例如 OpenAI）。

### 运行示例

在您的终端中执行以下命令来运行一个基本的聊天机器人。

1.  **设置您的 API 密钥：**
    将 `YOUR_OPENAI_API_KEY` 替换为您的实际 OpenAI API 密钥。

    ```sh icon=lucide:terminal
    export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

2.  **以单次模式运行：**
    Agent 将处理一个默认提示并退出。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

3.  **以交互模式运行：**
    使用 `--chat` 标志启动一个交互式会话，您可以与 Agent 进行对话。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-chat-bot --chat
    ```

### 使用不同的 LLM

您可以通过设置 `MODEL` 环境变量以及相应的 API 密钥来指定不同的模型。以下是几个流行提供商的配置。

| 提供商 | 环境变量 |
| :--- | :--- |
| **OpenAI** | `export MODEL=openai:gpt-4o`<br/>`export OPENAI_API_KEY=...` |
| **Anthropic** | `export MODEL=anthropic:claude-3-opus-20240229`<br/>`export ANTHROPIC_API_KEY=...` |
| **Google Gemini** | `export MODEL=gemini:gemini-1.5-flash`<br/>`export GEMINI_API_KEY=...` |
| **DeepSeek** | `export MODEL=deepseek/deepseek-chat`<br/>`export DEEPSEEK_API_KEY=...` |
| **AWS Bedrock** | `export MODEL=bedrock:anthropic.claude-3-sonnet-20240229-v1:0`<br/>`export AWS_ACCESS_KEY_ID=...`<br/>`export AWS_SECRET_ACCESS_KEY=...`<br/>`export AWS_REGION=...` |
| **Ollama** | `export MODEL=llama3`<br/>`export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"` |

## 示例库

本节提供了一系列精选示例，每个示例都展示了 AIGNE 框架中的特定功能或工作流模式。点击任意卡片即可跳转至该示例的详细指南。

### 核心功能

<x-cards data-columns="2">
  <x-card data-title="聊天机器人" data-icon="lucide:bot" data-href="/examples/chat-bot">
    构建一个支持单次和交互模式的基础对话 Agent。
  </x-card>
  <x-card data-title="AFS 本地文件系统" data-icon="lucide:folder-git-2" data-href="/examples/afs-local-fs">
    创建一个可以在本地文件系统上读取、写入和列出文件的聊天机器人。
  </x-card>
  <x-card data-title="记忆" data-icon="lucide:brain-circuit" data-href="/examples/memory">
    使用 FSMemory 插件实现一个具有持久记忆的 Agent。
  </x-card>
  <x-card data-title="Nano Banana" data-icon="lucide:image" data-href="/examples/nano-banana">
    演示如何创建一个具备图像生成能力的聊天机器人。
  </x-card>
</x-cards>

### 工作流模式

<x-cards data-columns="3">
  <x-card data-title="顺序执行" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    按特定顺序执行一系列 Agent，如同流水线作业。
  </x-card>
  <x-card data-title="并发执行" data-icon="lucide:git-fork" data-href="/examples/workflow-concurrency">
    同时运行多个 Agent 以并行执行任务，提高效率。
  </x-card>
  <x-card data-title="路由器" data-icon="lucide:route" data-href="/examples/workflow-router">
    创建一个管理者 Agent，智能地将任务分配给相应的专业 Agent。
  </x-card>
  <x-card data-title="交接" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    实现无缝过渡，一个 Agent 将其输出传递给另一个 Agent 进行后续处理。
  </x-card>
  <x-card data-title="反思" data-icon="lucide:refresh-ccw" data-href="/examples/workflow-reflection">
    构建能够审查和完善自身输出的 Agent，以实现自我修正和改进。
  </x-card>
  <x-card data-title="编排" data-icon="lucide:users" data-href="/examples/workflow-orchestration">
    协调多个 Agent 解决需要协作的复杂问题。
  </x-card>
  <x-card data-title="群聊" data-icon="lucide:messages-square" data-href="/examples/workflow-group-chat">
    模拟多 Agent 讨论，Agent 之间可以互动并基于彼此的消息进行构建。
  </x-card>
  <x-card data-title="代码执行" data-icon="lucide:code-2" data-href="/examples/workflow-code-execution">
    在 AI 驱动的工作流中安全地执行动态生成的代码。
  </x-card>
</x-cards>

### MCP 与集成

<x-cards data-columns="3">
  <x-card data-title="MCP 服务器" data-icon="lucide:server" data-href="/examples/mcp-server">
    将 AIGNE Agent 作为模型上下文协议（MCP）服务器运行，以暴露其技能。
  </x-card>
  <x-card data-title="MCP Blocklet" data-icon="lucide:box" data-href="/examples/mcp-blocklet">
    与 Blocklet 集成，并将其功能作为 MCP 技能暴露。
  </x-card>
  <x-card data-title="MCP GitHub" data-icon="lucide:github" data-href="/examples/mcp-github">
    通过连接到 GitHub MCP 服务器的 Agent 与 GitHub 仓库进行交互。
  </x-card>
  <x-card data-title="MCP Puppeteer" data-icon="lucide:mouse-pointer-2" data-href="/examples/mcp-puppeteer">
    利用 Puppeteer 进行自动化网页抓取和浏览器交互。
  </x-card>
  <x-card data-title="MCP SQLite" data-icon="lucide:database" data-href="/examples/mcp-sqlite">
    连接到 SQLite 数据库以执行智能数据库操作。
  </x-card>
  <x-card data-title="DID Spaces 记忆" data-icon="lucide:key-round" data-href="/examples/memory-did-spaces">
    使用去中心化身份和存储（DID Spaces）持久化 Agent 的记忆。
  </x-card>
</x-cards>

## 调试

要深入了解 Agent 的执行情况，您可以启用调试日志或使用 AIGNE 观测服务器。

### 查看调试日志

将 `DEBUG` 环境变量设置为 `*` 以输出详细日志，其中包括模型调用和响应。

```sh icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

### 使用观测服务器

`aigne observe` 命令会启动一个本地 Web 服务器，提供一个用户友好的界面来检查执行跟踪、查看详细的调用信息并了解您的 Agent 的行为。这是调试和性能调优的强大工具。

1.  **安装 AIGNE CLI：**

    ```sh icon=lucide:terminal
    npm install -g @aigne/cli
    ```

2.  **启动观测服务器：**

    ```sh icon=lucide:terminal
    aigne observe
    ```

    ![显示 aigne observe 命令启动服务器的终端。](../../../examples/images/aigne-observe-execute.png)

3.  **查看跟踪记录：**
    运行 Agent 后，在浏览器中打开 `http://localhost:7893`，即可查看最近的执行列表并检查每次运行的详细信息。

    ![显示跟踪记录列表的 AIGNE 可观测性界面。](../../../examples/images/aigne-observe-list.png)