# Team Agent

可以将 `TeamAgent` 想象成您 AI 员工的项目经理。虽然像 [AIAgent](./core-agents-ai-agent.md) 这样的单个 Agent 非常适合处理特定任务，但有些问题过于复杂，单个 Agent 无法独立处理。这就是 `TeamAgent` 发挥作用的地方。

它负责协调一组专业的 Agent，为它们分配子任务并协调它们的行动以实现一个更大的目标。您可以使用不同类型的 Agent 组建一个团队，例如用 `AIAgent` 编写内容，用 `FunctionAgent` 执行计算，并让它们无缝地协同工作。

## 工作原理

`TeamAgent` 管理一个工作流。当它接收到一个任务时，会将输入传递给团队中的第一个 Agent。一个 Agent 的输出会成为下一个 Agent 的输入，这一过程遵循团队指定的**工作模式**。

您可以选择三种主要的工作模式来定义团队的协作方式。

### 1. 顺序模式

在 `sequential` 模式下，Agent 会按照预定义的顺序一个接一个地工作，就像流水线一样。第一个 Agent 的输出会作为输入传递给第二个 Agent，以此类推。这种模式非常适合于每个步骤都依赖于前一步的多步骤流程。

**用例：** 想象一下您想创建一篇博客文章。您可以设置一个顺序执行的团队，其中：
1.  **Agent 1 (研究员):** 收集有关特定主题的信息。
2.  **Agent 2 (写作者):** 利用研究结果撰写草稿。
3.  **Agent 3 (编辑):** 审查草稿的语法和风格。

```d2 Sequential Mode Flowchart
direction: down

Task-Input: "写一篇关于 AI 的博客文章"
Agent-1: "Researcher Agent"
Agent-2: "Writer Agent"
Agent-3: "Editor Agent"
Final-Output: "润色后的博客文章"

Task-Input -> Agent-1: "主题"
Agent-1 -> Agent-2: "研究数据"
Agent-2 -> Agent-3: "草稿"
Agent-3 -> Final-Output: "最终版本"
```

下面是您在代码中配置此模式的方法：

```typescript TeamAgent in Sequential Mode icon=logos:typescript
import { TeamAgent } from '@aigner/core';
import { researcherAgent, writerAgent, editorAgent } from './my-agents';

const blogCreationTeam = new TeamAgent({
  name: 'Blog Creation Team',
  agents: [researcherAgent, writerAgent, editorAgent],
  mode: 'sequential', // Agent 按顺序逐一运行
});
```

### 2. 并行模式

在 `parallel` 模式下，团队中的所有 Agent 都会接收到相同的初始输入并同时工作。它们的各自输出随后会被收集到一个组合结果中。这对于可以分解为互不依赖的独立子任务的任务非常有用。

**用例：** 假设您正在分析竞争对手。您可以创建一个并行团队，其中：
*   **Agent A:** 分析竞争对手 X 的网站。
*   **Agent B:** 分析竞争对手 Y 的社交媒体。
*   **Agent C:** 分析竞争对手 Z 的定价页面。

所有三个 Agent 会同时运行，它们的发现最终会被汇总在一起。

```d2 Parallel Mode Flowchart
direction: down

Task-Input: "分析竞争对手"

Team: {
  shape: rectangle
  style.stroke-dash: 4
  
  Agent-A: "分析竞争对手 X"
  Agent-B: "分析竞争对手 Y"
  Agent-C: "分析竞争对手 Z"
}

Combined-Output: "综合报告"

Task-Input -> Team
Team -> Combined-Output
```

配置此模式同样简单：

```typescript TeamAgent in Parallel Mode icon=logos:typescript
import { TeamAgent } from '@aigner/core';
import { agentA, agentB, agentC } from './my-agents';

const competitorAnalysisTeam = new TeamAgent({
  name: 'Competitor Analysis Team',
  agents: [agentA, agentB, agentC],
  mode: 'parallel', // 所有 Agent 同时运行
});
```

### 3. 迭代模式

在 `iterate` 模式下，Agent 团队会多次运行其工作流，形成一个反馈循环。最后一个 Agent 的最终输出会作为新的输入反馈给第一个 Agent，从而使团队在每个周期中都能优化其工作。您可以控制迭代的次数。

**用例：** 开发一个新的软件功能。工作流可以是：
1.  **Agent 1 (规划师):** 编写功能规格说明。
2.  **Agent 2 (开发者):** 根据规格说明编写代码。
3.  **Agent 3 (测试员):** 审查代码并提供反馈。

然后，反馈会被传回给规划师以开始下一次迭代，不断完善规格和代码，直到完美。

```d2 Iterate Mode Flowchart
direction: down

Agent-1: "Planner Agent"
Agent-2: "Developer Agent"
Agent-3: "Tester Agent"

Agent-1 -> Agent-2: "规格说明"
Agent-2 -> Agent-3: "代码"
Agent-3 -> Agent-1: "反馈"
```

此模式非常适合需要经过多个周期进行优化和改进的任务。

```typescript TeamAgent in Iterate Mode icon=logos:typescript
import { TeamAgent } from '@aigner/core';
import { plannerAgent, developerAgent, testerAgent } from './my-agents';

const featureDevelopmentTeam = new TeamAgent({
  name: 'Feature Development Team',
  agents: [plannerAgent, developerAgent, testerAgent],
  mode: 'iterate',
  iterations: 3, // 运行循环 3 次
});
```

## 创建 TeamAgent

要创建一个 `TeamAgent`，您需要提供一个 Agent 实例数组并指定一种工作模式。

### 参数

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="团队 Agent 的唯一名称。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="关于团队工作的简要描述。"></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="true">
    <x-field-desc markdown>一个将成为团队一部分的 Agent 实例数组。这些可以是 `AIAgent`、`FunctionAgent`，甚至是其他的 `TeamAgent` 实例。</x-field-desc>
  </x-field>
  <x-field data-name="mode" data-type="'sequential' | 'parallel' | 'iterate'" data-required="true" data-default="sequential">
    <x-field-desc markdown>团队的工作模式。决定 Agent 如何协作：`sequential` (一个接一个)，`parallel` (所有同时进行)，或 `iterate` (循环中)。</x-field-desc>
  </x-field>
  <x-field data-name="iterations" data-type="number" data-required="false" data-default="1">
    <x-field-desc markdown>为 `iterate` 模式指定循环次数。此参数在其他模式下被忽略。</x-field-desc>
  </x-field>
</x-field-group>

### 完整示例

这是一个设置和运行 `TeamAgent` 的完整示例。

```typescript Full TeamAgent Example icon=logos:typescript
import { AIAgent, FunctionAgent, TeamAgent, Aigne } from '@aigner/core';

// 1. 定义专门的 Agent
const researcher = new AIAgent({
  name: 'Researcher',
  description: '收集关于某个主题的事实和数据。',
  model: 'openai:gpt-4o',
  prompt: '你是一位世界级的研​​究员。请找出关于 {{input}} 的三个关键点。',
});

const writer = new AIAgent({
  name: 'Writer',
  description: '根据研究撰写一个简短的段落。',
  model: 'openai:gpt-4o',
  prompt: '根据这些要点写一个引人入胜的短段落：{{input}}。',
});

// 2. 创建团队
const contentTeam = new TeamAgent({
  name: 'Content Team',
  agents: [researcher, writer],
  mode: 'sequential',
});

// 3. 使用初始输入运行团队
async function runTeam() {
  const aigne = new Aigne();
  const result = await aigne.run(contentTeam, 'the future of renewable energy');
  console.log(result.content);
}

runTeam();
```

### 响应示例

```json Response
{
  "content": "可再生能源的未来取决于太阳能和风能技术的巨大进步，使其比以往任何时候都更高效、更经济。这一转变的关键在于下一代储能解决方案的发展，例如固态电池，它有望通过储存多余的电力以备在没有阳光或风力时使用，从而解决间歇性问题。此外，全球范围内推动去中心化智能电网的努力正使社区能够自行生产和管理清洁能源，从而增强了韧性并减少了对传统电力基础设施的依赖。"
}
```

## 总结

`TeamAgent` 是一个强大的工具，用于自动化复杂的多步骤工作流。通过组合不同的 Agent 并选择合适的工作模式，您可以构建能够应对远超单个 Agent 能力范围的复杂 AI 系统。

要了解有关团队构建模块的更多信息，请查阅以下文档：
*   [AIAgent](./core-agents-ai-agent.md)
*   [FunctionAgent](./core-agents-function-agent.md)