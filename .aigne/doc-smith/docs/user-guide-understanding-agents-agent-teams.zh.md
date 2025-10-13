# Team Agent

`TeamAgent` 是一种专门的 Agent，它负责协调一组其他 Agent（称为“技能”）来执行复杂任务。它管理这些 Agent 如何协同工作，处理它们之间的信息流。

你可以将 `TeamAgent` 配置为以两种主要方式执行其技能：
- **顺序模式**：Agent 按顺序逐个运行，一个 Agent 的输出会作为下一个 Agent 的输入。这对于创建多步骤工作流非常理想。
- **并行模式**：所有 Agent 使用相同的输入同时运行，并将其输出合并。这对于需要一次生成多个独立信息的任务非常有用。

除了基本的编排，`TeamAgent` 还提供了一些高级功能，例如：
- **迭代**：自动处理输入数组中的每个项目，这对于批处理非常有用。
- **反思**：使用一个“审阅者” Agent 来验证并迭代优化团队的输出，直到其满足特定标准，从而实现自我修正的工作流。

这些功能的结合使 `TeamAgent` 成为一个强大的工具，可用于构建能够处理复杂、多步骤和数据密集型操作的精密多 Agent 系统。

## 工作原理

`TeamAgent` 接收一个输入，根据配置的模式将其传递给其技能 Agent 团队，然后将结果聚合为最终输出。下图说明了不同的处理流程。

```d2
direction: down

Input

TeamAgent: {
  label: "Team Agent 编排"
  shape: rectangle
  style.stroke-dash: 2

  Sequential-Mode: {
    label: "顺序模式"
    shape: rectangle
    style.fill: "#f0f8ff"
    Skill-A: "技能 A"
    Skill-B: "技能 B"
    Skill-C: "技能 C"
    Skill-A -> Skill-B -> Skill-C
  }

  Parallel-Mode: {
    label: "并行模式"
    shape: rectangle
    style.fill: "#f0fff0"
    Skill-X: "技能 X"
    Skill-Y: "技能 Y"
    Skill-Z: "技能 Z"
    Combine-Results: "合并结果"
    Skill-X -> Combine-Results
    Skill-Y -> Combine-Results
    Skill-Z -> Combine-Results
  }

  Advanced-Workflow: {
    label: "高级工作流（反思与迭代）"
    shape: rectangle
    style.fill: "#fff8f0"
    Process-Item: {
      label: "对于输入数组中的每个项目..."
      shape: rectangle
      style.stroke-dash: 2
      Team-Execution: "团队执行\n（顺序或并行）"
      Initial-Output: "初始输出"
      Reviewer-Agent: "审阅者 Agent"
      Meets-Criteria: {
        label: "是否符合标准？"
        shape: diamond
      }
      Team-Execution -> Initial-Output
      Initial-Output -> Reviewer-Agent
      Reviewer-Agent -> Meets-Criteria
      Meets-Criteria -> Team-Execution: "否，优化"
    }
  }
}

Final-Output

Input -> TeamAgent.Sequential-Mode.Skill-A: "单一输入"
TeamAgent.Sequential-Mode.Skill-C -> Final-Output

Input -> TeamAgent.Parallel-Mode.Skill-X
Input -> TeamAgent.Parallel-Mode.Skill-Y
Input -> TeamAgent.Parallel-Mode.Skill-Z
TeamAgent.Parallel-Mode.Combine-Results -> Final-Output

Input -> TeamAgent.Advanced-Workflow.Process-Item.Team-Execution: "输入数组"
TeamAgent.Advanced-Workflow.Process-Item.Meets-Criteria -> Final-Output: "是"

```

## 配置

你可以使用以下选项来配置 `TeamAgent`。

### 基本配置

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="Agent 的唯一标识符。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="Agent 用途的简要描述。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="此团队将编排的 Agent 实例数组。"></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-desc="处理模式。可以是 `sequential`（逐步执行）或 `parallel`（同步执行）。"></x-field>
  <x-field data-name="input_schema" data-type="object" data-required="false" data-desc="定义预期输入格式的 JSON schema。"></x-field>
  <x-field data-name="output_schema" data-type="object" data-required="false" data-desc="定义预期输出格式的 JSON schema。"></x-field>
</x-field-group>

### 高级功能

<x-field-group>
    <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="启用迭代的审阅-优化过程以提高输出质量。有关详细信息，请参阅“反思”部分。"></x-field>
    <x-field data-name="iterateOn" data-type="string" data-required="false" data-desc="要迭代的输入字段的名称（必须是数组）。数组中的每个项目都由团队单独处理。"></x-field>
    <x-field data-name="concurrency" data-type="number" data-default="1" data-desc="使用 `iterateOn` 时，此设置可指定并行处理的最大项目数。"></x-field>
    <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-desc="如果为 `true`，处理 `iterateOn` 数组中一个项目的输出将被合并回来，并可用于下一个项目的处理。要求 `concurrency` 为 1。"></x-field>
    <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-desc="在 `sequential` 模式下，如果为 `true`，则每个中间 Agent 的输出都将包含在最终结果中，而不仅仅是最后一个。这对于调试很有用。"></x-field>
</x-field-group>

---

## 核心概念

### 处理模式

`mode` 属性决定了团队内 Agent（技能）的执行流程。

#### 顺序模式

在 `sequential` 模式下，Agent 按照它们在 `skills` 数组中定义的顺序依次执行。每个 Agent 的输出与原始输入以及所有先前 Agent 的输出合并，形成链中下一个 Agent 的输入。

此模式非常适用于构建每一步都依赖于上一步的工作流，例如数据处理、分析和报告的流水线。

**流程示例 (`sequential`):**
1.  **Agent 1** 收到初始输入 `{ "topic": "AI" }`。
2.  **Agent 1** 生成输出 `{ "research": "..." }`。
3.  **Agent 2** 收到合并后的输入 `{ "topic": "AI", "research": "..." }`。
4.  **Agent 2** 生成输出 `{ "summary": "..." }`。
5.  最终输出为 `{ "topic": "AI", "research": "...", "summary": "..." }`。

#### 并行模式

在 `parallel` 模式下，`skills` 数组中的所有 Agent 会同时执行。每个 Agent 接收完全相同的初始输入。然后，它们的输出被组合起来形成最终结果。如果多个 Agent 产生具有相同键的输出，系统会确定哪个 Agent“拥有”该键以避免冲突。

此模式对于可以同时进行多个独立工作的任务非常高效，例如从不同来源收集信息或对同一数据集执行不同分析。

**流程示例 (`parallel`):**
1.  **Agent A** 和 **Agent B** 都收到初始输入 `{ "company": "Initech" }`。
2.  **Agent A** 生成 `{ "financials": "..." }`。
3.  **Agent B** 生成 `{ "news": "..." }`。
4.  最终输出是两者的结合：`{ "financials": "...", "news": "..." }`。

### 迭代

`iterateOn` 功能可实现批处理。通过指定一个包含数组的输入字段，你可以指示 `TeamAgent` 对该数组中的每个项目运行其完整的工作流（顺序或并行）。

-   **`concurrency`**：你可以控制一次处理多少个项目。例如，`concurrency: 5` 将并行处理数组中的五个项目。
-   **`iterateWithPreviousOutput`**：当设置为 `true`（且 `concurrency` 为 1）时，处理项目 `N` 的输出会合并到项目 `N+1` 的数据中。这会产生累积效应，对于每一步都依赖于上一步的任务非常有用，例如构建叙事或总结一系列事件。

**YAML 示例 (`iterateOn`)**
此配置处理来自 `sections` 输入字段的数组，并发数为 2。

```yaml
# sourceId: packages/core/test-agents/team.yaml
type: team
name: test-team-agent
description: Test team agent
skills:
  - sandbox.js
  - chat.yaml
mode: parallel
input_schema:
  type: object
  properties:
    sections:
      type: array
      description: Sections to iterate over
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
      description: Results from each section
      items:
        type: object
        properties:
          title:
            type: string
          description:
            type: string
iterate_on: sections
concurrency: 2
iterate-with-previous-output: false
include-all-steps-output: true
```

### 反思

反思提供了一种自我修正和质量控制的机制。启用后，`TeamAgent` 的初始输出会传递给指定的 `reviewer` Agent。该审阅者会根据一组标准评估输出。

-   如果输出被批准，则过程结束。
-   如果输出未被批准，审阅者的反馈将被添加到上下文中，原始的 Agent 团队将再次运行以生成修订后的输出。

此循环将持续进行，直到输出被批准或达到 `maxIterations` 限制。

`reflection` 配置需要：
<x-field-group>
    <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="负责评估团队输出的 Agent。"></x-field>
    <x-field data-name="isApproved" data-type="string | (output: Message) => boolean" data-required="true" data-desc="用于确定输出是否被批准的条件。它可以是审阅者输出中的字段名称（例如，`is_complete`），也可以是返回 `true` 表示批准的函数。"></x-field>
    <x-field data-name="maxIterations" data-type="number" data-default="3" data-desc="停止前审阅-优化周期的最大次数。"></x-field>
    <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-desc="如果为 `true`，即使在达到 `maxIterations` 后输出未获批准，Agent 也会返回最后生成的输出。如果为 `false`，则会抛出错误。"></x-field>
</x-field-group>

此功能对于要求高准确性、遵守特定格式或可以通过另一个 Agent 自动进行复杂验证的任务非常强大。