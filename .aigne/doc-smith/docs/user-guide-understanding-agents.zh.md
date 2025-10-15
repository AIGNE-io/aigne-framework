# 理解 Agent

在 AIGNE 框架中，“agent”是完成工作的基本构建块。可以将 agent 想象成一个专业的数字工作者，被雇佣来执行特定任务。每个 agent 都有明确的角色和一套技能。就像在现实世界的团队中一样，您可以将单个任务分配给一个 agent，也可以组建一个 agent 团队来处理更复杂的项目。

其核心原则是将一个大问题分解成更小、更易于管理的任务，并将每个任务分配给最适合该工作的 agent。这种方法可以实现清晰、高效，并能够构建复杂的自动化工作流。

本节对 agent 可以扮演的不同角色进行了概念性概述。有关更详细的解释，请参阅以下页面：

-   **[基础 Agent](./user-guide-understanding-agents-basic-agents.md):** 了解作为独立工作者的单个 agent。
-   **[Agent 团队](./user-guide-understanding-agents-agent-teams.md):** 了解多个 agent 如何协作解决复杂问题。

```d2
direction: down
style: {
  font-size: 14
  stroke: "#262626"
  fill: "#FAFAFA"
  stroke-width: 2
  border-radius: 8
}

Your_Request -> Manager_Agent

subgraph "专业 Agent" {
    direction: right
    Researcher
    Artist
    Calculator
}

Manager_Agent -> Researcher: "分配研究任务"
Manager_Agent -> Artist: "分配图像创建任务"
Manager_Agent -> Calculator: "分配计算任务"

Researcher -> Manager_Agent: "返回研究结果"
Artist -> Manager_Agent: "返回图像"
Calculator -> Manager_Agent: "返回结果"

Manager_Agent -> Completed_Task

Your_Request: {
  label: "你的请求\n(例如, '创建一份带有图表的销售趋势报告')"
  shape: document
  style: {
    fill: "#E0F2FE"
    stroke: "#0EA5E9"
  }
}

Manager_Agent: {
  label: "管理 Agent\n(团队 Agent)"
  tooltip: "协调工作流并委派任务"
  style: {
    fill: "#FEF3C7"
    stroke: "#FBBF24"
  }
}

Researcher: {
  label: "研究员\n(AI Agent)"
  tooltip: "分析数据并总结趋势"
  style: {
    fill: "#D1FAE5"
    stroke: "#10B981"
  }
}

Artist: {
  label: "艺术家\n(图像 Agent)"
  tooltip: "根据数据生成图表"
  style: {
    fill: "#D1FAE5"
    stroke: "#10B981"
  }
}

Calculator: {
  label: "计算器\n(函数 Agent)"
  tooltip: "执行特定计算"
  style: {
    fill: "#D1FAE5"
    stroke: "#10B981"
  }
}

Completed_Task: {
  label: "已完成的任务\n(最终报告)"
  shape: document
  style: {
    fill: "#E0F2FE"
    stroke: "#0EA5E9"
  }
}
```

### Agent 可以扮演的角色

为了更好地理解其功能，我们可以用类比来描述常见的 agent 类型及其在系统中扮演的角色。

<x-cards data-columns="2">
  <x-card data-title="专家" data-icon="lucide:user-cog">
    这是最常见的 agent 类型，通常由 AI 模型驱动。它就像您为特定认知任务（如作家、翻译员或分析师）聘请的专家。您向其提供指令和信息，它会根据其专业知识产出结果。例如，您可以要求它总结一篇长文或起草一封专业的电子邮件。
  </x-card>
  <x-card data-title="项目经理" data-icon="lucide:users">
    这种 agent 本身不执行任务，但擅长协调其他 agent。就像一个真正的项目经理一样，它接收一个复杂的目标，将其分解为更小的步骤，并将这些步骤委派给合适的专家 agent。它确保工作按正确的顺序进行，并确保最终结果被正确地组合起来。
  </x-card>
  <x-card data-title="工具使用者" data-icon="lucide:wrench">
    有些 agent 专为操作特定工具而设计。这可能是一个用于执行数学运算的计算器，一个搜索数据库的工具，或者一个连接到外部服务（如天气 API）的工具。这些 agent 可靠且可预测，每次被调用时都会执行精确的功能。
  </x-card>
  <x-card data-title="数据文员" data-icon="lucide:file-cog">
    这种 agent 专门从事信息的格式化和重组。它可以将一种结构的数据转换为另一种结构。例如，它可以从客户电子邮件中提取特定细节，并将其格式化为可以保存在数据库中的结构化记录，就像文员将纸质表格上的信息录入电子表格一样。
  </x-card>
</x-cards>

### 总结

通过将 agent 理解为具有专门角色的数字工作者，您就可以开始了解如何将它们组合起来以自动化复杂的流程。单个 agent 可以是执行特定任务的强大工具，但 AIGNE 框架的真正潜力在于组建一个 agent 团队，每个 agent 贡献其独特的技能以实现共同的目标。

要了解更多关于这些概念如何付诸实践的信息，请继续阅读以下部分。

-   **[基础 Agent](./user-guide-understanding-agents-basic-agents.md):** 探索单个 agent 如何运作。
-   **[Agent 团队](./user-guide-understanding-agents-agent-teams.md):** 了解如何为复杂的工作流编排多个 agent。