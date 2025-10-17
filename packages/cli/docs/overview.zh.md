---
labels: ["Reference"]
---

# 概述

<p align="center">
  <picture>
    <source srcset="../logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="../logo.svg" media="(prefers-color-scheme: light)">
    <img src="../logo.svg" alt="AIGNE 标志" width="400" />
  </picture>

  <center>您的 Agent 开发指挥中心</center>
</p>

`@aigne/cli` 是 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 的官方命令行工具，旨在简化 Agent 开发的整个生命周期。它提供了一套全面的命令，以简化项目创建、本地执行、测试和部署，使您能够轻松构建、运行和管理 AIGNE 应用程序。

## 主要功能

`@aigne/cli` 包含多种功能，可加速您的 Agent 开发工作流程。

<x-cards data-columns="3">
  <x-card data-title="项目脚手架" data-icon="lucide:folder-plus">
    使用 `aigne create` 命令，通过预定义的文件结构和配置快速创建新的 AIGNE 项目。
  </x-card>
  <x-card data-title="本地 Agent 执行" data-icon="lucide:play-circle">
    通过 `aigne run` 命令，在本地聊天循环中轻松运行您的 Agent 并与之交互，以进行快速测试和调试。
  </x-card>
  <x-card data-title="自动化测试" data-icon="lucide:beaker">
    利用内置的 `aigne test` 命令运行单元测试和集成测试，确保您的 Agent 健壮可靠。
  </x-card>
  <x-card data-title="MCP 服务器集成" data-icon="lucide:server">
    将您的 Agent 作为模型上下文协议（MCP）服务器启动，使其能够与外部系统集成。
  </x-card>
  <x-card data-title="丰富的可观测性" data-icon="lucide:bar-chart-3">
    使用 `aigne observe` 启动本地服务器，以查看和分析 Agent 执行跟踪和性能数据。
  </x-card>
  <x-card data-title="多模型支持" data-icon="lucide:bot">
    在不同的 AI 模型提供商（包括 OpenAI、Claude、XAI 等）之间无缝切换。
  </x-card>
</x-cards>

## 核心命令一览

CLI 提供了一套直观的命令来管理您的 AIGNE 项目。以下是您将使用的主要命令：

```bash Basic Commands icon=lucide:terminal
# 创建一个新的 AIGNE 项目
aigne create [path]

# 本地运行一个 Agent
aigne run --path <agent-path>

# 为您的 Agent 运行自动化测试
aigne test --path <agent-path>

# 将 Agent 作为 MCP 服务器提供服务
aigne serve-mcp --path <agent-path>

# 启动可观测性和监控服务器
aigne observe
```

该工具集构成了 AIGNE 开发体验的基础，提供了从项目启动到生产所需的一切。

---

准备好开始了吗？请遵循我们的 [入门指南](./getting-started.md) 来安装 CLI 并创建您的第一个 AIGNE Agent。
