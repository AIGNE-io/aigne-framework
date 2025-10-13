# 内存管理

内存模块提供了一个强大的框架，使 Agent 能够持久化和回忆信息，从而创建一个有状态且具备上下文感知能力的系统。这使得 Agent 可以维护交互历史、从过去的事件中学习，并做出更明智的决策。

内存系统的核心是 `MemoryAgent`，它充当所有内存相关操作的中央协调器。它将写入和读取内存的实际任务委托给两个专门的组件：`MemoryRecorder` 和 `MemoryRetriever`。这种关注点分离的设计实现了灵活且可扩展的内存解决方案。

- **MemoryAgent**：内存操作的主要入口点。它负责协调记录和检索过程。
- **MemoryRecorder**：一种 Agent 技能，负责将内存写入或存储到持久化后端（例如，数据库、文件系统或内存存储）。
- **MemoryRetriever**：一种 Agent 技能，负责从存储后端查询和获取内存。

本指南将逐一介绍每个组件，解释它们的作用，并提供如何在您的 Agent 系统中实现和使用它们的实际示例。

## 架构概述

下图说明了核心内存组件之间的关系。应用程序逻辑与 `MemoryAgent` 交互，`MemoryAgent` 再使用 `MemoryRecorder` 和 `MemoryRetriever` 技能与持久化存储后端进行交互。

```d2
direction: down

Agent-System: {
  label: "Agent 系统\n（应用程序）"
  shape: rectangle
}

Memory-Module: {
  label: "内存模块"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MemoryAgent: {
    label: "MemoryAgent\n（协调器）"
  }

  MemoryRecorder: {
    label: "MemoryRecorder\n（Agent 技能）"
  }

  MemoryRetriever: {
    label: "MemoryRetriever\n（Agent 技能）"
  }
}

Persistent-Backend: {
  label: "持久化后端\n（数据库、文件系统等）"
  shape: cylinder
}

Agent-System -> Memory-Module.MemoryAgent: "1. record() / retrieve()"

Memory-Module.MemoryAgent -> Memory-Module.MemoryRecorder: "2a. 委托写入"
Memory-Module.MemoryRecorder -> Persistent-Backend: "3a. 存储内存"

Memory-Module.MemoryAgent -> Memory-Module.MemoryRetriever: "2b. 委托读取"
Memory-Module.MemoryRetriever -> Persistent-Backend: "3b. 查询内存"
Persistent-Backend -> Memory-Module.MemoryRetriever: "4b. 返回内存"
```

## 核心组件

### MemoryAgent

`MemoryAgent` 是一种专门的 Agent，作为管理、存储和检索内存的主要接口。与其他 Agent 不同，它不用于直接调用以处理消息；相反，它提供核心的 `record()` 和 `retrieve()` 方法来与系统的内存进行交互。

您可以通过为其提供一个 `recorder` 和一个 `retriever` 来配置 `MemoryAgent`。这些可以是预构建的实例，也可以是定义您特定存储逻辑的自定义函数。

**主要特性：**

- **集中管理**：作为内存操作的单点联系人。
- **委托**：将存储和检索逻辑卸载到专用的 `MemoryRecorder` 和 `MemoryRetriever` Agent。
- **自动记录**：可以通过 `autoUpdate` 配置，以自动记录其观察到的所有消息，从而创建无缝的交互历史记录。

**示例：创建 MemoryAgent**

```typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@core/memory";
import { Agent, type AgentInvokeOptions, type Message } from "@core/agents";

// 定义用于记录和检索内存的自定义逻辑
const myRecorder = new MemoryRecorder({
  process: async (input, options) => {
    // 将内存保存到数据库的自定义逻辑
    console.log("Recording memories:", input.content);
    // ... 实现 ...
    return { memories: [] }; // 返回已创建的内存
  },
});

const myRetriever = new MemoryRetriever({
  process: async (input, options) => {
    // 从数据库获取内存的自定义逻辑
    console.log("Retrieving memories with search:", input.search);
    // ... 实现 ...
    return { memories: [] }; // 返回找到的内存
  },
});

// 创建 MemoryAgent
const memoryAgent = new MemoryAgent({
  recorder: myRecorder,
  retriever: myRetriever,
  autoUpdate: true, // 自动记录来自订阅主题的消息
  subscribeTopic: "user-input",
});
```

### MemoryRecorder

`MemoryRecorder` 是一个负责存储内存的抽象 Agent 类。要使用它，您必须提供 `process` 方法的具体实现，该方法包含如何以及在何处持久化内存数据的逻辑。这种设计允许您连接到任何存储后端，从简单的内存数组到复杂的向量数据库。

**输入 (`MemoryRecorderInput`)**

`process` 函数接收一个包含 `content` 数组的输入对象。数组中的每个项目代表要存储的一条信息，可以是一个 `input` 消息、一个 `output` 消息以及 `source` Agent 的 ID。

```typescript
interface MemoryRecorderInput extends Message {
  content: {
    input?: Message;
    output?: Message;
    source?: string;
  }[];
}
```

**输出 (`MemoryRecorderOutput`)**

该函数应返回一个 Promise，该 Promise 解析为一个对象，其中包含已成功创建的 `memories` 数组。

```typescript
interface MemoryRecorderOutput extends Message {
  memories: Memory[];
}
```

**示例：实现一个简单的内存记录器**

以下是如何创建一个将内存存储在本地数组中的简单记录器。

```typescript
import {
  MemoryRecorder,
  type MemoryRecorderInput,
  type MemoryRecorderOutput,
  type Memory,
  newMemoryId,
} from "@core/memory";
import { type AgentInvokeOptions, type AgentProcessResult } from "@core/agents";

// 使用一个简单的内存数组作为我们的数据库
const memoryDB: Memory[] = [];

const inMemoryRecorder = new MemoryRecorder({
  process: async (
    input: MemoryRecorderInput,
    options: AgentInvokeOptions
  ): Promise<AgentProcessResult<MemoryRecorderOutput>> => {
    const newMemories: Memory[] = input.content.map((item) => ({
      id: newMemoryId(),
      content: item,
      createdAt: new Date().toISOString(),
    }));

    // 将新内存添加到我们的“数据库”中
    memoryDB.push(...newMemories);
    console.log("Current memory count:", memoryDB.length);

    return { memories: newMemories };
  },
});
```

### MemoryRetriever

`MemoryRetriever` 是记录器的对应部分。它是一个负责从存储中获取内存的抽象 Agent 类。与记录器一样，它需要 `process` 方法的自定义实现来定义检索逻辑。

**输入 (`MemoryRetrieverInput`)**

`process` 函数接收一个输入对象，其中可以包含 `search` 查询和用于控制结果数量的 `limit`。具体实现决定了如何执行搜索（例如，关键字匹配、向量相似度）。

```typescript
interface MemoryRetrieverInput extends Message {
  limit?: number;
  search?: string | Message;
}
```

**输出 (`MemoryRetrieverOutput`)**

该函数应返回一个 Promise，该 Promise 解析为一个对象，其中包含与查询匹配的 `memories` 数组。

```typescript
interface MemoryRetrieverOutput extends Message {
  memories: Memory[];
}
```

**示例：实现一个简单的内存检索器**

此检索器与上面的 `inMemoryRecorder` 示例协同工作，在本地数组中搜索匹配的内容。

```typescript
import {
  MemoryRetriever,
  type MemoryRetrieverInput,
  type MemoryRetrieverOutput,
  type Memory,
} from "@core/memory";
import { type AgentInvokeOptions, type AgentProcessResult } from "@core/agents";

// 假设 memoryDB 与记录器使用的数组相同
declare const memoryDB: Memory[];

const inMemoryRetriever = new MemoryRetriever({
  process: async (
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions
  ): Promise<AgentProcessResult<MemoryRetrieverOutput>> => {
    let results: Memory[] = [...memoryDB];

    // 根据搜索查询筛选结果
    if (input.search && typeof input.search === "string") {
      const searchTerm = input.search.toLowerCase();
      results = results.filter((mem) =>
        JSON.stringify(mem.content).toLowerCase().includes(searchTerm)
      );
    }

    // 应用限制
    if (input.limit) {
      results = results.slice(-input.limit); // 获取最新的项目
    }

    return { memories: results };
  },
});
```

## 综合应用

现在，让我们将这些组件结合起来，创建一个功能齐全的内存系统。我们将使用自定义的内存记录器和检索器来实例化 `MemoryAgent`，然后用它来记录和检索信息。

```typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@core/memory";
import { AIGNE, type Context } from "@core/aigne";

// --- 假设 inMemoryRecorder 和 inMemoryRetriever 已如上文定义 ---

// 1. 初始化 MemoryAgent
const memoryAgent = new MemoryAgent({
  recorder: inMemoryRecorder,
  retriever: inMemoryRetriever,
});

// 2. 创建一个上下文来运行 Agent
const context = new AIGNE().createContext();

// 3. 记录一条新内存
async function runMemoryExample(context: Context) {
  console.log("Recording a new memory...");
  await memoryAgent.record(
    {
      content: [
        {
          input: { text: "What is the capital of France?" },
          output: { text: "The capital of France is Paris." },
          source: "GeographyAgent",
        },
      ],
    },
    context
  );

  // 4. 检索内存
  console.log("\nRetrieving memories about 'France'...");
  const retrieved = await memoryAgent.retrieve({ search: "France" }, context);

  console.log("Found memories:", retrieved.memories);
}

runMemoryExample(context);

/**
 * 预期输出：
 *
 * Recording a new memory...
 * Current memory count: 1
 *
 * Retrieving memories about 'France'...
 * Found memories: [
 *   {
 *     id: '...',
 *     content: {
 *       input: { text: 'What is the capital of France?' },
 *       output: { text: 'The capital of France is Paris.' },
 *       source: 'GeographyAgent'
 *     },
 *     createdAt: '...'
 *   }
 * ]
 */
```

这个完整的示例演示了端到端的流程：定义自定义存储逻辑，将其接入 `MemoryAgent`，并使用该 Agent 来管理系统的内存。