# TeamAgent

TeamAgent 负责协调一组 Agent 协同工作以完成任务。它管理一组 Agent（即其技能）并根据指定的处理模式来编排它们的执行。这使得创建多个 Agent 协作的复杂工作流成为可能。

TeamAgent 特别适用于：
- 创建 Agent 工作流，其中一个 Agent 的输出会作为另一个 Agent 的输入。
- 同时执行多个 Agent 并合并它们的结果。
- 构建由专业化组件协同工作的复杂 Agent 系统。
- 使用反思机制实现迭代的、自我修正的工作流。
- 通过定义的 Agent 管道批量处理数据项。

## 工作原理

`TeamAgent` 根据定义的 `ProcessMode`，通过其成员 Agent（技能）路由输入来进行处理。它可以顺序执行、并行执行，或使用迭代反思过程来优化结果。下图展示了高层级的处理逻辑。

```d2
direction: down

Input: { 
  label: "输入"
  shape: oval 
}

Mode-Selection: {
  label: "处理模式？"
  shape: diamond
}

Sequential-Execution: {
  label: "顺序执行"
  Agent-1: "Agent 1"
  Agent-2: "Agent 2"
  Agent-N: "..."
  Agent-1 -> Agent-2 -> Agent-N
}

Parallel-Execution: {
  label: "并行执行"
  p-agent-1: "Agent 1"
  p-agent-2: "Agent 2"
  p-agent-n: "..."
}

Combine-Results: "合并结果"

Reflection-Check: {
  label: "反思？"
  shape: diamond
}

Reviewer: {
  label: "审阅者 Agent"
}

Approval-Check: {
  label: "已批准？"
  shape: diamond
}

Output: { 
  label: "输出"
  shape: oval 
}

Input -> Mode-Selection

Mode-Selection -> Sequential-Execution: "顺序"
Mode-Selection -> Parallel-Execution: "并行"

Sequential-Execution.Agent-N -> Reflection-Check
Parallel-Execution -> Combine-Results
Combine-Results -> Reflection-Check

Reflection-Check -> Output: "否"
Reflection-Check -> Reviewer: "是"

Reviewer -> Approval-Check
Approval-Check -> Output: "是"
Approval-Check -> Mode-Selection: "否 (反馈并重试)" {
  style.stroke-dash: 2
}
```

## 关键概念

### 处理模式

`TeamAgentOptions` 中的 `mode` 属性决定了团队中 Agent 的执行方式。

- **`ProcessMode.sequential`**：Agent 按照提供的顺序逐一处理。每个 Agent 的输出都会被合并，并作为输入传递给序列中的下一个 Agent。这对于创建多步骤管道非常有用。
- **`ProcessMode.parallel`**：所有 Agent 同时处理，每个 Agent 都接收相同的初始输入。最终输出是所有 Agent 结果的组合。这非常适合可以分解为独立子任务的任务。

### 反思模式

反思模式可启用迭代优化和验证工作流。配置后，团队的输出会传递给一个 `reviewer` Agent。审阅者根据特定条件 (`isApproved`) 评估输出。如果输出未获批准，流程将重复，并将上一次的输出和审阅者的反馈再次输入团队进行下一次迭代。此循环将持续进行，直到输出被批准或达到 `maxIterations` 限制。

这对于需要质量控制、自我修正或迭代改进的任务非常强大。

### 迭代处理 (`iterateOn`)

`iterateOn` 选项允许 `TeamAgent` 以类似批处理的方式处理项目数组。您可以指定一个包含数组的输入键，团队将对该数组中的每个项目执行其工作流。这对于需要将相同操作应用于多个数据条目的批处理场景非常高效。您可以使用 `concurrency` 选项来控制并行度。

## 创建 TeamAgent

您可以使用 `TeamAgent.from()` 静态方法创建一个 `TeamAgent`，向其提供一组技能（其他 Agent）和配置选项。

### 顺序模式示例

在此示例中，一个 `translator` Agent 的输出会直接输入到一个 `sentiment` Agent 中。

```typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// 将文本翻译成英文的 Agent
const translator = new AIAgent({
  name: "Translator",
  model,
  instructions: "Translate the following text to English.",
  inputKey: "text",
  outputKey: "translated_text",
});

// 分析文本情感的 Agent
const sentiment = new AIAgent({
  name: "SentimentAnalyzer",
  model,
  instructions: "Analyze the sentiment of the following text. Is it positive, negative, or neutral?",
  inputKey: "translated_text",
  outputKey: "sentiment",
});

// 一个顺序执行的团队，先进行翻译，再进行情感分析
const sequentialTeam = TeamAgent.from({
  name: "SequentialTranslatorTeam",

  // Agent（技能）将按此顺序运行
  skills: [translator, sentiment],
  
  // 将模式设置为顺序执行
  mode: ProcessMode.sequential, 
});

const result = await sequentialTeam.invoke({
  text: "Me encanta este producto, es fantástico.",
});

console.log(result);
// 预期输出：
// {
//   translated_text: "I love this product, it's fantastic.",
//   sentiment: "positive" 
// }
```

### 并行模式示例

在这里，两个独立的 Agent 同时运行，从相同的输入文本中收集不同的信息。

```typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// 提取主旨的 Agent
const topicExtractor = new AIAgent({
  name: "TopicExtractor",
  model,
  instructions: "Identify the main topic of the text.",
  inputKey: "text",
  outputKey: "topic",
});

// 总结文本的 Agent
const summarizer = new AIAgent({
  name: "Summarizer",
  model,
  instructions: "Provide a one-sentence summary of the text.",
  inputKey: "text",
  outputKey: "summary",
});

// 一个并行执行的团队，两个 Agent 同时运行
const parallelTeam = TeamAgent.from({
  name: "ParallelAnalysisTeam",
  skills: [topicExtractor, summarizer],
  mode: ProcessMode.parallel, // 将模式设置为并行执行
});

const result = await parallelTeam.invoke({
  text: "The new AI model shows remarkable improvements in natural language understanding and can be applied to various industries, from healthcare to finance.",
});

console.log(result);
// 预期输出：
// {
//   topic: "AI Model Improvements",
//   summary: "A new AI model has significantly advanced in natural language understanding, with broad industry applications."
// }
```

### 反思模式示例

此示例展示了一个 `writer` Agent 用于生成内容，以及一个 `reviewer` Agent 用于检查内容是否满足特定的字数要求。团队将重新运行，直到满足条件为止。

```typescript
import { AIAgent, TeamAgent, FunctionAgent } from "@aigne/core";
import { z } from "zod";

const writer = new AIAgent({
  name: "Writer",
  model,
  instructions: "Write a short paragraph about the benefits of teamwork. If you receive feedback, use it to revise the text.",
  inputKey: "request",
  outputKey: "paragraph",
});

const reviewer = new FunctionAgent({
  name: "Reviewer",
  inputSchema: z.object({ paragraph: z.string() }),
  outputSchema: z.object({
    approved: z.boolean(),
    feedback: z.string().optional(),
  }),
  process: ({ paragraph }) => {
    if (paragraph.split(" ").length >= 50) {
      return { approved: true };
    } else {
      return {
        approved: false,
        feedback: "The paragraph is too short. Please expand it to at least 50 words.",
      };
    }
  },
});

const reflectionTeam = TeamAgent.from({
  name: "ReflectiveWriterTeam",
  skills: [writer],
  reflection: {
    reviewer: reviewer,
    isApproved: "approved", // 检查审阅者输出中的 'approved' 字段
    maxIterations: 3,
  },
});

const result = await reflectionTeam.invoke({
  request: "Write about teamwork.",
});

console.log(result);
// 输出将是一段关于团队合作的段落，长度至少为 50 个单词。
```

## 配置选项 (`TeamAgentOptions`)

`TeamAgent` 可以通过以下选项进行配置：

<x-field-group>
  <x-field data-name="mode" data-type="ProcessMode" data-required="false" data-desc="Agent 的处理模式。可以是 `ProcessMode.sequential` 或 `ProcessMode.parallel`。默认为 `sequential`。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="构成团队的 Agent 实例数组。"></x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="反思模式的配置，用于启用迭代审查和优化。">
    <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="负责审查团队输出的 Agent。"></x-field>
    <x-field data-name="isApproved" data-type="string | (output: Message) => boolean" data-required="true" data-desc="一个函数或审阅者输出中布尔值字段的名称，用于确定结果是否被批准。"></x-field>
    <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="在停止前可进行的最大审查-优化迭代次数。"></x-field>
    <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false" data-desc="如果为 true，则在达到最大迭代次数时返回最后一次的输出，即使未被批准。否则，将抛出错误。"></x-field>
  </x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false" data-desc="包含数组的输入字段的键。团队将对数组中的每个项目执行其工作流。"></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="使用 `iterateOn` 时并发操作的最大数量。"></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="如果为 true，一次迭代的输出将被合并回该项目，使其可用于后续迭代。仅在 `concurrency` 为 1 时有效。"></x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false" data-desc="在顺序模式下，如果为 true，输出流将包含所有中间步骤的数据块，而不仅仅是最后一步的数据块。"></x-field>
</x-field-group>