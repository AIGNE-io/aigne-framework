# 记忆

在任何先进的 AI 系统中，记忆都是一个至关重要的组件，它允许 Agent 在多次交互中保留信息、从过去的经验中学习并维持上下文。在 AIGNE 框架中，记忆管理由 `MemoryAgent` 负责，这是一个专门的 Agent，使用 `Recorder` 和 `Retriever` 技能来存储和回忆信息。

本节将介绍 AIGNE 中记忆管理的核心概念，包括每个组件的角色以及它们如何协同工作，为你的 Agent 提供一个持久化的记忆层。

## 工作原理

Agent 与记忆系统之间的交互遵循一个清晰、解耦的模式。Agent 可以显式调用 `MemoryAgent` 上的 `record()` 方法来存储信息。之后，它可以使用 `retrieve()` 方法来查询记忆存储。此外，`MemoryAgent` 也可以被配置为自动监听特定主题上的消息并进行记录，从而无缝地创建交互历史。

下图展示了记录和检索记忆的流程。

```d2
direction: down

AIAgent: {
  label: "AIAgent\n（例如，你的应用的 Agent）"
  shape: rectangle
}

Memory-System: {
  label: "AIGNE 记忆系统"
  style: {
    stroke-dash: 4
  }

  MemoryAgent: {
    label: "MemoryAgent\n（协调器）"
    shape: rectangle

    MemoryRecorder: {
      label: "MemoryRecorder 技能"
      shape: rectangle
    }
    MemoryRetriever: {
      label: "MemoryRetriever 技能"
      shape: rectangle
    }
  }
}

Persistent-Storage: {
  label: "持久化存储\n（例如，向量数据库）"
  shape: cylinder
}

# 记录流程
AIAgent -> Memory-System.MemoryAgent: "1. 调用 record(data)"
Memory-System.MemoryAgent -> Memory-System.MemoryAgent.MemoryRecorder: "2. 委托记录"
Memory-System.MemoryAgent.MemoryRecorder -> Persistent-Storage: "3. 写入记忆"

# 检索流程
AIAgent -> Memory-System.MemoryAgent: "4. 调用 retrieve(query)"
Memory-System.MemoryAgent -> Memory-System.MemoryAgent.MemoryRetriever: "5. 委托检索"
Memory-System.MemoryAgent.MemoryRetriever -> Persistent-Storage: "6. 搜索记忆"
Persistent-Storage -> Memory-System.MemoryAgent.MemoryRetriever: "7. 返回记忆"
Memory-System.MemoryAgent.MemoryRetriever -> Memory-System.MemoryAgent: "8. 转发结果"
Memory-System.MemoryAgent -> AIAgent: "9. 返回结果"
```

## MemoryAgent

`MemoryAgent` 充当所有与记忆相关操作的中心枢纽。它不直接存储信息，而是将写入和读取记忆的任务委托给专门的技能。这种设计将记忆管理的逻辑与底层存储实现分离开来，从而提供了极大的灵活性。例如，你可以轻松地将一个简单的内存存储机制替换为一个强大的向量数据库，而无需更改 Agent 的核心逻辑。

`MemoryAgent` 的主要职责：
- **协调**：管理进出记忆存储的信息流。
- **委托**：使用 `Recorder` Agent 保存记忆，使用 `Retriever` Agent 获取记忆。
- **自动化**：可以通过 `subscribeTopic` 进行配置，以自动记录对话和 Agent 交互。

`MemoryAgent` 的设计目的不是像 `AIAgent` 那样被直接调用来处理任务。相反，其他 Agent 通过 `Context` 对象，利用其 `record()` 和 `retrieve()` 方法与之交互。

### 配置选项

在创建 `MemoryAgent` 时，你可以提供以下选项：

<x-field-group>
  <x-field data-name="recorder" data-type="MemoryRecorder | MemoryRecorderOptions['process'] | MemoryRecorderOptions" data-required="false" data-desc="记录器技能。可以是一个实例、一个处理函数或一个完整的选项对象。"></x-field>
  <x-field data-name="retriever" data-type="MemoryRetriever | MemoryRetrieverOptions['process'] | MemoryRetrieverOptions" data-required="false" data-desc="检索器技能。可以是一个实例、一个处理函数或一个完整的选项对象。"></x-field>
  <x-field data-name="autoUpdate" data-type="boolean" data-required="false" data-desc="如果为 true，则在 Agent 操作后自动记录信息。"></x-field>
  <x-field data-name="subscribeTopic" data-type="string | string[]" data-required="false" data-desc="要订阅以实现自动消息记录的主题。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="Agent 的附加技能列表。"></x-field>
</x-field-group>

## 核心组件

记忆系统建立在两种主要类型的专门 Agent 之上：`MemoryRecorder` 和 `MemoryRetriever`。

### MemoryRecorder

`MemoryRecorder` 是一个负责将信息写入持久化存储层的 Agent。其唯一的工作是接收输入内容，将其格式化为标准的 `Memory` 对象，并进行保存。你可以实现一个自定义的 `MemoryRecorder` 来连接任何存储后端，例如本地文件系统、SQL 数据库或基于云的向量存储。

**输入**

<x-field data-name="content" data-type="object[]" data-required="true">
  <x-field-desc markdown>一个待记录的对象数组。每个对象可以包含 `input`、`output` 和 `source`。</x-field-desc>
  <x-field data-name="input" data-type="Message" data-required="false" data-desc="输入消息或数据。"></x-field>
  <x-field data-name="output" data-type="Message" data-required="false" data-desc="输出消息或数据。"></x-field>
  <x-field data-name="source" data-type="string" data-required="false" data-desc="记忆的来源（例如，Agent 的名称）。"></x-field>
</x-field>

**输出**

<x-field data-name="memories" data-type="Memory[]" data-required="true" data-desc="新创建的记忆对象数组，包含唯一的 ID 和时间戳。"></x-field>

### MemoryRetriever

`MemoryRetriever` 是记录器的对应部分。它负责根据特定标准从存储层搜索和获取记忆。一个 `MemoryRetriever` 实现可以执行简单的关键字匹配，也可以利用更复杂的技术，如语义搜索或向量相似度，来找到最相关的记忆。

**输入**

<x-field-group>
  <x-field data-name="search" data-type="string | Message" data-required="false" data-desc="用于过滤记忆的搜索词或消息。"></x-field>
  <x-field data-name="limit" data-type="number" data-required="false" data-desc="要检索的最大记忆数量。"></x-field>
</x-field-group>

**输出**

<x-field data-name="memories" data-type="Memory[]" data-required="true" data-desc="符合查询条件的记忆对象数组。"></x-field>

## 记忆对象

`Memory` 对象是用于表示单个存储信息的标准数据结构。它包含内容本身，以及用于识别和提供上下文的元数据。

<x-field-group>
  <x-field data-name="id" data-type="string" data-required="true" data-desc="记忆条目的唯一标识符。"></x-field>
  <x-field data-name="sessionId" data-type="string | null" data-required="false" data-desc="一个可选的标识符，用于对来自同一会话或对话的记忆进行分组。"></x-field>
  <x-field data-name="content" data-type="unknown" data-required="true" data-desc="实际存储的内容。"></x-field>
  <x-field data-name="createdAt" data-type="string" data-required="true" data-desc="记忆创建时的 ISO 8601 时间戳。"></x-field>
</x-field-group>

## 总结

`MemoryAgent` 及其 `Recorder` 和 `Retriever` 技能，为在你的 AI 应用程序中管理状态和历史提供了一个强大而灵活的系统。通过将记忆管理逻辑与存储实现解耦，你可以轻松地调整你的记忆系统以适应任何项目的需求，从简单的聊天机器人到复杂的多 Agent 工作流。

在对记忆的工作原理有了扎实的理解之后，你现在可以探索如何为你的 Agent 构建动态且具备上下文感知能力的指令了。请继续阅读[提示词](./developer-guide-core-concepts-prompts.md)部分以了解更多信息。