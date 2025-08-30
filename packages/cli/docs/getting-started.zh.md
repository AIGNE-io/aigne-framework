---
labels: ["Reference"]
---

# 快速入门

本指南将引导您逐步完成 @aigne/cli 的安装与运行。您将学习如何安装该命令行工具、从模板创建一个新的 AIGNE 项目，以及运行您的第一个 agent。

## 前提条件

在开始之前，请确保您已具备以下条件：

- **Node.js**：需要一个现代版本的 Node.js。
- **API 密钥**：您需要一个受支持的 AI 模型提供商（例如 OpenAI）的 API 密钥。默认模板配置为使用 OpenAI。

## 第 1 步：安装 AIGNE CLI

首先，使用您偏好的包管理器在您的系统上全局安装 `@aigne/cli` 包。这样，您就可以在任何目录下使用 `aigne` 命令。

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

## 第 2 步：创建您的第一个项目

接下来，使用 `aigne create` 命令生成一个新项目。该命令会搭建一个包含所有入门所需配置文件的目录。

```bash
aigne create my-first-agent
```

CLI 将启动一个交互式过程，提示您确认项目名称并选择一个模板。目前，您可以选择 `default` 模板。

![交互式项目名称提示](../assets/create/create-project-interactive-project-name-prompt.png)

创建成功后，您将看到一条确认消息，其中包含后续操作的说明。

![项目创建成功消息](../assets/create/create-project-using-default-template-success-message.png)

## 第 3 步：配置环境变量

您的 agent 需要一个 API 密钥才能与 AI 模型提供商通信。项目模板为此提供了一个示例环境文件。

首先，进入您新创建的项目目录：
```bash
cd my-first-agent
```

接下来，将示例环境文件复制到一个名为 `.env.local` 的新文件中：
```bash
cp .env.local.example .env.local
```

现在，在您的编辑器中打开 `.env.local` 文件，并添加您的 OpenAI API 密钥：

```shell
# .env.local

# OpenAI
MODEL="openai:gpt-4o-mini"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY" # 在此处粘贴您的密钥
```

## 第 4 步：运行 Agent

配置好 API 密钥后，您就可以运行 agent 了。在您的项目目录中执行 `aigne run` 命令：

```bash
aigne run
```

该命令会初始化 AIGNE 框架，并在您的终端中与默认 agent 启动一个交互式聊天会话。现在，您可以开始向您的 agent 发送消息了。

![在聊天模式下运行 agent](../assets/run/run-default-template-project-in-chat-mode.png)

## 后续步骤

恭喜！您已成功安装 AIGNE CLI 并运行了您的第一个 agent。接下来，您可以：

- 浏览生成的项目文件，在 [核心概念](./core-concepts.md) 部分了解如何定义 agent 和技能。
- 在 [命令参考](./command-reference.md) 中发现所有可用的命令及其选项。
- 学习如何使用 `aigne test` 命令为您的 agent 编写测试。
