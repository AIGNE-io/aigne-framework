# Agent 类型

AIGNE 框架提供了一套专门的 Agent 类型，每种类型都设计用于执行特定功能。虽然所有 Agent 都继承自基础的 `Agent` 类，但这些专门的实现为常见任务提供了预构建的功能，从与 AI 模型交互到编排复杂工作流。理解这些类型是构建健壮且高效的应用程序的关键。

本节对可用的 Agent 类型进行了高层次的概述。有关详细的实现、配置选项和代码示例，请参阅每种 Agent 的具体子文档。

```d2
direction: down
style: {
  font-size: 14
  stroke-width: 2
  fill: "#f8f9fa"
  stroke: "#adb5bd"
}

Agent: {
  label: "基础 Agent"
  shape: class
  style: {
    fill: "#e9ecef"
    stroke: "#495057"
  }
}

sub_agents: {
  AIAgent: {
    label: "AIAgent"
    tooltip: "与语言模型交互"
    style: { fill: "#dbe4ff" }
  }
  TeamAgent: {
    label: "TeamAgent"
    tooltip: "编排多个 Agent"
    style: { fill: "#d1e7dd" }
  }
  ImageAgent: {
    label: "ImageAgent"
    tooltip: "生成图像"
    style: { fill: "#fff3cd" }
  }
  FunctionAgent: {
    label: "FunctionAgent"
    tooltip: "包装自定义代码"
    style: { fill: "#f8d7da" }
  }
  TransformAgent: {
    label: "TransformAgent"
    tooltip: "执行数据映射"
    style: { fill: "#e2d9f3" }
  }
  MCPAgent: {
    label: "MCPAgent"
    tooltip: "连接到外部 MCP 系统"
    style: { fill: "#cfe2ff" }
  }
}

Agent -> sub_agents.AIAgent: Inherits
Agent -> sub_agents.TeamAgent: Inherits
Agent -> sub_agents.ImageAgent: Inherits
Agent -> sub_agents.FunctionAgent: Inherits
Agent -> sub_agents.TransformAgent: Inherits
Agent -> sub_agents.MCPAgent: Inherits
```

## 可用的 Agent 类型

框架包含以下专门的 Agent，每种都为特定目的而量身定制。

<x-cards data-columns="2">
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/ai-agent">
    与大语言模型 (LLM) 交互的主要 Agent。它负责处理提示词构建、模型调用以及处理 AI 生成的响应，包括工具使用。
  </x-card>
  <x-card data-title="Team Agent" data-icon="lucide:users" data-href="/developer-guide/agents/team-agent">
    编排一组 Agent 协同工作。它可以按顺序或并行模式管理工作流，从而实现复杂的多步骤问题解决。
  </x-card>
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agents/image-agent">
    一种专门用于与图像生成模型对接的 Agent。它接收指令性提示词并生成视觉内容。
  </x-card>
  <x-card data-title="Function Agent" data-icon="lucide:function-square" data-href="/developer-guide/agents/function-agent">
    包装标准的 TypeScript 或 JavaScript 函数，让您可以将任何自定义代码或业务逻辑无缝集成到 Agent 工作流中。
  </x-card>
  <x-card data-title="Transform Agent" data-icon="lucide:shuffle" data-href="/developer-guide/agents/transform-agent">
    使用 JSONata 表达式执行声明式数据转换。它非常适合在不同格式之间映射、重构和转换数据，而无需编写过程式代码。
  </x-card>
  <x-card data-title="MCP Agent" data-icon="lucide:plug-zap" data-href="/developer-guide/agents/mcp-agent">
    通过模型上下文协议 (MCP) 连接到外部系统和工具。该 Agent 充当桥梁，允许您的应用程序利用外部资源和能力。
  </x-card>
</x-cards>

## 总结

为给定任务选择正确的 Agent 类型是设计高效 AIGNE 应用程序的基础步骤。每种 Agent 都是为特定工作设计的专门工具。通过组合这些 Agent，您可以构建能够处理各种任务的复杂系统。

要更深入地了解每种 Agent 的功能和配置，请继续阅读每种类型的详细文档。

- **下一步**：了解 [AI Agent](./developer-guide-agents-ai-agent.md)，它是与语言模型交互的核心组件。