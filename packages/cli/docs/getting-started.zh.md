---
labels: ["Reference"]
---

# 快速入门

本指南将引导您完成安装 AIGNE CLI、创建新项目以及运行您的第一个 AI agent 的基本步骤。完成本指南后，您将拥有一个在本地运行的 agent。

## 第 1 步：安装 AIGNE CLI

首先，您需要在系统上全局安装 `@aigne/cli` 包。您可以使用您偏好的 JavaScript 包管理器。

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

## 第 2 步：创建新项目

CLI 安装完成后，您可以使用 `aigne create` 命令创建一个新的 AIGNE 项目。该命令会使用默认的 agent 模板搭建一个新目录，其中包含所有必需的配置文件。

```bash
aigne create my-first-agent
```

随后，CLI 将引导您完成一个交互式设置过程。系统将提示您确认项目名称并选择一个模板。在本指南中，您可以按 Enter 键接受默认选项。

![交互式项目创建提示](../assets/create/create-project-interactive-project-name-prompt.png)

该过程完成后，您将看到一条成功消息，其中包含有关如何开始使用您的新 agent 的说明。

![项目创建成功消息](../assets/create/create-project-using-default-template-success-message.png)

## 第 3 步：设置环境变量

在运行 agent 之前，您需要配置 AI 模型提供商的 API 密钥。

首先，进入您新创建的项目目录：
```bash
cd my-first-agent
```

项目模板包含一个名为 `.env.local.example` 的示例环境文件。将其复制到一个名为 `.env.local` 的新文件中，以创建您的本地配置。
```bash
cp .env.local.example .env.local
```

现在，在编辑器中打开 `.env.local` 文件。您需要添加您的 OpenAI API 密钥。默认模板已预先配置为使用 OpenAI。

```shell .env.local icon=mdi:file-document-edit-outline
# OpenAI
MODEL="openai:gpt-4o-mini"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

将 `"YOUR_OPENAI_API_KEY"` 替换为您的实际密钥。

## 第 4 步：运行您的 Agent

配置完成后，您现在可以运行您的 agent。在您的项目目录中执行 `aigne run` 命令。

```bash
aigne run
```

此命令会与您项目中定义的默认 agent 启动一个交互式聊天会话。您现在可以直接在终端中发送消息并与您的 AI agent 互动。

![在聊天模式下运行默认 agent](../assets/run/run-default-template-project-in-chat-mode.png)

## 后续步骤

恭喜！您已成功安装 AIGNE CLI、创建项目并运行了您的第一个 agent。

要了解您刚刚创建的文件以及 AIGNE 项目的结构，请前往[核心概念](./core-concepts.md)部分。
