本文档详细概述了 `AIGNE` 类，它是构建复杂 AI 应用的核心编排器。

## AIGNE 类

`AIGNE` 类是该框架的核心，旨在管理和协调多个 Agent 以执行复杂任务。它充当 Agent 交互、消息传递和整体执行流程的中心枢纽。通过编排各种专门的 Agent，`AIGNE` 能够构建复杂的多 Agent AI 系统。

### 架构概览

下图展示了 AIGNE 系统的高层架构，显示了 `AIGNE`、`Agent` 和 `Context` 等主要类之间的关系。

```d2
direction: down

AIGNE: {
  label: "AIGNE 类\n(编排器)"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Context: {
  label: "上下文"
  shape: cylinder
}

Agents: {
  label: "Agent 池"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  Agent-A: {
    label: "Agent A"
  }
  Agent-B: {
    label: "Agent B"
  }
  Agent-N: {
    label: "..."
  }
}

AIGNE -> Context: "管理"
AIGNE <-> Agents: "编排和路由消息"
Agents -> Context: "访问"
```

### 核心概念

-   **Agent 管理**：`AIGNE` 负责添加、管理和编排系统内所有 Agent 的生命周期。
-   **上下文创建**：它为不同的任务或对话创建隔离的执行上下文（`AIGNEContext`），确保状态和资源使用得到妥善管理。
-   **消息传递**：它通过内置的消息队列促进 Agent 之间的通信，支持直接调用和发布-订阅两种模式。
-   **全局配置**：`AIGNE` 持有全局配置，例如默认的 `ChatModel`、`ImageModel`，以及可被系统中任何 Agent 访问的共享 `skills`（专用 Agent）集合。

### 创建 AIGNE 实例

您可以通过两种主要方式创建 `AIGNE` 实例：以编程方式使用构造函数，或从文件系统加载配置。

#### 1. 使用构造函数

构造函数允许您以编程方式配置实例。

```typescript
import { AIGNE, Agent, ChatModel } from "@aigne/core";

// 定义一个模型和一些 Agent (技能)
const model = new ChatModel(/* ... */);
const skillAgent = new Agent({ /* ... */ });
const mainAgent = new Agent({ /* ... */ });

// 创建一个 AIGNE 实例
const aigne = new AIGNE({
  name: "MyAIGNEApp",
  description: "An example AIGNE application.",
  model: model,
  skills: [skillAgent],
  agents: [mainAgent],
});
```

**构造函数选项 (`AIGNEOptions`)**

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="AIGNE 实例的名称。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="实例用途的描述。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="适用于所有 Agent 的全局默认 ChatModel。"></x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="用于图像相关任务的全局默认 ImageModel。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="可供所有其他 Agent 使用的共享 Agent (技能)列表。"></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="创建实例时要添加的主要 Agent 列表。"></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="执行上下文的使用限制（例如，超时、最大令牌数）。"></x-field>
  <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="用于监控和记录实例活动的观察者。"></x-field>
</x-field-group>

#### 2. 从配置加载

静态方法 `AIGNE.load()` 提供了一种便捷的方式，可以从包含 `aigne.yaml` 文件和其他 Agent 定义的目录中初始化实例。这对于将配置与代码分离非常理想。

```typescript
import { AIGNE } from "@aigne/core";

// 从目录路径加载 AIGNE 实例
const aigne = await AIGNE.load("./path/to/config/dir");

// 你也可以覆盖已加载的选项
const aigneWithOverrides = await AIGNE.load("./path/to/config/dir", {
  name: "MyOverriddenAppName",
});
```

### 关键方法

#### invoke()

`invoke()` 方法是与 Agent 交互的主要方式。它有多个重载以支持不同的交互模式。

**1. 简单调用**

这是最常见的用例，即向一个 Agent 发送输入消息并接收完整的响应。

**示例**
```typescript
import { AIGNE } from '@aigne/core';
import { GreeterAgent } from './agents/greeter.agent.js';

const aigne = new AIGNE();
const greeter = new GreeterAgent();
aigne.addAgent(greeter);

const { message } = await aigne.invoke(greeter, {
  name: 'John',
});

// 预期输出: "Hello, John"
console.log(message);
```

**2. 流式调用**

对于长时间运行的任务或交互式体验（如聊天机器人），您可以在响应生成时以流式方式接收它。

**示例**
```typescript
import { AIGNE } from '@aigne/core';
import { StreamAgent } from './agents/stream.agent.js';

const aigne = new AIGNE();
const streamAgent = new StreamAgent();
aigne.addAgent(streamAgent);

const stream = await aigne.invoke(
  streamAgent,
  {
    name: 'World',
  },
  { streaming: true }
);

let fullMessage = '';
for await (const chunk of stream) {
  if (chunk.delta.text?.message) {
    fullMessage += chunk.delta.text.message;
    // 实时处理块
    process.stdout.write(chunk.delta.text.message);
  }
}
// 预期输出: "Hello, World" (逐字符流式传输)
```

**3. 创建 UserAgent**

如果您需要与一个 Agent 重复交互，可以创建一个 `UserAgent`。这为对话提供了一个一致的接口。

**示例**
```typescript
import { AIGNE } from '@aigne/core';
import { CalculatorAgent } from './agents/calculator.agent.js';

const aigne = new AIGNE();
const calculator = new CalculatorAgent();
aigne.addAgent(calculator);

// 为计算器创建一个 UserAgent
const user = aigne.invoke(calculator);

// 多次调用它
const result1 = await user.invoke({ operation: 'add', a: 5, b: 3 });
console.log(result1.result); // 8

const result2 = await user.invoke({ operation: 'subtract', a: 10, b: 4 });
console.log(result2.result); // 6
```

#### addAgent()

在 `AIGNE` 实例创建后，动态地向其添加一个或多个 Agent。一旦添加，Agent 就会附加到实例上，并能参与系统。

```typescript
const aigne = new AIGNE();
const agent1 = new MyAgent1();
const agent2 = new MyAgent2();

aigne.addAgent(agent1, agent2);
```

#### publish() / subscribe()

`AIGNE` 提供了一个消息队列，用于 Agent 之间使用发布-订阅模型的解耦、事件驱动的通信。

**示例**
```typescript
import { AIGNE } from '@aigne/core';

const aigne = new AIGNE();

// 订阅者：监听主题上的消息
aigne.subscribe('user.updated', ({ message }) => {
  console.log(`Received user update: ${message.userName}`);
});

// 另一个使用 async/await 处理单条消息的订阅者
async function waitForUpdate() {
  const { message } = await aigne.subscribe('user.updated');
  console.log(`Async handler received: ${message.userName}`);
}
waitForUpdate();

// 发布者：向主题广播一条消息
aigne.publish('user.updated', {
  userName: 'JaneDoe',
  status: 'active',
});
```

#### shutdown()

平稳地关闭 `AIGNE` 实例，确保所有 Agent 和技能都能正确清理其资源。这对于防止资源泄漏至关重要。

**示例**
```typescript
const aigne = new AIGNE();
// ... 添加 Agent 并进行操作

// 完成后关闭
await aigne.shutdown();
```

`AIGNE` 类还支持 `Symbol.asyncDispose` 方法，允许您将其与 `using` 语句一起使用以实现自动清理。

```typescript
import { AIGNE } from '@aigne/core';

async function myApp() {
  await using aigne = new AIGNE();
  // ... aigne 将在此代码块结束时自动关闭
}
```