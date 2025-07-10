# 核心概念

AIGNE Framework 提供了一个强大的基础，通过协调多个智能体协同工作来构建 AI 驱动的应用程序。本指南解释了构成 AIGNE Framework 的基本概念和组件，包括 AIGNE、Context、Agents 和消息传递。

```mermaid
flowchart TD
    A["AIGNE"] --> B["Context"]
    A --> C["Agents"]
    A --> D["Skills"]
    A --> E["Message Queue"]
    B --> F["Invocation"]
    B --> G["Memory"]
    B --> H["User Context"]
    C --> I["AI Agent"]
    C --> J["Team Agent"]
    C --> K["Transform Agent"]
    C --> L["Function Agent"]
    E --> M["Publish/Subscribe"]
    M --> N["Topics"]
</flowchart>
```

## AIGNE 类

AIGNE 类作为智能体交互、消息传递和执行流程的中央协调点。它是构建复杂 AI 应用程序的主要入口点。

```typescript
import { AIGNE } from "@aigne/core";
import { AIAgent } from "@aigne/core";

// 创建一个新的 AIGNE 实例
const aigne = new AIGNE({
  name: "My AIGNE App",
  description: "A simple AIGNE application",
  // 可选的全局模型，用于未指定自己模型的智能体
  model: myCustomModel, 
  // Skills 是可以被其他智能体使用的智能体
  skills: [myUtilityAgent],
  // 驱动应用程序的主要智能体
  agents: [myMainAgent]
});
```

AIGNE 构造函数接受以下选项：

| 选项 | 类型 | 描述 |
|--------|------|-------------|
| name | string | AIGNE 实例的可选名称标识符 |
| description | string | AIGNE 实例目的的可选描述 |
| model | ChatModel | 用于所有未指定模型的智能体的全局模型 |
| skills | Agent[] | AIGNE 实例使用的技能（实用智能体） |
| agents | Agent[] | AIGNE 实例使用的智能体（主要智能体） |
| limits | ContextLimits | AIGNE 实例的限制（超时、最大令牌数等） |
| observer | AIGNEObserver | 用于跟踪和调试 AIGNE 操作的观察者 |

你也可以从配置文件加载 AIGNE 实例：

```typescript
// 从包含 aigne.yaml 的目录加载 AIGNE
const aigne = await AIGNE.load("./my-aigne-project", {
  // 如需要，可覆盖选项
  model: myCustomModel
});
```

这提供了一种从配置文件初始化 AIGNE 系统的便捷方式，使管理复杂设置变得更容易。

## Context

AIGNE 中的 Context 作为智能体的执行环境，为不同的流程或对话隔离状态。它管理记忆、用户上下文，并维护使用指标。

```typescript
// 创建新的上下文
const context = aigne.newContext();

// 创建具有初始用户上下文的上下文
const userContext = { userId: "user123", sessionId: "session456" };
const context = aigne.newContext({ userContext });

// 创建具有初始记忆的上下文
const memories = [{ content: "Previous conversation data..." }];
const context = aigne.newContext({ memories });
```

当你通过 AIGNE 调用智能体时，上下文通常会自动创建，但当你需要对执行环境有更多控制时，也可以显式创建它们。

Context 提供这些关键能力：

1. **状态隔离** - 每个上下文维护自己的状态，允许多个对话同时进行
2. **记忆管理** - 上下文存储和检索供智能体使用的记忆
3. **用户上下文** - 可以附加自定义用户数据以提供个性化
4. **使用跟踪** - 上下文跟踪令牌使用量、智能体调用和执行时间
5. **事件处理** - 上下文发出可用于监控和调试的事件

```typescript
// 跟踪上下文使用情况
console.log(context.usage);
// {
//   inputTokens: 250,
//   outputTokens: 150,
//   agentCalls: 2,
//   duration: 1250 // 毫秒
// }
```

## Agent 调用

使用 AIGNE 的主要方式是调用智能体来执行任务。根据需求，有几种调用智能体的方式。

### 基本调用

```typescript
// 创建一个智能体
const greeterAgent = new AIAgent({
  name: "greeter",
  description: "Greets users",
  prompt: "You are a friendly greeter. Greet the user by name.",
  model: myModel
});

// 添加到 AIGNE
aigne.addAgent(greeterAgent);

// 使用消息调用智能体
const response = await aigne.invoke(greeterAgent, {
  name: "Alice"
});

console.log(response.greeting); // "Hello, Alice! Welcome!"
```

这种简单模式允许你快速从智能体获取响应。

### 流式响应

对于更大的响应或更好的用户体验，你可以使用流式处理来获取生成过程中的部分结果：

```typescript
// 启用流式处理进行调用
const stream = await aigne.invoke(greeterAgent, {
  name: "Bob"
}, { streaming: true });

// 处理流
for await (const chunk of stream) {
  if (chunk.delta.text) {
    process.stdout.write(chunk.delta.text);
  }
  if (chunk.delta.json) {
    // 处理结构化数据更新
    console.log(chunk.delta.json);
  }
}
```

流式处理对于长时间运行的 AI 生成特别有用，允许你实时向用户显示进度。

### UserAgent 模式

UserAgent 模式提供了一种与智能体一致交互的便捷方式：

```typescript
// 创建用户智能体包装器
const userAgent = aigne.invoke(greeterAgent);

// 使用用户智能体进行多次调用
const response1 = await userAgent.send({ name: "Charlie" });
const response2 = await userAgent.send({ name: "Dana" });

// 流式响应
const stream = await userAgent.stream({ name: "Ellie" });
for await (const chunk of stream) {
  // 处理流块
}
```

当你需要在保持一致上下文的情况下多次调用同一智能体时，这种模式很有用。

## 消息传递

AIGNE 提供了一个用于智能体间通信的发布/订阅系统。这允许智能体异步通信，无需直接耦合。

### 发布消息

```typescript
// 向主题发布消息
aigne.publish("notifications", {
  type: "alert",
  message: "System status update"
});

// 发布到多个主题
aigne.publish(["notifications", "logs"], {
  type: "info",
  message: "User logged in"
});
```

消息可以发布到一个或多个主题，允许灵活的通信模式。

### 订阅消息

```typescript
// 使用监听器函数订阅
const unsubscribe = aigne.subscribe("notifications", (payload) => {
  console.log(`Received: ${payload.message.type} - ${payload.message.message}`);
});

// 稍后，不再需要时取消订阅
unsubscribe();

// 或等待单个消息
const nextMessage = await aigne.subscribe("notifications");
console.log(nextMessage);
```

订阅可以使用回调函数持久化，或者你可以使用基于 Promise 的模式来等待主题上的下一条消息。

```mermaid
sequenceDiagram
    participant AgentA
    participant MessageQueue
    participant AgentB
    
    AgentA->>MessageQueue: publish("topic", message)
    MessageQueue->>AgentB: deliver message to subscriber
    AgentB->>MessageQueue: subscribe("topic")
    MessageQueue-->>AgentB: future messages
    
    Note over MessageQueue: Topics can have multiple subscribers
    Note over AgentA, AgentB: Agents can publish and subscribe to multiple topics
</flowchart>
```

## Context 使用和限制

AIGNE 提供了跟踪和限制资源使用的机制，以防止失控成本或过度令牌消耗。

```typescript
// 创建 AIGNE 时配置限制
const aigne = new AIGNE({
  limits: {
    maxTokens: 10000,      // 最大总令牌数（输入 + 输出）
    maxAgentInvokes: 20,   // 最大智能体调用次数
    timeout: 30000         // 最大执行时间（毫秒）
  }
});

// 运行操作后检查使用情况
const context = aigne.newContext();
await context.invoke(myAgent, { query: "..." });

console.log(context.usage);
// {
//   inputTokens: 500,
//   outputTokens: 800,
//   agentCalls: 3,
//   duration: 2500 // 毫秒
// }
```

当超出限制时，操作将以适当的错误消息优雅终止。

## Agent 转移

AIGNE 支持一种称为 Agent 转移的强大模式，其中一个智能体可以将执行移交给另一个智能体。这允许复杂的工作流程，其中专门的智能体处理任务的不同部分。

```typescript
// 一个确定使用哪个专家的路由智能体
const routerAgent = new AIAgent({
  name: "router",
  description: "Routes queries to the appropriate specialist",
  prompt: `Analyze the user query and transfer to the appropriate specialist:
  - For greetings, transfer to 'greeter'
  - For technical questions, transfer to 'techSupport'
  - For sales inquiries, transfer to 'sales'`,
  model: myModel
});

// 调用路由器，它可能会转移到另一个智能体
const response = await aigne.invoke(routerAgent, {
  query: "I'm having trouble with my account"
}, { 
  // 必须为 false 以允许转移
  disableTransfer: false 
});

// 响应将来自链中的最后一个智能体
console.log(response);
```

Agent 转移是构建复杂的多智能体工作流程同时为用户维持简单界面的强大机制。

```mermaid
sequenceDiagram
    participant User
    participant RouterAgent
    participant SpecialistA
    participant SpecialistB
    
    User->>RouterAgent: invoke(query)
    RouterAgent->>RouterAgent: Analyze query
    RouterAgent->>SpecialistA: transfer if appropriate
    SpecialistA->>SpecialistB: transfer if needed
    SpecialistB-->>User: final response
    
    Note over RouterAgent,SpecialistB: Transfer chain can be any length
</flowchart>
```

## 优雅关闭

AIGNE 提供了优雅关闭的机制，确保资源得到正确清理：

```typescript
// 手动关闭
await aigne.shutdown();

// 或在支持的环境中使用 'using' 语句
using aigne = new AIGNE();
// 当块退出时 AIGNE 将自动处理
```

该框架自动注册进程退出事件的处理程序，以确保即使在进程意外终止时也能干净地关闭。

## 总结

AIGNE Framework 的核心概念为构建 AI 驱动的应用程序提供了坚实的基础：

- **AIGNE** 作为中央协调点
- **Context** 提供隔离的执行环境
- **Agent 调用**模式支持不同的交互方式
- **消息传递**实现灵活的智能体间通信
- **使用跟踪和限制**帮助控制资源消耗
- **Agent 转移**允许复杂的专业化工作流程

通过理解这些基础知识，你可以利用 AIGNE Framework 的全部能力来构建复杂的 AI 应用程序，无缝地结合多个智能体。

要继续你的学习旅程，请探索：
- [Agents](./agents.md) - 不同类型智能体的详细文档
- [Memory Management](./memory.md) - 如何在 AIGNE 中处理记忆
- [Loading and Configuration](./configuration.md) - 高级配置技术