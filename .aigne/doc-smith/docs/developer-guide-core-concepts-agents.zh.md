# Agents

在 AIGNE 框架中，**`Agent`** 是工作的基本单元。它是一个抽象类，为所有专业化的 Agent 类型建立了一个标准契约。一个 Agent 可以被概念化为一个能够执行特定任务、处理信息并与系统中其他 Agent 交互的独立工作者。

每一个专业化的 Agent，无论是设计用于与 AI 模型交互、转换数据，还是协调一组其他 Agent，都从这个基础的 `Agent` 类继承其核心结构和行为。这一架构原则确保了整个框架的一致性和可预测性。

关于专业化 Agent 类型的进一步阅读，请参阅 [Agent Types](./developer-guide-agents.md) 部分。

## 核心概念

`Agent` 类的设计围绕几个核心概念，这些概念定义了其身份、数据契约和操作行为。这些都是在 Agent 实例化期间通过 `AgentOptions` 对象进行配置的。

### 关键属性

以下属性定义了 Agent 的配置：

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `name` | `string` | Agent 的唯一标识符，用于日志记录和引用。如果未指定，则默认为构造函数的类名。 |
| `description` | `string` | 对 Agent 的目的和功能的人类可读摘要，有助于文档记录和调试。 |
| `inputSchema` | `ZodType` | 一个 Zod 模式，定义了 Agent 输入数据的结构和验证规则。这确保了数据的完整性。 |
| `outputSchema` | `ZodType` | 一个 Zod 模式，定义了 Agent 输出数据的结构和验证规则。 |
| `skills` | `Agent[]` | 该 Agent 可以调用的其他 Agent 的列表，用于执行委托的子任务，从而实现组合行为。 |
| `memory` | `MemoryAgent` | 一个可选的内存单元，允许 Agent 在多次交互中持久化和回忆状态。 |
| `hooks` | `AgentHooks[]` | 一组生命周期钩子（例如 `onStart`、`onEnd`），用于在运行时观察或修改 Agent 行为。 |
| `guideRails` | `GuideRailAgent[]` | 一组专业化的 Agent，用于对该 Agent 的输入和输出强制执行规则、策略或约束。 |

### `process` 方法

`process` 方法是每个 Agent 的核心组件。它在基础 `Agent` 类中被定义为一个 `abstract` 方法，这强制要求任何具体的 Agent 类都必须提供一个实现。该方法包含了定义 Agent 功能的核心逻辑。

该方法接收经过验证的输入消息和调用选项（包括执行 `Context`），并负责产生输出。

```typescript Agent.ts icon=logos:typescript
export abstract class Agent<I extends Message = any, O extends Message = any> {
  // ... 构造函数和其他属性

  /**
   * Agent 的核心处理方法，必须在子类中实现
   *
   * @param input 输入消息
   * @param options Agent 调用选项
   * @returns 处理结果
   */
  abstract process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>;

  // ... 其他方法
}
```

返回值 `AgentProcessResult` 可以是一个直接的对象、一个流式响应、一个异步生成器，或者另一个用于任务转发的 Agent 实例。

## Agent 生命周期

Agent 的执行遵循一个结构化的生命周期，该生命周期通过钩子为扩展提供了清晰的切入点。

```d2
direction: down

Agent-Lifecycle: {
  label: "Agent 执行生命周期"
  style: {
    stroke-dash: 4
  }

  invoke: {
    label: "1. 调用 invoke(input)"
    shape: oval
  }

  on-start: {
    label: "2. onStart 钩子"
    shape: rectangle
  }

  input-validation: {
    label: "3. 输入有效？"
    shape: diamond
  }

  process: {
    label: "4. 执行 process(input)"
    shape: rectangle
    style.fill: "#e6f7ff"
  }

  output-validation: {
    label: "5. 输出有效？"
    shape: diamond
  }

  on-end: {
    label: "6. onEnd 钩子\n(处理成功或错误)"
    shape: rectangle
  }

  return-value: {
    label: "7. 返回输出或抛出错误"
    shape: oval
  }
}

Agent-Lifecycle.invoke -> Agent-Lifecycle.on-start
Agent-Lifecycle.on-start -> Agent-Lifecycle.input-validation
Agent-Lifecycle.input-validation -> Agent-Lifecycle.process: "是"
Agent-Lifecycle.process -> Agent-Lifecycle.output-validation
Agent-Lifecycle.output-validation -> Agent-Lifecycle.on-end: "是"
Agent-Lifecycle.on-end -> Agent-Lifecycle.return-value
Agent-Lifecycle.input-validation -> Agent-Lifecycle.on-end: "否"
Agent-Lifecycle.output-validation -> Agent-Lifecycle.on-end: "否"
```

1.  **调用**：通过使用输入负载调用其 `invoke()` 方法来启动 Agent 的执行。
2.  **`onStart` 钩子**：触发 `onStart` 钩子，为预处理逻辑（如日志记录或输入转换）提供机会。
3.  **输入验证**：根据 Agent 的 `inputSchema` 自动验证输入数据。如果验证失败，则中止该过程。
4.  **`process()` 执行**：执行 Agent 的 `process()` 方法中定义的核心逻辑。
5.  **输出验证**：根据 Agent 的 `outputSchema` 验证 `process()` 方法的结果。
6.  **`onEnd` 钩子**：使用最终输出或发生的任何错误触发 `onEnd` 钩子。这是用于后处理、记录结果或实现自定义失败处理的指定点。
7.  **返回值**：将最终经过验证的输出返回给原始调用者。

这种系统化的生命周期确保了数据的一致性验证，并为自定义逻辑提供了清晰、非侵入式的扩展点。

## 实现示例

要创建一个功能性 Agent，请扩展基础 `Agent` 类并实现 `process` 方法。以下示例定义了一个 Agent，它接受两个数字并返回它们的和。

```typescript title="adder-agent.ts" icon=logos:typescript
import { Agent, type AgentInvokeOptions, type Message } from "@aigne/core";
import { z } from "zod";

// 1. 使用 Zod 定义输入和输出模式以进行验证。
const inputSchema = z.object({
  a: z.number(),
  b: z.number(),
});

const outputSchema = z.object({
  sum: z.number(),
});

// 2. 从 Zod 模式推断 TypeScript 类型。
type AddAgentInput = z.infer<typeof inputSchema>;
type AddAgentOutput = z.infer<typeof outputSchema>;

// 3. 通过扩展 Agent 创建自定义 Agent 类。
export class AddAgent extends Agent<AddAgentInput, AddAgentOutput> {
  constructor() {
    super({
      name: "AddAgent",
      description: "一个将两个数字相加的 Agent。",
      inputSchema,
      outputSchema,
    });
  }

  // 4. 在 process 方法中实现核心逻辑。
  async process(input: AddAgentInput, options: AgentInvokeOptions): Promise<AddAgentOutput> {
    const { a, b } = input;
    const sum = a + b;
    return { sum };
  }
}
```

此示例说明了标准的实现模式：
1.  为输入和输出数据结构定义 Zod 模式。
2.  使用相应的输入和输出类型扩展 `Agent` 类。
3.  将模式和其他元数据提供给 `super()` 构造函数。
4.  在 `process` 方法中实现 Agent 的特定逻辑。

## 总结

`Agent` 类是 AIGNE 框架中的基础抽象。它为所有操作单元提供了一致且强大的契约，确保它们是可识别的，遵循清晰的数据模式，并遵循可预测的执行生命周期。通过抽象这种通用机制，该框架允许开发者专注于在 `process` 方法中实现其任务所需的独特逻辑。

有关 Agent 如何由中央引擎执行和管理的详细信息，请参阅 [AIGNE](./developer-guide-core-concepts-aigne-engine.md) 文档。要探索各种可用的专业化 Agent 实现，请参阅 [Agent Types](./developer-guide-agents.md) 部分。