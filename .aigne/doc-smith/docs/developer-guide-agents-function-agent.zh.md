# Function Agent

`FunctionAgent` 提供了一种封装现有 TypeScript 或 JavaScript 函数的直接方法，从而将它们提升为 AIGNE 框架内的一等 Agent。这使得将自定义业务逻辑、外部 API 交互或任何任意代码无缝集成到 Agent 工作流中成为可能，无需编写大量样板代码。

通过包装一个函数，`FunctionAgent` 使其能够完全参与到 Agent 生态系统中。它可以像任何其他 Agent 一样被调用，可以作为一项技能整合到 `AIAgent` 或 `TeamAgent` 中，并与 AIGNE 上下文和生命周期钩子进行交互。这使其成为连接传统编程逻辑与人工智能驱动流程的重要组件。

此图展示了 `FunctionAgent` 的创建和调用流程，从提供源函数到接收最终输出。

```d2
direction: down

Zod-Library: {
  label: "Zod 库"
  shape: rectangle
  style.fill: "#f0f0f0"
}

External-API: {
  label: "外部 API\n（例如 REST、GraphQL）"
  shape: cylinder
}

Developers-Code: {
  label: "开发者的代码"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Custom-Logic: {
    label: "自定义逻辑\n（JS/TS 函数）"
    shape: rectangle
  }

  Agent-Config: {
    label: "Agent 配置对象"
    shape: rectangle
  }
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  FunctionAgent: {
    label: "FunctionAgent"
    shape: rectangle

    from-method: {
      label: "from()"
      shape: oval
    }

    invoke-method: {
      label: "invoke()"
      shape: oval
    }
  }
}

Developers-Code.Custom-Logic -> AIGNE-Framework.FunctionAgent.from-method: "1a. 提供函数"
Developers-Code.Agent-Config -> AIGNE-Framework.FunctionAgent.from-method: "1b. 提供配置"
Zod-Library -> Developers-Code.Agent-Config: {
  label: "定义模式"
  style.stroke-dash: 2
}
AIGNE-Framework.FunctionAgent.from-method -> AIGNE-Framework.FunctionAgent: "2. 创建实例"

Developers-Code -> AIGNE-Framework.FunctionAgent.invoke-method: "3. 使用输入调用"
AIGNE-Framework.FunctionAgent.invoke-method -> Developers-Code.Custom-Logic: "4. 执行 'process' 逻辑"
Developers-Code.Custom-Logic -> External-API: "5. （可选）获取数据"
External-API -> Developers-Code.Custom-Logic: "6. 返回数据"
Developers-Code.Custom-Logic -> AIGNE-Framework.FunctionAgent.invoke-method: "7. 返回结果"
AIGNE-Framework.FunctionAgent.invoke-method -> Developers-Code: "8. 返回最终输出"
```

## 关键概念

`FunctionAgent` 是 `Agent` 类的一个专门实现，它将其核心处理逻辑委托给用户提供的函数。此 Agent 的主要构造函数是静态方法 `FunctionAgent.from()`，它简化了其实例化过程。

`FunctionAgent` 可以通过两种方式创建：

1.  **直接从函数创建：** 将一个同步或异步函数传递给 `FunctionAgent.from()`。Agent 将从函数定义中推断属性，例如其名称。
2.  **从配置对象创建：** 为了更明确的控制，提供一个选项对象，该对象指定 `process` 函数以及其他标准 Agent 配置，如 `name`、`description`、`inputSchema` 和 `outputSchema`。

这种设计为快速、临时的集成以及开发健壮、定义明确的 Agent 组件提供了灵活性。

## 创建 Function Agent

创建 `FunctionAgent` 的标准方法是通过 `FunctionAgent.from()` 工厂方法，该方法接受一个函数或一个配置对象。

### 从简单函数创建

任何标准函数都可以直接被包装。AIGNE 框架将使用该函数的名称作为 Agent 的名称。这种方法最适合简单、自包含的操作。

```javascript 包装一个简单函数 icon=logos:javascript
import { FunctionAgent } from "@aigne/core";

// 定义一个简单的同步函数
function add({ a, b }) {
  return { result: a + b };
}

// 将函数包装成一个 agent
const addAgent = FunctionAgent.from(add);

console.log(addAgent.name); // 输出: 'add'
```

该函数接收 Agent 的输入对象作为其第一个参数，并期望返回一个构成 Agent 输出的对象。

### 使用完整配置

对于更复杂的集成，应提供一个完整的配置对象。这允许定义用于验证的输入/输出模式、包含描述以及分配自定义名称。推荐使用此方法来创建健壮且可重用的 Agent。

```javascript 带有配置的 Function Agent icon=logos:javascript
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const fetchUserAgent = FunctionAgent.from({
  name: "FetchUser",
  description: "Fetches user data from a placeholder API.",
  inputSchema: z.object({
    userId: z.number().describe("The ID of the user to fetch."),
  }),
  outputSchema: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
  process: async ({ userId }) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data.");
    }
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
    };
  },
});
```

在此示例中，定义了 `zod` 模式以确保输入 `userId` 是一个数字，并且输出符合指定的结构。

## 调用 Function Agent

创建的 `FunctionAgent` 使用标准的 `.invoke()` 方法进行调用，与所有其他 Agent 类型保持一致。

```javascript 调用 Agent icon=logos:javascript
async function main() {
  // 使用前一个示例中的简单 'add' agent
  const result = await addAgent.invoke({ a: 10, b: 5 });
  console.log(result); // { result: 15 }

  // 使用配置好的 'FetchUser' agent
  const user = await fetchUserAgent.invoke({ userId: 1 });
  console.log(user); 
  // { id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz' }
}

main();
```

`invoke` 方法管理执行生命周期，包括根据模式（如果提供）进行输入验证、执行底层函数以及根据输出模式验证结果。

## 高级用法

### 流式响应

`FunctionAgent` 通过使用异步生成器支持流式响应。`process` 函数可以定义为一个 `async function*`，它 `yield`s `AgentResponseChunk` 对象，从而实现增量数据传输。

```javascript 使用异步生成器进行流式处理 icon=logos:javascript
import { FunctionAgent, jsonDelta, textDelta } from "@aigne/core";
import { z } from "zod";

const streamNumbersAgent = FunctionAgent.from({
  name: "StreamNumbers",
  inputSchema: z.object({
    count: z.number().int().positive(),
  }),
  outputSchema: z.object({
    finalCount: z.number(),
    message: z.string(),
  }),
  process: async function* ({ count }) {
    for (let i = 1; i <= count; i++) {
      yield textDelta({ message: `Processing number ${i}... ` });
      await new Promise((resolve) => setTimeout(resolve, 200)); // 模拟工作
    }
    yield jsonDelta({ finalCount: count });
    yield textDelta({ message: "Done." });
  },
});

async function runStream() {
  const stream = await streamNumbersAgent.invoke({ count: 5 }, { streaming: true });
  for await (const chunk of stream) {
    console.log(chunk);
  }
}

runStream();
```

对于需要提供有关 Agent 进度的实时反馈的长时间运行任务，此功能特别有用。

## 配置

`FunctionAgent` 通过传递给 `FunctionAgent.from` 或其构造函数的配置对象进行初始化。以下是其配置特有的参数。

<x-field-group>
  <x-field data-name="process" data-type="FunctionAgentFn" data-required="true">
    <x-field-desc markdown>实现 Agent 逻辑的函数。它接收输入消息和调用选项，并返回处理结果。这可以是一个同步函数、一个返回 Promise 的异步函数，或用于流式处理的异步生成器。</x-field-desc>
  </x-field>
  <x-field data-name="name" data-type="string" data-required="false">
    <x-field-desc markdown>Agent 的唯一名称，用于识别和日志记录。如果未提供，则默认为 `process` 函数的名称。</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="false">
    <x-field-desc markdown>对 Agent 功能的人类可读描述。这对于文档记录以及其他 Agent 理解其能力很有用。</x-field-desc>
  </x-field>
  <x-field data-name="inputSchema" data-type="ZodObject" data-required="false">
    <x-field-desc markdown>用于验证输入消息结构和类型的 Zod 模式。如果验证失败，Agent 将在调用 `process` 函数之前抛出错误。</x-field-desc>
  </x-field>
  <x-field data-name="outputSchema" data-type="ZodObject" data-required="false">
    <x-field-desc markdown>用于验证 `process` 函数返回的输出消息结构和类型的 Zod 模式。如果验证失败，则会抛出错误。</x-field-desc>
  </x-field>
</x-field-group>

基础 `AgentOptions` 中的所有其他属性也可用。有关完整列表，请参阅 [Agent 文档](./developer-guide-core-concepts-agents.md)。

## 总结

`FunctionAgent` 是一个多功能工具，用于将传统代码集成到 AIGNE 框架中，充当一座桥梁，允许任何 JavaScript 或 TypeScript 函数作为标准 Agent 运行。

-   **简单性：** 使用 `FunctionAgent.from()` 以最少的代码包装现有函数。
-   **集成：** 将传统的业务逻辑、计算或外部 API 调用无缝地整合到 Agent 工作流中。
-   **验证：** 通过使用 Zod 定义输入和输出模式来强制执行数据契约并提高可靠性。
-   **灵活性：** 支持同步函数、异步 Promise 和使用异步生成器的流式处理。

通过利用 `FunctionAgent`，开发者可以将传统代码的确定性和可靠性与 AI Agent 的动态能力相结合，构建更强大、更稳健的应用程序。要协调包括 Function Agent 在内的多个 Agent，请参阅有关 [Team Agent](./developer-guide-agents-team-agent.md) 的文档。