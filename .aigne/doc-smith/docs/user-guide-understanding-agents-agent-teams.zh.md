# Agent 团队

虽然单个专门的 Agent 对于特定任务很有用，但有些问题对于一个 Agent 来说过于庞大或复杂，无法单独处理。就像在人类组织中一样，当一项任务需要多个步骤或不同技能时，你会组建一个团队。在 AIGNE 中，Agent 团队是一组为协作解决更大目标而组织的 Agent。

可以这样理解：如果一个[基础 Agent](./user-guide-understanding-agents-basic-agents.md) 是一位专家，比如平面设计师，那么 Agent 团队就是整个市场部门，包括文案、策略师和设计师，他们共同为一个营销活动而工作。

## Agent 团队如何协作

Agent 团队可以根据任务的性质配置成不同的协作方式。两种主要的协作模式是顺序协作和并行协作。

### 顺序工作流：流水线

在顺序工作流中，Agent 按照特定顺序一个接一个地执行任务。第一个 Agent 的输出成为第二个 Agent 的输入，以此类推，就像一条流水线。这种方法非常适合于每一步都依赖于前一步完成的流程。

例如，要撰写一篇博客文章，一个团队可能会按以下方式工作：
1.  **研究员 Agent：** 收集关于某个主题的信息和关键事实。
2.  **作家 Agent：** 利用研究成果起草博客文章。
3.  **编辑 Agent：** 审查草稿的语法和风格，并提供最终版本。

### 并行工作流：头脑风暴会议

在并行工作流中，团队中的所有 Agent 同时处理相同的初始输入。每个 Agent 独立执行其专门任务，然后将它们的各自输出组合起来形成最终结果。这类似于一场头脑风暴会议，不同的专家同时就一个问题贡献他们独特的见解。

例如，要分析市场情绪，一个团队可以并行工作：
*   **输入：** 公司名称。
*   **社交媒体 Agent：** 扫描 Twitter 上的提及。
*   **新闻 Agent：** 搜索最近的新闻文章。
*   **金融 Agent：** 查询近期的股票表现。
*   **输出：** 将所有三份报告合并为一份全面的市场分析报告。

### 反思：质量保证循环

一个更高级的模式是“反思”，它引入了一个质量控制步骤。在这个模型中，团队完成其任务，然后一个特殊的 **审查员 Agent** 会检查输出。

*   如果工作成果符合要求标准，审查员会批准它，流程就此完成。
*   如果工作成果不令人满意，审查员会提供反馈并将其发回团队重试。

这个循环会一直持续，直到输出被批准或达到最大尝试次数。它通过在工作流中直接构建一个审查和优化的循环来确保更高质量的结果。

下图说明了这三种主要的协作模式。

```d2
direction: down

Sequential-Workflow: {
  label: "顺序工作流：流水线"
  style.stroke-dash: 2

  Input: { shape: oval }
  Researcher: "研究员 Agent"
  Writer: "作家 Agent"
  Editor: "编辑 Agent"
  Output: { label: "最终版本"; shape: oval }

  Input -> Researcher: "主题"
  Researcher -> Writer: "研究成果"
  Writer -> Editor: "草稿"
  Editor -> Output: "批准的文章"
}

Parallel-Workflow: {
  label: "并行工作流：头脑风暴会议"
  style.stroke-dash: 2

  Input: { label: "公司名称"; shape: oval }
  Social-Media: "社交媒体 Agent"
  News: "新闻 Agent"
  Financial: "金融 Agent"
  Output: { label: "综合市场分析"; shape: oval }

  Input -> Social-Media
  Input -> News
  Input -> Financial
  Social-Media -> Output: "提及"
  News -> Output: "文章"
  Financial -> Output: "股票数据"
}

Reflection-Workflow: {
  label: "反思：质量保证循环"
  style.stroke-dash: 2

  Team: "Agent 团队"
  Task-Output: "任务输出"
  Reviewer: {
    label: "审查员 Agent"
    shape: diamond
  }
  Final-Output: { label: "最终批准的输出"; shape: oval }

  Team -> Task-Output
  Task-Output -> Reviewer
  Reviewer -> Final-Output: "已批准"
  Reviewer -> Team: "需要修订\n(反馈)"
}
```

## 总结

通过将 Agent 组织成团队，您可以自动化更复杂、多步骤的工作流。这种协作方法允许构建复杂的解决方案，以模拟现实世界中的业务流程，从内容创建流程到数据分析和质量保证检查。

要查看这些概念的实际应用，请浏览我们的[常见工作流](./user-guide-common-workflows.md)指南，其中提供了 Agent 团队解决实际问题的实用示例。有关实施的技术细节，开发人员可以参考 [Team Agent 文档](./developer-guide-agents-team-agent.md)。