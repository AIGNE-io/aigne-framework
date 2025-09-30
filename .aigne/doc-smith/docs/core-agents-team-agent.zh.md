# Team Agent

`TeamAgent` 是一个强大的组件，可以协调多个 Agent 协作完成复杂任务。它扮演着管理者的角色，指导一个由专业 Agent（其 `skills`）组成的团队协同工作。这使您能够通过组合不同 Agent 的能力来构建复杂的工作流。

团队中的 Agent 主要通过两种方式协同工作：
- **顺序执行**：像流水线一样，一个 Agent 的输出成为下一个 Agent 的输入。
- **并行执行**：像头脑风暴会议一样，所有 Agent 同时处理相同的输入，并将它们的结果合并。

`TeamAgent` 还支持高级模式，例如通过审查流程（`反思模式`）进行迭代优化和数据批量处理（`迭代模式`）。

## 处理模式

`mode` 选项决定了团队中的 Agent 如何执行其任务。

### 顺序模式

在 `sequential` 模式下，Agent 会按照提供的顺序逐一执行。每个 Agent 的输出都会被合并，并作为输入传递给下一个 Agent。这非常适合创建多步骤的流水线。

例如，你可以让一个 Agent 翻译文本，另一个 Agent 格式化翻译结果。

```javascript 创建一个顺序执行的团队 icon=logos:javascript
// 创建独立的专业 Agent
const translatorAgent = FunctionAgent.from({
  name: "translator",
  process: (input) => ({
    translation: `${input.text} (translation)`,
  }),
});

const formatterAgent = FunctionAgent.from({
  name: "formatter",
  process: (input) => ({
    formatted: `[formatted] ${input.translation || input.text}`,
  }),
});

// 使用专业 Agent 创建一个顺序执行的 TeamAgent
const teamAgent = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, formatterAgent],
});

const result = await teamAgent.invoke({ text: "Hello world" });

console.log(result);
// 预期输出：{
//   formatted: "[formatted] Hello world (translation)"
// }
```

### 并行模式

在 `parallel` 模式下，团队中的所有 Agent 会使用相同的初始输入同时执行。它们各自的输出随后会被合并成一个单一的结果。当需要一次执行多个独立任务时（例如查询不同的搜索引擎），这种模式非常有用。

```javascript 创建一个并行执行的团队 icon=logos:javascript
const googleSearch = FunctionAgent.from({
  name: "google-search",
  process: (input) => ({
    googleResults: `Google search results for ${input.query}`,
  }),
});

const braveSearch = FunctionAgent.from({
  name: "brave-search",
  process: (input) => ({
    braveResults: `Brave search results for ${input.query}`,
  }),
});

const teamAgent = TeamAgent.from({
  name: "parallel-team",
  mode: ProcessMode.parallel,
  skills: [googleSearch, braveSearch],
});

const result = await teamAgent.invoke({ query: "AI news" });

console.log(result);
// 预期输出：{
//   googleResults: "Google search results for AI news",
//   braveResults: "Brave search results for AI news"
// }
```

## 反思：自我修正的工作流

反思模式启用了一个强大的迭代工作流，其中团队的输出会经过审查和优化。它创建了一个“执行、审查、改进”的循环，直到结果满足指定的质量标准。

其工作原理如下：
1.  Agent 团队处理输入并产生初始结果。
2.  一个指定的 `审查者` Agent 评估此结果。
3.  如果审查者不批准该结果，它会提供反馈。
4.  团队再次运行，使用原始输入和反馈来创建改进后的结果。
5.  此过程会重复进行，直到审查者批准输出或达到最大迭代次数（`maxIterations`）。

这非常适合需要高质量输出的任务，例如撰写文章、生成代码或进行详细分析。

## 迭代：批量处理

`TeamAgent` 可以使用一致的工作流高效地处理项目数组。通过指定 `iterateOn` 选项，您可以告诉 Agent 哪个输入字段包含要处理的项目列表。然后，团队的工作流将对数组中的每个项目执行。

这对于批量处理任务非常有用，例如总结文章列表或丰富数据集。

## 配置

以下是配置 `TeamAgent` 的关键选项：

<x-field-group>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="构成团队的 Agent 实例数组。"></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-required="false">
    <x-field-desc markdown>处理模式。可以是 `ProcessMode.sequential`（用于逐步执行）或 `ProcessMode.parallel`（用于同时执行）。</x-field-desc>
  </x-field>
  <x-field data-name="reflection" data-type="object" data-required="false" data-desc="用于迭代审查和优化过程的配置。">
    <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="负责审查团队输出的 Agent。"></x-field>
    <x-field data-name="isApproved" data-type="function | string" data-required="true">
      <x-field-desc markdown>一个函数或字段名，用于确定审查者的输出是否被批准。如果是一个字符串，它会检查审查者输出中指定字段的真值。</x-field-desc>
    </x-field>
    <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="在停止前可进行的最大优化循环次数。"></x-field>
    <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false">
      <x-field-desc markdown>如果为 `true`，当达到 `maxIterations` 时，即使未被批准，也会返回最后一次生成的输出。否则，将抛出错误。</x-field-desc>
    </x-field>
  </x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false">
    <x-field-desc markdown>包含数组的输入字段的键。团队将单独处理数组中的每个项目。</x-field-desc>
  </x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false">
    <x-field-desc markdown>使用 `iterateOn` 时，此选项设置可并发处理的数组项目数量。</x-field-desc>
  </x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown>使用 `iterateOn` 时，如果为 `true`，处理一个项目的输出将被合并并提供给序列中的下一个项目。要求 `concurrency` 为 1。</x-field-desc>
  </x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown>在 `sequential` 模式下，如果为 `true`，最终输出将包含所有中间 Agent 的结果，而不仅仅是最后一个。这对于调试非常有用。</x-field-desc>
  </x-field>
</x-field-group>

## 总结

`TeamAgent` 提供了一种灵活而强大的方式，将多个 Agent 组合成一个有凝聚力的单元。无论您需要简单的顺序流水线还是复杂的自我修正系统，`TeamAgent` 都提供了构建高级 AI 驱动工作流的工具。

要构建您的团队，通常会使用其他类型的 Agent 作为技能。在此处了解更多相关信息：
- [AIAgent](./core-agents-ai-agent.md)
- [FunctionAgent](./core-agents-function-agent.md)