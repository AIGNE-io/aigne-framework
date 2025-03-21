# Function Agent API 参考

**中文** | [English](./function-agent-api.md)

Function Agent 是一个简单但功能强大的 Agent 实现，它将函数包装成 Agent，使其可以在 AIGNE 框架中无缝使用。

## FunctionAgent 类

`FunctionAgent` 继承自 `Agent` 基类，专门用于将普通函数转换为 Agent。

### 基本属性

| 属性名 | 类型 | 描述 |
|-------|------|------|
| `fn` | `FunctionAgentFn<I, O>` | 被包装的函数 |

### 构造函数

```typescript
constructor(options: FunctionAgentOptions<I, O>)
```

#### 参数

- `options`: `FunctionAgentOptions<I, O>` - FunctionAgent 配置选项

  | 选项名 | 类型 | 描述 |
  |-------|------|------|
  | `fn` | `FunctionAgentFn<I, O>` | 要包装的函数 |
  | 其他选项 | - | 继承自 `AgentOptions<I, O>` |

### 静态方法

#### `from`

创建 FunctionAgent 的工厂方法，可以从函数或选项对象创建实例。

```typescript
static from<I extends AgentInput, O extends AgentOutput>(
  options: FunctionAgentOptions<I, O> | FunctionAgentFn<I, O>
): FunctionAgent<I, O>
```

##### 参数

- `options`: `FunctionAgentOptions<I, O> | FunctionAgentFn<I, O>` - 函数或 FunctionAgent 配置选项

##### 返回值

- `FunctionAgent<I, O>` - 返回创建的 FunctionAgent 实例

### 方法

#### `process`

执行包装的函数并处理结果。

```typescript
async process(input: I, context?: Context): Promise<O>
```

##### 参数

- `input`: `I` - 输入数据
- `context`: `Context` (可选) - 执行上下文

##### 返回值

- `Promise<O>` - 返回函数执行的结果

## 相关类型

### `FunctionAgentOptions`

定义 FunctionAgent 的配置选项。

```typescript
interface FunctionAgentOptions<I extends AgentInput = AgentInput, O extends AgentOutput = AgentOutput> extends AgentOptions<I, O> {
  fn?: FunctionAgentFn<I, O>;
}
```

### `FunctionAgentFn`

定义可以被 FunctionAgent 包装的函数类型。

```typescript
type FunctionAgentFn<I extends AgentInput = AgentInput, O extends AgentOutput = AgentOutput> =
  (input: I, context?: Context) => O | Promise<O> | Agent | Promise<Agent>;
```

## 工作机制

1. FunctionAgent 接收一个函数作为构造参数
2. 当 FunctionAgent 被调用时，它将输入传递给该函数
3. 函数的返回值将作为 Agent 的输出返回
4. 如果函数返回另一个 Agent，FunctionAgent 将处理为向该 Agent 的转换

## 示例

### 基本用法

```typescript
import { FunctionAgent } from "@aigne/core-next";

// 创建一个简单的函数
function greet(input) {
  const name = input.name || "Anonymous";
  return {
    message: `Hello, ${name}!`
  };
}

// 方法 1: 使用 from 静态方法
const greetAgent1 = FunctionAgent.from(greet);

// 方法 2: 使用构造函数
const greetAgent2 = new FunctionAgent({
  name: "Greeter",
  description: "A simple greeting agent",
  fn: greet
});

// 使用 FunctionAgent
const output = await greetAgent1.call({ name: "John" });
console.log(output); // { message: "Hello, John!" }
```

### 异步函数

```typescript
import { FunctionAgent } from "@aigne/core-next";

// 创建一个异步函数
async function fetchUserData(input) {
  // 在实际应用中，这里会调用 API
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    id: input.userId,
    name: "John Doe",
    email: "john@example.com"
  };
}

const userAgent = FunctionAgent.from({
  name: "UserDataFetcher",
  description: "Fetches user data from an API",
  fn: fetchUserData
});

// 使用异步 FunctionAgent
const userData = await userAgent.call({ userId: 123 });
console.log(userData); // { id: 123, name: "John Doe", email: "john@example.com" }
```

### 在工具链中使用

```typescript
import { ExecutionEngine, AIAgent, FunctionAgent, ChatModelOpenAI } from "@aigne/core-next";

const model = new ChatModelOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// 创建一个数据处理函数
function processData(input) {
  const data = input.data || [];

  return {
    count: data.length,
    summary: `Processed ${data.length} items`,
    firstItem: data[0]
  };
}

// 将函数转换为 Agent
const processAgent = FunctionAgent.from({
  name: "DataProcessor",
  fn: processData
});

// 创建一个 AI Agent，使用处理 Agent 作为工具
const aiAgent = AIAgent.from({
  name: "DataAnalyst",
  model,
  instructions: "你是一个数据分析助手，可以处理和分析数据。",
  tools: [processAgent]
});

// 创建执行引擎
const engine = new ExecutionEngine({ model });

// 运行工作流
const result = await engine.call(
  aiAgent,
  { data: [1, 2, 3, 4, 5] }
);

console.log(result); // 包含 AI 对数据的分析结果
