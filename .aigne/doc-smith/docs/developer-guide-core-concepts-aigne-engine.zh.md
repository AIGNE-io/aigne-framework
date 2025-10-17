# AIGNE

`AIGNE` 类是框架的核心执行引擎。它通过协调多个 Agent 来构建复杂的 AI 应用程序，充当 Agent 交互、消息传递和整体执行流程的主要协调点。

本指南介绍了如何实例化和配置 AIGNE，如何使用 `invoke` 方法执行 Agent，以及如何管理应用程序的生命周期。

```d2
direction: down

Developer: {
  shape: c4-person
}

Instantiation: {
  label: "实例化方法"
  shape: rectangle
  style.stroke-dash: 2

  Constructor: {
    label: "`new AIGNE()`\n(编程方式)"
  }

  Load-Method: {
    label: "`AIGNE.load()`\n(从目录加载)"
  }
}

AIGNE-Engine: {
  label: "AIGNE"
  shape: rectangle

  Core: {
    label: "核心职责"
    shape: rectangle
    style.stroke-dash: 4

    Agent-Management: {
      label: "Agent 和技能\n管理"
    }
    Model-Configuration: {
      label: "全局模型\n配置"
    }
    Execution-Context: {
      label: "执行上下文"
    }
  }
}

Invocation-Results: {
  label: "`invoke()` 结果"
  shape: rectangle
  style.stroke-dash: 2

  Standard-Response: {
    label: "标准响应\n(Promise)"
  }

  Streaming-Response: {
    label: "流式响应\n(AgentResponseStream)"
  }

  User-Agent: {
    label: "有状态 UserAgent\n(维护上下文)"
  }
}

Developer -> Instantiation: "通过...初始化"
Instantiation.Constructor -> AIGNE-Engine
Instantiation.Load-Method -> AIGNE-Engine

Developer -> AIGNE-Engine: "调用 `invoke()`"

AIGNE-Engine -> Invocation-Results.Standard-Response: "返回"
AIGNE-Engine -> Invocation-Results.Streaming-Response: "返回"
AIGNE-Engine -> Invocation-Results.User-Agent: "返回"

Invocation-Results -> Developer: "接收结果"

```

## 概述

AIGNE 充当整个 Agent 应用的容器。其主要职责包括：

-   **Agent 管理**：管理所有已注册 Agent 和技能的生命周期。
-   **模型配置**：为聊天和图像模型提供全局默认配置，该配置可被单个 Agent 继承或覆盖。
-   **执行上下文**：为每次调用创建和管理隔离的上下文，确保并发操作互不干扰。
-   **生命周期控制**：提供优雅地启动和停止应用程序的方法，确保所有资源都得到妥善处理。

## 实例化

创建 `AIGNE` 实例主要有两种方式：使用构造函数以编程方式创建，或从目录加载配置。

### 使用构造函数

最直接的方法是使用 `AIGNE` 构造函数，并传入一个选项对象。这种方法非常适合在代码中动态管理配置的应用程序。

```typescript Instantiating AIGNE icon=logos:typescript
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  name: "MyFirstAIGNEApp",
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});
```

### 从配置加载

对于更复杂的项目，最佳实践是在一个包含 `aigne.yaml` 文件和其他 Agent 定义的目录中定义应用程序结构。静态方法 `AIGNE.load()` 会读取此目录并构建一个完全配置的实例。这种方式促进了配置与逻辑的分离。

```typescript Loading AIGNE from a Directory icon=logos:typescript
import { AIGNE } from "@aigne/core";
import { join } from "node:path";

const configPath = join(process.cwd(), "my-aigne-project");
const aigne = await AIGNE.load(configPath);
```

## 配置选项

`AIGNE` 构造函数接受一个 `AIGNEOptions` 对象来控制其行为。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="AIGNE 实例的唯一名称。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="实例用途的简要描述。"></x-field>
  <x-field data-name="rootDir" data-type="string" data-required="false" data-desc="用于解析 Agent 和技能相对路径的根目录。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false">
    <x-field-desc markdown>为所有未指定自身模型的 Agent 提供的全局默认聊天模型。更多详情请参阅[模型](./developer-guide-core-concepts-models.md)。</x-field-desc>
  </x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="用于图像生成任务的全局默认图像模型。"></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="一个 Agent 实例数组，在初始化时注册到引擎中。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="一个技能 Agent 数组，供其他 Agent 使用。"></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="应用于所有调用的执行限制，例如超时或最大 token 数。"></x-field>
  <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="用于监控和记录执行追踪的观察者实例。"></x-field>
</x-field-group>

## Agent 和生命周期管理

实例创建后，您可以管理 Agent 并控制应用程序的生命周期。

### 添加 Agent

虽然可以在构造函数中提供 Agent，但您也可以使用 `addAgent` 方法动态添加它们。每个 Agent 都会附加到 AIGNE 实例上，从而可以访问全局模型等共享资源。

```typescript Dynamically Adding an Agent icon=logos:typescript
import { AIAgent } from "@aigne/core";
import { AIGNE } from "@aigne/core";

// 假设 'aigne' 是一个已有的 AIGNE 实例
const aigne = new AIGNE();

const myAgent = new AIAgent({
  instructions: "You are a helpful assistant.",
});

aigne.addAgent(myAgent);
```

### 关闭

为确保程序干净退出并妥善清理资源，请调用 `shutdown` 方法。这对于防止长时间运行的应用程序发生资源泄漏至关重要。引擎还会自动处理如 `SIGINT` 之类的进程退出信号。

```typescript Graceful Shutdown icon=logos:typescript
// 假设 'aigne' 是一个已有的 AIGNE 实例
await aigne.shutdown();
```

## 调用 Agent

`invoke` 方法是执行 Agent 的主要入口点。它是一个重载方法，支持从简单的请求-响应到实时流的多种模式。

### 标准调用

最常见的用例是提供一个 Agent 和一条输入消息。此操作会返回一个 Promise，该 Promise 在解析后会返回 Agent 的最终输出。

```typescript Standard Agent Invocation icon=logos:typescript
// 假设 'aigne' 和 'myAgent' 已配置
const result = await aigne.invoke(myAgent, {
  message: "What is the AIGNE Framework?",
});

console.log(result.message);
// 预期输出：关于该框架的描述性回答。
```

### 流式响应

对于聊天机器人等交互式应用，您可以启用流式传输以增量方式接收响应。在选项中设置 `streaming: true` 会返回一个 `AgentResponseStream`。然后，您可以遍历该流来处理陆续到达的数据块。

```typescript Streaming Agent Responses icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";

// 假设 'aigne' 和 'myAgent' 已配置
const stream = await aigne.invoke(
  myAgent,
  { message: "Tell me a short story." },
  { streaming: true }
);

let fullResponse = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const textDelta = chunk.delta.text?.message ?? "";
    fullResponse += textDelta;
    process.stdout.write(textDelta);
  }
}

console.log("\n--- End of Story ---");
```

### 创建 User Agent

在没有消息的情况下调用 Agent 会创建一个 `UserAgent`。这是一个有状态的包装器，它能在多次调用之间保留对话上下文，因此非常适合构建会话式体验。

```typescript Creating a Stateful UserAgent icon=logos:typescript
// 假设 'aigne' 和 'myAgent' 已配置

// 创建一个 UserAgent 来维护上下文
const userAgent = aigne.invoke(myAgent);

// 第一次交互
const response1 = await userAgent.invoke({ message: "My name is Bob." });
console.log(response1.message); // 例如："很高兴认识你，Bob！"

// 第二次交互保留了上下文
const response2 = await userAgent.invoke({ message: "What is my name?" });
console.log(response2.message); // 例如："你的名字是 Bob。"
```

`invoke` 方法还为高级场景提供了额外的重载，例如返回多 Agent 团队中最终活跃的 Agent。请参阅 API 参考以获取完整的签名列表。

---

在清晰地了解了 AIGNE 后，你现在可以开始探索构成应用程序基础的不同类型的 [Agent](./developer-guide-core-concepts-agents.md) 了。