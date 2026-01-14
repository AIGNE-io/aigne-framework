# 核心概念

要有效使用 AIGNE 框架构建应用程序，首先必须理解其基本架构组件。本节将高阶概述主要构建块及其交互方式。清晰掌握这些概念将有助于更直观地进行开发。

该框架围绕几个协同工作的关键抽象而设计，以编排复杂的 AI 驱动工作流。主要组件包括 AIGNE 编排器、作为基本工作单元的 Agent、用于与 AI 服务交互的模型以及用于状态持久化的内存。

下图说明了这些核心组件之间的关系。

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Core Concepts](assets/diagram/core-concepts-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 架构构建块

AIGNE 框架由四个主要概念组成。理解每一个概念对于构建稳健且可扩展的基于 Agent 的应用程序至关重要。

<x-cards data-columns="2">
  <x-card data-title="AIGNE" data-icon="lucide:box" data-href="/developer-guide/core-concepts/aigne-engine">
    负责管理 Agent 生命周期、协调其交互并处理整体执行流程的中央编排器。
  </x-card>
  <x-card data-title="Agents" data-icon="lucide:bot" data-href="/developer-guide/core-concepts/agents">
    基本的工作单元。Agent 是一种抽象，封装了从运行简单函数到复杂推理的特定能力。
  </x-card>
  <x-card data-title="Models" data-icon="lucide:brain-circuit" data-href="/developer-guide/core-concepts/models">
    提供与外部服务（如大型语言模型 (LLM) 或图像生成 API）的标准化接口的专用 Agent。
  </x-card>
  <x-card data-title="Memory" data-icon="lucide:database" data-href="/developer-guide/core-concepts/memory">
    为 Agent 提供持久化和回忆信息的能力，从而实现有状态的对话和随时间变化的上下文感知行为。
  </x-card>
</x-cards>

## 总结

本节介绍了 AIGNE 框架的四个基本支柱：`AIGNE` 编排器、`Agent`、`模型`和`内存`。每个组件在架构中都扮演着独特而至关重要的角色。

为了更全面地理解，建议继续阅读每个概念的详细文档。

*   **下一步：** 深入了解 [AIGNE 编排器](./developer-guide-core-concepts-aigne-engine.md)。