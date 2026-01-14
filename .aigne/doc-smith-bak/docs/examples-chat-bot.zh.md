# 聊天机器人

本指南全面介绍了基于 Agent 的聊天机器人示例。您将学习如何在不同模式下运行聊天机器人，将其连接到各种 AI 模型提供商，并使用 AIGNE 可观测性工具来调试其执行过程。本示例旨在开箱即用，让您无需任何本地安装即可开始使用。

## 概述

本示例演示了如何使用 AIGNE 框架创建并运行一个简单而强大的基于 Agent 的聊天机器人。它支持两种主要操作模式：
*   **单次模式**：聊天机器人接收单个输入，提供一个响应，然后退出。
*   **交互模式**：聊天机器人进行持续对话，直到您决定结束会话。

可以将聊天机器人配置为使用不同的 AI 模型，并可直接从命令行或通过管道接收输入。

## 先决条件

在运行此示例之前，请确保您的系统上已安装以下软件：

*   [Node.js](https://nodejs.org)（20.0 或更高版本）
*   一个 [OpenAI API 密钥](https://platform.openai.com/api-keys)或对 AIGNE Hub 的访问权限，以便与模型进行交互。

## 快速入门

您可以使用 `npx` 直接运行此示例，而无需克隆代码仓库或在本地安装任何依赖项。

### 运行示例

在您的终端中执行以下命令来运行聊天机器人。

以默认的单次模式运行：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

使用 `--interactive` 标志以交互式聊天模式运行：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-chat-bot --interactive
```

使用管道输入直接提供提示：
```bash npx command icon=lucide:terminal
echo "Tell me about AIGNE Framework" | npx -y @aigne/example-chat-bot
```

### 连接到 AI 模型

首次运行该示例时，由于未配置 API 密钥，它会提示您连接到 AI 模型服务。下图说明了可用的连接选项：

```d2
direction: down

Chatbot-Example: {
  label: "聊天机器人示例\n(@aigne/example-chat-bot)"
  shape: rectangle
}

Connection-Options: {
  label: "连接选项"
  shape: rectangle
  style: {
    stroke-dash: 4
  }

  Official-AIGNE-Hub: {
    label: "1. 官方 AIGNE Hub\n(推荐)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Self-Hosted-Hub: {
    label: "2. 自托管的 AIGNE Hub"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Third-Party-Provider: {
    label: "3. 第三方提供商\n(例如 OpenAI)"
    shape: rectangle
  }
}

Blocklet-Store: {
  label: "Blocklet Store"
  icon: "https://store.blocklet.dev/assets/z8ia29UsENBg6tLZUKi2HABj38Cw1LmHZocbQ/logo.png"
}

Chatbot-Example -> Connection-Options: "提示用户连接到 AI 模型"
Connection-Options.Self-Hosted-Hub -> Blocklet-Store: "从此处安装"
```

![连接 AI 模型的初始设置提示。](../../../examples/chat-bot/run-example.png)

您有以下几个选项可以继续：

#### 1. 连接到官方 AIGNE Hub（推荐）

这是最简单的入门方式。
1.  选择第一个选项：`Connect to the Arcblock official AIGNE Hub`。
2.  您的网络浏览器将打开一个页面，以授权 AIGNE CLI。
3.  按照屏幕上的说明批准连接。新用户会获得免费的令牌赠款以使用该服务。

![授权 AIGNE CLI 连接到 AIGNE Hub。](../../../examples/images/connect-to-aigne-hub.png)

#### 2. 连接到自托管的 AIGNE Hub

如果您正在运行自己的 AIGNE Hub 实例：
1.  选择第二个选项：`Connect to a self-hosted AIGNE Hub instance`。
2.  在提示时输入您自托管的 AIGNE Hub 的 URL。
3.  按照后续提示完成连接。

如果您需要设置一个自托管的 AIGNE Hub，可以从 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 安装。

![输入自托管 AIGNE Hub 的 URL。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. 通过第三方模型提供商连接

您也可以通过设置相应的环境变量，直接连接到第三方 AI 模型提供商，例如 OpenAI。例如，要使用 OpenAI，请按如下方式设置您的 API 密钥：

```bash 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

设置环境变量后，再次运行该示例。有关支持的提供商及其所需环境变量的列表，请参阅示例配置文件。

## 本地安装和使用

出于开发目的，您可能希望克隆代码仓库并在本地运行该示例。

### 1. 安装 AIGNE CLI

首先，全局安装 AIGNE 命令行界面（CLI）。

```bash 安装 AIGNE CLI icon=lucide:terminal
npm install -g @aigne/cli
```

### 2. 克隆代码仓库

克隆 `aigne-framework` 代码仓库并导航到 `chat-bot` 示例目录。

```bash 克隆代码仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
cd aigne-framework/examples/chat-bot
```

### 3. 本地运行示例

使用 `pnpm start` 命令运行聊天机器人。

以默认的单次模式运行：
```bash pnpm command icon=lucide:terminal
pnpm start
```

以交互式聊天模式运行：
```bash pnpm command icon=lucide:terminal
pnpm start --interactive
```

使用管道输入：
```bash pnpm command icon=lucide:terminal
echo "Tell me about AIGNE Framework" | pnpm start
```

## 命令行选项

聊天机器人脚本接受多个命令行参数以自定义其行为。

| 参数 | 描述 | 默认值 |
|---|---|---|
| `--interactive` | 以交互式聊天模式运行。如果省略，则以单次模式运行。 | `禁用` |
| `--model <provider[:model]>` | 指定要使用的 AI 模型。格式为 `provider[:model]`。例如：`openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度，控制随机性。 | 提供商默认值 |
| `--top-p <value>` | 设置模型生成的 top-p（核采样）值。 | 提供商默认值 |
| `--presence-penalty <value>` | 设置存在惩罚值以影响主题多样性。 | 提供商默认值 |
| `--frequency-penalty <value>` | 设置频率惩罚值以减少重复输出。 | 提供商默认值 |
| `--log-level <level>` | 设置日志记录级别。选项为 `ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接以参数形式提供输入提示。 | `无` |

## 使用 AIGNE Observe 进行调试

AIGNE 包含一个强大的本地可观测性工具，用于调试和分析 Agent 的执行过程。`aigne observe` 命令会启动一个本地 Web 服务器，提供一个用户界面来检查执行跟踪。

首先，在您的终端中启动观测服务器：

```bash aigne observe icon=lucide:terminal
aigne observe
```

![显示 aigne observe 服务器正在运行的终端输出。](../../../examples/images/aigne-observe-execute.png)

运行聊天机器人后，您可以在浏览器中打开提供的 URL（通常是 `http://localhost:7893`）以查看最近的 Agent 执行列表。该界面允许您检查每次运行的详细信息，包括输入、输出、模型调用和性能指标，这对于调试和优化非常有价值。

![显示跟踪列表的 AIGNE 可观测性界面。](../../../examples/images/aigne-observe-list.png)

## 总结

本示例为使用 AIGNE 框架构建基于 Agent 的聊天机器人提供了实用的基础。您已经学习了如何运行该示例，将其连接到各种 AI 模型，并利用内置的可观测性工具进行调试。

有关更高级的主题和示例，您可能会发现以下文档很有帮助：

<x-cards data-columns="2">
  <x-card data-title="记忆" data-icon="lucide:brain-circuit" data-href="/examples/memory">
    了解如何为您的聊天机器人添加记忆功能，以在对话中保持上下文。
  </x-card>
  <x-card data-title="AIGNE 核心概念" data-icon="lucide:book-open" data-href="/developer-guide/core-concepts">
    更深入地了解 AIGNE 框架的基本构建模块。
  </x-card>
</x-cards>
