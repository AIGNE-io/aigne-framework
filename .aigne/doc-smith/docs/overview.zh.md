# 概述

AIGNE 框架是一个函数式 AI 应用开发框架，旨在简化和加速构建可扩展的、Agentic AI 应用的过程。它结合了函数式编程概念、强大的人工智能能力和模块化设计，为开发者提供了一个结构化的环境。

本文档宏观概述了 AIGNE 框架的架构、核心组件和主要特性。它也作为一个导航指南，根据您的技术背景和目标，引导您至相应的文档路径。

## 核心架构

该框架的架构设计围绕一个中央协调器，即 `AIGNE`，它管理着各种称为 `Agents` 的专用组件的生命周期和交互。Agent 是基本的工作单元，旨在执行特定任务。它们可以组合成团队来处理复杂的工作流。

```d2
direction: down
style: {
  font-size: 14
}

AIGNE: {
  label: "AIGNE"
  tooltip: "协调 Agent 和工作流的中央执行引擎。"
  shape: hexagon
  style: {
    fill: "#F0F4EB"
    stroke: "#C2D7A7"
    stroke-width: 2
  }
}

Models: {
  label: "AI 模型"
  tooltip: "与外部语言和图像模型（例如 OpenAI、Anthropic）的接口。"
  shape: cylinder
  style: {
    fill: "#FEF7E8"
    stroke: "#F7D8A3"
    stroke-width: 2
  }
}

Agents: {
  shape: package
  label: "Agents"
  tooltip: "执行任务的专用工作单元。"
  style: {
    fill: "#EBF5FB"
    stroke: "#AED6F1"
    stroke-width: 2
  }

  AIAgent: {
    label: "AI Agent"
    tooltip: "与语言模型交互。"
  }
  TeamAgent: {
    label: "Team Agent"
    tooltip: "协调多个 Agent。"
  }
  FunctionAgent: {
    label: "Function Agent"
    tooltip: "封装自定义代码。"
  }
  OtherAgents: {
    label: "..."
    tooltip: "其他专用 Agent，如 ImageAgent、MCPAgent 等。"
  }
}

Skills: {
  label: "技能与工具"
  tooltip: "可供 Agent 使用的可重用函数或外部工具。"
  shape: rectangle
  style: {
    fill: "#F4ECF7"
    stroke: "#D7BDE2"
    stroke-width: 2
  }
}

AIGNE -> Agents: 管理与调用
Agents -> Models: 利用
Agents -> Skills: 使用
```

-   **AIGNE**：负责管理 Agent 生命周期、协调其交互并处理整体执行流程的中央执行引擎。它通过包含模型、Agent 和技能的配置进行实例化。
-   **Agents**：框架的基本构建模块。Agent 是执行特定任务的自主单元。框架提供了几种专门的 Agent 类型，包括用于与语言模型交互的 `AIAgent`、用于协调多个 Agent 的 `TeamAgent`，以及用于执行自定义代码的 `FunctionAgent`。
-   **模型**：与 OpenAI、Anthropic 和 Google 等外部 AI 模型提供商对接的抽象层。Agent 使用这些模型来利用大型语言模型（LLM）和图像生成模型的能力。
-   **技能**：可重用的能力，通常以函数或其他 Agent 的形式呈现，可以附加到 Agent 上以扩展其功能。

## 主要特性

AIGNE 框架配备了一套全面的功能，以支持复杂的 AI 应用开发。

<x-cards data-columns="2">
  <x-card data-title="模块化设计" data-icon="lucide:blocks">
    清晰的模块化结构使开发人员能够有效组织代码，从而提高开发效率并简化维护。
  </x-card>
  <x-card data-title="支持多种 AI 模型" data-icon="lucide:bot">
    内置支持 OpenAI、Google 和 Anthropic 等多种主流 AI 模型，并采用可扩展设计以支持更多模型。
  </x-card>
  <x-card data-title="灵活的工作流模式" data-icon="lucide:git-merge">
    原生支持顺序、并发和路由等多种工作流模式，以满足复杂的应用需求。
  </x-card>
  <x-card data-title="支持 TypeScript" data-icon="lucide:file-type">
    提供全面的 TypeScript 类型定义，确保类型安全并提升整体开发者体验。
  </x-card>
  <x-card data-title="代码执行" data-icon="lucide:terminal-square">
    支持在安全的沙箱环境中执行动态生成的代码，从而实现强大的自动化功能。
  </x-card>
  <x-card data-title="集成 MCP 协议" data-icon="lucide:plug-zap">
    通过模型上下文协议（MCP）与外部系统和服务无缝集成。
  </x-card>
</x-cards>

## 如何使用本文档

为了满足不同需求，本文档分为两个主要路径。请选择最符合您角色和目标的路径。

<x-cards data-columns="2">
  <x-card data-title="开发者指南" data-icon="lucide:code" data-href="/developer-guide/getting-started" data-cta="开始构建">
    适用于工程师和开发人员。本指南提供技术深度解析、代码优先的示例、API 参考以及使用 AIGNE 框架构建、测试和部署 Agent 应用所需的一切。
  </x-card>
  <x-card data-title="用户指南" data-icon="lucide:user" data-href="/user-guide" data-cta="学习概念">
    适用于非技术用户、产品经理和业务相关者。本指南以通俗易懂的语言解释了 AI Agent 和工作流的核心概念，重点关注潜在应用和业务成果，不涉及技术术语。
  </x-card>
</x-cards>

## 总结

本概述介绍了 AIGNE 框架、其核心架构及主要特性。该框架是用于构建基于 Agent 的现代 AI 应用的综合工具集。

对于下一步，我们建议：
-   **开发者**：请继续阅读[快速入门](./developer-guide-getting-started.md)指南，获取实践教程。
-   **非技术用户**：请从[什么是 AIGNE？](./user-guide-what-is-aigne.md)开始，了解概念性介绍。