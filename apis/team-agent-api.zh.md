# Team Agent API 参考

**中文** | [English](./team-agent-api.md)

TeamAgent 是一个用于协调多个代理一起工作的 Agent 实现。它允许您编排工作流，其中代理可以按顺序或并行处理输入。

## TeamAgent 类

`TeamAgent` 继承自 `Agent` 基类，专门设计用于编排包含多个代理的工作流。

### 静态方法

#### `from`

创建一个新的 TeamAgent 实例。

```typescript
static from<I extends Message, O extends Message>(options: TeamAgentOptions<I, O>): TeamAgent<I, O>
```

##### 参数

- `options`: `TeamAgentOptions<I, O>` - TeamAgent 的配置选项

##### 返回值

- `TeamAgent<I, O>` - 一个新的 TeamAgent 实例

## 相关类型

### `TeamAgentOptions`

定义 TeamAgent 的配置选项。

```typescript
interface TeamAgentOptions<I extends Message, O extends Message> extends AgentOptions<I, O> {
  mode?: ProcessMode;
}
```

### `ProcessMode`

定义 TeamAgent 可用的处理方法。

| 值 | 描述 |
|-------|-------------|
| `sequential` | 一个接一个地处理代理，将每个代理的输出传递给下一个 |
| `parallel` | 并行处理所有代理，合并它们的输出 |

## 工作原理

### 顺序处理

1. 一个接一个地处理团队中的每个代理
2. 将每个代理的输出作为输入传递给下一个代理
3. 将所有输出合并为一个结果

### 并行处理

1. 同时处理团队中的所有代理
2. 使用相同的输入运行所有代理
3. 将所有代理的输出合并为一个结果
4. 处理输出之间的潜在冲突

## 示例

### 顺序工作流

```typescript
import { AIAgent, AIGNE, TeamAgent, ProcessMode } from "@aigne/core";

// 为特定任务创建单个代理
const conceptExtractor = AIAgent.from({
  instructions: `从产品描述中提取关键特性`,
  outputKey: "concept"
});

const writer = AIAgent.from({
  instructions: `根据功能特性编写营销文案`,
  outputKey: "draft"
});

const editor = AIAgent.from({
  instructions: `编辑并格式化草稿文案`,
  outputKey: "content"
});

// 创建一个按顺序处理代理的 TeamAgent
const teamAgent = TeamAgent.from({
  skills: [conceptExtractor, writer, editor],
  mode: ProcessMode.sequential // 默认值，可以省略
});

// 执行工作流
const aigne = new AIGNE({ model });
const result = await aigne.invoke(teamAgent, { product: "产品描述" });
```

### 并行工作流

```typescript
import { AIAgent, AIGNE, TeamAgent, ProcessMode } from "@aigne/core";

// 创建用于并行任务的单个代理
const featureExtractor = AIAgent.from({
  instructions: `提取并总结产品功能`,
  outputKey: "features"
});

const audienceAnalyzer = AIAgent.from({
  instructions: `确定产品的目标受众`,
  outputKey: "audience"
});

// 创建一个并行处理代理的 TeamAgent
const teamAgent = TeamAgent.from({
  skills: [featureExtractor, audienceAnalyzer],
  mode: ProcessMode.parallel
});

// 执行工作流
const aigne = new AIGNE({ model });
const result = await aigne.invoke(teamAgent, { product: "产品描述" });
