本文档为 AIGNE 框架的基础组件提供了一份面向开发者的指南。理解这些概念对于构建健壮、复杂的多 Agent 系统至关重要。我们将涵盖 `Agent`、`AIGNE 上下文`，以及使它们能够通信、记忆和扩展其能力的机制。

### 核心组件图

首先，让我们可视化 AIGNE 的核心组件是如何交互的。下图说明了 Agent、AIGNE 上下文、主题、内存和技能之间的关系。

```d2
direction: down

AIGNE-Context: {
  label: "AIGNE 上下文"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Agent: {
    label: "Agent"
    shape: rectangle
    style: {
      fill: "#e6f7ff"
      stroke: "#91d5ff"
    }
  }

  Topics: {
    label: "主题\n(通信总线)"
    shape: rectangle
  }

  Memory: {
    label: "内存\n(状态与历史)"
    shape: cylinder
  }

  Skills: {
    label: "技能\n(扩展能力)"
    shape: rectangle
  }
}

AIGNE-Context.Agent <-> AIGNE-Context.Topics: "通过...通信"
AIGNE-Context.Agent <-> AIGNE-Context.Memory: "读取/写入"
AIGNE-Context.Agent <-> AIGNE-Context.Skills: "使用"
```

---

## Agent 类

`Agent` 是 AIGNE 框架中的基本构建块。它是一个能够执行任务、处理信息并与其他 Agent 通信的自治实体。您创建的每个自定义 Agent 都将扩展此基类。

### 关键概念

*   **`name` 和 `description`**：每个 Agent 都有一个用于识别的 `name` 和一个可选的 `description` 来解释其用途。这对于调试以及其他 Agent 理解其能力至关重要。
*   **模式 (`inputSchema`, `outputSchema`)**：Agent 使用 Zod 模式定义其输入和输出结构。这确保了传入和传出 Agent 的所有数据都经过验证，从而防止错误并确保可预测的交互。
*   **`process` 方法**：Agent 的核心逻辑位于其 `process` 方法中。这是一个抽象方法，您必须在子类中实现它。它接收输入消息和调用选项（包括上下文），并返回结果。结果可以是一个直接的对象、一个数据流，甚至可以是任务被移交到的另一个 Agent。

### 核心职责

`Agent` 基类为以下方面提供了坚实的基础：
*   处理结构化的输入和输出。
*   通过基于主题的消息系统与其他 Agent 通信。
*   维护过去交互的记忆。
*   利用`技能`（其他 Agent）来委托任务和扩展功能。
*   支持流式和非流式响应。

### 示例：创建一个自定义 Agent

这是一个自定义 Agent 的基本示例，它接收一个名字并返回一句问候语。

```typescript
import { Agent, AgentInvokeOptions, Message } from "@aigne/core";
import { z } from "zod";

// 定义输入和输出消息类型
interface GreetingInput extends Message {
  name: string;
}

interface GreetingOutput extends Message {
  greeting: string;
}

// 创建自定义 Agent
class GreeterAgent extends Agent<GreetingInput, GreetingOutput> {
  constructor() {
    super({
      name: "GreeterAgent",
      description: "一个生成个性化问候语的 Agent。",
      inputSchema: z.object({
        name: z.string().describe("要问候的人的姓名。"),
      }),
      outputSchema: z.object({
        greeting: z.string().describe("生成的问候消息。"),
      }),
    });
  }

  // 在 process 方法中实现核心逻辑
  async process(input: GreetingInput, options: AgentInvokeOptions) {
    const { name } = input;
    return {
      greeting: `Hello, ${name}! Welcome to the AIGNE framework.`,
    };
  }
}
```

## AIGNE 上下文

`Context` (`AIGNEContext`) 是 Agent 运行的运行时环境。它在调用期间传递给 Agent，对其执行至关重要。上下文不是一个被动对象；它是通往整个 AIGNE 生态系统的门户。

### 关键职责

*   **Agent 间通信**：上下文提供 `publish` 和 `subscribe` 方法，允许 Agent 通过命名主题进行通信，而无需直接耦合。
*   **状态和内存管理**：它管理整体状态并提供对内存系统的访问。
*   **事件管理**：上下文包含一个事件发射器，用于广播关键的生命周期事件（例如 `agentStarted`、`agentSucceed`、`agentFailed`）。这对于监控、日志记录和调试系统至关重要。
*   **资源和限制执行**：它跟踪资源使用情况，例如 Agent 调用次数，并可以强制执行限制以防止失控进程。

## 通过主题进行通信

AIGNE 中的 Agent 使用发布-订阅 (pub/sub) 消息模型进行通信，由 `Context` 进行协调。这将 Agent 彼此解耦，从而实现灵活且可扩展的架构。

*   **`subscribeTopic`**：Agent 可以声明一个或多个它想要监听的主题。当消息发布到已订阅的主题时，上下文将自动触发 Agent 的 `onMessage` 处理程序，该处理程序又会调用 Agent。
*   **`publishTopic`**：处理后，Agent 可以将其输出发布到一个或多个主题。这使得其他感兴趣的 Agent 能够对结果做出反应。`publishTopic` 可以是一个静态字符串，也可以是一个根据输出消息动态确定主题的函数。

该系统使您能够构建复杂的工作流，其中 Agent 对其他 Agent 生成的事件和数据做出反应，形成一个协作的多 Agent 系统。

## 内存

要使 Agent 真正智能，它需要记住过去的交互。AIGNE 提供了一个可以附加到任何 Agent 的 `MemoryAgent`。

配置后，Agent 将自动：
1.  **记录交互**：成功处理消息后，Agent 会将输入和输出对记录到其关联的内存中。
2.  **检索记忆**：在处理之前，Agent 可以查询其内存以检索相关的过去交互，为其当前任务提供有价值的上下文。

这使得 Agent 能够从经验中学习，维护对话历史，并执行需要了解先前事件的任务。

## 技能

为了促进模块化和重用，Agent 的能力可以通过**`技能`**进行扩展。一个技能就是另一个 `Agent`。通过向一个 Agent 添加技能，您就赋予了它将特定任务委托给该技能的能力。

例如，一个复杂的 "TripPlanner" Agent 可能会使用几个技能：
*   一个 `FlightSearchAgent` 来查找航班。
*   一个 `HotelBookingAgent` 来预订住宿。
*   一个 `WeatherAgent` 来检查天气预报。

`TripPlanner` Agent 不需要知道这些任务的实现细节。它只是将它们作为技能来调用，协调它们的结果以实现其主要目标。这遵循了“组合优于继承”的原则，是构建复杂、可维护的 Agent 系统的关键。

## Agent 生命周期和钩子

每个 Agent 调用都会经历一个定义的生命周期，您可以使用**`钩子 (Hooks)`**来介入这个生命周期。钩子允许您在流程的关键阶段执行自定义逻辑，而无需修改 Agent 的核心实现。

关键的生命周期事件包括：
*   **`onStart`**：在 Agent 的 `process` 方法被调用之前。
*   **`onEnd`**：在 Agent 完成之后，无论成功还是失败。
*   **`onSuccess`**：在 Agent 成功完成后。
*   **`onError`**：在处理过程中发生错误时。
*   **`onSkillStart` / `onSkillEnd`**：在技能被调用之前和之后。

钩子对于日志记录、监控、指标收集以及实现诸如身份验证或缓存之类的横切关注点非常强大。