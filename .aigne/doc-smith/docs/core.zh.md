# 核心框架

欢迎来到 AIGNE 平台的核心。核心框架是驱动您构建的每个 AI 应用程序的引擎。可以把它想象成一个协调所有活动、管理内存并指导专门的“Agent”执行任务的中枢神经系统。在本节中，我们将探讨构成 AI 工作基础的基本构建块。

## 工作原理

从宏观上看，核心框架由几个无缝协作的关键部分组成。AIGNE 引擎扮演着中央协调器的角色，Context 提供必要的内存和状态，而 Agent 则是执行实际任务的工作单元。

下图展示了这些组件之间的基本关系：

```d2 AIGNE 核心架构 icon=lucide:workflow
direction: down

AIGNE-Engine: {
  label: "AIGNE 引擎\n(协调器)"
  shape: rectangle
  style.fill: "#f0f9ff"
}

Context: {
  label: "Context\n(内存)"
  shape: cylinder
  style.fill: "#fefce8"
}

Agents: {
  label: "Agent\n(工作单元)"
  shape: rectangle
  style: {
    stroke-dash: 4
  }

  AIAgent: {
    label: "AI Agent"
  }
  FunctionAgent: {
    label: "Function Agent"
  }
  TeamAgent: {
    label: "Team Agent"
  }
}

AIGNE-Engine <-> Context: "管理状态"
AIGNE-Engine -> Agents: "委派任务"

```

## 深入了解

要想了解这些部分是如何协同工作的，请在以下章节中探索核心框架的主要组件。

<x-cards data-columns="2">
  <x-card data-title="AIGNE 与 Context" data-icon="lucide:brain-circuit" data-href="/core/aigne-and-context">
    了解负责协调任务的中央 AIGNE 引擎，以及为您的 Agent 提供内存和感知能力的 Context 对象。
  </x-card>
  <x-card data-title="Agent" data-icon="lucide:bot" data-href="/core/agents">
    探索不同类型的 Agent——这些专业的“工人”可以执行任务、运行函数，甚至作为一个团队进行协作。
  </x-card>
</x-cards>

通过理解这些核心概念，您将能够顺利使用 AIGNE 构建复杂而强大的人工智能应用程序。我们建议从 [AIGNE 与 Context](./core-aigne-and-context.md) 开始，了解主要控制器。