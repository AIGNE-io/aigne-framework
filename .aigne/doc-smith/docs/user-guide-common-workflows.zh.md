# 常见工作流

在 AIGNE 框架中，单个 Agent 可以执行特定任务。然而，当多个 Agent 协作解决更复杂的问题时，才能发挥系统的真正威力。就像团队成员一样，可以组织 Agent 以结构化的方式协同工作。这些协作模式被称为“工作流”。

工作流定义了任务和信息如何在不同的 Agent 之间流动，以实现更大的目标。通过以不同的模式组织 Agent，我们可以为各种业务需求创建复杂的自动化流程。

下图展示了三种基本的工作流模式。

```d2
direction: down

Sequential-Tasks: {
  label: "顺序任务"
  shape: rectangle
  Agent-A: { label: "Agent A" }
  Agent-B: { label: "Agent B" }
  Agent-C: { label: "Agent C" }
}

Parallel-Tasks: {
  label: "并行任务"
  shape: rectangle
  Initial-Task: { label: "初始任务" }
  Parallel-Agents: {
    shape: rectangle
    grid-columns: 3
    Agent-A: { label: "Agent A" }
    Agent-B: { label: "Agent B" }
    Agent-C: { label: "Agent C" }
  }
  Combined-Result: { label: "合并结果" }
}

Decision-Making: {
  label: "决策"
  shape: rectangle
  Request: { label: "请求" }
  Manager-Agent: {
    label: "管理者 Agent"
    shape: diamond
  }
  Specialized-Agents: {
    shape: rectangle
    grid-columns: 2
    Agent-A: { label: "专门 Agent A" }
    Agent-B: { label: "专门 Agent B" }
  }
}

Sequential-Tasks.Agent-A -> Sequential-Tasks.Agent-B: "结果"
Sequential-Tasks.Agent-B -> Sequential-Tasks.Agent-C: "结果"

Parallel-Tasks.Initial-Task -> Parallel-Tasks.Parallel-Agents.Agent-A
Parallel-Tasks.Initial-Task -> Parallel-Tasks.Parallel-Agents.Agent-B
Parallel-Tasks.Initial-Task -> Parallel-Tasks.Parallel-Agents.Agent-C

Parallel-Tasks.Parallel-Agents.Agent-A -> Parallel-Tasks.Combined-Result
Parallel-Tasks.Parallel-Agents.Agent-B -> Parallel-Tasks.Combined-Result
Parallel-Tasks.Parallel-Agents.Agent-C -> Parallel-Tasks.Combined-Result

Decision-Making.Request -> Decision-Making.Manager-Agent
Decision-Making.Manager-Agent -> Decision-Making.Specialized-Agents.Agent-A: "任务 A"
Decision-Making.Manager-Agent -> Decision-Making.Specialized-Agents.Agent-B: "任务 B"
```

本指南介绍了您将遇到的最常见的工作流。理解这些模式将帮助您设想 Agent 如何为您自动化复杂的多步骤流程。

浏览每个工作流的详细说明，以了解其具体的用例和优势。

<x-cards data-columns="3">
  <x-card data-title="顺序任务" data-icon="lucide:list-ordered" data-href="/user-guide/common-workflows/sequential-tasks">
    如同流水线，Agent 按照顺序逐个完成任务，并将工作成果传递给队列中的下一个 Agent。这非常适合必须按特定顺序执行的流程。
  </x-card>
  <x-card data-title="并行任务" data-icon="lucide:git-fork" data-href="/user-guide/common-workflows/parallel-tasks">
    为了更快地完成工作，多个 Agent 可以同时处理一项工作的不同部分。然后将它们的各自结果合并，形成一个完整的解决方案。
  </x-card>
  <x-card data-title="决策" data-icon="lucide:git-merge" data-href="/user-guide/common-workflows/decision-making">
    就像管理者一样，一个 Agent 可以分析传入的请求，并智能地将其路由到最合适的专门 Agent 来处理该工作。
  </x-card>
</x-cards>

通过结合这些基本模式，您可以构建功能强大且自主的系统，以满足您的特定需求。点击任一卡片，深入了解每个工作流的运作方式。