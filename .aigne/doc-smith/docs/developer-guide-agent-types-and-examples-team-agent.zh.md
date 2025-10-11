# Team Agent

`TeamAgent` 是一个专门的 agent，旨在协调一组其他的 agent（被称为其“技能”）。它使您能够通过协调这些 agent 的协同工作方式来构建复杂的工作流。您可以配置一个团队，使其 agent 逐一执行（顺序执行）或同时执行（并行执行）。

这对于创建复杂的多步骤流程特别有用，例如一个研究团队，其中一个 agent 负责收集信息，另一个 agent 负责分析信息，第三个 agent 负责总结研究结果。

## 核心概念

`TeamAgent` 管理一组 agent，并根据定义的 `mode` 来执行它们。agent 的组织方式和执行模式决定了数据的流向和最终的输出。

### 处理模式

在一个团队中，处理 agent 有两种基本模式：

<x-cards data-columns="2">
  <x-card data-title="顺序模式" data-icon="lucide:arrow-right-circle">
    agent 按照它们被定义的顺序逐一执行。每个 agent 的输出都会被合并，并作为输入传递给序列中的下一个 agent。这非常适合创建线性管道，其中每一步都建立在前一步的基础上。
  </x-card>
  <x-card data-title="并行模式" data-icon="lucide:git-fork">
    所有 agent 使用相同的初始输入同时执行。然后，它们的输出会被智能地合并，形成一个单一的、组合的结果。当您需要一次性执行多个独立任务并整合其结果时，这种模式非常有用。
  </x-card>
</x-cards>

## 配置

您可以使用以下选项来配置 `TeamAgent`。

<x-field-group>
    <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="构成团队的 agent 实例数组。"></x-field>
    <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-required="false">
        <x-field-desc markdown>决定 agent 的处理方式。可以是 `ProcessMode.sequential` 或 `ProcessMode.parallel`。</x-field-desc>
    </x-field>
    <x-field data-name="reflection" data-type="ReflectionMode" data-required="false">
        <x-field-desc markdown>启用迭代式的审查和优化循环。一个 `reviewer` agent 会评估团队的输出，如果未获批准，团队将带着反馈再次运行。详见**高级功能**部分。</x-field-desc>
    </x-field>
    <x-field data-name="iterateOn" data-type="string" data-required="false">
        <x-field-desc markdown>指定一个包含数组的输入字段。团队将单独处理数组中的每个项。这对于批量处理非常有用。</x-field-desc>
    </x-field>
    <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false">
        <x-field-desc markdown>使用 `iterateOn` 时，此项设置可并发处理的数组项的最大数量。</x-field-desc>
    </x-field>
    <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false">
        <x-field-desc markdown>如果为 `true`，处理 `iterateOn` 数组中一个项的输出将被合并回来，使其可用于后续的迭代。此选项不能与大于 1 的 `concurrency` 一起使用。</x-field-desc>
    </x-field>
    <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false">
        <x-field-desc markdown>在 `sequential` 模式下，如果为 `true`，每个中间 agent 的输出都将包含在最终结果中，而不仅仅是最后一个 agent 的输出。</x-field-desc>
    </x-field>
</x-field-group>

## 使用示例

您可以通过 TypeScript 编程方式或使用 YAML 声明式地定义 `TeamAgent`。

### 顺序团队示例

在此示例中，一个 `researcher` agent 首先收集数据，然后一个 `writer` agent 使用这些数据撰写回应。这些 agent 按顺序运行。

```typescript team-agent-sequential.ts icon=logos:typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// 定义 researcher agent
const researcher = AIAgent.from({
  name: "researcher",
  description: "Gathers information on a given topic.",
  instructions: "Find key facts about the user's topic: {{topic}}.",
});

// 定义 writer agent
const writer = AIAgent.from({
  name: "writer",
  description: "Writes a summary based on research.",
  instructions: "Summarize the following facts into a paragraph: {{output}}",
});

// 创建一个顺序团队
const researchTeam = TeamAgent.from({
  name: "research-team",
  mode: ProcessMode.sequential,
  skills: [researcher, writer],
});

// 运行团队
async function run() {
  const result = await researchTeam.invoke({
    topic: "the history of artificial intelligence",
  });
  console.log(result);
}

run();
```

### 并行团队示例

在这里，两个 agent 同时运行以生成报告的不同部分，然后它们的输出被合并。

```typescript team-agent-parallel.ts icon=logos:typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// 定义一个用于撰写引言的 agent
const introWriter = AIAgent.from({
  name: "intro-writer",
  output: {
    json: {
      introduction: "A compelling introduction about {{topic}}",
    },
  },
});

// 定义一个用于创建要点的 agent
const keyPointsWriter = AIAgent.from({
  name: "key-points-writer",
  output: {
    json: {
      keyPoints: ["Three key bullet points about {{topic}}"],
    },
  },
});

// 创建一个并行团队
const reportTeam = TeamAgent.from({
  name: "report-team",
  mode: ProcessMode.parallel,
  skills: [introWriter, keyPointsWriter],
});

// 运行团队
async function run() {
  const result = await reportTeam.invoke({
    topic: "the benefits of remote work",
  });
  console.log(JSON.stringify(result, null, 2));
  /*
  预期输出：
  {
    "introduction": "...",
    "keyPoints": [
      "...",
      "...",
      "..."
    ]
  }
  */
}

run();
```

### 声明式 YAML 示例

您也可以在 YAML 文件中定义一个团队 agent。这对于无需编写代码即可配置 agent 非常有用。以下示例定义了一个并行团队，该团队会迭代处理一个 `sections` 数组。

```yaml team.yaml icon=mdi:language-yaml
type: team
name: test-team-agent
description: 测试团队 agent
skills:
  - sandbox.js
  - chat.yaml
mode: parallel
input_schema:
  type: object
  properties:
    sections:
      type: array
      description: 需要迭代处理的章节
      items:
        type: object
        properties:
          title:
            type: string
          description:
            type: string
output_schema:
  type: object
  properties:
    sections:
      type: array
      description: 每个章节的结果
      items:
        type: object
        properties:
          title:
            type: string
          description:
            type: string
iterate_on: sections
concurrency: 2
```

## 高级功能

### 迭代处理 (`iterateOn`)

`iterateOn` 选项允许 `TeamAgent` 对输入消息中的数组执行批量操作。当您使用 `iterateOn` 指定一个键时，团队将为该数组中的每个项执行其完整的工作流。

例如，如果您的输入是 `{ "articles": [{ "title": "A" }, { "title": "B" }] }` 并且您设置了 `iterateOn: "articles"`，团队将运行两次：一次针对 `{"title": "A"}`，一次针对 `{"title": "B"}`。结果会被累积并在最终输出中以单个数组的形式返回。您可以使用 `concurrency` 选项来控制并行运行的数量。

### 反思模式

反思功能启用了一个强大的自我修正循环。当配置了 `reflection` 时，团队的输出将被传递给一个指定的 `reviewer` agent。然后，此审查者会评估输出。

-   **批准**：如果审查者批准了输出（基于 `isApproved` 条件），流程结束。
-   **修订**：如果输出未获批准，审查者的反馈将被添加到上下文中，团队将再次运行流程以改进结果。

此循环会重复进行，直到输出被批准或达到 `maxIterations` 限制，以防止无限循环。

以下是一个带有反思功能的团队的 YAML 配置示例：

```yaml team-agent-with-reflection.yaml icon=mdi:language-yaml
type: team
name: test-team-agent-with-reflection
description: 带反思功能的测试团队 agent
skills:
  - chat.yaml
reflection:
  reviewer: team-agent-reviewer.yaml
  is_approved: approved
  max_iterations: 5
  return_last_on_max_iterations: true
```

### 嵌套团队

一个 `TeamAgent` 可以在其 `skills` 数组中包含另一个 `TeamAgent`。这使您能够创建复杂的、分层的 agent 结构，其中 agent 团队可以在更大的团队中协作，从而实现高度模块化和可扩展的工作流设计。