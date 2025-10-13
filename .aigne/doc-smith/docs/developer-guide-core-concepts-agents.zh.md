本文档全面介绍了 `Agent` 类，该类是 AIGNE 框架内所有 Agent 的基础构建模块。您将学习其核心概念、生命周期以及如何创建自定义 Agent。

## Agent 类图

下图展示了 `Agent` 类的架构，包括其关键属性和方法。

```d2
direction: down

Agent: {
  shape: class

  # 属性
  + id: string
  + name: string
  + description: string
  - state: AgentState
  # llm: LLM
  # tools: Tool[]

  # 生命周期方法
  + constructor(options)
  + run(input): Promise<any>
  + onStart(): void
  + onMessage(message): void
  + onStop(): void

  # 内部方法
  - useTool(toolName, args): any
}
```

## 简介

`Agent` 是系统中所有 Agent 的基类。它提供了一个强大的框架，用于定义输入/输出模式、实现处理逻辑以及管理 Agent 的生命周期。通过扩展 `Agent` 类，您可以创建具有广泛功能的自定义 Agent，包括：

*   处理带验证的结构化输入和输出数据。
*   通过消息传递系统与其他 Agent 通信。
*   支持流式和非流式响应。
*   维护过去交互的记忆。
*   将任务委托给其他 Agent（称为“技能”）。

## 核心概念

理解这些核心概念是有效使用 `Agent` 类的关键。

### Agent 识别

*   **`name`**: 用于识别和记录的 `string`。如果未提供，则默认为构造函数的名称。
*   **`alias`**: 可用于引用 Agent 的备用名称 `string[]`，在 AIGNE CLI 中特别有用。
*   **`description`**: 一段人类可读的 `string`，用于解释 Agent 的功能。这对于文档和调试非常有用。

### 数据模式

*   **`inputSchema`**: 一个 Zod 模式，用于定义 Agent 输入的结构。它确保传入的消息符合预期的格式。
*   **`outputSchema`**: 一个 Zod 模式，用于验证 Agent 的输出，确保其在发送前符合定义的结构。
*   **`defaultInput`**: 一个为输入模式提供默认值或部分值的对象，可简化 Agent 调用。

### 通信

*   **`subscribeTopic`**: Agent 监听的一个或多个主题 `string` | `string[]`。Agent 将处理发布在这些主题上的消息。每个 Agent 也会自动订阅一个默认主题：`$agent_[agent_name]`。
*   **`publishTopic`**: 一个 `string`、`string[]` 或一个函数，用于确定 Agent 的输出应发送到哪个（些）主题。

### 功能与行为

*   **`skills`**: 该 Agent 可以调用的其他 `Agent` 实例或 `FunctionAgentFn` 的数组。这允许通过组合更小、更专业的 Agent 来创建复杂的行为。
*   **`memory`**: 一个或多个 `MemoryAgent` 实例，Agent 可以用它们来存储和检索过去交互的信息。
*   **`guideRails`**: 一个 `GuideRailAgent` 实例列表，充当验证器或控制器。它们可以检查 Agent 的输入和输出，甚至在不满足某些条件时中止进程。
*   **`retryOnError`**: 用于在失败时自动重试 Agent `process` 方法的配置。您可以指定重试次数、退避策略以及决定是否应进行重试的自定义逻辑。

## Agent 生命周期与处理

### 调用

执行 Agent 的主要方式是调用 `invoke()` 方法。该方法处理 Agent 运行的整个生命周期。

*   **输入**：`invoke()` 的第一个参数是 Agent 的输入 `message`。
*   **选项**：第二个参数是一个 `options` 对象，其中必须包含一个 `context`。该上下文为 Agent 提供运行时环境。
*   **流式 vs. 非流式**：选项中的 `streaming` 标志决定了返回类型。
    *   如果 `streaming: true`，`invoke()` 返回一个 `ReadableStream`，它会在响应块生成时发出它们。这对于像聊天机器人这样的实时应用非常理想。
    *   如果为 `false` 或未定义，`invoke()` 返回一个 `Promise`，该 Promise 会解析为最终的完整输出对象。

以下是如何调用 Agent 的示例：
```typescript
// 非流式调用
const result = await myAgent.invoke({ text: "Hello, world!" });
console.log(result);

// 流式调用
const stream = await myAgent.invoke({ text: "Tell me a story." }, { streaming: true });
for await (const chunk of stream) {
    // 在每个数据块到达时进行处理
    process.stdout.write(chunk.delta.text?.content || "");
}
```

### `process()` 方法

这是您必须在自定义 Agent 中实现的核心抽象方法。它包含了 Agent 的主要逻辑。`process` 方法接收经过验证的输入和调用选项，并应返回 Agent 的输出。

返回值可以是：
*   一个 `object`：最终输出。
*   一个 `AgentResponseStream`：用于流式输出的可读流。
*   一个 `AsyncGenerator`：用于生成响应的各个数据块。
*   另一个 `Agent` 实例：将控制权转移给另一个 Agent。

### 预处理和后处理

`Agent` 类提供了 `preprocess()` 和 `postprocess()` 方法，它们会在 `invoke` 生命周期中自动调用。

*   **`preprocess(input, options)`**: 在 `process` 方法之前调用。它负责检查上下文状态和 Agent 调用限制。
*   **`postprocess(input, output, options)`**: 在 `process` 方法成功完成后调用。它负责将输出发布到相应的主题，并将交互记录到内存中。

### 钩子 (Hooks)

钩子 (Hooks) 允许您接入 Agent 的生命周期，以添加用于日志记录、监控或修改行为的自定义逻辑，而无需更改 Agent 的核心实现。您可以在 `AgentOptions` 或 `AgentInvokeOptions` 中提供钩子。

关键钩子包括：
*   `onStart`：处理开始前。
*   `onEnd`：处理完成时（无论成功与否）。
*   `onSuccess`：成功完成时。
*   `onError`：抛出错误时。
*   `onSkillStart`/`onSkillEnd`：调用技能前后。

## 创建自定义 Agent

### 扩展 `Agent` 类

要创建自定义 Agent，请扩展基类 `Agent` 并实现 `process` 方法。

**示例：一个简单的问候 Agent**
```typescript
import { Agent, AgentInvokeOptions, Message } from "@aigne/core";
import { z } from "zod";

interface GreetingInput extends Message {
  name: string;
}

interface GreetingOutput extends Message {
  greeting: string;
}

class GreetingAgent extends Agent<GreetingInput, GreetingOutput> {
  constructor() {
    super({
      name: "GreetingAgent",
      description: "An agent that generates a greeting.",
      inputSchema: z.object({
        name: z.string(),
      }),
      outputSchema: z.object({
        greeting: z.string(),
      }),
    });
  }

  async process(input: GreetingInput, options: AgentInvokeOptions): Promise<GreetingOutput> {
    const { name } = input;
    return {
      greeting: `Hello, ${name}!`,
    };
  }
}

// 用法
const agent = new GreetingAgent();
const result = await agent.invoke({ name: "Alice" });
console.log(result.greeting); // 输出: Hello, Alice!
```

### 使用 `FunctionAgent`

对于不需要复杂状态或方法的更简单的 Agent，您可以使用 `FunctionAgent`。这允许您从单个函数创建一个 Agent。

**示例：用于加法的 `FunctionAgent`**
```typescript
import { FunctionAgent, Message } from "@aigne/core";
import { z } from "zod";

interface AddInput extends Message {
  a: number;
  b: number;
}

const addAgent = new FunctionAgent({
  name: "AddAgent",
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  process: async (input: AddInput) => {
    return { result: input.a + input.b };
  },
});

// 用法
const result = await addAgent.invoke({ a: 5, b: 3 });
console.log(result.result); // 输出: 8
```

## API 参考

### AgentOptions

`Agent` 构造函数的配置选项。

| Option | Type | Description |
|---|---|---|
| `name` | `string` | Agent 的名称。默认为类名。 |
| `alias` | `string[]` | Agent 的备用名称。 |
| `description` | `string` | 关于 Agent 功能的描述。 |
| `subscribeTopic` | `string \| string[]` | Agent 应订阅以接收消息的主题。 |
| `publishTopic` | `string \| string[] \| (output) => string` | 要将 Agent 的输出发布到的主题。 |
| `inputSchema` | `ZodObject` | 用于验证输入消息的 Zod 模式。 |
| `outputSchema` | `ZodObject` | 用于验证输出消息的 Zod 模式。 |
| `defaultInput` | `Partial<I>` | Agent 输入的默认值。 |
| `includeInputInOutput` | `boolean` | 如果为 true，则将输入字段合并到输出对象中。 |
| `skills` | `(Agent \| FunctionAgentFn)[]` | 该 Agent 可以使用的其他 Agent 或函数的列表。 |
| `memory` | `MemoryAgent \| MemoryAgent[]` | 用于存储和检索对话历史的 MemoryAgent。 |
| `hooks` | `AgentHooks \| AgentHooks[]` | 用于跟踪、日志记录或自定义行为的生命周期钩子。 |
| `guideRails` | `GuideRailAgent[]` | 验证或控制消息流的 Agent 列表。 |
| `retryOnError` | `boolean \| object` | Agent 失败时进行重试的配置。 |
| `disableEvents` | `boolean` | 如果为 true，则禁用 `agentStarted` 或 `agentSucceed` 等事件的触发。 |
| `model` | `ChatModel` | Agent 及其技能使用的默认聊天模型。 |

### Agent 方法

`Agent` 实例上的关键方法。

| Method | Signature | Description |
|---|---|---|
| `invoke` | `(input: I, options?: AgentInvokeOptions) => Promise<O \| Stream>` | 调用 Agent 的处理逻辑并返回结果，结果可以是最终对象或流。 |
| `process` | `(input: I, options: AgentInvokeOptions) => PromiseOrValue<Result<O>>` | **抽象方法。** Agent 的核心逻辑必须在此实现。 |
| `addSkill` | `(...skills: (Agent \| FunctionAgentFn)[]) => void` | 向 Agent 添加一个或多个技能（子 Agent）。 |
| `attach` | `(context: Context) => void` | 将 Agent 附加到上下文中，并订阅其主题。 |
| `shutdown` | `() => Promise<void>` | 清理资源，例如取消订阅主题和关闭内存连接。 |