# TeamAgent

## 概述

`TeamAgent` 是一个专门的 Agent，它通过编排一组其他的 Agent（被称为“技能”）来完成复杂的任务。它扮演着管理者的角色，指导其技能 Agent 之间的工作流和数据流。这使得创建复杂的多步骤 AI 系统成为可能，其中每个 Agent 都可以专注于特定的专业领域。

`TeamAgent` 支持几种强大的工作流模式：

*   **顺序处理 (Sequential Processing)**：Agent 逐一执行，形成一个处理流水线。
*   **并行处理 (Parallel Processing)**：Agent 同时执行，适用于可以独立执行的任务。
*   **反思 (Reflection)**：一个迭代过程，其中“审阅者”Agent 提供反馈以优化输出，直到满足特定标准。
*   **迭代 (Iteration)**：对项目列表进行批处理，将相同的工作流应用于每个项目。

通过组合这些模式，您可以构建模块化、可扩展且功能强大的 AI 解决方案。

## 关键概念

### 处理模式

`TeamAgent` 可以在两种主要模式下运行，由 `ProcessMode` 枚举定义。该模式决定了团队中 Agent 的执行方式。

*   `ProcessMode.sequential`：在此模式下，Agent 按顺序执行。第一个 Agent 的输出与初始输入相结合，然后传递给第二个 Agent，依此类推。这创建了一个处理流水线，其中每个步骤都建立在前一个步骤的基础上。它非常适合具有明确依赖关系的任务。

*   `ProcessMode.parallel`：在此模式下，所有 Agent 同时执行。每个 Agent 都接收完全相同的初始输入。然后，它们的各自输出被合并以形成最终结果。这对于可以并发运行的独立子任务非常高效。

## 创建 TeamAgent

您可以通过提供一个 `skills` 列表（它将管理的 Agent）和一个处理 `mode` 来创建 `TeamAgent`。

### 顺序处理

在顺序模式下，Agent 形成一个链条。每个 Agent 的输出作为额外输入传递给下一个 Agent，使其非常适合多阶段工作流。

**用例**：一个内容创作流水线，首先生成文本，然后进行翻译，最后审查格式。

```typescript
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

// Agent 1：将内容翻译成中文
const translatorAgent = AIAgent.from({
  name: "translator",
  inputSchema: z.object({
    content: z.string().describe("The text content to translate"),
  }),
  instructions: "Translate the text to Chinese:\n{{content}}",
  outputKey: "translation",
});

// Agent 2：润色翻译后的文本
const prettierAgent = AIAgent.from({
  name: "prettier",
  inputSchema: z.object({
    translation: z.string().describe("The translated text"),
  }),
  instructions: "Prettier the following text:\n{{translation}}",
  outputKey: "formatted",
});

// 创建一个顺序处理团队
const sequentialTeam = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, prettierAgent],
});
```

当此团队被调用时，`translatorAgent` 首先运行。其输出 `{ translation: "..." }` 与原始输入合并，然后传递给 `prettierAgent`。

### 并行处理

在并行模式下，所有 Agent 接收相同的输入并同时运行。它们的输出被收集和合并。这对于需要对同一数据进行多次独立分析的任务非常理想。

**用例**：分析产品描述以同时提取其关键特性和目标受众。

```typescript
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

// Agent 1：提取产品特性
const featureAnalyzer = AIAgent.from({
  name: "feature-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: "Identify and list the key features of the product.",
  outputKey: "features",
});

// Agent 2：识别目标受众
const audienceAnalyzer = AIAgent.from({
  name: "audience-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: "Identify the target audience for this product.",
  outputKey: "audience",
});

// 创建一个并行处理团队
const analysisTeam = TeamAgent.from({
  name: "analysis-team",
  skills: [featureAnalyzer, audienceAnalyzer],
  mode: ProcessMode.parallel,
});
```

当使用产品描述调用此团队时，`featureAnalyzer` 和 `audienceAnalyzer` 会同时运行，它们的输出被合并成一个单一结果：`{ features: "...", audience: "..." }`。

## 高级工作流

除了简单的顺序和并行执行，`TeamAgent` 还为更复杂的场景提供了高级功能。

### 反思模式

反思模式启用了一个迭代优化的工作流。团队的输出由一个指定的 `reviewer` Agent 进行审查。如果输出未被批准，则该过程会重复，使用先前的输出和反馈作为下一次尝试的上下文。此循环将持续进行，直到输出被批准或达到最大迭代次数。

这对于质量保证、自我修正以及需要高度准确性的任务非常有用。

**配置 (`ReflectionMode`)**

<x-field-group>
  <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="负责评估团队输出的 Agent。"></x-field>
  <x-field data-name="isApproved" data-type="((output: Message) => PromiseOrValue<boolean>) | string" data-required="true" data-desc="一个函数或审阅者输出中的字段名，用于确定结果是否被批准。如果它是一个字符串，则会检查相应字段的真值。"></x-field>
  <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="抛出错误前的最大审查周期数。"></x-field>
  <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false" data-desc="如果为 true，则在达到最大迭代次数时返回最后生成的输出，而不是抛出错误。"></x-field>
</x-field-group>

### 迭代器模式

迭代器模式专为批处理而设计。当您使用 `iterateOn` 选项指定一个输入字段时，`TeamAgent` 将遍历该字段数组中的每个项目。整个团队工作流将为每个项目执行一次。

**配置**

<x-field-group>
  <x-field data-name="iterateOn" data-type="keyof I" data-required="true" data-desc="包含要迭代的数组的输入字段的键。"></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="并发处理的最大项目数。"></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="如果为 true，处理一个项目的输出将被合并回来，使其可用于数组中的后续项目。这要求并发数 `concurrency` 为 1。"></x-field>
</x-field-group>

## API 参考

### TeamAgentOptions

这些是使用 `TeamAgent.from()` 创建 `TeamAgent` 时可用的配置选项。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="Agent 的唯一名称。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="对 Agent 用途的描述。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="组成团队的 Agent 数组。"></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="ProcessMode.sequential" data-required="false" data-desc="团队的处理模式，可以是 'sequential' 或 'parallel'。"></x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="用于启用迭代式反思工作流的配置。"></x-field>
  <x-field data-name="iterateOn" data-type="keyof I" data-required="false" data-desc="用于批处理的要迭代的输入字段键。"></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="迭代器模式的并发级别。"></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="在批处理期间是否将一次迭代的输出反馈给下一次迭代。"></x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false" data-desc="在顺序模式下，如果为 true，最终输出将包括所有中间步骤的输出，而不仅仅是最后一个步骤的输出。"></x-field>
</x-field-group>