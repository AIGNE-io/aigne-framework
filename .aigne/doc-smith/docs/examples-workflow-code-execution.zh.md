# 工作流代码执行

执行由 AI 模型动态生成的代码会带来严峻的安全性和可靠性挑战。本指南提供了一个结构化的分步流程，用于使用 AIGNE 框架构建安全的的代码执行工作流。您将学习如何编排一个生成代码的 `Coder` Agent 和一个在隔离环境中执行代码的 `Sandbox` Agent。

## 概览

代码执行工作流旨在安全地处理需要动态代码生成和执行的任务。它采用了双 Agent 系统：

1.  **Coder Agent**：一个由 AI 驱动的 Agent，负责解释用户请求并编写必要的 JavaScript 代码来解决问题。
2.  **Sandbox Agent**：一个 `FunctionAgent`，它接收生成的代码并在受控环境中执行，然后返回结果。

这种关注点分离确保了 AI 的代码生成与直接执行相隔离，提供了一层安全保障。

### 逻辑流程

下图阐释了 Agent 之间的高层交互。`Coder` Agent 接收输入，生成代码，将其传递给 `Sandbox` 执行，然后格式化最终输出。

```d2
direction: down

User-Input: {
  label: "用户输入\n(例如, '计算 15!')"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  Coder-Agent: {
    label: "Coder Agent\n(AIAgent)"
    shape: rectangle
  }

  Sandbox-Agent: {
    label: "Sandbox Agent\n(FunctionAgent)"
    shape: rectangle
  }
}

Final-Output: {
  label: "最终输出"
  shape: rectangle
}

User-Input -> AIGNE-Framework.Coder-Agent: "1. 接收提示"
AIGNE-Framework.Coder-Agent -> AIGNE-Framework.Sandbox-Agent: "2. 生成 JS 代码并传递执行"
AIGNE-Framework.Sandbox-Agent -> AIGNE-Framework.Coder-Agent: "3. 执行代码并返回结果"
AIGNE-Framework.Coder-Agent -> Final-Output: "4. 格式化最终响应"

```

### 交互顺序

该序列图详细说明了用户与 Agent 之间针对特定任务（例如计算阶乘）的逐轮通信。


## 快速入门

您可以使用 `npx` 直接运行此示例，无需任何本地安装。

### 运行示例

该示例支持用于单个任务的单次执行模式和用于对话式工作流的交互式聊天模式。

#### 单次执行模式

这是默认模式。Agent 处理单个输入后退出。

```bash icon=lucude:terminal
npx -y @aigne/example-workflow-code-execution
```

您也可以通过标准输入管道直接提供输入。

```bash icon=lucude:terminal
echo 'Calculate 15!' | npx -y @aigne/example-workflow-code-execution
```

#### 交互式聊天模式

使用 `--interactive` 标志启动一个持久会话，您可以与 Agent 进行对话。

```bash icon=lucude:terminal
npx -y @aigne/example-workflow-code-execution --interactive
```

### 连接到 AI 模型

首次运行该示例时，它会提示您连接到一个大语言模型 (LLM)，因为 `Coder` Agent 需要它才能正常工作。


您有几个选项可以继续。

#### 选项 1：AIGNE Hub (推荐)

这是最简单的入门方式。官方 AIGNE Hub 为新用户提供免费额度。

1.  选择第一个选项：`Connect to the Arcblock official AIGNE Hub`。
2.  您的网络浏览器将打开一个授权页面。
3.  按照提示批准连接。


#### 选项 2：自托管 AIGNE Hub

如果您有自己的 AIGNE Hub 实例，您可以连接到它。

1.  选择第二个选项：`Connect to a self-hosted AIGNE Hub`。
2.  系统将提示您输入您的 AIGNE Hub 实例的 URL。


#### 选项 3：第三方模型提供商

您可以通过设置适当的环境变量直接连接到第三方模型提供商，如 OpenAI、Anthropic 或 Google Gemini。例如，要使用 OpenAI，请设置您的 API 密钥：

```bash icon=lucude:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

设置环境变量后，再次运行示例命令。有关所有支持的提供商及其所需环境变量的列表，请参阅示例 `.env.local.example` 文件。

### 使用 AIGNE Observe 进行调试

AIGNE 框架包含一个强大的可观察性工具，用于调试和分析 Agent 行为。

1.  **启动服务器**：在您的终端中，运行 `aigne observe` 命令。这将启动一个本地 Web 服务器。

    ```bash icon=lucude:terminal
    aigne observe
    ```

    
2.  **查看追踪**：打开您的 Web 浏览器并导航到提供的本地 URL (例如，`http://localhost:7893`)。该界面会显示最近的 Agent 执行列表，让您可以检查每个追踪的输入、输出、工具调用和性能指标。

    
## 本地安装和使用

出于开发目的，您可以克隆仓库并在本地运行示例。

### 先决条件

-   [Node.js](https://nodejs.org) (版本 20.0 或更高)
-   [pnpm](https://pnpm.io) 用于包管理

### 1. 克隆仓库

```bash icon=lucude:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

导航到示例目录并安装所需的包。

```bash icon=lucude:terminal
cd aigne-framework/examples/workflow-code-execution
pnpm install
```

### 3. 运行示例

使用 `pnpm start` 命令执行工作流。

```bash icon=lucude:terminal
# 以单次执行模式运行 (默认)
pnpm start

# 以交互式聊天模式运行
pnpm start -- --interactive

# 使用管道输入
echo "Calculate 15!" | pnpm start
```

### 命令行选项

该脚本接受多个命令行参数以自定义其行为。

| 参数 | 描述 | 默认值 |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `--interactive` | 以交互式聊天模式运行。 | 禁用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型，例如 `openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度。 | 提供商默认值 |
| `--top-p <value>` | 设置 top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>`| 设置存在惩罚值。 | 提供商默认值 |
| `--frequency-penalty <value>`| 设置频率惩罚值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志级别 (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`)。 | `INFO` |
| `--input`, `-i <input>` | 直接作为参数提供输入。 | 无 |

#### 用法示例

此命令以 `DEBUG` 日志级别在交互模式下运行工作流。

```bash icon=lucude:terminal
pnpm start -- --interactive --log-level DEBUG
```

## 代码实现

以下 TypeScript 代码演示了如何构建代码执行工作流。它定义了 `sandbox` 和 `coder` Agent，并使用 AIGNE 实例调用它们。

```typescript index.ts icon=logos:typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

// 从环境变量中检索 OpenAI API 密钥。
const { OPENAI_API_KEY } = process.env;

// 1. 初始化聊天模型
// 此模型将为 AI Agent 提供支持。
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定义 Sandbox Agent
// 此 Agent 使用 FunctionAgent 安全地执行 JavaScript 代码。
const sandbox = FunctionAgent.from({
  name: "evaluateJs",
  description: "一个用于运行 javascript 代码的 js 沙盒",
  inputSchema: z.object({
    code: z.string().describe("要运行的代码"),
  }),
  process: async (input: { code: string }) => {
    const { code } = input;
    // eval 的使用被隔离在此沙盒化的 Agent 中。
    // biome-ignore lint/security/noGlobalEval: <这是示例的一个受控沙盒环境>
    const result = eval(code);
    return { result };
  },
});

// 3. 定义 Coder Agent
// 此 AI Agent 被指示编写代码并使用沙盒技能。
const coder = AIAgent.from({
  name: "coder",
  instructions: `\
你是一名熟练的程序员。你编写代码来解决问题。
与沙盒协作以执行你的代码。
`,
  skills: [sandbox],
});

// 4. 初始化 AIGNE 框架
const aigne = new AIGNE({ model });

// 5. 调用工作流
// AIGNE 实例使用用户的提示运行 Coder Agent。
const result = await aigne.invoke(coder, "10! = ?");

console.log(result);
// 预期输出:
// {
//   $message: "The value of \\(10!\\) (10 factorial) is 3,628,800.",
// }
```

## 总结

本指南演示了如何使用 AIGNE 框架构建和运行一个安全的代码执行工作流。通过将代码生成和执行的关注点分离到不同的 `AIAgent` 和 `FunctionAgent` 角色中，您可以安全地利用 LLM 的强大功能来完成需要动态代码的任务。

要了解更高级的工作流模式，请浏览以下示例：

<x-cards data-columns="2">
  <x-card data-title="顺序工作流" data-href="/examples/workflow-sequential" data-icon="lucide:arrow-right-circle">构建具有保证执行顺序的逐步处理管道。</x-card>
  <x-card data-title="工作流编排" data-href="/examples/workflow-orchestration" data-icon="lucide:milestone">协调多个 Agent 在复杂的处理管道中协同工作。</x-card>
</x-cards>
