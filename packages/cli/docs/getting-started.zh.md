---
labels: ["Reference"]
---

# 快速入门

本指南将引导你完成启动和运行 `@aigne/cli` 的基本步骤。你将学习如何安装命令行工具、从模板创建一个新的 Agent 项目，并在本地交互式聊天会话中运行它。

### 开发工作流

开始一个新的 AIGNE 项目的典型工作流包括四个主要步骤：安装 CLI、创建项目、配置环境以及运行 Agent。

```d2
direction: down

User-Terminal: {
  label: "用户终端"
  shape: rectangle
}

AIGNE-Agent: {
  label: "交互式 Agent 会话"
  shape: rectangle
}

Installation: {
  label: "1. 安装 CLI\n`npm install -g @aigne/cli`"
  shape: step
}

Project-Creation: {
  label: "2. 创建项目\n`aigne create my-first-agent`"
  shape: step
}

Configuration: {
  label: "3. 配置 API 密钥\n`cd my-first-agent`\n`cp .env.local.example .env.local`"
  shape: step
}

Execution: {
  label: "4. 运行 Agent\n`aigne run --chat`"
  shape: step
}


User-Terminal -> Installation: "执行"
Installation -> Project-Creation: "执行"
Project-Creation -> Configuration: "执行"
Configuration -> Execution: "执行"
Execution -> AIGNE-Agent: "启动"
```

## 1. 安装 AIGNE CLI

首先，你需要使用你偏好的包管理器全局安装 `@aigne/cli` 包。这会使 `aigne` 命令在你的终端中可用。

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

安装 CLI 后，使用 `aigne create` 命令创建一个新的 AIGNE 项目。该命令会搭建一个具有默认文件结构和配置的新项目。

```bash
aigne create my-first-agent
```

CLI 将引导你完成一个交互式过程，询问项目名称（如果未提供）和要使用的模板。现在，你可以接受默认选项。

![AIGNE CLI 提示输入项目名称](../assets/create/create-project-interactive-project-name-prompt.png)

成功创建后，你将看到一条确认消息，其中包含后续操作的说明。

![项目创建成功的消息](../assets/create/create-project-using-default-template-success-message.png)

## 3. 配置你的 API 密钥

在运行 Agent 之前，你需要为 AI 模型提供商提供一个 API 密钥。默认模板配置为使用 OpenAI。

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

配置完成后，你就可以运行你的 Agent 了。要启动交互式会话，请在你的项目目录中执行带有 `--chat` 标志的 `aigne run` 命令。

```bash
aigne run --chat
```

此命令会与项目中定义的默认 Agent 启动一个聊天循环，允许你直接在终端中与其交互。

![AIGNE CLI 在聊天模式下运行默认 Agent](../assets/run/run-default-template-project-in-chat-mode.png)

## 后续步骤

你已经成功安装了 AIGNE CLI，创建了一个新项目，并运行了你的第一个 Agent。要了解你刚刚创建的项目的结构以及如何定义 Agent 和技能，请前往[核心概念](./core-concepts.md)部分。
