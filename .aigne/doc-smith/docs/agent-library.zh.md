# Agent 库

Agent 库提供了一系列预构建、可重用的 Agent，旨在加速复杂 AI 应用程序的开发。通过集成这些现成的组件，您可以轻松编排复杂的 工作流、管理并发任务，并自动化多步骤流程，而无需从头构建一切。

## 简介

`@aigne/agent-library` 是 AIGNE 框架的官方包，提供了功能强大的预构建 Agent 实现。该库构建于 `@aigne/core` 之上，扩展了框架的基础能力，以简化复杂 Agent 工作流的编排，使开发人员能够专注于高层逻辑，而不是底层的实现细节。

该库的主要特性包括：

*   **高级 Agent 模式**：提供高层级的 Agent 实现，例如 `OrchestratorAgent`，用于管理复杂的任务执行流程。
*   **并发任务执行**：支持多个任务的并行执行，显著提高了高负载工作下的处理效率。
*   **自动化规划**：能够根据一个高层目标自动生成分步执行计划。
*   **结果综合**：智能地聚合和综合来自不同任务和步骤的结果，以生成连贯的最终输出。
*   **完整的 TypeScript 支持**：包含全面的类型定义，以确保稳健且类型安全的开发体验。

## 安装

首先，使用您偏好的包管理器安装必要的包。您将需要 `@aigne/agent-library` 及其核心依赖 `@aigne/core`。

```sh 使用 npm 安装 icon=lucide:terminal
npm install @aigne/agent-library @aigne/core
```

```sh 使用 yarn 安装 icon=lucide:terminal
yarn add @aigne/agent-library @aigne/core
```

```sh 使用 pnpm 安装 icon=lucide:terminal
pnpm add @aigne/agent-library @aigne/core
```

## 可用的 Agent

该库包含专为高级用例设计的专业 Agent。每个 Agent 都在其各自的章节中有详细的文档说明。

下图展示了 `OrchestratorAgent` 的高层架构：

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Agent Library](assets/diagram/agent-library-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

<x-cards data-columns="2">
  <x-card data-title="Orchestrator Agent" data-href="/agent-library/orchestrator" data-icon="lucide:workflow">
    一款能够为复杂目标自主进行规划、执行和结果综合的高级 Agent。它使用 Planner → Worker → Completer 架构来协调多步骤工作流。
  </x-card>
</x-cards>

## 总结

对于任何希望使用 AIGNE 框架构建复杂的多 Agent 系统的开发者来说，Agent 库是一个至关重要的工具包。它为自动化复杂流程和高效编排工作流提供了基础组件。要深入了解此库的主要组件，请继续阅读 [Orchestrator](./agent-library-orchestrator.md) 文档。