# Agent 类型与示例

AIGNE 核心框架提供了一组专门的 Agent 类型，每种类型都设计为构建复杂 AI 工作流的基本构建块。这些预构建的 Agent 可以处理常见任务，从与语言模型交互到协调团队合作和转换数据。

理解这些 Agent 类型是使用该框架有效构建应用的关键。每个 Agent 都有其独特的用途，但被设计为能与其他 Agent 无缝协作。本节为每种类型提供了实用的指南和示例。

<x-cards data-columns="2">
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agent-types-and-examples/ai-agent">
    用于与大型语言模型（LLMs）交互的标准 Agent。它使用指令、提示和工具来执行 AI 驱动的任务。
  </x-card>
  <x-card data-title="Team Agent" data-icon="lucide:users" data-href="/developer-guide/agent-types-and-examples/team-agent">
    协调一组 Agent 协同工作。Team Agent 可以按顺序管理工作流，让 Agent 依次执行，也可以并行管理以实现同步执行。
  </x-card>
  <x-card data-title="Function Agent" data-icon="lucide:code-2" data-href="/developer-guide/agent-types-and-examples/function-agent">
    包装任何 JavaScript 或 TypeScript 函数，允许您将自定义逻辑、外部工具或旧代码集成到您的 Agent 工作流中。
  </x-card>
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agent-types-and-examples/image-agent">
    一种专门配置的 Agent，通过与底层图像生成模型交互，从文本描述中生成图像。
  </x-card>
  <x-card data-title="Transform Agent" data-icon="lucide:git-merge" data-href="/developer-guide/agent-types-and-examples/transform-agent">
    在其他 Agent 之间操作和重塑 JSON 数据。它使用 JSONata 表达式，提供一种功能强大、声明式的方式来处理数据格式化。
  </x-card>
</x-cards>

从上方选择一个 Agent 类型以查看其详细文档，包括配置选项和实用的代码示例。