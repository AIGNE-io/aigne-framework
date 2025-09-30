# Agents

在 AIGNE 框架中，Agent 是负责执行任务的基本构建块。可以将它们想象成专业的工人，每个都为特定类型的工作而设计。您可以单独使用它们，也可以将它们组合成团队来处理更复杂的工作流。了解不同类型的 Agent 是构建强大高效的 AI 应用程序的关键。

本节概述了可用的主要 Agent 类型。每种类型都提供独特的功能，从与大型语言模型交互到执行简单函数。

<x-cards data-columns="2">
  <x-card data-title="AI Agent" data-icon="lucide:brain-circuit" data-href="/core/agents/ai-agent">
    作为框架的核心，AI Agent 连接到大型语言模型 (LLM)，如 OpenAI 的 GPT 或 Anthropic 的 Claude，以处理信息、做出决策并生成类似人类的响应。可将此 Agent 用于任何需要推理、创造力或自然语言理解的任务。
  </x-card>
  <x-card data-title="Function Agent" data-icon="lucide:binary" data-href="/core/agents/function-agent">
    Function Agent 是一个简单的包装器，可将一段常规代码（一个函数）转换为 Agent。它非常适合创建特定的、可重用的工具，以执行可预测的任务，例如进行计算、从数据库获取数据或调用外部 API。
  </x-card>
  <x-card data-title="Team Agent" data-icon="lucide:users" data-href="/core/agents/team-agent">
    Team Agent 充当管理者的角色，协调一组其他 Agent 共同完成一项复杂的任务。它可以按顺序（一个接一个）或并行（同时）协调它们的工作，从而让您能够构建复杂的多步骤工作流。
  </x-card>
  <x-card data-title="MCP Agent" data-icon="lucide:webhook" data-href="/core/agents/mcp-agent">
    MCP Agent 充当连接到遵循模型上下文协议 (MCP) 的外部服务的桥梁。它允许您的应用程序连接到这些服务并与之交互，像访问本地 Agent 一样访问其独特的工具和功能。
  </x-card>
</x-cards>