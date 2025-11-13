本文档提供了使用 AIGNE 框架创建和运行基于 Agent 的聊天机器人的综合指南。您将学习如何无需安装即可立即执行聊天机器人，将其连接到各种 AI 模型提供商，并进行本地开发设置。该示例支持单次响应（one-shot）和连续对话（interactive）两种模式。

## 概述

本示例通过构建一个功能性的聊天机器人，展示了 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)和 [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md) 的能力。该 Agent 可以在两种主要模式下运行：

*   **单次响应模式**：聊天机器人在退出前处理单个输入并提供单个响应。这对于直接提问或命令行管道操作非常理想。
*   **交互模式**：聊天机器人进行连续对话，在用户终止会话前保持上下文。

## 前置要求

在继续之前，请确保您的环境满足以下要求：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：随 Node.js 安装。
*   **AI 模型访问权限**：需要来自 OpenAI 等提供商的 API 密钥。或者，您可以连接到 AIGNE Hub。

## 快速入门（无需安装）

您可以使用 `npx` 直接从终端运行聊天机器人示例，无需任何本地安装步骤。

### 执行聊天机器人

聊天机器人可以根据您的需求以不同模式运行。

*   **单次响应模式（默认）**：用于单个问题和回答。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

*   **交互式聊天模式**：开始连续对话。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-chat-bot --chat
    ```

*   **管道输入**：您可以在单次响应模式下将输入直接通过管道传递给聊天机器人。

    ```bash icon=lucide:terminal
    echo "Tell me about the AIGNE Framework" | npx -y @aigne/example-chat-bot
    ```

### 连接到 AI 模型

首次运行时，CLI 将提示您连接到 AI 模型服务。您有多种选择。
```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Connection-Options: {
  label: "连接选项"
  shape: rectangle
  grid-columns: 3

  AIGNE-Hub-Official: {
    label: "AIGNE Hub\n(官方)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  AIGNE-Hub-Self-Hosted: {
    label: "AIGNE Hub\n(自托管)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Third-Party-Provider: {
    label: "第三方提供商\n(例如 OpenAI)"
    shape: rectangle
  }
}

Blocklet-Store: {
  label: "Blocklet Store"
  icon: "https://store.blocklet.dev/assets/z8ia29UsENBg6tLZUKi2HABj38Cw1LmHZocbQ/logo.png"
}

User -> AIGNE-CLI: "1. 运行聊天机器人"
AIGNE-CLI -> User: "2. 提示连接 AI 模型"
User -> Connection-Options: "3. 选择一个选项"

Connection-Options.AIGNE-Hub-Official -> AIGNE-CLI: "通过浏览器认证连接"
Connection-Options.AIGNE-Hub-Self-Hosted -> AIGNE-CLI: "通过服务 URL 连接"
Connection-Options.AIGNE-Hub-Self-Hosted <- Blocklet-Store: "从此处部署"
Connection-Options.Third-Party-Provider -> AIGNE-CLI: "通过环境变量连接"
```
1.  **通过 AIGNE Hub (官方) 连接**
    这是推荐给新用户的路径。选择此选项将在您的网络浏览器中打开官方 AIGNE Hub。按照屏幕上的说明进行连接。新用户会自动获得免费的 token 余额以开始使用。

2.  **通过 AIGNE Hub (自托管) 连接**
    如果您运行自己的 AIGNE Hub 实例，请选择此选项并输入您服务的 URL 以完成连接。您可以从 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 部署一个自托管的 AIGNE Hub。

3.  **通过第三方模型提供商连接**
    您可以通过设置所需的环境变量直接连接到 OpenAI 等提供商。对于 OpenAI，请按如下方式设置您的 API 密钥：

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

    配置环境变量后，再次运行聊天机器人命令。有关其他提供商（例如 DeepSeek、Google Gemini）支持的变量列表，请参阅代码仓库中的 `.env.local.example` 文件。

## 本地安装和设置

为了进行开发或自定义，您可以克隆代码仓库并从本地计算机运行示例。

### 1. 安装 AIGNE CLI

首先，全局安装 AIGNE 命令行界面。

```bash icon=lucide:terminal
npm install -g @aigne/cli
```

### 2. 克隆代码仓库

克隆 AIGNE 框架代码仓库，并进入聊天机器人示例的目录。

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
cd aigne-framework/examples/chat-bot
```

### 3. 本地运行示例

在 `chat-bot` 目录中，使用 `pnpm` 执行启动脚本。

*   **单次响应模式（默认）**：

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **交互式聊天模式**：

    ```bash icon=lucide:terminal
    pnpm start --chat
    ```

*   **管道输入**：

    ```bash icon=lucide:terminal
    echo "Tell me about the AIGNE Framework" | pnpm start
    ```

## 命令行选项

聊天机器人脚本接受多个命令行参数以自定义其行为和配置。

| 参数 | 描述 | 默认值 |
|---|---|---|
| `--chat` | 以交互模式运行聊天机器人，进行连续对话。 | 禁用（单次响应模式） |
| `--model <provider[:model]>` | 指定要使用的 AI 模型。格式为 `provider[:model]`。例如：`openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度以控制随机性。 | 提供商默认值 |
| `--top-p <value>` | 设置用于 token 选择的 top-p（核采样）值。 | 提供商默认值 |
| `--presence-penalty <value>` | 根据新 token 在文本中是否已出现来调整其惩罚值。 | 提供商默认值 |
| `--frequency-penalty <value>` | 根据新 token 在文本中的频率来调整其惩罚值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志详细程度。可选值：`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接以参数形式提供输入查询。 | 无 |

## 调试

AIGNE 框架包含一个强大的观察工具，用于监控和分析 Agent 的执行，这对于调试和性能调优至关重要。

1.  **启动观察服务器**
    在终端中运行 `aigne observe` 命令。这将启动一个本地 Web 服务器，用于监听来自您的 Agent 的执行数据。

2.  **查看执行情况**
    在浏览器中打开 Web 界面，查看最近的 Agent 运行列表。您可以选择一个执行来检查其跟踪信息，查看详细的调用信息，并了解 Agent 如何处理信息以及与模型交互。

## 总结

本示例为使用 AIGNE 框架构建基于 Agent 的聊天机器人提供了实用的基础。您已经学会了如何以不同模式运行聊天机器人，将其连接到 AI 模型，并调试其执行过程。

有关更高级的示例和功能，您可能希望探索以下主题：

<x-cards data-columns="2">
  <x-card data-title="记忆" data-icon="lucide:brain-circuit" data-href="/examples/memory">学习如何为您的聊天机器人赋予记忆，使其能够回忆过去的互动。</x-card>
  <x-card data-title="AIGNE 文件系统 (AFS)" data-icon="lucide:folder-tree" data-href="/examples/afs-system-fs">构建一个可以与您的本地文件系统交互的聊天机器人。</x-card>
  <x-card data-title="工作流编排" data-icon="lucide:workflow" data-href="/examples/workflow-orchestration">协调多个 Agent 协同处理复杂任务。</x-card>
  <x-card data-title="核心概念" data-icon="lucide:book-open" data-href="/developer-guide/core-concepts">深入了解 AIGNE 框架的基本构建模块。</x-card>
</x-cards>