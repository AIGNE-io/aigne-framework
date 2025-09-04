---
labels: ["Reference"]
---

# 概述

`@aigne/cli` 是 AIGNE 框架的官方命令行工具，旨在成为你的 Agent 开发指挥中心。它提供了一套全面的命令，以简化创建、测试、运行和部署 AI Agent 的整个生命周期，使你能够专注于构建智能应用程序。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-cli.png" alt="AIGNE CLI 运行示意图" />
</picture>

## 为什么选择 @aigne/cli？

开发 AI Agent 不仅仅是编写代码。你需要管理项目结构、处理依赖关系、运行本地测试、为集成提供 Agent 服务以及将其部署到生产环境。`@aigne/cli` 为这些任务提供了标准化且高效的工作流程，它抽象了样板代码，让你能够专注于 Agent 的逻辑和行为。

## 主要特性

<x-cards data-columns="3">
  <x-card data-title="项目脚手架" data-icon="lucide:folder-plus">
    使用 aigne create 命令，通过预定义的文件结构和配置快速创建新的 AIGNE 项目。
  </x-card>
  <x-card data-title="本地 Agent 执行" data-icon="lucide:play-circle">
    通过 aigne run 命令，在本地聊天循环中轻松运行 Agent 并与之交互，以进行快速测试和调试。
  </x-card>
  <x-card data-title="集成测试" data-icon="lucide:beaker">
    使用内置的 aigne test 命令为你的 Agent 和技能运行单元测试和集成测试，以确保代码质量。
  </x-card>
  <x-card data-title="MCP 服务器" data-icon="lucide:server">
    将 Agent 作为模型上下文协议 (MCP) 服务器启动，使其能够与外部系统和用户界面集成。
  </x-card>
  <x-card data-title="开发可观测性" data-icon="lucide:area-chart">
    使用 aigne observe 启动本地服务器，以查看、检查和分析 Agent 执行跟踪和数据流。
  </x-card>
  <x-card data-title="多模型支持" data-icon="lucide:boxes">
    连接并使用包括 OpenAI、Claude、XAI 等在内的各种模型提供商，以实现最大的灵活性。
  </x-card>
</x-cards>

## 如何融入你的工作流

`@aigne/cli` 充当了你与 AIGNE 框架之间的主要接口，负责协调你的 Agent 应用程序的各个组件。

```d2
direction: down

"开发者": {
  shape: person
}

"CLI: @aigne/cli": {
  shape: package
}

"项目: AIGNE 项目": {
  shape: rectangle
  "Agent 与技能": { shape: document }
  "aigne.yaml": { shape: document }
}

"外部系统": {
  shape: package
  "LLM 提供商": { shape: cylinder }
  "MCP 客户端": { shape: rectangle }
}

"开发者" -> "CLI: @aigne/cli": "使用命令 (create, run, test...)"
"CLI: @aigne/cli" -> "项目: AIGNE 项目": "管理生命周期"
"项目: AIGNE 项目" -> "外部系统": "与之集成"
```

这种工作流形成了一个结构化的开发过程，其中 CLI 处理操作任务，项目包含你独特的逻辑，而外部系统则提供必要的 AI 功能和用户界面。

## 后续步骤

准备好构建你的第一个 Agent 了吗？请前往[快速入门](./getting-started.md)指南，安装 CLI 并创建你的第一个 AIGNE 项目。