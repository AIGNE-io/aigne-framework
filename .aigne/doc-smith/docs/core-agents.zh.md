# Agents

在 AIGNE 框架中，Agent 就像一个为执行特定工作而设计的专业工作者。您可以将它们视为创建 AI 驱动应用程序的基本构建模块。每个 Agent 都有独特的角色，您可以将它们组合起来以处理复杂的多步骤任务。

本节介绍了您将要使用的主要 Agent 类型。点击任意卡片，了解更多关于它的功能和使用方法。

<x-cards data-columns="2">
  <x-card data-title="AI Agent" data-href="/core/agents/ai-agent" data-icon="lucide:brain-circuit">
    系统的核心。AI Agent 是与大型语言模型（如 GPT-4）通信的主要工作者，用于理解指令、进行推理并生成响应。
  </x-card>
  <x-card data-title="Function Agent" data-href="/core/agents/function-agent" data-icon="lucide:cog">
    处理特定 JavaScript 函数的专家。使用此 Agent 可以让您的 AI 具备执行现实世界操作的能力，例如发送电子邮件或从 API 获取数据。
  </x-card>
  <x-card data-title="Team Agent" data-href="/core/agents/team-agent" data-icon="lucide:users">
    管理者。Team Agent 负责协调一组其他 Agent，通过分配任务和协同工作来解决单个 Agent 无法独立处理的复杂问题。
  </x-card>
  <x-card data-title="MCP Agent" data-href="/core/agents/mcp-agent" data-icon="lucide:share-2">
    沟通者。此 Agent 通过模型上下文协议（MCP）暴露其功能，使您的应用程序具备互操作性，从而能够连接其他外部服务并与之交互。
  </x-card>
</x-cards>