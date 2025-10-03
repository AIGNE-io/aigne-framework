# AIGNE 引擎

AIGNE 引擎是该框架的中枢神经系统，负责编排 Agent 执行、管理状态和促进通信。它由两个主要组件组成：`AIGNE` 类和 `Context` 对象。它们共同为构建和运行复杂的 AI 应用程序提供了一个强大的环境。

`AIGNE` 类充当主入口点和协调器，而 `Context` 对象则为每个特定任务或对话提供一个隔离的、有状态的环境。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Engine: {
  label: "AIGNE 引擎"
  shape: rectangle

  AIGNE-Class: {
    label: "AIGNE 类\n(编排器)"
    shape: rectangle
  }

  Context: {
    label: "Context 对象\n(隔离环境)"
    shape: rectangle
  }

  Agent: {
    label: "Agent\n(任务执行器)"
    shape: rectangle
  }
}

User -> AIGNE-Engine.AIGNE-Class: "1. 调用 Agent"
AIGNE-Engine.AIGNE-Class -> AIGNE-Engine.Context: "2. 为执行创建"
AIGNE-Engine.AIGNE-Class -> AIGNE-Engine.Agent: "3. 分派任务"
AIGNE-Engine.Agent <-> AIGNE-Engine.Context: "4. 在上下文中执行任务"
AIGNE-Engine.Agent -> AIGNE-Engine.AIGNE-Class: "5. 返回结果"
AIGNE-Engine.AIGNE-Class -> User: "6. 转发结果"
```

## `AIGNE` 类

`AIGNE` 类是管理 AI 应用程序所有组件的高级编排器。它作为加载配置、管理 Agent 和技能以及启动 Agent 调用的中心点。

其主要职责包括：
*   **Agent 管理**：添加、存储和提供对所有已注册 Agent 的访问。
*   **资源供应**：持有全局资源，如默认的 `ChatModel`、`ImageModel` 以及可供 Agent 使用的共享 `skills`（工具）集合。
*   **执行启动**：通过 `invoke` 方法启动 Agent 工作流，该方法会创建一个新的执行 `Context`。
*   **配置**：使用静态 `load` 方法从目录中加载整个应用程序设置。
*   **生命周期管理**：处理所有 Agent 及其资源的平稳关闭。

### 基本用法

以下是一个如何实例化和使用 `AIGNE` 类来运行 Agent 的简单示例。

```typescript AIGNE 引擎示例 icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. 定义一个全局模型
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. 创建主 AIGNE 实例
const aigne = new AIGNE({ model });

// 3. 定义一个 Agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 4. 将 Agent 添加到引擎
aigne.addAgent(agent);

// 5. 使用输入消息调用 Agent
const response = await aigne.invoke(agent, "Hello, how are you?");

console.log(response);
```

### 关键方法和属性

`AIGNE` 类公开了多种用于管理应用程序生命周期的方法和属性。

<x-field-group>
  <x-field data-name="agents" data-type="Agent[]" data-desc="由该实例管理的主要 Agent 的集合。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-desc="该实例可用的技能 Agent (工具) 的集合。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-desc="未指定聊天模型的 Agent 使用的默认全局聊天模型。"></x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-desc="用于图像生成任务的默认全局图像模型。"></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-desc="应用于执行上下文的全局使用限制，例如超时或最大令牌数。"></x-field>
</x-field-group>

| 方法 | 描述 |
| :--- | :--- |
| `static load(path, options)` | 从包含 `aigne.yaml` 文件和 Agent 定义的目录中初始化 `AIGNE` 实例。 |
| `addAgent(...agents)` | 向实例中添加一个或多个 Agent，使其可供调用。 |
| `invoke(agent, message, options)` | 执行 Agent 的主要方法。它会创建一个新的 `Context` 并运行 Agent 的逻辑。 |
| `publish(topic, payload)` | 将消息发布到内部消息队列的主题上，从而实现事件驱动的 Agent 通信。 |
| `subscribe(topic, listener)` | 订阅主题以接收消息。可与回调监听器一起使用，或用于等待下一条消息。 |
| `shutdown()` | 平稳关闭实例及其所有关联的 Agent 和技能，并清理资源。 |

## `Context` 对象

`AIGNE` 类是静态编排器，而 `Context` 对象则是实际工作的动态环境。每次顶层 `invoke` 调用都会创建一个新的 `AIGNEContext`，确保每次执行运行都与其他运行隔离。这对于管理并发请求和维护无冲突的会话状态至关重要。

`Context` 对象负责：

*   **状态管理**：它持有单个执行流的状态，包括使用情况统计（`usage`）、用户特定数据（`userContext`）和记忆。
*   **隔离**：每个上下文都有唯一的 ID（`id`、`rootId`），以防止不同对话或任务之间的干扰。
*   **资源访问**：它为执行中的 Agent 提供访问必要资源的权限，例如从父 `AIGNE` 实例继承的模型（`model`、`imageModel`）和 `skills`。
*   **消息传递**：上下文继承了消息队列，允许同一执行流中的 Agent 通过 `publish` 和 `subscribe` 进行通信。
*   **可观察性**：每个上下文都链接到一个 OpenTelemetry `Span`，从而可以对 Agent 执行进行详细的跟踪和监控。

通常情况下，您不需要直接创建 `Context` 对象。当您调用 `aigne.invoke()` 时，框架会为您处理其创建和管理。然后，`Context` 会在 Agent 执行和协作时在它们之间内部传递。

### 关键属性

`Context` 实例上提供了以下属性，它们对于理解执行环境至关重要。

<x-field-group>
    <x-field data-name="id" data-type="string" data-desc="当前上下文范围的唯一标识符。"></x-field>
    <x-field data-name="rootId" data-type="string" data-desc="调用链中根上下文的标识符，相当于跟踪 ID。"></x-field>
    <x-field data-name="parentId" data-type="string" data-desc="如果这是子上下文，则为父上下文的 ID。"></x-field>
    <x-field data-name="usage" data-type="ContextUsage" data-desc="一个跟踪当前上下文资源消耗的对象，例如令牌计数和持续时间。"></x-field>
    <x-field data-name="userContext" data-type="object" data-desc="一个灵活的对象，用于在执行流程中传递用户特定数据（例如，userId、sessionId）。"></x-field>
    <x-field data-name="memories" data-type="Memory[]" data-desc="在此执行期间 Agent 可用的内存集合。"></x-field>
    <x-field data-name="span" data-type="Span" data-desc="用于跟踪和可观察性的 OpenTelemetry span。"></x-field>
</x-field-group>

## 总结

AIGNE 引擎的双组件设计提供了明确的关注点分离：

-   **`AIGNE` 类** 充当应用程序配置、Agent 和共享资源的静态、长生命周期容器。
-   **`Context` 对象** 为每次单独的执行提供一个动态、短生命周期且隔离的环境，确保状态的完整性并实现强大的可观察性。

这种架构允许您在应用程序级别一次性定义您的 Agent 和资源，而引擎则负责以可扩展且可靠的方式管理其执行的复杂任务。