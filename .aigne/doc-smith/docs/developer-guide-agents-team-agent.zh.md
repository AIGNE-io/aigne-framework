# Team Agent

`TeamAgent` 是一种专门的 Agent，它负责协调一组其他 Agent（称为“技能”）来执行复杂任务。它扮演着管理者的角色，根据既定策略指导信息流并协调其技能的执行。这使得创建复杂的工作流成为可能，其中多个专门的 Agent 协同合作，以实现单个 Agent 无法独立完成的目标。

`TeamAgent` 支持几种关键的 Agent 编排模式：
-   **顺序执行**：Agent 按顺序逐一运行，形成一个处理流水线。
-   **并行执行**：Agent 同时运行，然后合并它们的结果。
-   **迭代处理**：团队处理列表中的每个项，非常适合批量操作。
-   **反思**：团队的输出会经过循环审查和优化，直到满足特定标准。

该组件是构建模块化、功能强大的人工智能系统的基础。有关可作为团队一部分的单个 Agent 的详细信息，请参阅 [AI Agent](./developer-guide-agents-ai-agent.md) 和 [Function Agent](./developer-guide-agents-function-agent.md) 的文档。

```d2
direction: down

Team-Agent-Orchestration: {
  label: "Team Agent 编排工作流"
  grid-columns: 2
  grid-gap: 100

  Sequential-Execution: {
    label: "顺序执行（流水线）"
    shape: rectangle
    style.fill: "#f0f4f8"

    Input: { shape: oval }
    Skill-A: "技能 A"
    Skill-B: "技能 B"
    Output: { shape: oval }
  }

  Parallel-Execution: {
    label: "并行执行"
    shape: rectangle
    style.fill: "#f0f4f8"

    Input: { shape: oval }
    Skill-A: "技能 A"
    Skill-B: "技能 B"
    Merge: "合并结果"
    Output: { shape: oval }
  }

  Iterative-Processing: {
    label: "迭代处理（批量）"
    shape: rectangle
    style.fill: "#f0f4f8"

    Input-List: { label: "输入列表"; shape: oval }
    Process-Item: { label: "处理项\n（使用技能）" }
    Output-List: { label: "输出列表"; shape: oval }
  }

  Reflection: {
    label: "反思（优化循环）"
    shape: rectangle
    style.fill: "#f0f4f8"

    Generate-Draft: "生成草稿"
    Review: { label: "审查草稿"; shape: diamond }
    Refine-Draft: "优化草稿"
    Final-Output: { label: "最终输出"; shape: oval }
  }
}

# Connections
seq: Team-Agent-Orchestration.Sequential-Execution
seq.Input -> seq.Skill-A -> seq.Skill-B -> seq.Output

par: Team-Agent-Orchestration.Parallel-Execution
par.Input -> par.Skill-A
par.Input -> par.Skill-B
par.Skill-A -> par.Merge
par.Skill-B -> par.Merge
par.Merge -> par.Output

iter: Team-Agent-Orchestration.Iterative-Processing
iter.Input-List -> iter.Process-Item: "对于每个项"
iter.Process-Item -> iter.Process-Item: "下一个项"
iter.Process-Item -> iter.Output-List: "完成"

refl: Team-Agent-Orchestration.Reflection
refl.Generate-Draft -> refl.Review
refl.Review -> refl.Final-Output: "符合标准"
refl.Review -> refl.Refine-Draft: "需要优化"
refl.Refine-Draft -> refl.Generate-Draft
```

## 配置

`TeamAgent` 通过一组选项进行配置，这些选项定义了其行为、执行模式以及迭代和反思等高级功能。

<x-field-group>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="构成团队的 Agent 实例数组。"></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-required="false">
    <x-field-desc markdown="Agent 的执行策略。可以是 `sequential` 或 `parallel`。"></x-field-desc>
  </x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="用于启用迭代式自我修正过程的配置。"></x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false">
    <x-field-desc markdown="包含数组的输入字段的键。团队将对数组中的每个项执行一次。"></x-field-desc>
  </x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false">
    <x-field-desc markdown="使用 `iterateOn` 时，此项设置并发处理的项数。"></x-field-desc>
  </x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown="如果为 `true`，处理 `iterateOn` 循环中一个项的输出将被合并回来，并可用于下一个项的执行。这要求 `concurrency` 为 1。"></x-field-desc>
  </x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown="在 `sequential` 模式下，如果为 `true`，则每个中间 Agent 的输出都将包含在最终结果中，而不仅仅是最后一个 Agent 的输出。"></x-field-desc>
  </x-field>
</x-field-group>

## 执行模式

`mode` 属性决定了团队的基本工作流程。

### 顺序模式

在 `sequential` 模式下，Agent 逐一执行。每个 Agent 的输出会与初始输入合并，然后传递给序列中的下一个 Agent。这创建了一个流水线，适用于需要一系列转换或步骤的任务。

```typescript team-agent-sequential.ts icon=logos:typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";
import { model } from "./model"; // 假设 model 是一个已初始化的 ChatModel

const writerAgent = new AIAgent({
  name: "writer",
  model,
  instructions: "You are a creative writer. Write a short story based on the topic: {{topic}}.",
  outputKey: "story",
});

const editorAgent = new AIAgent({
  name: "editor",
  model,
  instructions: "You are an editor. Review the following story and correct any grammatical errors: {{story}}.",
  outputKey: "editedStory",
});

const sequentialTeam = new TeamAgent({
  name: "writingTeam",
  mode: ProcessMode.sequential,
  skills: [writerAgent, editorAgent],
});

// 调用示例：
// const result = await aigne.invoke(sequentialTeam, { topic: "a journey to the moon" });
// console.log(result.editedStory);
```

在此示例中，`writerAgent` 首先生成一个 `story`。然后，包含 `story` 键的输出被传递给 `editorAgent`，后者使用它来生成最终的 `editedStory`。

### 并行模式

在 `parallel` 模式下，所有 Agent 使用相同的初始输入同时执行。它们的输出随后被合并成一个单一的结果。这对于需要同时生成多个独立信息片段的任务非常高效。

如果多个 Agent 尝试写入同一个输出键，第一个为该键生成值的 Agent 将“声明”它，而其他 Agent 后续对该键的写入将被忽略。

```typescript team-agent-parallel.ts icon=logos:typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";
import { model } from "./model"; // 假设 model 是一个已初始化的 ChatModel

const researcherAgent = new AIAgent({
  name: "researcher",
  model,
  instructions: "Research the key facts about {{topic}}.",
  outputKey: "facts",
});

const summaryAgent = new AIAgent({
  name: "summarizer",
  model,
  instructions: "Provide a brief, one-paragraph summary of {{topic}}.",
  outputKey: "summary",
});

const parallelTeam = new TeamAgent({
  name: "researchTeam",
  mode: ProcessMode.parallel,
  skills: [researcherAgent, summaryAgent],
});

// 调用示例：
// const result = await aigne.invoke(parallelTeam, { topic: "the Roman Empire" });
// console.log(result.facts);
// console.log(result.summary);
```
这里，两个 Agent 同时开始。一旦两个 Agent 都完成工作，最终结果将同时包含 `facts` 和 `summary`。

## 高级功能

### 使用 iterateOn 进行迭代

`iterateOn` 属性可实现批量处理。您提供一个持有数组的输入键的名称。然后，`TeamAgent` 将为该数组中的每个项执行其完整的工作流程。这对于使用同一组 Agent 处理多条数据记录非常有效。

```typescript team-agent-iteration.ts icon=logos:typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";
import { model } from "./model"; // 假设 model 是一个已初始化的 ChatModel

const translatorAgent = new AIAgent({
  name: "translator",
  model,
  instructions: "Translate the following text to French: {{text}}.",
  outputKey: "translatedText",
});

const sentimentAgent = new AIAgent({
  name: "sentiment",
  model,
  instructions: "Analyze the sentiment of the following text (positive, negative, or neutral): {{text}}.",
  outputKey: "sentiment",
});

const processingTeam = new TeamAgent({
  name: "batchProcessor",
  mode: ProcessMode.parallel,
  skills: [translatorAgent, sentimentAgent],
  iterateOn: "reviews", // 持有数组的键
});

const inputData = {
  reviews: [
    { text: "This product is amazing!" },
    { text: "I am very disappointed with the quality." },
    { text: "It works as expected." },
  ],
};

// 调用示例：
// const result = await aigne.invoke(processingTeam, inputData);
// console.log(result.reviews);
/*
输出将是：
[
  { translatedText: "Ce produit est incroyable !", sentiment: "positive" },
  { translatedText: "Je suis très déçu de la qualité.", sentiment: "negative" },
  { translatedText: "Cela fonctionne comme prévu.", sentiment: "neutral" }
]
*/
```

### 反思

反思提供了一种自我修正和质量保证的机制。配置后，`TeamAgent` 的输出会传递给指定的 `reviewer` Agent。审阅者根据特定标准评估输出。如果输出未被“批准”，则整个过程将再次运行，并将前一次的输出和审阅者的反馈输入到下一次迭代中。此循环将持续进行，直到输出被批准或达到 `maxIterations` 限制。

反思的配置在 `reflection` 键下提供。

<x-field-group>
  <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="负责评估团队输出的 Agent。"></x-field>
  <x-field data-name="isApproved" data-type="string | Function" data-required="true">
    <x-field-desc markdown="批准条件。如果为 `string`，则是审阅者输出中布尔值字段的名称。如果为 `function`，它会接收审阅者的输出，并且必须返回一个真值才能批准。"></x-field-desc>
  </x-field>
  <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="在失败前可进行的最大审查-优化循环次数。"></x-field>
  <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown="如果为 `true`，当达到 `maxIterations` 时，流程将返回最后生成的输出，而不是抛出错误。"></x-field-desc>
  </x-field>
  <x-field data-name="customErrorMessage" data-type="string" data-required="false" data-desc="当达到最大迭代次数但仍未获批准时，要抛出的自定义错误消息。"></x-field>
</x-field-group>

```typescript team-agent-reflection.ts icon=logos:typescript
import { AIAgent, TeamAgent } from "@aigne/core";
import { model } from "./model"; // 假设 model 是一个已初始化的 ChatModel

const planGenerator = new AIAgent({
  name: "planGenerator",
  model,
  instructions: `Generate a 3-step marketing plan for a new {{product}}. 
  If you received feedback, incorporate it. Feedback: {{feedback}}`,
  outputKey: "plan",
});

const planReviewer = new AIAgent({
  name: "planReviewer",
  model,
  instructions: `Review the marketing plan: {{plan}}. 
  Does it include a budget allocation? If not, provide feedback to add one. 
  Output JSON with an 'approved' (boolean) and 'feedback' (string) field.`,
  output: {
    json: {
      schema: {
        type: "object",
        properties: {
          approved: { type: "boolean" },
          feedback: { type: "string" },
        },
      },
    },
  },
});

const reflectionTeam = new TeamAgent({
  name: "planningTeam",
  skills: [planGenerator],
  reflection: {
    reviewer: planReviewer,
    isApproved: "approved", // 检查审阅者输出中的 'approved' 字段
    maxIterations: 3,
  },
});

// 调用示例：
// const result = await aigne.invoke(reflectionTeam, { product: "smart watch" });
// console.log(result.plan);
```

在此流程中，`planGenerator` 创建一个初步计划。`planReviewer` 对其进行检查。如果未提及预算，它会将 `approved` 设置为 `false` 并提供反馈。然后 `TeamAgent` 会重新运行 `planGenerator`，这次会包含反馈，直到计划被批准为止。

## YAML 定义

您还可以使用 YAML 以声明方式定义 `TeamAgent`。

```yaml team-agent-definition.yaml icon=mdi:language-yaml
type: team
name: test-team-agent
description: Test team agent
skills:
  - sandbox.js # Path to another agent definition
  - chat.yaml
mode: parallel
iterate_on: sections
concurrency: 2
include-all-steps-output: true
reflection:
  reviewer: team-agent-reviewer.yaml
  is_approved: approved
  max_iterations: 5
  return_last_on_max_iterations: true
```

此 YAML 定义了一个并行团队，它会迭代名为 `sections` 的输入字段，并包含一个用于质量控制的反思步骤。

## 总结

`TeamAgent` 是一个强大的工具，用于协调多个 Agent 解决复杂问题。通过将 Agent 组合成 `sequential` 或 `parallel` 工作流，并利用 `iterateOn` 进行批量处理和 `reflection` 进行自我修正等高级功能，您可以构建稳健且复杂的 AI 应用程序。

要了解有关团队构建模块的更多信息，请参阅 [AI Agent](./developer-guide-agents-ai-agent.md) 和 [Function Agent](./developer-guide-agents-function-agent.md) 文档。