# 快速入门

本指南将引导你逐步完成安装 `@aigne/cli`、从模板创建新项目以及运行你的第一个 AI agent 的全过程。

## 1. 安装 CLI

首先，在你的系统上全局安装 AIGNE 命令行工具。你可以使用 npm、yarn 或 pnpm。

#### 使用 npm
```bash
npm install -g @aigne/cli
```

#### 使用 yarn
```bash
yarn global add @aigne/cli
```

#### 使用 pnpm
```bash
pnpm add -g @aigne/cli
```

## 2. 创建你的第一个项目

CLI 安装完成后，你可以搭建一个新的 AIGNE 项目。`create` 命令会创建一个包含默认文件结构和配置的目录。

```bash
aigne create my-aigne-project
```

CLI 将启动一个交互式提示，要求你确认项目名称并选择模板。默认模板包含一个预配置的聊天 agent 和一个 JavaScript 沙箱技能。

完成后，系统将创建一个名为 `my-aigne-project` 的新目录。

## 3. 配置你的环境

在运行 agent 之前，你必须为语言模型提供一个 API 密钥。默认项目使用 OpenAI 的 `gpt-4o-mini`。

首先，进入你的新项目目录：

```bash
cd my-aigne-project
```

接下来，通过复制所提供的示例文件来创建一个本地环境文件：

```bash
# 在 macOS 或 Linux 上
cp .env.local.example .env.local

# 在 Windows 上
copy .env.local.example .env.local
```

打开新建的 `.env.local` 文件并添加你的 OpenAI API 密钥：

```shell
# .env.local

# OpenAI
MODEL="openai:gpt-4o-mini"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

## 4. 运行 Agent

你的项目现已配置完毕，可以运行了。在项目目录中，执行 `run` 命令以启动与你的 agent 的交互式聊天会话。

```bash
aigne run
```

现在你可以在终端中直接与你的 agent 互动了。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-cli.png" alt="AIGNE CLI 正在运行聊天会话" />
</picture>

## 后续步骤

你已经成功设置了你的第一个 AIGNE 项目。要了解更多关于项目结构、配置文件以及 agents 和技能如何工作的信息，请继续阅读 [核心概念](./core-concepts.md) 部分。