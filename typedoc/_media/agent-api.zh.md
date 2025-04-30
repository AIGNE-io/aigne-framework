# Agent API 参考

**中文** | [English](./agent-api.md)

Agent 是 AIGNE 框架的核心概念，代表了一个能够接收输入并产生输出的实体。所有特定类型的 Agent 都继承自这个基类。

## Agent 基类

`Agent` 是一个抽象类，提供了所有 Agent 类型共享的基本功能。

### 基本属性

| 属性名 | 类型 | 描述 |
|-------|------|------|
| `name` | `string` | Agent 的名称，默认为类名 |
| `description` | `string \| undefined` | Agent 的描述信息 |
| `inputSchema` | `ZodObject<{ [key in keyof I]: ZodType }>` | 验证输入的 Zod 模式 |
| `outputSchema` | `ZodObject<{ [key in keyof O]: ZodType }>` | 验证输出的 Zod 模式 |
| `includeInputInOutput` | `boolean \| undefined` | 是否在输出中包含输入 |
| `subscribeTopic` | `SubscribeTopic` | Agent 订阅的主题，用于实现 memory 功能，允许代理在指定主题上共享和接收信息 |
| `publishTopic` | `PublishTopic<AgentOutput>` | 输出发布的主题 |
| `memory` | `AgentMemory` | 用于配置 Agent 的记忆功能，类型为 `AgentMemory`。在配置参数中可以设置为 `true`，以便自动创建 `AgentMemory` 实例 |
| `skills` | `Agent[]` | Agent 可以使用的工具列表 |
| `isInvokable` | `boolean` | 指示 Agent 是否可以被调用 |

### 构造函数

```typescript
constructor(options: AgentOptions<I, O>)
```

#### 参数

- `options`: `AgentOptions<I, O>` - Agent 配置选项

  | 选项名 | 类型 | 描述 |
  |-------|------|------|
  | `subscribeTopic` | `SubscribeTopic` | Agent 订阅的主题，用于实现 memory 功能，允许代理在指定主题上共享和接收信息 |
  | `publishTopic` | `PublishTopic<O>` | 输出发布的主题 |
  | `name` | `string` | Agent 的名称 |
  | `description` | `string` | Agent 的描述信息 |
  | `inputSchema` | `ZodObject<{ [key in keyof I]: ZodType }>` | 验证输入的 Zod 模式 |
  | `outputSchema` | `ZodObject<{ [key in keyof O]: ZodType }>` | 验证输出的 Zod 模式 |
  | `includeInputInOutput` | `boolean` | 是否在输出中包含输入 |
  | `memory` | `AgentMemory` | 用于配置 Agent 的记忆功能，类型为 `AgentMemory`。在配置参数中可以设置为 `true`，以便自动创建 `AgentMemory` 实例 |
| `skills` | `(Agent \| FunctionAgentFn)[]` | Agent 可以使用的工具列表 |
  | `disableLogging` | `boolean` | 是否禁用日志记录 |

### 方法

#### `invoke`

调用 Agent 处理输入并返回输出。

```typescript
async invoke(input: I | string, context?: Context): Promise<O>
async invoke(input: I | string, context: Context | undefined, options: AgentInvokeOptions & { streaming: true }): Promise<AgentResponseStream<O>>
```

##### 参数

- `input`: `I | string` - 输入数据或字符串
- `context`: `Context` (可选) - 执行上下文
- `options`: `AgentInvokeOptions` (可选) - 调用选项
  - `streaming`: `boolean` - 当设置为 `true` 时，返回响应块流而不是等待完整响应

##### 返回值

- `Promise<O>` - 非流式模式时返回 Agent 的完整输出
- `Promise<AgentResponseStream<O>>` - 当 `options.streaming` 为 `true` 时，返回响应块流

#### `addSkill`

向 Agent 添加一个工具。

```typescript
addSkill(...skills: (Agent | FunctionAgentFn)[])
```

##### 参数

- `skills`: `(Agent | FunctionAgentFn)[]` - 要添加的工具

#### `process`

处理输入并产生输出的抽象方法，所有子类必须实现此方法。

```typescript
abstract process(input: I, context: Context): Promise<O>
```

##### 参数

- `input`: `I` - 输入数据
- `context`: `Context` - 执行上下文

##### 返回值

- `Promise<O>` - 返回 Agent 的输出

#### `shutdown`

关闭 Agent 并释放资源。

```typescript
async shutdown()
```

## 相关类型

### `AgentInput`

定义 Agent 输入的类型。

```typescript
type AgentInput = Record<string, unknown>;
```

### `AgentOutput`

定义 Agent 输出的类型。

```typescript
type AgentOutput = Record<string, unknown> & Partial<TransferAgentOutput>;
```

### `SubscribeTopic`

定义 Agent 订阅主题的类型。

```typescript
type SubscribeTopic = string | string[];
```

### `PublishTopic`

定义 Agent 发布主题的类型。

```typescript
type PublishTopic<O extends AgentOutput = AgentOutput> =
  | string
  | string[]
  | ((output: O) => string | string[] | Promise<string | string[]>);
```

## 示例

### 使用 Agent 的流式响应

```typescript
import { mergeAgentResponseChunk } from "@aigne/core/utils/stream-utils.js";

const stream = await agent.invoke(input, context, { streaming: true });

const reader = stream.getReader();
const result = {};

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  mergeAgentResponseChunk(result, value);

  console.log("收到块:", value);
}

console.log("最终结果:", result);
```

### 创建自定义 Agent

```typescript
import { Agent } from "@aigne/core";

class GreetingAgent extends Agent {
  async process(input) {
    const name = input.name || "Anonymous";
    return {
      greeting: `Hello, ${name}!`
    };
  }
}

const agent = new GreetingAgent({
  name: "Greeter",
  description: "A simple greeting agent"
});

// 使用 Agent
const output = await agent.invoke({ name: "John" });
console.log(output); // { greeting: "Hello, John!" }
