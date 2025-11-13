# 工作流反思

是否想过如何创建一个能够自我纠错的 AI 工作流？本指南将演示如何构建一个自我完善的系统，其中一个 AI Agent 生成内容，另一个 Agent 审查并优化内容，从而形成一个持续改进的反馈循环。您将学习如何设置一个“编码员”和“审查员” Agent 团队，它们协同工作以产生精良的最终输出。

## 概览

工作流反思模式涉及一个为迭代优化而设计的多 Agent 系统。在本示例中，我们创建了一个包含两个不同 Agent 的工作流：

*   **编码员 Agent (Coder Agent)**：负责根据用户请求生成初始解决方案（例如，编写一段代码）。
*   **审查员 Agent (Reviewer Agent)**：根据特定标准（例如，正确性、效率、安全性）评估编码员的输出。

该工作流遵循一个结构化的循环：

1.  用户提供一个初始想法或问题。
2.  `Coder` Agent 接收想法并生成一个解决方案。
3.  `Reviewer` Agent 检查该解决方案。
4.  如果解决方案被批准，它将被发送到最终输出。
5.  如果解决方案被拒绝，`Reviewer` 会提供反馈，并将请求发送回 `Coder` 进行修订。

这个循环过程会一直持续到 `Reviewer` 批准输出为止，从而确保高质量的结果。

```d2
direction: down

User: {
  shape: c4-person
}

Coder-Agent: {
  label: "编码员 Agent"
  shape: rectangle
}

Reviewer-Agent: {
  label: "审查员 Agent"
  shape: rectangle
}

Decision: {
  label: "已批准？"
  shape: diamond
}

Final-Output: {
  label: "最终输出"
  shape: rectangle
}

User -> Coder-Agent: "1. 提供想法"
Coder-Agent -> Reviewer-Agent: "2. 生成解决方案"
Reviewer-Agent -> Decision: "3. 检查解决方案"
Decision -> Final-Output: "4. 是"
Decision -> Coder-Agent: "5. 否，提供反馈"
```

## 快速入门

您可以使用 `npx` 直接运行此示例，无需任何本地安装。

### 运行示例

在您的终端中执行以下命令。

*   **单次模式 (One-Shot Mode)**：Agent 处理单个输入后终止。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-reflection
    ```

*   **交互式聊天模式 (Interactive Chat Mode)**：与 Agent 团队开始一个连续的聊天会话。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-reflection --chat
    ```

*   **管道模式 (Pipeline Mode)**：直接从另一个命令通过管道传递输入。

    ```bash icon=lucide:terminal
    echo "Write a function to validate email addresses" | npx -y @aigne/example-workflow-reflection
    ```

### 连接到 AI 模型

AIGNE 框架需要连接到大语言模型 (LLM) 才能运行。您可以通过 AIGNE Hub 连接以获得托管体验，或直接配置第三方提供商。

例如，要使用 OpenAI，请设置 `OPENAI_API_KEY` 环境变量：

```bash 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

配置 API 密钥后，再次运行该示例。有关配置不同模型提供商的详细指南，请参阅[模型配置](./models-configuration.md)文档。

## 从源代码运行

对于希望检查或修改代码的开发者，请按照以下步骤从源代码仓库运行示例。

### 1. 克隆仓库

首先，将 AIGNE 框架仓库克隆到您的本地计算机。

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

导航到示例目录并使用 `pnpm` 安装所需的依赖项。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-reflection
pnpm install
```

### 3. 运行示例

执行启动脚本以运行工作流。

*   **单次模式（默认）**

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **交互式聊天模式**

    ```bash icon=lucide:terminal
    pnpm start -- --chat
    ```

## 代码实现

此示例的核心是一个 TypeScript 文件，它定义并编排了 `Coder` 和 `Reviewer` Agent。让我们来看看关键组件。

```typescript reflection-workflow.ts icon=logos:typescript
import { AIAgent, AIGNE, UserInputTopic, UserOutputTopic } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

// 1. 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定义编码员 Agent
const coder = AIAgent.from({
  subscribeTopic: [UserInputTopic, "rewrite_request"],
  publishTopic: "review_request",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the reviewer to improve your code.
Always put all finished code in a single Markdown code block.
For example:
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

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
});

// 3. 定义审查员 Agent
const reviewer = AIAgent.from({
  subscribeTopic: "review_request",
  publishTopic: (output) =>
    output.approval ? UserOutputTopic : "rewrite_request",
  instructions: `\
You are a code reviewer. You focus on correctness, efficiency and safety of the code.

The problem statement is: {{question}}
The code is:
\`\`\`
{{code}}
\`\`\`

Previous feedback:
{{feedback}}

Please review the code. If previous feedback was provided, see if it was addressed.
`,
  outputSchema: z.object({
    approval: z.boolean().describe("APPROVE or REVISE"),
    feedback: z.object({
      correctness: z.string().describe("Your comments on correctness"),
      efficiency: z.string().describe("Your comments on efficiency"),
      safety: z.string().describe("Your comments on safety"),
      suggested_changes: z
        .string()
        .describe("Your comments on suggested changes"),
    }),
  }),
  includeInputInOutput: true,
});

// 4. 初始化并运行 AIGNE 实例
const aigne = new AIGNE({ model, agents: [coder, reviewer] });
aigne.publish(
  UserInputTopic,
  "Write a function to find the sum of all even numbers in a list.",
);

const { message } = await aigne.subscribe(UserOutputTopic);
console.log(message);
```

### 说明

1.  **初始化模型**：创建一个 `OpenAIChatModel` 实例，作为两个 Agent 的底层 LLM。
2.  **定义编码员 Agent**：
    *   `subscribeTopic`：监听初始用户输入 (`UserInputTopic`) 和来自审查员的修订请求 (`rewrite_request`)。
    *   `publishTopic`：将其生成的代码发送到 `review_request` 主题，供审查员接收。
    *   `instructions`：一个详细的提示，定义了其角色、输出格式以及如何处理反馈。
    *   `outputSchema`：使用 Zod 模式强制要求输出必须包含一个 `code` 字符串。
3.  **定义审查员 Agent**：
    *   `subscribeTopic`：监听 `review_request` 主题上的代码提交。
    *   `publishTopic`：一个动态路由输出的函数。如果 `approval` 为 `true`，结果将发送到最终的 `UserOutputTopic`。否则，它将被发送回 `rewrite_request` 主题，供编码员修订。
    *   `instructions`：一个指导审查员如何评估代码的提示。
    *   `outputSchema`：一个 Zod 模式，要求包含一个布尔值 `approval` 字段和一个结构化的 `feedback` 对象。
4.  **运行工作流**：
    *   使用模型和两个 Agent 创建一个 `AIGNE` 实例。
    *   `aigne.publish()` 将初始问题陈述发送到 `UserInputTopic`，从而启动工作流。
    *   `aigne.subscribe()` 等待 `UserOutputTopic` 上的消息，这只会在审查员批准代码后发生。

### 示例输出

当脚本执行时，最终批准的输出将被记录到控制台：

```json
{
  "code": "def sum_of_even_numbers(numbers):\n    \"\"\"Function to calculate the sum of all even numbers in a list.\"\"\"\n    return sum(number for number in numbers if number % 2 == 0)",
  "approval": true,
  "feedback": {
    "correctness": "The function correctly calculates the sum of all even numbers in the given list. It properly checks for evenness using the modulus operator and sums the valid numbers.",
    "efficiency": "The implementation is efficient as it uses a generator expression which computes the sum in a single pass over the list. This minimizes memory usage as compared to creating an intermediate list of even numbers.",
    "safety": "The function does not contain any safety issues. However, it assumes that all elements in the input list are integers. It would be prudent to handle cases where the input contains non-integer values (e.g., None, strings, etc.).",
    "suggested_changes": "Consider adding type annotations to the function for better clarity and potential type checking, e.g. `def sum_of_even_numbers(numbers: list[int]) -> int:`. Also, include input validation to ensure 'numbers' is a list of integers."
  }
}
```

## 命令行选项

您可以使用以下命令行标志自定义执行：

| 参数 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `--chat` | 以交互式聊天模式运行。 | 已禁用 |
| `--model <provider[:model]>` | 要使用的 AI 模型，例如 'openai' 或 'openai:gpt-4o-mini'。 | `openai` |
| `--temperature <value>` | 模型生成的温度。 | 提供商默认值 |
| `--top-p <value>` | 模型生成的 Top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>` | 模型生成的“存在惩罚”值。 | 提供商默认值 |
| `--frequency-penalty <value>` | 模型生成的“频率惩罚”值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志级别（ERROR、WARN、INFO、DEBUG、TRACE）。 | `INFO` |
| `--input`, `-i <input>` | 直接通过命令行指定输入。 | 无 |

#### 用法示例

```bash 将日志级别设置为 DEBUG icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## 总结

本示例说明了工作流反思在构建健壮、自我纠正的 AI 系统中的强大作用。通过将生成和评估的角色分离到不同的 Agent 中，您可以创建一个反馈循环，从而显著提高最终输出的质量和可靠性。

要探索其他高级工作流模式，请参阅以下示例：

<x-cards data-columns="2">
  <x-card data-title="工作流编排" data-href="/examples/workflow-orchestration" data-icon="lucide:workflow">
  协调多个 Agent 在复杂的处理管道中协同工作。
  </x-card>
  <x-card data-title="工作流路由器" data-href="/examples/workflow-router" data-icon="lucide:git-fork">
  实现智能路由逻辑，将请求定向到适当的处理程序。
  </x-card>
</x-cards>