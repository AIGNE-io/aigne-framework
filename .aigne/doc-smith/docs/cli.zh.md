# 命令行界面 (CLI)

AIGNE 命令行界面 (CLI) 是您创建、运行和管理 AI Agent 的指挥中心。作为 AIGNE 框架的官方命令行工具，`@aigne/cli` 旨在简化从初始设置到部署的整个开发生命周期。

无论您是创建新项目、测试 Agent 的技能，还是将其作为服务提供，CLI 都提供了一套直观的命令来简化流程。

![AIGNE CLI](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli.png)

## 主要特性

AIGNE CLI 包含了丰富的功能，旨在使 Agent 开发更快、更高效。

<x-cards data-columns="3">
  <x-card data-title="项目创建" data-icon="lucide:folder-plus">
    使用预定义的文件结构和配置快速搭建新的 AIGNE 项目，让您能够立即开始构建。
  </x-card>
  <x-card data-title="Agent 运行器" data-icon="lucide:play-circle">
    在本地聊天环境中轻松运行您的 AIGNE Agent 并与之交互，以测试其响应和行为。
  </x-card>
  <x-card data-title="测试支持" data-icon="lucide:beaker">
    使用内置的测试命令运行单元测试和集成测试，确保您的 Agent 技能按预期工作。
  </x-card>
  <x-card data-title="MCP 服务" data-icon="lucide:server">
    将您的 Agent 作为模型上下文协议 (MCP) 服务器启动，使其能够与外部系统和应用程序集成。
  </x-card>
  <x-card data-title="交互式界面" data-icon="lucide:terminal">
    享受用户友好的命令行体验，清晰的提示和反馈将引导您完成每一步。
  </x-card>
  <x-card data-title="多模型支持" data-icon="lucide:brain-circuit">
    将您的 Agent 连接到来自 OpenAI、Anthropic (Claude)、xAI 等提供商的各种 AI 模型。
  </x-card>
</x-cards>

## 安装

首先，请使用您偏好的包管理器在您的系统上全局安装 CLI。

### npm

```bash npm install icon=logos:npm
npm install -g @aigne/cli
```

### yarn

```bash yarn add icon=logos:yarn
yarn global add @aigne/cli
```

### pnpm

```bash pnpm add icon=logos:pnpm
pnpm add -g @aigne/cli
```

## 您可以做什么

CLI 提供了一套命令来管理 Agent 的整个生命周期。要快速了解其功能，请参阅 [概述](./cli-overview.md) 或深入研究详细的 [命令参考](./cli-command-reference.md)。

<x-cards>
  <x-card data-title="快速入门" data-icon="lucide:rocket" data-href="/cli/getting-started">
    按照分步指南安装 CLI、创建您的第一个项目，并在五分钟内运行一个 Agent。
  </x-card>
  <x-card data-title="命令参考" data-icon="lucide:book-open" data-href="/cli/command-reference">
    浏览所有可用命令的完整参考，包括 `create`、`run`、`test`、`deploy` 等。
  </x-card>
</x-cards>

## 后续步骤

准备好构建您的第一个 Agent 了吗？请前往 **快速入门** 指南开始吧。

<x-card data-title="开始使用 CLI" data-icon="lucide:arrow-right-circle" data-href="/cli/getting-started" data-cta="开始教程">
  一份分步指南，帮助您在几分钟内完成从安装到运行第一个 AI Agent 的全过程。
</x-card>