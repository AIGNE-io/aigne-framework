# 工作流反思

反思工作流模式能够实现 Agent 输出的自我改进和迭代优化。在此模式中，系统会先生成一个初始输出，然后将其传递给一个独立的 `reviewer` Agent 进行评估。如果输出不符合要求标准，系统会将其连同反馈一起发回，以进行新一轮迭代。此循环将持续进行，直到输出被批准或达到最大迭代次数为止。

该模式对于需要高质量、经验证的输出的场景尤其有效，例如：
- **代码生成与审查**：一个编码员 Agent 编写代码，一个审查员 Agent 检查其正确性、效率和安全性。
- **内容质量控制**：一个编写员 Agent 生成内容，一个编辑员 Agent 检查其风格、语法和准确性。
- **自我修正系统**：Agent 可以从反馈中学习，并迭代地提升其在特定任务上的表现。

## 工作原理

反思过程遵循一个循环：一个或多个 Agent 生成解决方案，然后由一个审查员 Agent 提供反馈。最初的 Agent 会利用这些反馈来优化下一次尝试。

# 工作流反思

反思工作流模式能够实现 Agent 输出的自我改进和迭代优化。在此模式中，系统会先生成一个初始输出，然后将其传递给一个独立的 `reviewer` Agent 进行评估。如果输出不符合要求标准，系统会将其连同反馈一起发回，以进行新一轮迭代。此循环将持续进行，直到输出被批准或达到最大迭代次数为止。

该模式对于需要高质量、经验证的输出的场景尤其有效，例如：
- **代码生成与审查**：一个编码员 Agent 编写代码，一个审查员 Agent 检查其正确性、效率和安全性。
- **内容质量控制**：一个编写员 Agent 生成内容，一个编辑员 Agent 检查其风格、语法和准确性。
- **自我修正系统**：Agent 可以从反馈中学习，并迭代地提升其在特定任务上的表现。

## 工作原理

反思过程遵循一个循环：一个或多个 Agent 生成解决方案，然后由一个审查员 Agent 提供反馈。最初的 Agent 会利用这些反馈来优化下一次尝试。

```d2
direction: down

start: { 
  label: "开始"
  shape: oval 
}

generator: {
  label: "生成器 Agent\n生成初始输出"
  shape: rectangle
}

reviewer: {
  label: "审查员 Agent\n评估输出"
  shape: rectangle
}

decision: {
  label: "输出是否\n符合标准？"
  shape: diamond
}

end: {
  label: "结束\n（已批准的输出）"
  shape: oval
}

start -> generator
generator -> reviewer: "提交审查"
reviewer -> decision
decision -> end: "是"
decision -> generator: "否（提供反馈）"
```

## 配置

要启用反思模式，您需要在 `TeamAgentOptions` 中配置 `reflection` 属性。该属性接受一个 `ReflectionMode` 对象，用于定义审查和批准流程。

**ReflectionMode 参数**

<x-field-group>
  <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="负责审查输出并提供反馈的 Agent。"></x-field>
  <x-field data-name="isApproved" data-type="((output: Message) => PromiseOrValue<boolean | unknown>) | string" data-required="true" data-desc="一个函数或审查员输出中的字段名，用于确定结果是否被批准。如果是一个函数，它会接收审查员的输出，并应返回一个真值表示批准。如果是一个字符串，则会检查输出中相应字段的真值。"></x-field>
  <x-field data-name="maxIterations" data-type="number" data-required="false" data-default="3" data-desc="在流程终止前，审查-反馈循环的最大次数。这可以防止无限循环。"></x-field>
  <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-required="false" data-default="false" data-desc="如果设置为 `true`，当达到 `maxIterations` 时，工作流将返回最后一次生成的输出，即使该输出未被批准。如果为 `false`，则会抛出错误。"></x-field>
</x-field-group>

## 示例：代码生成与审查

本示例演示了一个反思工作流，其中 `coder` Agent 负责编写一个 Python 函数，而 `reviewer` Agent 则负责对其进行评估。该过程将持续进行，直到 `reviewer` 批准代码为止。

### 1. 定义 Coder Agent

`coder` Agent 负责根据用户请求编写初始代码。它被设计为能够接收来自审查员的反馈，以便在后续迭代中改进其解决方案。

```typescript
import { TeamAgent, AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const coder = AIAgent.from({
  name: "Coder",
  instructions: `
You are a proficient coder. You write Python code to solve problems.
Work with the reviewer to improve your code.
Always put all finished code in a single Markdown code block.

Respond using the following format:
Thoughts: <Your comments>
Code: <Your code>

Previous review result:
{{feedback}}

User's question:
{{question}}
`,
  outputSchema: z.object({
    code: z.string().describe("Your code"),
  }),
  inputKey: "question",
});
```

### 2. 定义 Reviewer Agent

`reviewer` Agent 负责评估由 `coder` 生成的代码。它会检查代码的正确性、效率和安全性，并提供结构化的反馈。其输出包含一个布尔值字段 `approval`，用于控制反思循环。

```typescript
const reviewer = AIAgent.from({
  name: "Reviewer",
  instructions: `
You are a code reviewer. You focus on correctness, efficiency and safety of the code.

The problem statement is: {{question}}
The code is:
\`\`\`
{{code}}
\`\`\`

Please review the code. If previous feedback was provided, see if it was addressed.
`,
  outputSchema: z.object({
    approval: z.boolean().describe("Set to true to APPROVE or false to REVISE"),
    feedback: z.object({
      correctness: z.string().describe("Your comments on correctness"),
      efficiency: z.string().describe("Your comments on efficiency"),
      safety: z.string().describe("Your comments on safety"),
      suggested_changes: z
        .string()
        .describe("Your comments on suggested changes"),
    }),
  }),
});
```

### 3. 创建并调用 TeamAgent

配置一个 `TeamAgent` 来编排此工作流。将 `coder` 设置为主 Agent（技能），并在 `reflection` 属性中配置 `reviewer`。`isApproved` 条件指向 `reviewer` 输出中的 `approval` 字段。

```typescript
const reflectionTeam = TeamAgent.from({
  skills: [coder],
  reflection: {
    reviewer,
    isApproved: "approval",
    maxIterations: 3,
  },
});

async function run() {
  const result = await reflectionTeam.invoke(
    {
      question: "Write a function to find the sum of all even numbers in a list.",
    },
    { model }
  );
  
  console.log(JSON.stringify(result, null, 2));
}

run();
```

### 示例输出

经过一次或多次迭代后，`reviewer` Agent 会批准代码，并返回 `coder` Agent 的最终输出。

```json
{
  "code": "def sum_of_even_numbers(numbers):\n    \"\"\"Function to calculate the sum of all even numbers in a list.\"\"\"\n    return sum(number for number in numbers if number % 2 == 0)"
}
```