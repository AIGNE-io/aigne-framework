# 记忆

`MemoryAgent` 为 Agent 提供了一种机制，使其能够在多次交互中保持状态和记忆信息。它充当一个专门的编排器，不直接处理消息，而是通过两个关键组件来管理记忆操作：用于存储信息的 `Recorder` 和用于回忆信息的 `Retriever`。这种关注点分离的设计允许使用灵活且可插拔的记忆存储解决方案。

## 核心组件

记忆系统由三个主要类组成：

1.  **`MemoryAgent`**：管理记忆操作的中心 Agent。它配置了一个记录器和一个检索器，并提供 `record()` 和 `retrieve()` 方法与记忆存储进行交互。
2.  **`MemoryRecorder`**：一个负责将信息写入持久化存储后端（例如，数据库、文件系统或向量存储）的 Agent。您必须提供关于数据如何以及在何处存储的实现。
3.  **`MemoryRetriever`**：一个负责根据指定标准（例如搜索查询或数量限制）从存储后端获取信息的 Agent。您必须提供检索逻辑的实现。

```d2
direction: down

AIGNE-Engine: {
  label: "AIGNE\n（应用逻辑）"
  shape: rectangle
}

Memory-Agent: {
  label: "MemoryAgent（编排器）"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MemoryRecorder: {
    label: "MemoryRecorder"
    shape: rectangle
  }

  MemoryRetriever: {
    label: "MemoryRetriever"
    shape: rectangle
  }
}

Storage-Backend: {
  label: "存储后端\n（数据库、向量存储等）"
  shape: cylinder
}

# 记录流程
AIGNE-Engine -> Memory-Agent: "1. invoke(record)"
Memory-Agent -> Memory-Agent.MemoryRecorder: "2. 委托给记录器"
Memory-Agent.MemoryRecorder -> Storage-Backend: "3. 写入数据"

# 检索流程
AIGNE-Engine -> Memory-Agent: "4. invoke(retrieve)" {
  style.stroke-dash: 2
}
Memory-Agent -> Memory-Agent.MemoryRetriever: "5. 委托给检索器" {
  style.stroke-dash: 2
}
Storage-Backend -> Memory-Agent.MemoryRetriever: "6. 返回数据" {
  style.stroke-dash: 2
}
```

## 工作原理

`MemoryAgent` 将任务委托给其下属 Agent。当您在 `MemoryAgent` 上调用 `record()` 方法时，它会调用其配置的 `MemoryRecorder` 来持久化数据。同样，当您调用 `retrieve()` 时，它会调用 `MemoryRetriever` 来查询并返回存储的信息。

这种架构允许开发者定义自定义的存储和检索逻辑，而无需更改核心 Agent 的工作流程。例如，您可以实现一个将对话历史记录保存到 PostgreSQL 数据库的记录器，以及一个使用向量嵌入来查找语义上相似的过去交互的检索器。

## `MemoryAgent`

`MemoryAgent` 是记忆管理的主要接口。它不适合在处理 Agent 链中直接调用，而是作为一个有状态的服务，供其他 Agent 或您的应用程序逻辑使用。

### 配置

要创建 `MemoryAgent`，您需要为其提供一个 `recorder` 和一个 `retriever`。它们可以是 `MemoryRecorder` 和 `MemoryRetriever` 的实例，也可以是它们各自 `process` 方法的函数定义。

```typescript Agent 初始化 icon=logos:typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@aigne/core";
import { v7 as uuidv7 } from "@aigne/uuid";

// 1. 定义一个简单的内存存储用于演示
const memoryStore: Map<string, any> = new Map();

// 2. 实现记录器逻辑
const recorder = new MemoryRecorder({
  async process({ content }) {
    const memories = content.map((item) => {
      const memory = {
        id: uuidv7(),
        content: item,
        createdAt: new Date().toISOString(),
      };
      memoryStore.set(memory.id, memory);
      return memory;
    });
    return { memories };
  },
});

// 3. 实现检索器逻辑
const retriever = new MemoryRetriever({
  async process({ search, limit = 10 }) {
    // 这是一个简化的搜索。实际实现中可能会使用数据库查询或向量搜索。
    const allMemories = Array.from(memoryStore.values());
    const filteredMemories = search
      ? allMemories.filter((m) => JSON.stringify(m.content).includes(search as string))
      : allMemories;

    return { memories: filteredMemories.slice(0, limit) };
  },
});

// 4. 实例化 MemoryAgent
const memoryAgent = new MemoryAgent({
  recorder,
  retriever,
});
```

上面的示例演示了如何使用简单的内存存储机制创建 `MemoryAgent`。在生产环境中，您应该用更强大的解决方案（如数据库）来替换它。

### `MemoryAgentOptions`

<x-field-group>
  <x-field data-name="recorder" data-type="MemoryRecorder | MemoryRecorderOptions['process'] | MemoryRecorderOptions" data-required="false">
    <x-field-desc markdown>负责存储记忆的 Agent 或函数。可以是一个完整的 `MemoryRecorder` 实例、一个配置对象，或者只是处理函数。</x-field-desc>
  </x-field>
  <x-field data-name="retriever" data-type="MemoryRetriever | MemoryRetrieverOptions['process'] | MemoryRetrieverOptions" data-required="false">
    <x-field-desc markdown>负责检索记忆的 Agent 或函数。可以是一个完整的 `MemoryRetriever` 实例、一个配置对象，或者只是处理函数。</x-field-desc>
  </x-field>
  <x-field data-name="autoUpdate" data-type="boolean" data-required="false">
    <x-field-desc markdown>如果为 `true`，Agent 将在完成操作后自动记录信息，以创建交互历史。</x-field-desc>
  </x-field>
  <x-field data-name="subscribeTopic" data-type="string | string[]" data-required="false" data-desc="为实现自动消息记录而订阅的主题。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="一个其他 Agent 的数组，可用作技能。记录器和检索器会自动添加到此列表中。"></x-field>
</x-field-group>

## `MemoryRecorder`

`MemoryRecorder` 是一个抽象 Agent 类，它定义了存储记忆的契约。您必须提供其 `process` 方法的具体实现。

### `MemoryRecorderInput`

`MemoryRecorder` 的 `process` 方法接收一个 `MemoryRecorderInput` 对象。

<x-field-group>
  <x-field data-name="content" data-type="array" data-required="true">
    <x-field-desc markdown>一个待作为记忆存储的对象数组。每个对象可以包含 `input`、`output` 和 `source`，以便为记忆提供上下文。</x-field-desc>
    <x-field data-name="input" data-type="Message" data-required="false" data-desc="导致此记忆的输入消息（例如，用户的提示）。"></x-field>
    <x-field data-name="output" data-type="Message" data-required="false" data-desc="生成的输出消息（例如，AI 的响应）。"></x-field>
    <x-field data-name="source" data-type="string" data-required="false" data-desc="产生输出的 Agent 或系统的标识符。"></x-field>
  </x-field>
</x-field-group>

### `MemoryRecorderOutput`

`process` 方法必须返回一个 `MemoryRecorderOutput` 对象。

<x-field-group>
  <x-field data-name="memories" data-type="Memory[]" data-required="true" data-desc="一个新创建的记忆对象数组，每个对象都包含其唯一 ID、原始内容和创建时间戳。"></x-field>
</x-field-group>

## `MemoryRetriever`

`MemoryRetriever` 是一个抽象 Agent 类，它定义了从存储中获取记忆的契约。您必须提供其 `process` 方法的具体实现。

### `MemoryRetrieverInput`

`MemoryRetriever` 的 `process` 方法接收一个 `MemoryRetrieverInput` 对象，用于筛选和限制结果。

<x-field-group>
  <x-field data-name="limit" data-type="number" data-required="false">
    <x-field-desc markdown>返回记忆的最大数量。可用于分页或保持上下文窗口较小。</x-field-desc>
  </x-field>
  <x-field data-name="search" data-type="string | Message" data-required="false">
    <x-field-desc markdown>用于筛选记忆的搜索词或消息对象。具体实现决定了如何使用此值（例如，关键字搜索、向量相似度）。</x-field-desc>
  </x-field>
</x-field-group>

### `MemoryRetrieverOutput`

`process` 方法必须返回一个 `MemoryRetrieverOutput` 对象。

<x-field-group>
  <x-field data-name="memories" data-type="Memory[]" data-required="true" data-desc="与检索标准匹配的记忆对象数组。"></x-field>
</x-field-group>

## 用法示例

一旦 `MemoryAgent` 配置完成，您就可以在应用程序的上下文中使用它来记录和检索信息。

```typescript AIGNE 交互 icon=logos:typescript
import { AIGNE } from "@aigne/core";

// 假设 memoryAgent 已按第一个示例所示进行配置
const aigne = new AIGNE({
  // ...其他配置
});

async function run() {
  // 记录一条新记忆
  const recordedMemory = await aigne.invoke(memoryAgent.record.bind(memoryAgent), {
    content: [{ input: { query: "What is the capital of France?" } }],
  });
  console.log("Recorded:", recordedMemory.memories[0].id);

  // 检索记忆
  const retrievedMemories = await aigne.invoke(memoryAgent.retrieve.bind(memoryAgent), {
    search: "France",
    limit: 5,
  });
  console.log("Retrieved:", retrievedMemories.memories);
}

run();
```
此示例展示了如何使用 `aigne.invoke` 方法调用 `memoryAgent` 实例上的 `record` 和 `retrieve` 函数，从而有效地管理 Agent 在多次交互中的状态。

## 总结

`MemoryAgent` 为管理 Agent 应用中的状态提供了一个强大而灵活的抽象。通过将编排（`MemoryAgent`）与实现细节（`MemoryRecorder`、`MemoryRetriever`）分离，您可以轻松集成各种存储后端，从简单的内存数组到复杂的向量数据库。

有关核心执行引擎的更多信息，请参阅 [AIGNE](./developer-guide-core-concepts-aigne-engine.md) 文档。要了解工作的基本构建块，请参阅 [Agents](./developer-guide-core-concepts-agents.md) 页面。