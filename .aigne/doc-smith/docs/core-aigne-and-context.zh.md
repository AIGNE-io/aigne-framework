# AIGNE 与 Context

AIGNE 框架的核心是两个基本概念：`AIGNE` 和 `Context`。`AIGNE` 类作为中央引擎或编排器，负责管理和执行 Agent。对于您运行的每个任务，`AIGNE` 都会创建一个 `Context` 对象，该对象作为一个隔离的环境，用于管理状态、强制执行限制并跟踪该操作的整个生命周期。

理解这两个组件如何协同工作，是构建健壮且可预测的 AI 应用程序的关键。

## AIGNE 类

`AIGNE` 类是与该框架交互的主要入口点。您可以创建它的一个实例，用模型和 Agent 对其进行配置，然后使用它来调用任务。

### 创建 AIGNE 实例

首先，您需要实例化 `AIGNE` 类。它至少需要提供一个模型，该模型将由其管理的 Agent 使用。

```javascript AIGNE Instantiation icon=logos:javascript
import { AIGNE, AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "../_mocks/mock-models.js"; // 你的模型导入

// 实例化主执行引擎
const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});
```

### 使用 `invoke` 运行 Agent

执行任务最直接的方法是使用 `aigne.invoke()` 方法。您传入想要运行的 Agent 和必要的输入数据。该方法会处理整个执行过程并返回最终结果。

```javascript Simple Invocation icon=logos:javascript
// 定义一个要运行的简单 Agent
const agent = AIAgent.from({
  name: "chat",
  description: "一个聊天 Agent",
  inputKey: "message",
});

// 使用输入调用 Agent 并等待结果
const result = await aigne.invoke(agent, { message: "hello" });

console.log(result); 
// 预期输出：{ message: "Hello, How can I assist you today?" }
```

### 流式响应

对于像聊天机器人这样的交互式应用，您通常希望在生成响应时将其以流式传输回用户。您可以通过在 `invoke` 方法中设置 `streaming: true` 选项来实现此目的。这将返回一个您可以迭代的 `ReadableStream`。

```javascript Streaming Invocation icon=logos:javascript
const stream = await aigne.invoke(agent, { message: "hello" }, { streaming: true });

let text = "";
for await (const chunk of stream) {
  if (chunk.delta?.text?.message) { // 检查流中的文本增量
    text += chunk.delta.text.message;
  }
}

console.log(text); 
// 输出：Hello, How can I assist you today?
```

### 维护对话状态

如果您想进行一次连续的对话，让 Agent 记住之前的消息，该怎么办？您可以只用 Agent 调用 `invoke`，而不是直接向其提供输入。这将返回一个 `UserAgent` 实例，它会为您维护对话历史。

```javascript Conversational State icon=logos:javascript
// 获取一个维护自身状态的 UserAgent 实例
const userAgent = aigne.invoke(agent);

// 第一次交互
const result1 = await userAgent.invoke({ message: "hello" });
console.log(result1); // { message: "Hello, How can I assist you today?" }

// 第二次交互，Agent 会记住上下文
const result2 = await userAgent.invoke({ message: "I'm Bob!" });
console.log(result2); // { message: "Nice to meet you, Bob!" }
```

## Context 对象

每次调用 `aigne.invoke()` 都会创建一个新的 `Context`。这个对象对于管理执行流程和确保稳定性至关重要。虽然您通常不直接与它交互，但它的配置选项提供了强大的控制功能。

### 设置执行限制

为了防止失控执行或过高的成本，您可以在 `AIGNE` 实例上设置限制。这些限制由 `Context` 对每次调用强制执行。

- `maxAgentInvokes`：在单次操作中，Agent 可以调用其他 Agent 的最大次数。
- `maxTokens`：可以消耗的总令牌数。
- `timeout`：最大执行时间（以毫秒为单位）。

```javascript Configuring Limits icon=logos:javascript
const aigne = new AIGNE({
  limits: {
    maxAgentInvokes: 10, // Agent 之间最多调用 10 次
    maxTokens: 4096,       // 每次操作最多 4096 个令牌
    timeout: 30000,        // 30 秒后超时
  },
});
```

### 使用 `userContext` 传递自定义数据

您可以使用 `userContext` 选项将您自己的特定于应用程序的数据附加到调用中。这些数据将对在该上下文中运行的所有 Agent 可用，这对于传递用户信息（如用户 ID 或会话详情）而不将其混入 AI 提示中非常有用。

```javascript Passing User Context icon=logos:javascript
const result = await aigne.invoke(
  agent,
  { message: "hello" },
  {
    userContext: { userId: "user-123", theme: "dark" },
  }
);
```

## 高级：用于 Agent 通信的发布/订阅

对于更复杂的工作流，`AIGNE` 包含一个内置的消息总线，允许 Agent 使用发布-订阅模式进行间接通信。Agent 可以将消息发布到命名的 `topics`，而不是直接相互调用，其他 Agent 可以订阅这些主题以响应事件。

这可以解耦您的 Agent，并允许更灵活和可扩展的系统设计。

```javascript Publish and Subscribe icon=logos:javascript
// 定义一个订阅 'test_topic' 并发布到 'result_topic' 的 Agent
const listeningAgent = AIAgent.from({
  subscribeTopic: "test_topic",
  publishTopic: "result_topic",
  inputKey: "message",
});

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  agents: [listeningAgent], // 向引擎注册 Agent
});

// 订阅结果主题以获取最终输出
const subscription = aigne.subscribe("result_topic");

// 向输入主题发布消息以触发 Agent
aigne.publish("test_topic", { message: "hello" });

// 等待来自订阅的消息
const { message } = await subscription;

console.log(message); // { message: "Hello, How can I assist you today?" }
```

## 资源管理

`AIGNE` 实例可能会占用网络连接等资源。在完成工作后清理它们非常重要。

### 手动关闭

您可以显式调用 `shutdown()` 方法来释放所有资源。

```javascript Manual Shutdown icon=logos:javascript
await aigne.invoke(agent, { message: "hello" });

// 手动关闭 AIGNE 实例
await aigne.shutdown();
```

### 使用 `using` 自动关闭

现代 JavaScript 支持使用 `using` 声明进行自动资源管理。这是推荐的方法，因为它能确保在变量离开作用域时自动调用 `shutdown()`，即使发生错误也是如此。

```javascript Automatic Shutdown with 'using' icon=logos:javascript
await using aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

await aigne.invoke(agent, { message: "hello" });

// aigne.shutdown() 会在此处自动调用
```

## 总结

`AIGNE` 类是您执行 AI 任务的主要工具，而 `Context` 则为每次运行提供了一个安全且可观察的环境。通过掌握 `invoke`、流式传输和发布/订阅系统，您可以构建各种由 AI 驱动的应用程序。

既然您已经了解了编排器，让我们更深入地探讨它所管理的 Agent。

[下一篇：Agents](./core-agents.md)
