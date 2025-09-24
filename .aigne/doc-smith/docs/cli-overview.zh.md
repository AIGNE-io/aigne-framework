# 概述

欢迎使用 AIGNE 命令行界面 (CLI)！您可以将其视为一个个人指挥中心，用于通过 AIGNE 框架构建、测试和管理 AI agents。

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/packages/cli/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/packages/cli/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/packages/cli/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

`@aigne/cli` 是官方的命令行工具，旨在让您从创建第一个项目到部署供他人使用的整个 agent 开发过程都顺畅无阻。它简化了开发、测试和部署，让您可以专注于构建出色的 agents。

## 您能用它做什么？

CLI 提供了一套简单而强大的命令，用于管理 AI agent 的整个生命周期。以下是其主要功能的快速概览：

<x-cards data-columns="2">
  <x-card data-title="创建项目" data-icon="lucide:folder-plus">
    快速启动新的 AIGNE 项目，所有必要的文件和配置都会自动为您设置好。
  </x-card>
  <x-card data-title="运行 Agent" data-icon="lucide:play-circle">
    轻松与您的 AI agent 启动交互式聊天会话，以对其进行测试并观察其响应。
  </x-card>
  <x-card data-title="运行测试" data-icon="lucide:shield-check">
    运行自动化检查，以确保您的 agent 的技能和配置在部署前正常工作。
  </x-card>
  <x-card data-title="服务 Agent" data-icon="lucide:server">
    将您的 agent 转变为一项服务，其他应用程序可以通过 API 与之连接并进行交互。
  </x-card>
  <x-card data-title="观察与调试" data-icon="lucide:area-chart">
    启动一个本地 Web 仪表板，以可视化方式监控您的 agent 的活动，使其更易于理解和调试。
  </x-card>
  <x-card data-title="部署应用" data-icon="lucide:rocket">
    打包您的 agent 应用程序并将其发布到指定端点，使其可用于生产环境。
  </x-card>
</x-cards>

## 快速预览

CLI 在您的终端中提供了美观的交互式体验，引导您完成每一步操作。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-cli.png" alt="AIGNE CLI Interface" />
</picture>

## 主要命令

以下是您最常使用的命令：

| Command         | Description                                                |
| :-------------- | :--------------------------------------------------------- |
| `aigne create`  | 从模板创建一个新的 AIGNE 项目。               |
| `aigne run`     | 与您的 agent 开始一个交互式聊天会话。        |
| `aigne test`    | 运行自动化测试以验证您的 agent。               |
| `aigne serve-mcp` | 使您的 agent 作为服务可供其他应用使用。    |
| `aigne observe` | 启动一个本地 Web 服务器来监控和调试您的 agent。 |

## 后续步骤

这只是对 AIGNE CLI 功能的简要介绍。准备好动手实践了吗？让我们继续阅读[入门指南](./cli-getting-started.md)，安装 CLI 并创建您的第一个 agent。