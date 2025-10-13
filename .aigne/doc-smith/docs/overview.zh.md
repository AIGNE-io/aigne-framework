本文档详细介绍了 `AIGNE` 类，它是 AIGNE 框架中的核心编排器。您将学习如何创建、配置和使用 `AIGNE` 实例来管理 Agent、处理消息传递以及构建复杂的 AI 驱动应用。

### 简介

`AIGNE` 类是该框架的核心组件，旨在编排多个 Agent 及其交互。它作为主要的执行引擎，管理 Agent 的生命周期，通过消息队列促进通信，并为调用 Agent 工作流提供统一的入口点。

`AIGNE` 类的主要职责包括：
-   **Agent 管理**：加载、添加和管理构成应用的 Agent。
-   **执行上下文**：为每个工作流创建隔离的上下文，以管理状态并强制执行限制。
-   **调用**：提供灵活的 `invoke` 方法与 Agent 交互，支持标准和流式响应。
-   **消息传递**：提供发布-订阅系统，用于 Agent 之间的解耦通信。
-   **资源管理**：确保 Agent 及相关资源的优雅关闭。

### 架构概览

`AIGNE` 类位于框架的核心，协调各种组件以执行复杂的任务。下图说明了它在架构中的核心作用。

```d2
direction: down

User-Application: {
  label: "用户应用程序"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  AIGNE: {
    label: "AIGNE 类\n(核心编排器)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Managed-Components: {
    grid-columns: 2

    Agents: {
      label: "托管的 Agent"
      shape: rectangle
      Agent-A: "Agent A"
      Agent-B: "Agent B"
      Agent-C: "..."
    }

    Message-Queue: {
      label: "消息队列\n(发布/订阅)"
      shape: queue
    }
  }
}

User-Application -> AIGNE-Framework.AIGNE: "invoke()"
AIGNE-Framework.AIGNE -> AIGNE-Framework.Managed-Components.Agents: "Agent 管理"
AIGNE-Framework.AIGNE -> AIGNE-Framework.Managed-Components.Message-Queue: "消息传递"
AIGNE-Framework.AIGNE -> AIGNE-Framework.AIGNE: "创建执行上下文"
AIGNE-Framework.Managed-Components.Agents.Agent-A <-> AIGNE-Framework.Managed-Components.Message-Queue: "通信"

```

### 创建实例

您可以通过两种主要方式创建 `AIGNE` 实例：直接使用其构造函数或从文件系统加载配置。

#### 1. 使用构造函数

最直接的方法是使用 `AIGNEOptions` 对象实例化该类。这允许您以编程方式定义引擎的各个方面，例如全局模型、Agent 和技能。

**参数 (`AIGNEOptions`)**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | AIGNE 实例的名称。 |
| `description` | `string` | 实例用途的描述。 |
| `model` | `ChatModel` | 一个全局模型，供所有未分配特定模型的 Agent 使用。 |
| `imageModel` | `ImageModel` | 一个可选的全局图像模型，用于处理与图像相关的任务。 |
| `skills` | `Agent[]` | 实例可用的技能 Agent 列表。 |
| `agents` | `Agent[]` | 由实例管理的主要 Agent 列表。 |
| `limits` | `ContextLimits` | 执行上下文的使用限制，例如超时或最大令牌数。 |
| `observer` | `AIGNEObserver` | 用于监控和日志记录的观察者。 |

**示例**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. 创建模型实例
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. 定义一个 Agent
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 3. 创建一个 AIGNE 实例
const aigne = new AIGNE({
  model: model,
  agents: [assistantAgent],
  name: "MyFirstAIGNE",
});
```

#### 2. 从配置加载

对于更复杂的应用，您可以在 YAML 文件中定义您的 AIGNE 设置，并使用静态 `AIGNE.load()` 方法加载它。这种方法将配置与代码分离，使您的应用程序更加模块化。

```typescript
import { AIGNE } from '@aigne/core';

// 假设您在 './my-aigne-app' 目录中有一个 `aigne.yaml` 文件
async function loadAigne() {
  const aigne = await AIGNE.load('./my-aigne-app');
  console.log(`AIGNE instance "${aigne.name}" loaded successfully.`);
  return aigne;
}
```

### 核心方法

`AIGNE` 类提供了一套强大的方法来管理 Agent 并与之交互。

#### `invoke()`

`invoke` 方法是与 Agent 交互的主要方式。它支持多种模式，包括创建持久化用户会话、发送单条消息和流式响应。

**1. 创建用户 Agent**

在没有消息的情况下调用 Agent 会创建一个 `UserAgent`，它维护一个一致的交互上下文。

```typescript
// 创建一个用户 Agent，用于与 'assistantAgent' 进行持续交互
const userAgent = aigne.invoke(assistantAgent);

// 现在您可以通过 userAgent 发送多条消息
const response1 = await userAgent.invoke("Hello, what's your name?");
const response2 = await userAgent.invoke("Can you help me with a task?");
```

**2. 发送单条消息（请求-响应）**

对于简单的一次性交互，您可以直接传递 Agent 和消息。

```typescript
const response = await aigne.invoke(
  assistantAgent,
  "Write a short poem about AI.",
);
console.log(response);
```

**3. 流式响应**

要以数据块流的形式接收响应，请将 `streaming` 选项设置为 `true`。这对于像聊天机器人这样的实时应用非常理想。

```typescript
const stream = await aigne.invoke(
  assistantAgent,
  "Tell me a long story.",
  { streaming: true }
);

for await (const chunk of stream) {
  // 在故事的每个片段到达时进行处理
  process.stdout.write(chunk.delta.text?.content || "");
}
```

#### `addAgent()`

您可以在 `AIGNE` 实例创建后动态地向其中添加 Agent。该 Agent 将附加到实例的生命周期和通信系统中。

```typescript
const newAgent = AIAgent.from({ name: "NewAgent", instructions: "..." });
aigne.addAgent(newAgent);
```

#### `publish()` & `subscribe()`

该框架包含一个用于 Agent 之间解耦通信的消息队列。Agent 可以向主题发布消息，其他 Agent 可以订阅这些主题以接收它们。

**发布消息**

```typescript
// 向 'news_updates' 主题发布一条消息
aigne.publish("news_updates", {
  headline: "AIGNE Framework v2.0 Released",
  content: "New features include...",
});
```

**订阅主题**

您可以订阅一个主题以接收单条消息，或设置一个持久化监听器。

```typescript
// 1. 等待主题上的下一条消息
const nextMessage = await aigne.subscribe('user_actions');
console.log('Received action:', nextMessage);

// 2. 为主题上的所有消息设置一个监听器
const unsubscribe = aigne.subscribe('system_events', (payload) => {
  console.log(`System Event: ${payload.message.type}`);
});

// 之后，要停止监听：
unsubscribe();
```

#### `shutdown()`

为确保干净地退出，`shutdown` 方法会优雅地终止所有 Agent 和技能，清理它们持有的任何资源。

```typescript
await aigne.shutdown();
console.log("AIGNE instance has been shut down.");
```

这也可以通过在现代 JavaScript/TypeScript 中使用 `Symbol.asyncDispose` 功能来自动管理。

```typescript
async function run() {
  await using aigne = new AIGNE({ ... });
  // ... 使用 aigne 实例 ...
} // aigne.shutdown() 会在此处自动调用
```