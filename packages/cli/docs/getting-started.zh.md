---
labels: ["Reference"]
---

# 入门指南

本指南提供了安装 `@aigne/cli`、从模板创建新项目以及运行你的第一个 agent 的分步说明。只需几分钟，你就可以在终端中与 AI agent 进行交互。

## 1. 安装 @aigne/cli

首先，你需要使用你偏好的包管理器全局安装 AIGNE 命令行工具。这样 `aigne` 命令就会在你的系统中可用。

**使用 npm**
```bash
npm install -g @aigne/cli
```

**使用 yarn**
```bash
yarn global add @aigne/cli
```

**使用 pnpm**
```bash
pnpm add -g @aigne/cli
```

## 2. 创建你的第一个项目

安装 CLI 后，你现在可以创建一个新的 AIGNE 项目。`create` 命令会搭建一个包含基本 agent 和所有必要配置文件的项目目录。

在终端中运行以下命令：

```bash
aigne create my-first-agent
```

CLI 将引导你完成一个交互式设置过程。它会首先询问项目名称，然后提示你选择一个模板。现在，请选择 `default` 模板。

![创建项目交互式项目名称提示](../assets/create/create-project-interactive-project-name-prompt.png)

该过程完成后，你将看到一条成功消息，其中包含后续操作的说明。

![使用默认模板创建项目成功消息](../assets/create/create-project-using-default-template-success-message.png)

## 3. 配置你的环境

在运行 agent 之前，你需要为 AI 模型提供商提供一个 API 密钥。默认模板配置为使用 OpenAI。

首先，进入你新创建的项目目录：

```bash
cd my-first-agent
```

接下来，将示例环境文件复制到一个新的 `.env.local` 文件中。该文件用于存储你的密钥，并被版本控制忽略。

```bash
cp .env.local.example .env.local
```

现在，打开 `.env.local` 文件并添加你的 OpenAI API 密钥：

```shell
# .env.local

# OpenAI
MODEL="openai:gpt-4o-mini"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

将 `"YOUR_OPENAI_API_KEY"` 替换为你的实际密钥。

## 4. 运行你的 Agent

一切都已设置完毕。你可以通过在项目目录中运行 `aigne run` 命令来启动 agent。该命令会加载你的 agent 并在终端中启动一个交互式聊天会话。

```bash
aigne run
```

现在你可以开始向你的 agent 发送消息并接收响应了。

![在聊天模式下运行默认模板项目](../assets/run/run-default-template-project-in-chat-mode.png)

要结束会话，请按 `Ctrl + C`。

## 后续步骤

你已经成功安装了 AIGNE CLI、创建了一个项目并运行了你的第一个 agent。要了解其内部工作原理，包括项目结构以及 agent 和技能的定义方式，请转到下一部分。

接下来，了解 AIGNE 项目的[核心概念](./core-concepts.md)。