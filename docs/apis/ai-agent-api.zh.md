# AI Agent API 参考

**中文** | [English](./ai-agent-api.md)

AIAgent 是用于与 AI 模型交互的 Agent 实现。它能够发送提示到 AI 模型，处理返回的结果，并支持工具调用功能。

## AIAgent 类

`AIAgent` 继承自 `Agent` 基类，专门用于执行与 AI 模型相关的任务。

### 基本属性

| 属性名 | 类型 | 描述 |
|-------|------|------|
| `model` | `ChatModel \| undefined` | AI 聊天模型实例 |
| `instructions` | `PromptBuilder` | 用于构建提示的 PromptBuilder 对象 |
| `outputKey` | `string \| undefined` | 输出对象中存储模型文本响应的键名 |
| `toolChoice` | `AIAgentToolChoice \| undefined` | 工具选择策略 |
| `enableHistory` | `boolean \| undefined` | 是否启用历史记录 |
| `maxHistoryMessages` | `number` | 保留的最大历史消息数量 |

### 构造函数

```typescript
constructor(options: AIAgentOptions<I, O>)
```

#### 参数

- `options`: `AIAgentOptions<I, O>` - AIAgent 配置选项

  | 选项名 | 类型 | 描述 |
  |-------|------|------|
  | `model` | `ChatModel` | AI 聊天模型实例 |
  | `instructions` | `string \| PromptBuilder` | 指导 AI 行为的指令或 PromptBuilder |
  | `outputKey` | `string` | 输出对象中存储模型文本响应的键名 |
  | `toolChoice` | `AIAgentToolChoice` | 工具选择策略 |
  | `enableHistory` | `boolean` | 是否启用历史记录 |
  | `maxHistoryMessages` | `number` | 保留的最大历史消息数量 |

### 静态方法

#### `from`

创建 AIAgent 的工厂方法。

```typescript
static from<I extends AgentInput, O extends AgentOutput>(options: AIAgentOptions<I, O>): AIAgent<I, O>
```

##### 参数

- `options`: `AIAgentOptions<I, O>` - AIAgent 配置选项

##### 返回值

- `AIAgent<I, O>` - 返回创建的 AIAgent 实例

### 方法

#### `process`

处理输入并生成输出，与 AI 模型交互并处理响应。

```typescript
async process(input: I, context?: Context): Promise<O>
```

##### 参数

- `input`: `I` - 输入数据
- `context`: `Context` (可选) - 执行上下文

##### 返回值

- `Promise<O>` - 返回 AI 模型的处理结果

## 相关类型

### `AIAgentOptions`

定义 AIAgent 的配置选项。

```typescript
interface AIAgentOptions<I extends AgentInput = AgentInput, O extends AgentOutput = AgentOutput> extends AgentOptions<I, O> {
  model?: ChatModel;
  instructions?: string | PromptBuilder;
  outputKey?: string;
  toolChoice?: AIAgentToolChoice;
  enableHistory?: boolean;
  maxHistoryMessages?: number;
}
```

### `AIAgentToolChoice`

定义 AIAgent 的工具选择策略。

```typescript
type AIAgentToolChoice = "auto" | "none" | "required" | "router" | Agent;
```

| 值 | 描述 |
|-----|------|
| `"auto"` | 模型自行决定是否使用工具 |
| `"none"` | 不使用任何工具 |
| `"required"` | 必须使用工具 |
| `"router"` | 路由模式，将结果直接转发到第一个被调用的工具 |
| `Agent` | 指定使用特定的 Agent 作为工具 |

## 工作原理

1. 使用 PromptBuilder 构建提示消息
2. 将提示发送到 AI 模型
3. 处理 AI 模型的响应
4. 如果需要，执行工具调用
5. 继续与 AI 模型对话，直到完成任务
6. 返回最终结果

## 示例

### 创建基本的 AIAgent

```typescript
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

const agent = AIAgent.from({
  name: "Assistant",
  model,
  instructions: "你是一个友好、乐于助人的助手。"
});

// 使用 AIAgent
const output = await agent.call("你好，请告诉我北京的天气如何？");
console.log(output.text); // 输出 AI 的回复
```

### 使用工具的 AIAgent

```typescript
import { AIAgent, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// 创建一个天气查询工具
const weatherTool = FunctionAgent.from({
  name: "getWeather",
  description: "获取指定城市的天气信息",
  inputSchema: z.object({
    city: z.string().describe("城市名称")
  }),
  fn: async (input) => {
    // 在实际应用中，这里会调用天气 API
    return {
      temperature: 24,
      conditions: "晴天",
      humidity: 60,
      city: input.city
    };
  }
});

const agent = AIAgent.from({
  name: "WeatherAssistant",
  model,
  instructions: "你是一个天气助手，可以回答有关天气的问题。",
  tools: [weatherTool],
  toolChoice: "auto" // 允许模型决定是否使用工具
});

// 使用带工具的 AIAgent
const output = await agent.call("北京今天的天气怎么样？");
console.log(output.text); // "北京今天天气晴朗，温度24°C，湿度60%。"
```

### 使用路由模式的 AIAgent

```typescript
import { AIAgent, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// 天气助手
const weatherAgent = AIAgent.from({
  name: "WeatherAssistant",
  model,
  instructions: "你是一个专业的天气助手，只回答有关天气的问题。"
});

// 旅游助手
const travelAgent = AIAgent.from({
  name: "TravelAssistant",
  model,
  instructions: "你是一个旅游助手，提供旅游建议和信息。"
});

// 路由 Agent
const routerAgent = AIAgent.from({
  name: "Router",
  model,
  instructions: `你是一个路由器，负责决定将用户的问题路由到哪个专家助手。
    - 对于天气相关的问题，使用 WeatherAssistant
    - 对于旅游相关的问题，使用 TravelAssistant`,
  tools: [weatherAgent, travelAgent],
  toolChoice: "router" // 使用路由模式
});

// 使用路由 Agent
const output = await routerAgent.call("北京有哪些好玩的地方？");
// 将自动路由到 travelAgent 处理，并返回回复
console.log(output);
