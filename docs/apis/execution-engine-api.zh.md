# 执行引擎 API 参考

**中文** | [English](./execution-engine-api.md)

执行引擎是 AIGNE 框架的核心组件，负责协调 Agent 之间的交互和工作流程的执行。它提供了一个统一的接口来运行单个或多个 Agent，并管理它们之间的消息传递。

## ExecutionEngine 类

`ExecutionEngine` 继承自 `EventEmitter`，为 Agent 提供执行环境。它为每个操作创建一个执行上下文。

### 构造函数

```typescript
constructor(options?: ExecutionEngineOptions)
```

#### 参数

- `model`: `ChatModel` - 默认的 AI 聊天模型实例
- `tools`: `Agent[]` - 全局可用的工具列表
- `agents`: `Agent[]` - 初始化时添加的 Agent 列表
- `limits`: `ContextLimits` - 执行引擎的限制配置
  - `maxTokens`: `number` - 允许处理的最大 Token 数
  - `maxAgentCalls`: `number` - 允许的最大 Agent 调用次数
  - `timeout`: `number` - 执行超时时间（毫秒）

### 方法

#### `addAgent`

向执行引擎添加一个或多个 Agent。

```typescript
addAgent(...agents: Agent[])
```

##### 参数

- `agents`: `Agent[]` - 要添加的 Agent 列表

#### `publish`

向指定主题发布消息。

```typescript
publish(topic: string | string[], message: Message | string, from?: Agent)
```

##### 参数

- `topic`: `string | string[]` - 消息主题或主题数组
- `message`: `Message | string` - 要发布的消息内容
- `from`: `Agent` (可选) - 发布消息的 Agent

#### `subscribe`

订阅指定主题的消息。此方法有多种重载方式。

```typescript
// 使用回调函数订阅
// 注册一个回调函数，用于接收主题上的每条消息
// 返回一个取消订阅函数，可以调用该函数停止接收消息
subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;

// 订阅并等待单个消息
// 返回一个 Promise，该 Promise 会在下一条消息发布到主题时解析
// 适用于一次性消息接收场景
subscribe(topic: string): Promise<MessagePayload>;
```

##### 参数

- `topic`: `string` - 要订阅的主题
- `listener`: `MessageQueueListener` (可选) - 接收消息的回调函数

#### `unsubscribe`

取消订阅指定主题的消息。

```typescript
unsubscribe(topic: string, listener: (message: AgentOutput) => void)
```

##### 参数

- `topic`: `string` - 要取消订阅的主题
- `listener`: `(message: AgentOutput) => void` - 之前注册的回调函数

#### `call`

调用一个 Agent 并返回输出。此方法有多种重载方式，每种方式都有不同的用途。

```typescript
// 创建一个用户代理以持续调用 Agent
// 返回一个 UserAgent 实例，用于持续与执行引擎交互
// 适合需要多轮对话或持续交互的场景
call<I extends Message, O extends Message>(agent: Runnable<I, O>): UserAgent<I, O>;

// 使用消息调用 Agent
// 使用提供的消息调用指定的 Agent
// 返回 Agent 的输出
// 适合需要单次交互的场景
call<I extends Message, O extends Message>(
  agent: Runnable<I, O>,
  message: I | string,
  options?: { stream?: false }
): Promise<O>;

// 使用消息调用 Agent 并返回响应块流
// 使用提供的消息调用指定的 Agent
// 返回实时的响应块流，而不是等待完整响应
// 适合实时处理或显示增量结果的场景
call<I extends Message, O extends Message>(
  agent: Runnable<I, O>,
  message: I | string,
  options: { stream: true }
): Promise<AgentResponseStream<O>>;

// 使用消息调用 Agent 并返回输出和活动的 Agent
// 使用提供的消息调用指定的 Agent
// 返回 Agent 的输出和最终活动的 Agent
// 适合需要跟踪活动 Agent 的场景
call<I extends Message, O extends Message>(
  agent: Runnable<I, O>,
  message: I | string,
  options: { returnActiveAgent: true; stream?: false },
): Promise<[O, Runnable]>;

// 使用消息调用 Agent 并返回响应块流和活动 Agent 的 Promise
// 使用提供的消息调用指定的 Agent
// 返回响应块流和一个解析为最终活动 Agent 的 Promise
// 适合在跟踪活动 Agent 的同时进行实时处理
call<I extends Message, O extends Message>(
  agent: Runnable<I, O>,
  message: I | string,
  options: { returnActiveAgent: true; stream: true },
): Promise<[AgentResponseStream<O>, Promise<Runnable>]>;
```

##### 参数

- `agent`: `Runnable<I, O>` - 要调用的 Agent 或函数
- `message`: `I | string` - 要传递给 Agent 的消息
- `options`: `{ returnActiveAgent?: boolean }` - 调用选项

##### 返回值

- `UserAgent<I, O>` - 当仅提供 agent 参数时，返回可用于持续交互的 UserAgent 实例
- `Promise<O>` - 当提供 message 参数时，返回处理结果
- `Promise<[O, Runnable]>` - 当提供 options 参数时，返回处理结果和活动的 Agent

#### `shutdown`

关闭执行引擎并释放资源。

```typescript
async shutdown()
```

## 工具函数

### `sequential`

创建一个按顺序执行多个 Agent 的函数。

```typescript
function sequential(...agents: [Runnable, ...Runnable[]]): FunctionAgentFn
```

#### 参数

- `agents`: `[Runnable, ...Runnable[]]` - 要按顺序执行的 Agent 列表

#### 返回值

- `FunctionAgentFn` - 返回一个函数，该函数按顺序执行指定的 Agent 并合并它们的输出

### `parallel`

创建一个并行执行多个 Agent 的函数。

```typescript
function parallel(...agents: [Runnable, ...Runnable[]]): FunctionAgentFn
```

#### 参数

- `agents`: `[Runnable, ...Runnable[]]` - 要并行执行的 Agent 列表

#### 返回值

- `FunctionAgentFn` - 返回一个函数，该函数并行执行指定的 Agent 并合并它们的输出

## 相关类型

### `Runnable`

定义可运行的实体类型。

```typescript
type Runnable = Agent | FunctionAgentFn;
```

### `UserAgent`

表示用户在执行引擎中的代理，用于持续的交互会话。

```typescript
class UserAgent<I extends Message = Message, O extends Message = Message> extends Agent<I, O> {
  static from<I extends Message, O extends Message>(
    options: UserAgentOptions<I, O>,
  ): UserAgent<I, O>;

  constructor(options: UserAgentOptions<I, O>);

  process(input: I, context: Context): Promise<O>;

  publish(topic: string | string[], message: Message | string): void;

  subscribe(topic: string, listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;

  unsubscribe(topic: string, listener: MessageQueueListener): void;

  get stream(): ReadableStream<MessagePayload & { topic: string }>;
}
```

#### `UserAgentOptions`

定义 `UserAgent` 的配置选项。

```typescript
interface UserAgentOptions<I extends Message = Message, O extends Message = Message> extends AgentOptions<I, O> {
  context: Context;
  process?: (input: I, context: Context) => PromiseOrValue<O>;
}
```

## 消息传递机制

执行引擎使用发布-订阅模式来处理 Agent 之间的通信。每个 Agent 可以定义：

1. `subscribeTopic`：Agent 监听的主题
2. `publishTopic`：Agent 发布结果的主题

当消息发布到某个主题时，所有订阅该主题的 Agent 将接收到消息并执行相应的操作。

预定义的特殊主题：
- `UserInputTopic`：用户输入的主题
- `UserOutputTopic`：用户输出的主题

## 示例

### 使用执行引擎的流式响应

```typescript
import { ExecutionEngine, AIAgent } from "@aigne/core";
import { mergeAgentResponseChunk } from "@aigne/core/utils/stream-utils.js";

const engine = new ExecutionEngine();

const agent = AIAgent.from({
  model,
  instructions: "..."
})

// 启用流式响应进行调用
const stream = await engine.call(agent, "你好，请告诉我关于流式 API 的信息", { stream: true });

const reader = stream.getReader();
const result = {};

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  mergeAgentResponseChunk(result, value);

  console.log("收到块:", value);
}
console.log("最终结果:", result);

// 同时获取流和活动 Agent（适用于更复杂的工作流）
const [agentStream, activeAgentPromise] = await engine.call(
  assistant,
  "你好，请推荐一些书籍",
  { stream: true, returnActiveAgent: true }
);

// 按照上面的方式处理流

// 处理完成后获取活动 Agent
const activeAgent = await activeAgentPromise;
console.log("活动 Agent 是:", activeAgent.name);
```

### 基本用法

```typescript
import { ExecutionEngine, AIAgent, OpenAIChatModel } from "@aigne/core";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// 创建 Agent
const assistant = AIAgent.from({
  name: "Assistant",
  model,
  instructions: "你是一个友好、乐于助人的助手。"
});

// 创建执行引擎
const engine = new ExecutionEngine({ model });

// 方法 1: 直接调用并获取结果
const result = await engine.call(assistant, "你好，请告诉我今天的日期");
console.log(result);

// 方法 2: 创建交互式会话
const userAgent = engine.call(assistant);

// 发送消息并获取回复
const response1 = await userAgent.call("你好！");
console.log(response1);

const response2 = await userAgent.call("你能帮我写一首诗吗？");
console.log(response2);

// 关闭执行引擎
await engine.shutdown();
```

### 顺序执行多个 Agent

```typescript
import { ExecutionEngine, AIAgent, FunctionAgent, sequential, OpenAIChatModel } from "@aigne/core";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// 创建数据准备 Agent
const dataPrep = FunctionAgent.from({
  name: "DataPreparation",
  fn: (input) => ({
    ...input,
    formattedData: `Processed: ${JSON.stringify(input.data)}`
  })
});

// 创建分析 Agent
const analyzer = AIAgent.from({
  name: "DataAnalyzer",
  model,
  instructions: "你是一个数据分析专家，分析提供的数据并提供洞见。"
});

// 创建摘要 Agent
const summarizer = AIAgent.from({
  name: "Summarizer",
  model,
  instructions: "你的任务是将分析结果总结为简洁的要点。"
});

// 创建执行引擎
const engine = new ExecutionEngine({ model });

// 顺序执行 Agent
const result = await engine.call(
  sequential(dataPrep, analyzer, summarizer),
  { data: [10, 20, 30, 40, 50] }
);

console.log(result);
```

### 并行执行多个 Agent

```typescript
import { ExecutionEngine, AIAgent, parallel, OpenAIChatModel } from "@aigne/core";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// 创建诗歌 Agent
const poet = AIAgent.from({
  name: "Poet",
  model,
  instructions: "你是一位诗人，创作与提供的主题相关的诗歌。",
  outputKey: "poem"
});

// 创建故事 Agent
const storyteller = AIAgent.from({
  name: "Storyteller",
  model,
  instructions: "你是一位故事讲述者，创作与提供的主题相关的短篇故事。",
  outputKey: "story"
});

// 创建执行引擎
const engine = new ExecutionEngine({ model });

// 并行执行 Agent
const result = await engine.call(
  parallel(poet, storyteller),
  { topic: "月亮" }
);

console.log("诗歌:", result.poem);
console.log("故事:", result.story);
```

### 使用发布-订阅模式

```typescript
import { ExecutionEngine, AIAgent, FunctionAgent, OpenAIChatModel } from "@aigne/core";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// 创建天气 Agent
const weatherAgent = FunctionAgent.from({
  name: "WeatherAgent",
  subscribeTopic: "weather.request",
  publishTopic: "weather.response",
  fn: async (input) => {
    // 在实际应用中，这里会调用天气 API
    return {
      city: input.city,
      temperature: 24,
      conditions: "晴天"
    };
  }
});

// 创建旅游建议 Agent
const travelAgent = AIAgent.from({
  name: "TravelAgent",
  model,
  subscribeTopic: "weather.response",
  publishTopic: "travel.response",
  instructions: "基于提供的天气信息，提供旅游建议。"
});

// 创建执行引擎并添加 Agent
const engine = new ExecutionEngine();
engine.addAgent(weatherAgent, travelAgent);

// 订阅最终结果
engine.subscribe("travel.response", (response) => {
  console.log("旅游建议:", response);
});

// 发布初始请求
engine.publish("weather.request", { city: "北京" });
