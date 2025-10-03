# 开发者指南

本指南为使用 `@aigne/core` 框架的开发者提供全面的技术文档。它涵盖了从初始设置到高级概念的所有内容，使您能够构建、集成和扩展强大的 AI 驱动应用程序。

`@aigne/core` 包是 AIGNE 框架的基础组件。它提供了构建复杂的 AI 驱动应用程序所需的基本模块和工具，包括强大的 Agent 系统、AIGNE 执行环境、无缝的模型集成以及对复杂工作流模式的支持。

### 架构概述

该框架围绕一个中央 AIGNE 引擎设计，由该引擎协调 Agent 的执行。Agent 与各种 AI 模型交互，并利用内存进行状态持久化。这种模块化架构采用 TypeScript 构建，提供了全面的类型定义，以实现卓越的开发体验。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-framework-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-framework.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-framework.png" alt="AIGNE 框架架构图" />
</picture>

### 核心功能

<x-cards data-columns="2">
  <x-card data-title="支持多种 AI 模型" data-icon="lucide:puzzle">
    内置支持 OpenAI、Gemini、Claude 及其他主流 AI 模型，并采用可扩展架构以支持更多模型。
  </x-card>
  <x-card data-title="高级 Agent 系统" data-icon="lucide:bot">
    强大的抽象能力，支持多种 Agent 类型，包括 AI Agent、函数 Agent 和多 Agent 团队。
  </x-card>
  <x-card data-title="AIGNE 环境" data-icon="lucide:box">
    一个灵活的引擎，负责处理 Agent 之间的通信并协调复杂工作流的执行。
  </x-card>
  <x-card data-title="多样化的工作流模式" data-icon="lucide:git-merge">
    原生支持顺序、并发、路由等多种核心工作流模式，以构建复杂流程。
  </x-card>
</x-cards>

### 如何使用本指南

本指南分为几个关键部分，以帮助您高效地找到所需信息。我们建议您遵循以下路径，特别是当您是 AIGNE 框架的新手时。

<x-cards data-columns="2">
  <x-card data-title="快速入门" data-href="/developer-guide/getting-started" data-icon="lucide:rocket">
    安装框架，并在 30 分钟内构建您的第一个 AI Agent。
  </x-card>
  <x-card data-title="核心概念" data-href="/developer-guide/core-concepts" data-icon="lucide:brain-circuit">
    理解 AIGNE 的基本构建模块，包括引擎、Agent、模型和内存。
  </x-card>
  <x-card data-title="Agent 类型与示例" data-href="/developer-guide/agent-types-and-examples" data-icon="lucide:lightbulb">
    探索框架中不同类型的专用 Agent 的实际示例。
  </x-card>
  <x-card data-title="API 参考" data-href="/api-reference" data-icon="lucide:book-open">
    由 @aigne/core 包导出的所有公共类、函数和类型的详细参考。
  </x-card>
</x-cards>