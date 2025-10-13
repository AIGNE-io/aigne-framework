# Agent 钩子

Agent 钩子提供了一种强大的机制，可以介入 Agent 执行的生命周期。它们允许你在关键节点——例如 Agent 启动前、成功后或发生错误时——插入自定义逻辑，而无需更改 Agent 的核心实现。这使得钩子成为实现日志记录、监控、追踪、修改输入/输出以及自定义错误处理策略的理想选择。

## 核心概念

### 生命周期事件

你可以将自定义逻辑附加到 Agent 的各种生命周期事件上。每个钩子在执行过程中的特定时间点被触发，并接收相关上下文，例如输入、输出或错误。

以下是可用的生命周期钩子：

| 钩子 | 触发时机 | 用途 |
| :------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onStart` | 在 Agent 的 `process` 方法被调用之前。 | 预处理或验证输入、记录执行的开始，或设置所需资源。它可以在 Agent 接收输入之前对其进行修改。 |
| `onSuccess` | 在 Agent 的 `process` 方法成功完成后。 | 后处理或验证输出、记录成功结果，或执行清理操作。它可以修改最终的输出。 |
| `onError` | 在 Agent 执行期间抛出错误时。 | 记录错误、发送通知，或实现自定义重试逻辑。它可以向 Agent 发出重试操作的信号。 |
| `onEnd` | 在 `onSuccess` 或 `onError` 被调用之后。 | 无论结果如何都执行清理操作，例如关闭连接或释放资源。它也可以修改最终输出或触发重试。 |
| `onSkillStart` | 在当前 Agent 调用一个技能（子 Agent）之前。 | 拦截并记录技能调用，或修改传递给技能的输入。 |
| `onSkillEnd` | 在一个技能完成其执行（无论成功与否）之后。 | 记录技能的结果或错误，执行特定于该技能的清理，或处理特定于技能的错误。 |
| `onHandoff` | 当一个 Agent 将控制权移交给另一个 Agent 时。 | 跟踪多 Agent 系统中的控制流，并监控任务在 Agent 之间的委派方式。 |

### 钩子优先级

可以为钩子分配 `priority`，以便在为同一事件注册多个钩子时控制它们的执行顺序。这对于确保某些钩子（如身份验证或验证）在其他钩子之前运行非常有用。

可用的优先级级别有：
- `high`
- `medium`
- `low` (默认)

钩子按从 `high` 到 `low` 的优先级顺序执行。这由 `sortHooks` 工具处理，确保了可预测的执行序列。

```typescript
// 来自 packages/core/src/utils/agent-utils.ts
const priorities: NonNullable<AgentHooks["priority"]>[] = ["high", "medium", "low"];

export function sortHooks(hooks: AgentHooks[]): AgentHooks[] {
  return hooks
    .slice(0)
    .sort(({ priority: a = "low" }, { priority: b = "low" }) =>
      a === b ? 0 : priorities.indexOf(a) - priorities.indexOf(b),
    );
}
```

## 实现钩子

钩子可以通过两种方式实现：作为简单的回调函数，或作为独立的、可复用的 `Agent` 实例。

### 1. 函数钩子

对于简单的逻辑，你可以直接在 `AgentOptions` 对象中将钩子定义为一个函数。这是使用钩子最常见和最直接的方式。

**示例：一个简单的日志记录钩子**

此示例演示了一个基本的钩子，用于记录 Agent 执行的开始和结束。

```typescript
import { Agent, AgentOptions, Message } from "./agent"; // 假设 agent.ts 的路径

// 定义一个日志记录钩子对象
const loggingHook = {
  priority: "high",
  onStart: ({ agent, input }) => {
    console.log(`[INFO] Agent '${agent.name}' started with input:`, JSON.stringify(input));
  },
  onEnd: ({ agent, output, error }) => {
    if (error) {
      console.error(`[ERROR] Agent '${agent.name}' failed with error:`, error.message);
    } else {
      console.log(`[INFO] Agent '${agent.name}' succeeded with output:`, JSON.stringify(output));
    }
  }
};

// 创建一个新的 Agent 并附加钩子
const myAgent = new Agent({
  name: "DataProcessor",
  hooks: [loggingHook],
  // ... 其他 Agent 选项
});
```

### 2. Agent 钩子

对于更复杂或可复用的逻辑，你可以将钩子实现为其自己的 `Agent`。这允许你封装钩子逻辑、管理其状态，并在多个 Agent 之间复用它。钩子 Agent 的输入将是事件的有效载荷（例如 `{ agent, input, error }`）。

**示例：一个基于 Agent 的错误处理器**

在这里，`ErrorHandlingAgent` 是一个被设计为 `onError` 钩子的 Agent。它可以包含向监控服务发送警报的逻辑。

```typescript
import { FunctionAgent, Agent, Message } from "./agent"; // 假设 agent.ts 的路径

// 一个通过发送警报来处理错误的 Agent
const errorHandlingAgent = new FunctionAgent({
  name: "ErrorAlerter",
  process: async ({ agent, error }) => {
    console.log(`Alert! Agent ${agent.name} encountered an error: ${error.message}`);
    // 在真实场景中，你可以在这里调用外部监控 API。
  }
});

// 一个可能会失败的 Agent
class RiskyAgent extends Agent<{ command: string }, { result: string }> {
  async process(input) {
    if (input.command === "fail") {
      throw new Error("This operation was designed to fail.");
    }
    return { result: "Success!" };
  }
}

// 将错误处理 Agent 附加为钩子
const riskyAgent = new RiskyAgent({
  name: "RiskyOperation",
  hooks: [
    {
      onError: errorHandlingAgent,
    }
  ],
});
```

## 修改执行流程

钩子不仅用于观察；它们还可以主动修改 Agent 的执行流程。

- **修改输入**：`onStart` 钩子可以返回一个带有新 `input` 属性的对象，该属性将替换传递给 Agent 的 `process` 方法的原始输入。
- **修改输出**：`onSuccess` 或 `onEnd` 钩子可以返回一个带有新 `output` 属性的对象，该属性将替换 Agent 的原始结果。
- **触发重试**：`onError` 或 `onEnd` 钩子可以返回 `{ retry: true }` 来指示 Agent 重新运行其 `process` 方法。这对于处理瞬时错误很有用。

**示例：输入转换和重试逻辑**

```typescript
import { Agent, AgentOptions, Message } from "./agent"; // 假设 agent.ts 的路径

const transformationAndRetryHook = {
  onStart: ({ input }) => {
    // 在处理前标准化输入
    const transformedInput = { ...input, data: input.data.toLowerCase() };
    return { input: transformedInput };
  },
  onError: ({ error }) => {
    // 遇到网络错误时重试
    if (error.message.includes("network")) {
      console.log("Network error detected. Retrying...");
      return { retry: true };
    }
  }
};

const myAgent = new Agent({
  name: "NetworkAgent",
  hooks: [transformationAndRetryHook],
  // ... 其他 Agent 选项
});
```

## 声明式配置 (YAML)

钩子也可以在 YAML 配置文件中以声明方式定义，这在使用 AIGNE CLI 时特别有用。你可以内联定义钩子或从其他文件中引用它们。

**`test-agent-with-hooks.yaml` 示例**

此示例展示了一个使用多种钩子的团队 Agent，包括一个内联 AI Agent 和在外部文件 (`test-hooks.yaml`) 中定义的钩子。

```yaml
# 来自: packages/core/test-agents/test-agent-with-hooks.yaml
type: team
name: test_agent_with_default_input
hooks:
  priority: high
  on_start:
    type: ai
    name: test_hooks_inline # 一个作为钩子的内联 Agent
  on_success: test-hooks.yaml # 引用外部钩子定义
  on_error: test-hooks.yaml
  on_end: test-hooks.yaml
  on_skill_start: test-hooks.yaml
  on_skill_end: test-hooks.yaml
  on_handoff: test-hooks.yaml
skills:
  - url: ./test-agent-with-default-input-skill.yaml
    hooks:
      # 钩子也可以附加到特定的技能上
      on_start: test-hooks.yaml
  - type: ai
    name: test_agent_with_default_input_skill2.yaml
    hooks:
      on_start: test-hooks.yaml
```

这种声明式方法可以实现关注点的清晰分离，将 Agent 的逻辑与日志记录、安全和错误处理等横切关注点解耦。