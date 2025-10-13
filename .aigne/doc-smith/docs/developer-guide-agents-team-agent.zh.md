本文档详细介绍了 `TeamAgent` 类，这是一个功能强大的组件，用于协调多个 Agent 协同工作。本文档涵盖了其配置、处理模式以及反思和迭代等特殊功能。

### 概览

`TeamAgent` 负责协调一组 Agent（被称为“技能”）来完成复杂任务。它根据指定的处理模式管理这些 Agent 的执行，允许它们按顺序（一个接一个）或并行（一次性全部）工作。这对于构建复杂的工作流特别有用，例如一个 Agent 的输出是另一个 Agent 的输入，或者当多个任务需要同时执行以合并它们的结果时。

### 配置 (`TeamAgentOptions`)

要创建 `TeamAgent`，您需要向其构造函数提供一个 `TeamAgentOptions` 对象。这些选项允许您自定义团队的行为。

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `mode` | `ProcessMode` | 处理团队中 Agent 的方法。可以是 `sequential` 或 `parallel`。 | `sequential` |
| `reflection` | `ReflectionMode` | 用于为团队输出启用迭代式审查和优化流程的配置。 | `undefined` |
| `iterateOn` | `string` | 包含数组的输入字段的键。团队将遍历数组中的每个项目。 | `undefined` |
| `concurrency` | `number` | 使用 `iterateOn` 时并发操作的最大数量。 | `1` |
| `iterateWithPreviousOutput` | `boolean` | 如果为 `true`，一次迭代的输出将被合并回下一次迭代的输入中。要求 `concurrency` 为 `1`。 | `false` |
| `includeAllStepsOutput` | `boolean` | 如果在顺序模式下为 `true`，所有中间步骤的输出都将包含在最终结果中。 | `false` |

### 处理模式

`ProcessMode` 枚举决定了团队中的 Agent 如何执行。

#### `sequential`
在此模式下，Agent 会被逐一处理。每个 Agent 的输出都会作为额外输入传递给序列中的下一个 Agent。这是默认模式，非常适合创建线性工作流。

#### `parallel`
在此模式下，所有 Agent 会同时处理。每个 Agent 接收相同的初始输入，它们的输出会被合并。此模式适用于可以独立执行然后合并结果的任务。

### 关键特性

#### 反思模式
反思模式提供了一种对团队输出进行迭代式自我修正和优化的机制。启用后，指定的 `reviewer` Agent 会评估团队的结果。如果输出未获批准，流程将重复，并使用先前的输出和审查者的反馈作为下一次迭代的上下文。此循环将持续进行，直到输出被批准或达到 `maxIterations` 限制。

**配置 (`ReflectionMode`)**

| Parameter | Type | Description |
| --- | --- | --- |
| `reviewer` | `Agent` | 负责审查团队输出并提供反馈的 Agent。 |
| `isApproved` | `((output: Message) => PromiseOrValue<boolean \| unknown>) \| string` | 一个函数或审查者输出中的字段名，用于确定结果是否被批准。真值表示批准。 |
| `maxIterations` | `number` | 停止前审查迭代的最大次数。默认为 `3`。 |
| `returnLastOnMaxIterations` | `boolean` | 如果为 `true`，当达到 `maxIterations` 时，即使未获批准，Agent 也会返回最后生成的输出。如果为 `false`，则会抛出错误。默认为 `false`。 |

**示例 (`team-agent-with-reflection.yaml`)**
```yaml
type: team
name: test-team-agent-with-reflection
description: Test team agent with reflection
skills:
  - chat.yaml
reflection:
  reviewer: team-agent-reviewer.yaml
  is_approved: approved
  max_iterations: 5
  return_last_on_max_iterations: true
```

#### 迭代 (`iterateOn`)

`iterateOn` 功能使 `TeamAgent` 能够对输入消息中的数组执行批量处理。当您使用 `iterateOn` 指定一个输入字段键时，Agent 会遍历该数组的每个元素，并通过团队的工作流单独处理每个元素。

这对于需要将同一组操作应用于多个数据项的场景非常有效，例如处理文档的各个部分、分析用户评论列表或丰富数据集。

**示例 (`team.yaml`)**
此示例演示了一个配置为遍历 `sections` 数组的团队 Agent。

```yaml
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
        # ... 项目属性
iterate_on: sections
concurrency: 2
iterate-with-previous-output: false
include-all-steps-output: true
```

### 方法

#### `constructor(options: TeamAgentOptions<I, O>)`
创建一个新的 `TeamAgent` 实例。

-   **参数:**
    -   `options`: 团队 Agent 的配置选项。

#### `process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>`
根据配置的 `mode`，通过团队的 Agent 路由并处理输入消息。

-   **参数:**
    -   `input`: 要处理的消息。
    -   `options`: 调用选项。
-   **返回:** 构成最终响应的消息块流。

### 示例

以下是创建 `TeamAgent` 的示例。

**顺序 TeamAgent**
```typescript
import { TeamAgent, ProcessMode } from "./team-agent";
import { Agent } from "./agent";

const agent1 = new Agent({ /* ... */ });
const agent2 = new Agent({ /* ... */ });

const sequentialTeam = TeamAgent.from({
  skills: [agent1, agent2],
  mode: ProcessMode.sequential,
});
```

**并行 TeamAgent**
```typescript
import { TeamAgent, ProcessMode } from "./team-agent";
import { Agent } from "./agent";

const agentA = new Agent({ /* ... */ });
const agentB = new Agent({ /* ... */ });

const parallelTeam = TeamAgent.from({
  skills: [agentA, agentB],
  mode: ProcessMode.parallel,
});
```