# 并行任务

在某些情况下，为了提高效率，你需要同时执行多个独立任务。并行任务工作流正是为此目的而设计的。它允许多个 AI Agent 同时处理相同的初始信息，最终将它们的独立结果收集并组合起来。

这种方法就像聘请一个专家团队来分析一份商业提案。一位专家可能专注于财务可行性，另一位专注于市场趋势，第三位则专注于法律风险。他们都从同一份提案开始同时工作，最终将他们的报告汇总起来，以提供一个全面的情况。这比他们必须等待彼此完成工作要快得多。

此工作流由一个配置为并行模式运行的 [Agent Team](./user-guide-understanding-agents-agent-teams.md) 管理。对于任务一个接一个完成的不同方法，请参阅[顺序任务](./user-guide-common-workflows-sequential-tasks.md)工作流。

## 工作原理

并行工作流遵循一个清晰、高效的流程来处理互不依赖的任务。该流程旨在通过同时运行所有 Agent 来最大化速度。

1.  **单一输入**：流程从单一信息开始，例如一份文档、一个用户查询或一组数据。
2.  **同步分发**：Agent Team 接收此输入，并将*完全相同的信息*分发给团队中的每个 Agent。
3.  **独立处理**：所有 Agent 同时开始工作。每个 Agent 根据其独特的指令执行其专门的任务，无需等待或与其他 Agent 交互。
4.  **结果聚合**：当每个 Agent 完成其工作时，其输出会被收集。然后，Agent Team 将这些独立的输出聚合为单一的组合结果。如果多个 Agent 为同一字段生成了输出，系统通常会接受最先完成的 Agent 的结果。

这种结构确保了完成所有任务所需的总时间取决于运行时间最长的 Agent，而不是所有 Agent 时间的总和。

```d2
direction: down

Input: {
  label: "1. 单一输入"
  shape: rectangle
}

Agent-Team: {
  label: "Agent Team (并行模式)"
  style.stroke-dash: 4

  Distribution: {
    label: "2. 分发任务"
    shape: diamond
  }

  Agents: {
    label: "3. 独立处理"
    style.stroke-width: 0
    grid-columns: 3

    Agent-1: { 
      label: "Agent 1"
      shape: rectangle 
    }
    Agent-2: { 
      label: "Agent 2"
      shape: rectangle 
    }
    Agent-N: {
      label: "Agent N..."
      shape: rectangle
    }
  }

  Aggregation: {
    label: "4. 聚合结果"
    shape: diamond
  }
}

Output: {
  label: "5. 组合结果"
  shape: rectangle
}

Input -> Agent-Team.Distribution
Agent-Team.Distribution -> Agent-Team.Agents.Agent-1
Agent-Team.Distribution -> Agent-Team.Agents.Agent-2
Agent-Team.Distribution -> Agent-Team.Agents.Agent-N
Agent-Team.Agents.Agent-1 -> Agent-Team.Aggregation
Agent-Team.Agents.Agent-2 -> Agent-Team.Aggregation
Agent-Team.Agents.Agent-N -> Agent-Team.Aggregation
Agent-Team.Aggregation -> Output

```

## 常见用例

并行工作流最适用于需要在同一信息上进行多个独立分析或任务，且速度是优先考虑因素的场景。

<x-cards data-columns="2">
  <x-card data-title="多角度内容分析" data-icon="lucide:scan-text">
    在分析文档时，一个 Agent 可以提取关键特征，另一个可以分析情感基调（情绪），第三个可以识别目标受众。所有这三个任务都可以同时进行。
  </x-card>
  <x-card data-title="并行数据查询" data-icon="lucide:database-zap">
    如果您需要跨不同来源（例如，客户数据库、产品目录和知识库）搜索信息，您可以为每个来源派遣一个 Agent 同时进行搜索。
  </x-card>
  <x-card data-title="竞争分析" data-icon="lucide:bar-chart-3">
    为了分析竞争对手的产品，一个 Agent 可以收集近期的客户评论，另一个可以查找定价信息，第三个可以查找技术规格，所有这些都可以并行进行。
  </x-card>
  <x-card data-title="代码审查" data-icon="lucide:code-2">
    对于一段代码，一个 Agent 可以检查安全漏洞，而另一个可以检查是否符合样式指南。然后将反馈结合起来提供给开发者。
  </x-card>
</x-cards>

## 总结

并行任务工作流是提高效率的强大模式。通过允许多个 Agent 独立且同时工作，它显著减少了完成涉及多个不相关子任务的复杂工作所需的时间。这使其成为构建响应迅速、功能强大的 AI 应用的基础工作流。

要了解 Agent 如何以不同方式协同工作，请接下来阅读[顺序任务](./user-guide-common-workflows-sequential-tasks.md)工作流。