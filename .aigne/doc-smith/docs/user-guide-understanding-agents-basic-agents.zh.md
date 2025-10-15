# 基础 Agent

可以将基础 Agent 想象成一个专业的数字助理，比如一个乐于助人的聊天机器人或一个专注的数据录入员。每个 Agent 都被设计用于执行一种特定类型的任务，并能出色地完成。它根据一套明确的指令进行操作，接收特定的输入，并产生一个结果。

这些单一用途的 Agent 是 AIGNE 的基本构建模块。虽然它们本身很简单，但可以将它们组合起来处理更复杂的工作流，我们将在 [Agent 团队](./user-guide-understanding-agents-agent-teams.md) 部分探讨这一点。

## Agent 的构成

每个基础 Agent，无论其功能如何，都由几个核心组件定义。了解这些部分有助于阐明 Agent 是如何知道该做什么的。

<x-cards data-columns="2">
  <x-card data-title="指令" data-icon="lucide:book-marked">
    这是 Agent 的永久规则手册或工作描述。它是一份详细的指南，告诉 Agent 它的身份、目的以及行为方式。例如，一个客服 Agent 的指令可能是：“你是一个友好且乐于助人的助手。你的目标是准确回答客户的问题。”
  </x-card>
  <x-card data-title="输入" data-icon="lucide:arrow-right-to-line">
    这是在特定时刻提供给 Agent 的具体信息或任务。如果 Agent 是一个聊天机器人，输入就是用户的问题，比如“你们的营业时间是什么？”。
  </x-card>
  <x-card data-title="输出" data-icon="lucide:arrow-left-from-line">
    这是 Agent 根据其指令处理输入后产生的结果。对于聊天机器人的例子，输出就是答案：“我们的营业时间是周一至周五，上午 9 点到下午 5 点。”
  </x-card>
  <x-card data-title="技能" data-icon="lucide:sparkles">
    这些是 Agent 在执行任务时可以使用的特殊工具或能力。例如，一个“天气 Agent”可能拥有一项技能，使其能够从外部服务访问实时天气数据。
  </x-card>
</x-cards>

## Agent 的工作原理

这个过程很简单。用户向 Agent 提供一个输入。然后，Agent 会查阅其核心指令以理解上下文和规则，在必要时使用其可能拥有的任何技能，并生成一个输出。

```d2 icon=material-symbols:robot-2-outline
direction: right

User: {
  label: "用户"
  shape: person
}

Agent: {
  label: "基础 Agent"
  shape: hexagon
  style.fill: "#f0f4f8"
}

Instructions: {
  label: "核心指令\n(规则手册)"
  shape: document
}

Output: {
  label: "结果"
  shape: document
}

User -> Agent: "输入 (例如，一个具体问题)"
Agent -> Instructions: "查阅"
Instructions -> Agent: "提供指导"
Agent -> Output: "生成输出 (例如，一个答案)"
```

## 示例：一个简单的聊天 Agent

让我们来看一个“聊天 Agent”的实际例子。该 Agent 被设计成一个能回答问题的得力助手。其配置大致如下：

| 属性 | 值 | 描述 |
| :--- | :--- | :--- |
| **名称** | `chat` | Agent 的一个简单标识符。 |
| **描述** | `Chat agent` | 对其用途的简要说明。 |
| **指令**| `你是一个乐于助人的助手...` | 这告诉 Agent 要友好且提供丰富信息。 |
| **输入键** | `message` | Agent 期望用户的问题被标记为 "message"。 |
| **输出键** | `message` | Agent 会将其答案标记为 "message"。 |

当你向这个 Agent 发送像 `message: "一个 Agent 是如何工作的？"` 这样的输入时，它会遵循其指令，以乐于助人的方式，根据其编程提供一个清晰、信息丰富的答案。

## 总结

一个基础 Agent 是一个执行单一任务的数字工作者，由其指令、接收的输入和产生的输出来定义。它们是 AIGNE 的核心基础组件。虽然它们在执行特定任务时很强大，但当它们被组装成 [Agent 团队](./user-guide-understanding-agents-agent-teams.md) 来应对更复杂的挑战时，其真正的潜力才得以释放。