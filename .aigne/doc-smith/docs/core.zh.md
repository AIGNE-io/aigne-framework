# 核心框架

欢迎来到 AIGNE 平台的引擎室。核心框架为创建、管理和运行复杂的 AI Agent 提供了基础构建模块。它旨在为您的应用程序提供一个强大而灵活的基础，处理从简单的聊天交互到复杂的多 Agent 工作流等所有事务。

该框架的核心由三大支柱组成：

*   **AIGNE 引擎**：管理 AI 任务整个生命周期的中央协调器。
*   **上下文（Context）**：在交互过程中跟踪对话、记忆和其他关键数据的状态管理器。
*   **Agent**：执行特定任务的专业行动者，例如与 AI 模型通信、执行代码或协调其他 Agent。

### 工作原理

下图说明了 AIGNE 核心框架的高级架构。应用程序与中央 AIGNE 引擎进行交互，该引擎使用 Context 对象来管理状态，并将任务委托给一个或多个 Agent。

```d2
direction: down

app: {
  label: "您的应用程序"
  shape: rectangle
}

aigne-core: {
  label: "AIGNE 核心框架"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 2
  }

  aigne-engine: {
    label: "AIGNE 引擎"
  }

  context: {
    label: "上下文（Context）"
    shape: cylinder
  }

  agents: {
    label: "Agent"
    shape: rectangle
    grid-columns: 3

    ai-agent: { label: "AIAgent" }
    function-agent: { label: "FunctionAgent" }
    team-agent: { label: "TeamAgent" }
  }
}

app -> aigne-core.aigne-engine: "调用"
aigne-core.aigne-engine <-> aigne-core.context: "管理"
aigne-core.aigne-engine -> aigne-core.agents: "委托任务"
```

### 关键组件

核心框架分为两个主要概念。点击卡片以了解更多关于每个概念的信息。

<x-cards data-columns="2">
  <x-card data-title="AIGNE 与上下文（Context）" data-icon="lucide:brain-circuit" data-href="/core/aigne-and-context">
    了解协调 Agent 的主要 AIGNE 类以及管理状态和可观察性的 Context 对象。
  </x-card>
  <x-card data-title="Agent" data-icon="lucide:bot" data-href="/core/agents">
    探索不同类型的 Agent，它们是执行聊天或调用函数等任务的基本行动者。
  </x-card>
</x-cards>

### 总结

AIGNE 核心框架为构建强大的 AI 应用程序提供了一个健壮且模块化的架构。通过理解这些核心组件，您可以有效地设计出可扩展、可维护且能够处理复杂任务的 Agent。

要继续，请浏览每个组件的详细文档：

*   **[AIGNE 与上下文（Context）](./core-aigne-and-context.md)**：了解中央引擎和状态管理。
*   **[Agent](./core-agents.md)**：发现您可以构建和使用的不同类型的执行单元。