---
labels: ["Reference"]
---

# 快速入门

本指南将引导你完成 `@aigne/cli` 的必要步骤，助你快速上手。你将学习如何安装该命令行工具、从模板创建一个新的 Agent 项目，并在本地交互式聊天会话中运行它。

## 1. 安装 AIGNE CLI

首先，你需要使用你偏好的包管理器全局安装 `@aigne/cli` 包。这会让 `aigne` 命令在你的终端中可用。

### 使用 npm

```bash
npm install -g @aigne/cli
```

### 使用 yarn

```bash
yarn global add @aigne/cli
```

### 使用 pnpm

```bash
pnpm add -g @aigne/cli
```

## 2. 创建你的第一个项目

CLI 安装完成后，使用 `aigne create` 命令创建一个新的 AIGNE 项目。该命令会为你搭建一个包含默认文件结构和配置的新项目。

```bash
aigne create my-first-agent
```

CLI 将通过一个交互式流程引导你，询问项目名称（如果尚未提供）和要使用的模板。现在，你可以直接接受默认选项。

![AIGNE CLI 提示输入项目名称](../assets/create/create-project-interactive-project-name-prompt.png)

创建成功后，你将看到一条确认消息，其中包含后续操作的说明。

![项目创建成功的消息](../assets/create/create-project-using-default-template-success-message.png)

## 3. 配置你的 API 密钥

在运行 Agent 之前，你需要为 AI 模型提供商提供一个 API 密钥。默认模板已配置为使用 OpenAI。

首先，进入你新创建的项目目录：

```bash
cd my-first-agent
```

接下来，将示例环境文件复制为新的 `.env.local` 文件。该文件用于存储你的私密密钥，并会被版本控制系统忽略。

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

配置完成后，你就可以运行你的 Agent 了。若要启动一个交互式会话，请在项目目录中执行带有 `--chat` 标志的 `aigne run` 命令。

```bash
aigne run --chat
```

此命令会与项目中定义的默认 Agent 启动一个聊天循环，让你可以在终端中直接与其交互。

![AIGNE CLI 在聊天模式下运行默认 Agent](../assets/run/run-default-template-project-in-chat-mode.png)

## 后续步骤

你已经成功安装了 AIGNE CLI、创建了新项目并运行了你的第一个 Agent。要了解你刚创建的项目的结构以及 Agent 和技能的定义方式，请前往[核心概念](./core-concepts.md)部分。