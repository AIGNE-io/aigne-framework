本文档为 AIGNE 框架的核心概念提供了一份面向开发者的指南。它解释了基本构建模块、它们之间的交互以及整体架构，使工程师能够有效地构建系统并与系统集成。

### AIGNE 框架的核心概念

AIGNE 框架围绕一个中心组件设计：**Agent**。理解 Agent 及其相关概念是充分利用该平台全部功能的关键。本指南将引导您了解从 Agent 的生命周期到其强大的组合功能（如技能和记忆）等基本构建模块。

### 什么是 Agent？

Agent 是 AIGNE 生态系统中的基本行动者。它是一个自主实体，旨在通过处理输入、做出决策并产生结构化输出来执行特定任务。每个 Agent 都封装了自己的逻辑、配置和能力。

所有 Agent 的基础是 `Agent` 类，定义在 `packages/core/src/agents/agent.ts` 中。它为以下方面提供了核心结构：

-   **输入和输出模式**：使用 Zod 模式（`inputSchema`、`outputSchema`）确保数据完整性。
-   **核心处理逻辑**：抽象的 `process` 方法，必须由子类实现以定义 Agent 的独特行为。
-   **生命周期钩子**：一种在 Agent 执行的各个阶段（例如 `onStart`、`onEnd`）拦截并添加功能的机制。
-   **技能和记忆**：用于组合复杂行为和维护状态的功能。

```typescript
// packages/core/src/agents/agent.ts

export abstract class Agent<I extends Message = any, O extends Message = any> {
  // ...
  abstract process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>;
  // ...
}
```

### Agent 生命周期

每个 Agent 在被调用时都遵循一个明确定义的生命周期。该生命周期确保了一致的执行、验证和可观察性。`invoke` 方法是启动此过程的入口点。

下图说明了 Agent 生命周期的关键阶段：

```d2
direction: down

invoke: {
  label: "invoke()"
  shape: oval
}

onStart: {
  label: "onStart 钩子"
  shape: rectangle
}

validateInput: {
  label: "验证输入\n(inputSchema)"
  shape: diamond
}

process: {
  label: "process() 方法\n(核心逻辑)"
  shape: rectangle
}

validateOutput: {
  label: "验证输出\n(outputSchema)"
  shape: diamond
}

onEnd: {
  label: "onEnd 钩子"
  shape: rectangle
}

returnResult: {
  label: "返回结果"
  shape: oval
}

returnError: {
  label: "返回错误"
  shape: oval
}

invoke -> onStart
onStart -> validateInput
validateInput -> process: "有效"
validateInput -> returnError: "无效"
process -> validateOutput
validateOutput -> onEnd: "有效"
validateOutput -> returnError: "无效"
onEnd -> returnResult
```

### Agent 的特殊化类型

AIGNE 框架提供了几种特殊化的 Agent 类型，每种类型都为特定目的量身定制。这些类型定义在 `packages/core/src/loader/agent-yaml.ts` 中，通常由 YAML 配置文件中的 `type` 属性指定。

-   **AI Agent (`type: "ai"`)**：最常见的类型，设计用于与大型语言模型 (LLM) 交互。它使用 `PromptBuilder` 从指令、输入、记忆和可用技能（工具）构建详细的提示，然后处理模型的响应。
-   **Team Agent (`type: "team"`)**：作为一组其他 Agent（技能）的编排器或管理者。它可以顺序、并行或在更复杂的工作流（如反思，即一个 Agent 审查另一个 Agent 的工作）中处理输入。
-   **Function Agent (`type: "function"`)**：一个轻量级包装器，可将任何 JavaScript/TypeScript 函数转换为 Agent。这对于将自定义业务逻辑、计算或第三方 API 调用直接集成到 Agent 生态系统中非常理想。
-   **Transform Agent (`type: "transform"`)**：一个实用工具 Agent，使用 JSONata 查询将 JSON 数据从一种格式重构或转换为另一种格式。它非常适合使一个 Agent 的输出适应另一个 Agent 的输入要求。
-   **Image Agent (`type: "image"`)**：专门用于与图像生成模型交互。它接收指令并生成图像。
-   **MCP Agent (`type: "mcp"`)**：促进与外部系统或命令行工具的交互。

### 组合：构建复杂系统

AIGNE 的真正威力在于将简单的、专门化的 Agent 组合成复杂的、精密的系统。这通过三种主要机制实现：技能、钩子和记忆。

#### 技能

一个 Agent 可以配备一系列**技能**，这些技能是它可以调用的其他 Agent。这允许进行模块化和分层设计。例如，一个“旅行规划师” `TeamAgent` 可能会使用一个“机票预订员” `AIAgent`、一个“酒店查找器” `FunctionAgent` 和一个“货币转换器” `TransformAgent` 作为其技能。父 Agent 可以将任务委托给适当的技能，编排它们的组合输出以实现复杂的目标。

```typescript
// packages/core/src/agents/agent.ts
export interface AgentOptions<I extends Message = Message, O extends Message = Message>
  extends Partial<Pick<Agent, "guideRails">> {
  // ...
  skills?: (Agent | FunctionAgentFn)[];
  // ...
}
```

#### 钩子

**钩子**提供了一种强大的机制，用于实现可观察性并扩展 Agent 行为，而无需修改其核心逻辑。它们允许您将自定义功能附加到 Agent 生命周期的不同阶段（`onStart`、`onEnd`、`onError`、`onSkillStart` 等）。这对于以下方面很有用：

-   记录和追踪 Agent 执行。
-   实现自定义错误处理和重试逻辑。
-   动态修改输入或输出。
-   监控性能和成本。

#### 记忆

Agent 可以配置**记忆**以在多次调用中维护状态和上下文。`MemoryAgent` 可以记录 Agent 交互的输入和输出。在随后的调用中，Agent 可以检索此历史记录，使其能够“记住”过去的对话或结果。这对于构建对话式 AI、多步工作流以及从经验中学习的 Agent 至关重要。

### 使用 YAML 进行配置

虽然可以在 TypeScript 中以编程方式定义和配置 Agent，但最常见的方法是在 `.yaml` 文件中定义它们。`packages/core/src/loader/agent-yaml.ts` 中的 `loadAgentFromYamlFile` 函数会解析这些文件并构造相应的 Agent 对象。这种配置与逻辑的分离使得无需更改代码即可更轻松地管理、共享和修改 Agent。

以下是一个在 YAML 中定义的 `AIAgent` 的简单示例：

```yaml
type: ai
name: Greeter
description: A simple agent that greets the user.

instructions: "You are a friendly assistant. Greet the user based on their name and wish them a good day."

inputSchema:
  type: object
  properties:
    name:
      type: string
      description: "The name of the person to greet."
  required:
    - name

outputSchema:
  type: object
  properties:
    greeting:
      type: string
      description: "The personalized greeting message."
  required:
    - greeting
```

### 使用 `PromptBuilder` 进行提示工程

对于 `AIAgent`，`PromptBuilder` 类 (`packages/core/src/prompt/prompt-builder.ts`) 是一个关键组件。它负责动态构建发送给语言模型的最终提示。它智能地组装各种上下文片段：

-   **系统指令**：在 Agent 配置中定义的基本指令。
-   **用户输入**：为当前调用提供的特定输入。
-   **记忆**：从 `MemoryAgent` 检索到的过去交互。
-   **工具/技能**：模型可以选择使用的可用技能的定义。

这种复杂的组装方式允许与底层 AI 模型进行高度情境化和强大的交互。

### 结论

AIGNE 框架提供了一个以 **Agent** 为中心的强大而灵活的架构。通过理解 Agent 生命周期、为特定任务专门化 Agent，并使用技能、钩子和记忆来组合它们，开发者可以构建强大而复杂的自主系统。使用 YAML 进行配置进一步增强了模块化和易管理性。