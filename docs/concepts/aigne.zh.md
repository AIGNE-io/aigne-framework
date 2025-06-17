# AIGNE

[English](./aigne.md) | [中文](./aigne.zh.md)

AIGNE 是一个强大的框架，用于编排多个 Agent 以构建复杂的 AI 应用程序。它作为 Agent 交互、消息传递和执行流程的中央协调点。

## 基本概念

AIGNE 的核心是 Agent 编排。它通过以下机制实现这一点：

* **Agent 管理** - AIGNE 允许您添加和管理多个 Agent，每个 Agent 都可以访问 AIGNE 的资源。Agent 分为两类：主要 Agent（agents）和技能 Agent（skills）。
* **上下文隔离** - AIGNE 使用上下文（Context）来隔离不同流程或对话的状态，确保数据和执行环境的清晰分离。
* **统一模型** - AIGNE 提供全局模型配置，可以被所有未指定自己模型的 Agent 使用，简化了多 Agent 系统的设置。
* **消息通信** - AIGNE 实现了一个消息队列系统，支持发布/订阅模式，使 Agent 之间能够进行异步通信。

## 配置选项

创建 AIGNE 实例时，您可以提供以下配置选项：

* **name** - AIGNE 实例的可选名称标识符
* **description** - AIGNE 实例目的或功能的可选描述
* **model** - 所有未指定自己模型的 Agent 使用的全局模型
* **skills** - AIGNE 实例可用的技能 Agent 集合
* **agents** - AIGNE 实例管理的主要 Agent 集合
* **limits** - 应用于 AIGNE 实例执行的使用限制，如超时、最大令牌数等

## 使用方法

以下示例展示了如何在实际项目中使用 AIGNE 框架，从基础设置到高级功能的应用。

### 导入模块

在使用 AIGNE 之前，需要先导入必要的模块。以下代码导入了 AIGNE 核心框架和 OpenAI 聊天模型，这是构建 AI 应用的基础组件。

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic" only_imports
import { AIAgent, AIGNE, isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
```

### 创建 AIGNE 实例

下面的代码演示了如何创建一个基本的 AIGNE 实例，并配置全局模型。这里使用了 OpenAI 的 GPT-4o-mini 模型，该模型将作为所有未指定自己模型的 Agent 的默认模型。

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-create-aigne" exclude_imports
const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});
```

### 从配置文件加载 AIGNE

对于更复杂的应用，AIGNE 支持从配置文件加载实例配置。这种方式适合于需要管理多个 Agent 和复杂设置的场景。以下代码展示了如何从指定路径加载 AIGNE 配置，并提供可用的模型类型。

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-load" exclude_imports
const path = join(import.meta.dirname, "../../test-aigne"); // "/PATH/TO/AIGNE_PROJECT";

const aigne = await AIGNE.load(path, { models: [OpenAIChatModel] });
```

### 添加 Agent

创建 AIGNE 实例后，可以向其添加各种 Agent。下面的代码演示了如何创建一个基本的 AI Agent 并将其添加到 AIGNE 实例中。这个 Agent 被配置为一个有帮助的助手，可以响应用户的查询。

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-add-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
});

aigne.addAgent(agent);
```

### 调用 Agent

添加 Agent 后，可以通过 AIGNE 实例调用它。以下代码展示了如何向指定的 Agent 发送消息并获取响应。在这个例子中，向 Agent 询问了关于 AIGNE 的信息，并输出了响应结果。

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-invoke-agent" exclude_imports
const result = await aigne.invoke(agent, "What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

### 流式响应

对于需要实时反馈的应用场景，AIGNE 支持流式响应。这种方式允许在 Agent 生成响应的同时接收部分结果，特别适合于聊天应用等需要即时反馈的场景。以下代码演示了如何使用流式模式调用 Agent 并逐步处理响应内容。

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-invoke-agent-streaming" exclude_imports
const stream = await aigne.invoke(agent, "What is AIGNE?", { streaming: true });
let response = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
  }
}
console.log(response);
// Output:  "AIGNE is a platform for building AI agents."
```

### 用户 Agent

AIGNE 提供了用户 Agent 的概念，允许创建与特定 Agent 关联的用户会话。这种方式适合于需要维护对话上下文的场景，使多次交互能够保持连贯性。以下代码展示了如何创建用户 Agent 并通过它与目标 Agent 进行交互。

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-invoke-agent-user-agent" exclude_imports
const userAgent = aigne.invoke(agent);
const result1 = await userAgent.invoke("What is AIGNE?");
console.log(result1);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

### 关闭和清理

为了确保资源得到适当释放并避免潜在的内存泄漏，在完成 AIGNE 实例的使用后应进行正确的关闭操作。以下代码演示了如何安全地关闭 AIGNE 实例。这一步骤在长时间运行的应用或服务中尤为重要。

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-shutdown" exclude_imports
await aigne.shutdown();
```

通过以上示例，您可以了解 AIGNE 框架的基本用法，从创建实例、配置模型、添加 Agent 到调用和管理 Agent 的完整流程。AIGNE 的灵活架构使其能够适应各种复杂的 AI 应用场景，支持从简单的对话系统到复杂的多 Agent 协作系统的构建。
