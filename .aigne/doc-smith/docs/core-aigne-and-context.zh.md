# AIGNE 与 Context

任何由 AIGNE 驱动的应用程序都包含两个核心组件，它们如同大脑和记忆一样协同工作：**AIGNE 引擎** 和 **Context** 对象。你可以将 AIGNE 引擎想象成负责完成工作的项目经理，将 Context 想象成一块共享的白板，上面记录着所有重要的笔记和进展。

理解这两个组件的交互方式，是掌握 AIGNE 框架如何协调复杂任务的关键。本节将详细介绍每个组件，并展示它们如何协作，从而让你的 AI agents 发挥作用。

## AIGNE 引擎：编排器

AIGNE 引擎是整个系统的中央协调器。它本身不执行任务，但负责编排执行任务的不同 agents。就像项目经理将工作分配给团队成员一样，AIGNE 引擎接收用户的请求，并决定哪个 agent（或一系列 agents）最适合处理该请求。

其主要工作是：

- **接收初始请求**：它是新任务开始时的第一个接触点。
- **委派任务**：它分析请求并将其分配给适当的 agent，无论是用于生成文本的 AI agent、用于运行特定工具的 Function agent，还是用于多步骤流程的 Team of agents。
- **管理流程**：它确保信息从一个 agent 正确地流向另一个 agent，并确保每个步骤都按正确的顺序进行。

简而言之，AIGNE 引擎就像一个总指挥，确保整个操作从头到尾都能顺利运行。

## Context：共享内存

如果说 AIGNE 引擎是总指挥，那么 **Context** 就集剧本和制作笔记于一身。它是一个对象，用于保存有关任务的所有当前信息。每个 agent 都可以访问 Context，这使得它们能够查看已发生的情况，并添加自己的结果以供其他 agent 使用。

这种共享内存至关重要，原因有以下几点：

- **状态管理**：它跟踪整个对话或工作流的历史，因此系统始终了解当前进展。这就是 agent 能够记住你五分钟前所谈论内容的方式。
- **信息共享**：它允许不同的 agents 通过相互传递数据进行协作。例如，一个 agent 可能会获取用户数据，而另一个 agent 则利用这些数据来撰写个性化电子邮件。这些数据就是通过 Context 传递的。
- **可观察性**：它提供了对每个步骤、每个决策以及生成的每个数据点的完整日志。这对于调试和理解你的应用程序如何得出特定结果非常有用。

从本质上讲，Context 确保所有 agents 都能信息同步，并获得有效完成工作所需的信息。

## 它们如何协同工作

该框架的真正威力源于 AIGNE 引擎和 Context 之间的无缝交互。一个典型的工作流程大致如下：

```d2 AIGNE and Context Interaction Flow icon=lucide:workflow
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  AIGNE-Engine: {
    label: "AIGNE Engine\n(Orchestrator)"
    shape: rectangle
  }

  Context: {
    label: "Context\n(Shared Memory)"
    shape: cylinder
  }

  Agent: {
    label: "Agent\n(Worker)"
    shape: rectangle
  }
}

User -> AIGNE-Framework.AIGNE-Engine: "1. Sends Request"
AIGNE-Framework.AIGNE-Engine <-> AIGNE-Framework.Context: "2. Reads/Writes State"
AIGNE-Framework.AIGNE-Engine -> AIGNE-Framework.Agent: "3. Dispatches Task"
AIGNE-Framework.Agent -> AIGNE-Framework.Context: "4. Updates with Result"
AIGNE-Framework.AIGNE-Engine -> User: "5. Sends Final Response"
```

1.  **用户发送请求**：任务开始，例如，“总结我最新的销售报告”。
2.  **AIGNE 引擎采取行动**：引擎接收请求并查询 `Context`，以查看是否存在任何相关的现有信息。
3.  **派遣 Agent**：引擎确定最适合该任务的 agent，并将任务连同对 `Context` 的访问权限一并分配给它。
4.  **Agent 更新 Context**：agent 执行其工作（例如，查找并阅读销售报告），然后将摘要写回 `Context`。
5.  **循环重复**：AIGNE 引擎再次检查 `Context`，看到摘要准备就绪后，它会派遣另一个 agent 执行下一步，或者将最终结果交付给用户。

## 总结

AIGNE 引擎和 Context 对象是该框架的基础支柱。引擎提供**编排**和决策功能，而 Context 则提供**内存**和状态管理功能。它们共同创建了一个强大的环境，让多个专业的 agents 能够协作解决复杂问题。

既然你已经了解了编排器和共享内存的角色，现在是时候来认识一下执行者了。让我们深入了解你可以在应用程序中使用的不同类型的 [Agents](./core-agents.md)。