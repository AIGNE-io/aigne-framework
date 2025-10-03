# 核心概念

AIGNE 框架采用模块化和可扩展的架构设计。理解其核心组件是构建稳健且可扩展的 AI 驱动应用程序的关键。本节概述了构成该框架的基本构建块和架构原则。

您将与之交互的主要组件是 AIGNE 引擎、Agent、模型和内存。每个组件在 AI 工作流的生命周期中都扮演着独特的角色。

<x-cards data-columns="2">
  <x-card data-title="AIGNE 引擎" data-icon="lucide:server" data-href="/developer-guide/core-concepts/aigne-engine">
    管理 Agent、状态和通信的中央协调器。
  </x-card>
  <x-card data-title="Agent 详解" data-icon="lucide:bot" data-href="/developer-guide/core-concepts/agents-explained">
    封装逻辑和执行任务的基本构建块。
  </x-card>
  <x-card data-title="模型" data-icon="lucide:brain-circuit" data-href="/developer-guide/core-concepts/models">
    用于与各种底层 AI 模型交互的抽象。
  </x-card>
  <x-card data-title="内存" data-icon="lucide:database" data-href="/developer-guide/core-concepts/memory">
    使 Agent 能够存储和回忆过去交互中的信息。
  </x-card>
    <x-card data-title="提示" data-icon="lucide:file-text" data-href="/developer-guide/core-concepts/prompts">
    一个用于构建动态和可复用提示的强大模板引擎。
  </x-card>
</x-cards>

## 架构概述

下图说明了 AIGNE 框架中核心类之间的关系。

```d2
direction: down

PromptBuilderBuildOptions: {
  shape: class
  "+Context context"
  "+Agent agent"
  "+object input"
  "+ChatModel model"
}

Prompt: {
  shape: class
  "+List<object> messages"
  "+List<Agent> skills"
  "+object toolChoice"
  "+object responseFormat"
}

PromptBuilder: {
  shape: class
  "+build(PromptBuilderBuildOptions options): Prompt"
}

ChatModel: {
  shape: class
}

ImageModel: {
  shape: class
}

Agent: {
  shape: class
  "+string name"
  "+string description"
  "+object inputSchema"
  "+object outputSchema"
  "+List<string> subscribeTopic"
  "+List<string> publishTopic"
  "+List<Agent> skills"
  "+MemoryAgent memory"
  "+invoke(object input, Context context): object"
  "+shutdown(): void"
  "+process(object input, Context context): object"
  "-preprocess(): void"
  "-postprocess(): void"
}

AIAgent: {
  shape: class
  "+ChatModel model"
  "+PromptBuilder instructions"
  "+string outputKey"
  "+object toolChoice"
  "+boolean catchToolsError"
}

TeamAgent: {
  shape: class
  "+ProcessMode mode"
}

ImageAgent: {
  shape: class
  "+ImageModel model"
  "+PromptBuilder instructions"
}

FunctionAgent: {
  shape: class
  "+Function process"
}

RPCAgent: {
  shape: class
  "+string url"
}

MCPAgent: {
  shape: class
  "+MCPClient client"
}

MCPClient: {
  shape: class
}

Message: {
  shape: class
  "+object output"
}

MessageQueue: {
  shape: class
  "+publish(string topic, Message message): void"
  "+subscribe(string topic, Function callback): void"
  "+unsubscribe(string topic, Function callback): void"
}

Context: {
  shape: class
  "+ChatModel model"
  "+ImageModel imageModel"
  "+List<Agent> skills"
  "+invoke(Agent agent, object input): object"
  "+publish(string topic, Message message): void"
  "+subscribe(string topic, Function callback): void"
  "+unsubscribe(string topic, Function callback): void"
}

UserAgent: {
  shape: class
}

EventEmitter: {
  shape: class
  "+on(): void"
  "+emit(): void"
}

AIGNE: {
  shape: class
  "+string name"
  "+string description"
  "+ChatModel model"
  "+object limits"
  "+List<Agent> agents"
  "+List<Agent> skills"
  "+load(string path): AIGNE"
  "+addAgent(Agent agent): void"
  "+invoke(Agent agent): UserAgent"
  "+invoke(Agent agent, string input): object"
  "+invoke(Agent agent, object input): object"
  "+publish(string topic, Message message): void"
  "+subscribe(string topic, Function callback): void"
  "+unsubscribe(string topic, Function callback): void"
  "+shutdown(): void"
}

# 关系
PromptBuilder -> PromptBuilderBuildOptions: { style.stroke-dash: 2 }
PromptBuilder -> Prompt: { style.stroke-dash: 2 }

ChatModel -> Agent: { target-arrowhead: { shape: unfilled triangle } }
ImageModel -> Agent: { target-arrowhead: { shape: unfilled triangle } }
AIAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
TeamAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
ImageAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
FunctionAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
RPCAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
MCPAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
UserAgent -> Agent: { target-arrowhead: { shape: unfilled triangle } }
Context -> MessageQueue: { target-arrowhead: { shape: unfilled triangle } }
AIGNE -> EventEmitter: { target-arrowhead: { shape: unfilled triangle } }

AIAgent -> PromptBuilder: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }
ImageAgent -> PromptBuilder: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }
ImageAgent -> ImageModel: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }
MCPAgent -> MCPClient: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }
Context -> ChatModel: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }
Context -> ImageModel: { source-arrowhead: { shape: diamond }, style.stroke-dash: 2 }

MessageQueue -> Message: { style.stroke-dash: 2 }
```

处于中心的是 `AIGNE` 引擎，它管理着一组 `Agent` 实例。`Agent` 类是所有专用 Agent（如 `AIAgent`、`TeamAgent` 和 `FunctionAgent`）的基类。当一个 Agent 被调用时，它在一个 `Context` 中运行，该 `Context` 提供对共享资源（如 `ChatModel` 或 `ImageModel`）的访问，并通过 `MessageQueue` 处理通信。

### AIGNE 引擎

`AIGNE` 类是框架的主要执行引擎。它负责：
- 加载和管理一组 Agent。
- 提供调用 Agent 的统一接口。
- 协调 Agent 之间的整体工作流和通信。
- 处理系统级问题，如状态管理和资源限制。

有关详细说明，请参阅 [AIGNE 引擎](./developer-guide-core-concepts-aigne-engine.md)。

### Agent

`Agent` 是 AIGNE 框架中最基本的概念。它是一个能够执行任务、做出决策并与其他 Agent 通信的自主实体。基础 `Agent` 类提供了核心功能，开发者可以通过扩展它来创建专门的 Agent。其主要职责包括：
- 定义用于数据验证的输入和输出模式。
- 在 `process` 方法中实现核心逻辑。
- 订阅和发布主题上的消息以进行 Agent 间通信。
- 利用“技能”（即其他 Agent）来委派任务。

在 [Agent 详解](./developer-guide-core-concepts-agents-explained.md)中了解更多信息。

### 模型

模型是将 Agent 连接到底层大语言模型（LLM）或图像生成模型的抽象。该框架提供了 `ChatModel` 和 `ImageModel` 基类，使得与 OpenAI、Gemini 和 Claude 等各种 AI 提供商的集成变得容易。这种抽象允许您在不改变 Agent 核心逻辑的情况下切换不同的 AI 模型。

有关更多详细信息，请参阅[模型](./developer-guide-core-concepts-models.md)文档。

### 内存

为了实现有状态的对话和解决复杂问题，Agent 需要能够记住过去的交互。`MemoryAgent` 提供了这种能力。它与 `Recorder` 和 `Retriever` 技能协同工作，以存储和回忆信息，从而使 Agent 在多次调用中拥有持久的记忆。

欲了解更多信息，请访问[内存](./developer-guide-core-concepts-memory.md)部分。

### 提示

与 AI 模型的有效沟通依赖于精心设计的提示。`PromptBuilder` 是一个实用工具，有助于创建动态和可复用的提示。它使用强大的模板引擎，允许您插入变量、包含部分模板，并轻松构建复杂的提示结构。

深入了解[提示](./developer-guide-core-concepts-prompts.md)文档。