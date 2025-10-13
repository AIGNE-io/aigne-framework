# Agent

`Agent` 类是 AIGNE 框架的基石。它作为所有 Agent 的基类，为定义输入/输出模式、实现处理逻辑以及管理 Agent 系统内的交互提供了一个强大的机制。

通过扩展 `Agent` 类，你可以创建具有广泛功能的自定义 Agent，从简单的基于函数的实用工具到复杂的、由人工智能驱动的实体。Agent 被设计为模块化、可重用，并能够通过消息传递系统相互通信。

```d2
direction: down

Input-Message: {
  label: "输入消息\n(来自 subscribeTopic)"
  shape: oval
}

Output-Message: {
  label: "输出消息\n(至 publishTopic)"
  shape: oval
}

Agent: {
  label: "Agent 实例"
  shape: rectangle
  style: {
    stroke-width: 3
  }

  invoke-method: {
    label: "invoke()"
    shape: rectangle
    style.fill: "#d0e0f0"
  }

  Pre-Processing: {
    label: "预处理"
    shape: rectangle
    style.stroke-dash: 2

    GuideRails-Pre: "GuideRails (前置)"
    onStart-Hook: "onStart 钩子"
    Input-Schema-Validation: {
      label: "输入模式验证\n(Zod)"
    }
  }

  process-method: {
    label: "process()\n(自定义核心逻辑)"
    shape: rectangle
    style.fill: "#e0f0d0"

    Skills: {
      label: "技能\n(其他 Agent)"
      shape: rectangle
    }
    Memory: {
      label: "记忆"
      shape: cylinder
    }
  }

  Post-Processing: {
    label: "后处理"
    shape: rectangle
    style.stroke-dash: 2

    Output-Schema-Validation: {
      label: "输出模式验证\n(Zod)"
    }
    onSuccess-onError-Hooks: "onSuccess / onError 钩子"
    GuideRails-Post: "GuideRails (后置)"
    onEnd-Hook: "onEnd 钩子"
  }
}

FunctionAgent: {
  label: "FunctionAgent\n(简化的 Agent)"
  shape: rectangle
}

Input-Message -> Agent.invoke-method: "1. 调用"

Agent.invoke-method -> Agent.Pre-Processing.GuideRails-Pre: "2. 前置验证"
Agent.Pre-Processing.GuideRails-Pre -> Agent.Pre-Processing.onStart-Hook: "3. 触发"
Agent.Pre-Processing.onStart-Hook -> Agent.Pre-Processing.Input-Schema-Validation: "4. 验证输入"
Agent.Pre-Processing.Input-Schema-Validation -> Agent.process-method: "5. 执行"

Agent.process-method -> Agent.process-method.Skills: "委托给"
Agent.process-method <-> Agent.process-method.Memory: "访问"

Agent.process-method -> Agent.Post-Processing.Output-Schema-Validation: "6. 验证输出"
Agent.Post-Processing.Output-Schema-Validation -> Agent.Post-Processing.onSuccess-onError-Hooks: "7. 触发"
Agent.Post-Processing.onSuccess-onError-Hooks -> Agent.Post-Processing.GuideRails-Post: "8. 后置验证"
Agent.Post-Processing.GuideRails-Post -> Agent.Post-Processing.onEnd-Hook: "9. 触发"
Agent.Post-Processing.onEnd-Hook -> Output-Message: "10. 发布结果"

FunctionAgent -> Agent.process-method: "为...提供函数"
```

## 核心概念

- **消息驱动架构**：Agent 基于发布-订阅模型运行。它们订阅特定主题以接收输入消息，并将其输出发布到其他主题，从而实现无缝的 Agent 间通信。
- **输入/输出模式**：你可以使用 Zod 模式定义 `inputSchema` 和 `outputSchema`，以确保流入和流出 Agent 的所有数据都经过验证并符合预定义的结构。
- **技能**：Agent 可以拥有 `skills`，即其他 Agent 或函数。这使你可以创建复杂的 Agent，将任务委托给更专业的 Agent，从而促进模块化和分层设计。
- **生命周期钩子**：Agent 的生命周期可以通过 `hooks`（例如 `onStart`、`onEnd`、`onError`）进行拦截。钩子对于日志记录、监控、追踪以及在 Agent 执行的各个阶段实现自定义逻辑非常宝贵。
- **流式响应**：Agent 可以以流式方式返回响应，这对于像聊天机器人这样的实时应用非常理想，因为结果可以在生成时增量显示。
- **GuideRails**：`guideRails` 是专门的 Agent，充当另一个 Agent 执行过程的验证器或控制器。它们可以检查输入和预期输出以强制执行规则、策略或业务逻辑，甚至可以在必要时中止该过程。
- **记忆**：Agent 可以配备 `memory` 来持久化状态并从过去的交互中回忆信息，从而实现更具上下文感知能力的行为。

## 关键属性

`Agent` 类通过传递给其构造函数的 `AgentOptions` 对象进行配置。以下是一些最重要的属性：

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | 为 Agent 指定的唯一名称，用于识别和日志记录。默认为类名。 |
| `description` | `string` | 对 Agent 的用途和功能进行的人类可读的描述。 |
| `subscribeTopic` | `string \| string[]` | Agent 监听传入消息的主题。 |
| `publishTopic` | `string \| string[] \| function` | Agent 发送其输出消息的主题。 |
| `inputSchema` | `ZodType` | 用于验证输入消息结构的 Zod 模式。 |
| `outputSchema` | `ZodType` | 用于验证输出消息结构的 Zod 模式。 |
| `skills` | `(Agent \| FunctionAgentFn)[]` | 该 Agent 可调用以执行子任务的其他 Agent 或函数的列表。 |
| `memory` | `MemoryAgent \| MemoryAgent[]` | 用于存储和检索信息的一个或多个记忆 Agent。 |
| `hooks` | `AgentHooks[]` | 用于将自定义逻辑附加到 Agent 生命周期事件的钩子对象数组。 |
| `guideRails` | `GuideRailAgent[]` | 用于验证、转换或控制消息流的 GuideRail Agent 列表。 |
| `retryOnError` | `boolean \| object` | 失败时自动重试的配置。 |

## 关键方法

### `invoke(input, options)`

这是执行 Agent 的主要方法。它接收一个 `input` 消息和一个 `options` 对象。`invoke` 方法处理整个生命周期，包括运行钩子、验证模式、执行 `process` 方法以及处理错误。

- **常规调用**：默认情况下，`invoke` 返回一个 Promise，该 Promise 会解析为最终的输出对象。
- **流式调用**：如果将 `options.streaming` 设置为 `true`，`invoke` 会返回一个 `ReadableStream`，该流在响应的各个部分可用时发出它们。

**示例：常规调用**
```typescript
const result = await agent.invoke({ query: "What is AIGNE?" });
console.log(result);
```

**示例：流式调用**
```typescript
const stream = await agent.invoke(
  { query: "Tell me a story." },
  { streaming: true }
);

for await (const chunk of stream) {
  // Process each chunk as it arrives
  if (chunk.delta.text) {
    process.stdout.write(chunk.delta.text.content);
  }
}
```

### `process(input, options)`

这是一个**抽象方法**，你必须在你的自定义 Agent 子类中实现它。它包含了 Agent 的核心逻辑。它接收经过验证的输入，并负责返回输出。`process` 方法可以返回一个直接的对象、一个 `ReadableStream`、一个 `AsyncGenerator`，甚至另一个 `Agent` 实例来转移控制权。

**示例：实现 `process`**
```typescript
import { Agent, type AgentInvokeOptions, type Message } from "@aigne/core";
import { z } from "zod";

class EchoAgent extends Agent {
  constructor() {
    super({
      name: "EchoAgent",
      description: "An agent that echoes the input message.",
      inputSchema: z.object({ message: z.string() }),
      outputSchema: z.object({ response: z.string() }),
    });
  }

  async process(input: { message: string }, options: AgentInvokeOptions) {
    // Agent 的核心逻辑
    return { response: `You said: ${input.message}` };
  }
}
```

### `shutdown()`

此方法清理 Agent 使用的资源，例如主题订阅和记忆连接。在 Agent 不再需要时调用此方法非常重要，以防止内存泄漏。

## Agent 生命周期和钩子

Agent 的执行生命周期是一个定义明确的过程，可以使用钩子进行监控和修改。

1.  **`onStart`**：在 Agent 的 `process` 方法被调用之前触发。你可以使用此钩子修改输入或执行设置任务。
2.  **`onSkillStart` / `onSkillEnd`**：在调用技能（另一个 Agent）前后触发。
3.  **`onSuccess`**：在 `process` 方法成功完成并且输出已被处理后触发。
4.  **`onError`**：如果在处理过程中发生错误则触发。你可以在此处实现自定义的错误处理或重试逻辑。
5.  **`onEnd`**：在调用的最末尾触发，无论调用成功还是失败。这对于清理、日志记录和指标收集非常理想。

**示例：使用钩子**
```typescript
const loggingHook = {
  onStart: async ({ agent, input }) => {
    console.log(`Agent ${agent.name} started with input:`, input);
  },
  onEnd: async ({ agent, error }) => {
    if (error) {
      console.error(`Agent ${agent.name} failed:`, error);
    } else {
      console.log(`Agent ${agent.name} finished successfully.`);
    }
  },
};

const agent = new MyAgent({
  hooks: [loggingHook],
});
```

## `FunctionAgent`

对于更简单的用例，AIGNE 提供了 `FunctionAgent` 类。它允许你从单个函数创建一个 Agent，从而无需创建一个继承 `Agent` 的新类。这非常适合创建简单的、无状态的实用工具 Agent。

**示例：创建 `FunctionAgent`**
```typescript
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const multiplierAgent = new FunctionAgent({
  name: "Multiplier",
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  outputSchema: z.object({ result: z.number() }),
  process: async (input) => {
    return { result: input.a * input.b };
  },
});

const result = await multiplierAgent.invoke({ a: 5, b: 10 });
console.log(result); // { result: 50 }
```