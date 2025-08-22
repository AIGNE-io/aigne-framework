# 快速入门

本指南将引导您逐步安装 AIGNE 命令行界面 (CLI)、从模板创建新项目以及运行您的第一个 AI Agent。完成本指南后，您将在本地计算机上拥有一个可运行的、基于聊天的 Agent。

## 第 1 步：安装 AIGNE CLI

AIGNE CLI 是一个需要 Node.js 的命令行工具。您可以使用您偏好的包管理器进行全局安装。

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

安装完成后，您可以在终端中运行 `aigne --help` 进行验证，该命令将显示可用命令列表。

## 第 2 步：创建新项目

安装 CLI 后，您现在可以创建一个新的 AIGNE 项目。`create` 命令会搭建一个包含默认 Agent 和必要配置文件的项目目录。

要在名为 `my-first-agent` 的新目录中创建项目，请运行：
```bash
aigne create my-first-agent
```

或者，如果您在不带路径的情况下运行该命令，它将提示您以交互方式输入项目名称：
```bash
aigne create
```

![通过交互式提示输入项目名称来创建项目](https://docsmith.aigne.io/image-bin/uploads/61a25e0b14ee2b304cd02972e81236b2.png)

完成后，将显示一条成功消息，并创建一个具有默认项目结构的新目录。

![项目创建成功消息](https://docsmith.aigne.io/image-bin/uploads/d77c21029750a66ba316b3a91e00f9ca.png)

## 第 3 步：配置环境变量

在运行 Agent 之前，您需要为语言模型提供一个 API 密钥。默认模板配置为使用 OpenAI。

1.  进入您的新项目目录：
    ```bash
    cd my-first-agent
    ```

2.  项目中包含一个名为 `.env.local.example` 的文件。请将其复制为一个名为 `.env.local` 的新文件。

3.  在编辑器中打开 `.env.local` 并添加您的 OpenAI API 密钥：

    ```shell
    # OpenAI
    MODEL="openai:gpt-4o-mini"
    OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

## 第 4 步：运行您的 Agent

项目创建和配置完成后，您就可以启动 Agent 了。`run` 命令会在您的终端中启动一个交互式聊天循环，让您可以与您的 Agent 对话。

在 `my-first-agent` 目录中，执行：

```bash
aigne run --chat
```

CLI 将初始化 Agent 并向您显示一个聊天提示。现在您可以直接与您的 Agent 互动了。

![在聊天模式下运行默认项目](https://docsmith.aigne.io/image-bin/uploads/6d8b90c443540b0fdb3c00211448a47f.png)

## 后续步骤

您已成功安装 AIGNE CLI、创建项目并运行了您的第一个 Agent。要了解项目结构以及如何自定义您的 Agent，请继续阅读 [核心概念](./core-concepts.md) 部分。