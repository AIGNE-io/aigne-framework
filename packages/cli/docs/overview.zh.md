---
labels: ["Reference"]
---

# 概述

`@aigne/cli` 是 AIGNE 框架的官方命令行工具，旨在成为你的 agent 开发指挥中心。它提供了一套全面的命令，以简化创建、测试、运行和部署 AI agent 的整个生命周期，让你能够专注于构建智能应用程序。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-cli.png" alt="AIGNE CLI 运行示意" />
</picture>

## 为何选择 @aigne/cli?

开发 AI agent 不仅仅是编写代码。你需要管理项目结构、处理依赖关系、运行本地测试、为集成提供 agent 服务以及将其部署到生产环境。`@aigne/cli` 为这些任务提供了一个标准化且高效的工作流，它抽象了繁琐的样板代码，让你能够专注于 agent 的逻辑和行为。

## 主要特性

<x-cards data-columns="3">
  <x-card data-title="项目脚手架" data-icon="lucide:folder-plus">
    使用 `aigne create` 命令，通过预定义的文件结构和配置快速创建新的 AIGNE 项目。
  </x-card>
  <x-card data-title="本地 Agent 执行" data-icon="lucide:play-circle">
    通过 `aigne run` 命令，在本地聊天循环中轻松运行你的 agent 并与之交互，以进行快速测试和调试。
  </x-card>
  <x-card data-title="集成测试" data-icon="lucide:beaker">
    使用内置的 `aigne test` 命令为你的 agent 和技能运行单元测试和集成测试，以确保代码质量。
  </x-card>
  <x-card data-title="MCP 服务器" data-icon="lucide:server">
    将 agent 作为模型上下文协议 (MCP) 服务器启动，使其能够与外部系统和 UI 集成。
  </x-card>
  <x-card data-title="开发可观测性" data-icon="lucide:area-chart">
    使用 `aigne observe` 启动本地服务器，以查看、检查和分析 agent 执行追踪和数据流。
  </x-card>
  <x-card data-title="多模型支持" data-icon="lucide:boxes">
    连接并使用包括 OpenAI、Claude、XAI 等在内的各种模型提供商，以实现最大的灵活性。
  </x-card>
</x-cards>

## 它如何融入你的工作流

`@aigne/cli` 是你与 AIGNE 框架之间的主要接口，负责协调你的 agent 应用程序的各个组件。

```d2
direction: down

Developer: {
  shape: person
}

CLI: {
  label: "@aigne/cli"
  shape: package
  grid-columns: 3

  create: "aigne create"
  run: "aigne run"
  test: "aigne test"
  serve-mcp: "aigne serve-mcp"
  observe: "aigne observe"
}

AIGNE-Project: {
  label: "AIGNE 项目"
  shape: rectangle
  grid-columns: 2

  config: {
    label: "aigne.yaml"
    shape: document
  }
  code: {
    label: "Agent 与技能"
    shape: document
  }
}

External-Systems: {
  label: "外部系统"
  shape: package
  grid-columns: 2
  
  LLM-Providers: {
    label: "LLM 提供商\n(OpenAI, Claude 等)"
    shape: cylinder
  }
  
  MCP-Clients: {
    label: "MCP 客户端\n(外部 UI)"
    shape: rectangle
  }
}

Observability-UI: {
  label: "可观测性 UI"
  shape: rectangle
}

Developer -> CLI: "执行命令"

CLI.create -> AIGNE-Project: "构建"
CLI.run -> AIGNE-Project: "执行"
CLI.test -> AIGNE-Project: "测试"
CLI.serve-mcp -> AIGNE-Project: "提供服务"
CLI.observe -> Observability-UI: "启动"

AIGNE-Project -> LLM-Providers: "通过 API 交互"
AIGNE-Project <-> MCP-Clients: "通过 MCP 连接"
AIGNE-Project -> Observability-UI: "发送追踪信息"
```

该工作流实现了一个结构化的开发流程：CLI 负责处理操作任务，项目包含你的独特逻辑，而外部系统则提供必要的 AI 功能和用户界面。

## 后续步骤

准备好构建你的第一个 agent 了吗？请前往[入门指南](./getting-started.md)安装 CLI 并创建你的第一个 AIGNE 项目。