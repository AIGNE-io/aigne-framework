# 决策

阐述了一个“管理者”Agent 分析请求并决定哪个专业化 Agent 最适合处理该任务的场景。

## 概述

在许多现实世界场景中，单个 AI Agent 是不够的。复杂问题通常需要一个由专业化 Agent 组成的团队，每个 Agent 都是特定领域的专家。决策工作流，也称为路由器或分诊模式，通过引入一个“管理者”Agent 来解决这个问题。

管理者 Agent 的唯一职责是分析传入的请求，理解其意图，并将其路由到团队中最合适的专业化 Agent。这类似于客户服务调度员，他们听取客户的问题，然后将其连接到正确的部门——无论是技术支持、账单还是销售部门。

这种模式创建了一个更高效、更智能的系统。你不再依赖一个试图处理所有事情的通用型 Agent，而是拥有一个协调的团队，其中每个成员都擅长其指定的任务。

## 工作原理

工作流始于用户提交请求。作为中央路由器的管理者 Agent 接收到此请求。它根据其指令和可用的“工具”（即专业化 Agent），决定哪个专业化 Agent 最适合处理该查询。然后，请求被移交给选定的专业化 Agent，由其处理并生成最终输出。

例如，如果用户问：“我的订单状态是什么？”，管理者 Agent 会将查询路由到“订单状态”Agent。如果用户问：“我如何重置密码？”，查询将被路由到“账户支持”Agent。

```d2
direction: down

User: {
  shape: c4-person
}

Manager-Agent: {
  label: "管理者 Agent\n（路由器）"
  shape: rectangle
}

Specialist-Agents: {
  label: "专业化 Agent 团队"
  shape: rectangle
  style: {
    stroke-dash: 4
  }
  grid-columns: 3

  Order-Status: { label: "订单状态 Agent" }
  Account-Support: { label: "账户支持 Agent" }
  Technical-Support: { label: "技术支持 Agent" }
}

User -> Manager-Agent: "1. 提交请求"
Manager-Agent -> Specialist-Agents.Order-Status: "2. 根据意图路由\n（例如，'订单状态'）"
Manager-Agent -> Specialist-Agents.Account-Support: "2. 根据意图路由\n（例如，'密码重置'）"
Manager-Agent -> Specialist-Agents.Technical-Support: "2. 根据意图路由\n（例如，'技术问题'）"

Specialist-Agents.Order-Status -> User: "3. 处理并返回输出"
Specialist-Agents.Account-Support -> User: "3. 处理并返回输出"
Specialist-Agents.Technical-Support -> User: "3. 处理并返回输出"
```

## 使用场景

此工作流非常适用于：

- **智能客户支持：** 自动将客户查询路由到正确的部门（例如，技术支持、账单、销售）。
- **多功能助手：** 创建一个能够将日程安排、数据分析或内容创作等任务委派给不同专业化 Agent 的单一助手。
- **内容审核：** 对传入内容进行分类，并根据其性质（例如，垃圾邮件、仇恨言论、不当内容）将其发送到不同的审核队列。
- **复杂查询处理：** 将复杂查询分解为子任务，并将每个子任务路由到特定的 Agent 进行处理。

## 总结

决策工作流是协调专业化 AI Agent 团队的强大模式。通过使用管理者 Agent 对任务进行分诊和路由，您可以构建更复杂、可扩展且高效的 AI 应用程序，充分利用各个专注 Agent 的优势。

要了解有关技术实现的更多信息，请参阅 [Team Agent](./developer-guide-agents-team-agent.md) 和 [AI Agent](./developer-guide-agents-ai-agent.md) 文档。