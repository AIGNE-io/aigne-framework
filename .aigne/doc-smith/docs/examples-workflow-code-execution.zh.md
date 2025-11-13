# 工作流代码执行

本文档提供了一个技术演练，用于构建一个安全的、由 AI 驱动的工作流，该工作流能够动态生成和执行代码。读完本文后，您将了解如何编排一个编写 JavaScript 来解决问题的“Coder” Agent 和一个安全运行代码的“Sandbox” Agent，从而实现复杂的自动化问题解决。

## 概述

在许多高级 AI 应用中，需要解决的问题所要求的计算或逻辑超出了标准语言模型的能力范围。本示例实现了一种常见且强大的模式：使用一个 AI Agent 编写代码，并使用另一个隔离的 Agent 来执行代码。这种方法使得系统能够动态执行复杂的计算、数据操作和其他编程任务。

该工作流包含两个主要的 Agent：
*   **Coder Agent**：一个 `AIAgent`，负责理解用户请求并编写 JavaScript 代码来完成请求。
*   **Sandbox Agent**：一个 `FunctionAgent`，封装了一个 JavaScript 评估环境。它从 Coder Agent 接收代码，执行代码，并返回结果。这隔离了代码执行，防止其影响主应用程序。

这种关注点分离确保了安全性和模块化。下图展示了高层数据流。

```d2
direction: down

User: {
  shape: c4-person
}

Workflow: {
  label: "AI 工作流"
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

User -> Workflow.Coder-Agent: "1. 问题请求\n（例如，'计算 10!'）"
Workflow.Coder-Agent -> Workflow.Sandbox-Agent: "2. 生成并执行 JS\n（例如，'evaluateJs({ code: ... })'）"
Workflow.Sandbox-Agent -> Workflow.Coder-Agent: "3. 返回结果\n（例如，3628800）"
Workflow.Coder-Agent -> User: "4. 最终答案\n（例如，'10! 是 3628800'）"

```

以下序列图详细说明了用户与 Agent 之间针对一个示例请求的交互过程。

DIAGRAM_PLACEHOLDER

## 前提条件

在继续之前，请确保您的开发环境满足以下要求：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：随 Node.js 一同安装。
*   **OpenAI API 密钥**：Coder Agent 与 AI 模型交互时需要。您可以从 [OpenAI Platform](https://platform.openai.com/api-keys) 获取密钥。

## 快速入门

您可以使用 `npx` 直接从命令行运行此示例，无需本地安装。

### 运行示例

在您的终端中执行以下命令之一：

*   **单次模式**：Agent 处理单个输入后退出。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-code-execution
    ```

*   **交互式聊天模式**：与 Agent 启动一个持续的聊天会话。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-code-execution --chat
    ```

*   **管道模式**：通过管道从另一个命令输入。

    ```bash icon=lucide:terminal
    echo 'Calculate 15!' | npx -y @aigne/example-workflow-code-execution
    ```

### 连接到 AI 模型

首次运行示例时，系统将提示您连接到一个 AI 模型提供商。

![连接到模型提供商](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/workflow-code-execution/run-example.png)

您有以下几种选择：

1.  **AIGNE Hub (官方)**：最简单的入门方式。它为新用户提供免费额度。

    ![连接到官方 AIGNE Hub](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-aigne-hub.png)

2.  **AIGNE Hub (自托管)**：连接到您自己的 AIGNE Hub 实例。

    ![连接到自托管的 AIGNE Hub](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **第三方模型提供商**：配置直接连接到 OpenAI、DeepSeek 或 Google Gemini 等提供商。为此，请将相应的 API 密钥设置为环境变量。对于 OpenAI，请使用：

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

    设置环境变量后，再次运行示例。

## 完整安装和使用

如需开发或修改此示例，请克隆仓库并在本地安装依赖项。

### 1. 克隆仓库

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

导航到示例目录并使用 `pnpm` 安装必要的包。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-code-execution
pnpm install
```

### 3. 运行示例

使用 `pnpm start` 命令运行工作流。

*   **单次模式**：

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **交互式聊天模式**：

    ```bash icon=lucide:terminal
    pnpm start -- --chat
    ```

*   **管道模式**：

    ```bash icon=lucide:terminal
    echo "Calculate 15!" | pnpm start
    ```

### 命令行选项

该示例支持多个命令行参数来自定义其行为。

| 参数 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `--chat` | 以交互式聊天模式运行。 | 禁用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型（例如 `openai` 或 `openai:gpt-4o-mini`）。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度。 | 提供商默认值 |
| `--top-p <value>` | 设置 top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>` | 设置存在惩罚值。 | 提供商默认值 |
| `--frequency-penalty <value>` | 设置频率惩罚值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志级别（`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`）。 | `INFO` |
| `--input`, `-i <input>` | 直接以参数形式提供输入。 | 无 |

## 代码实现

以下 TypeScript 代码概述了代码执行工作流的核心逻辑。它定义了 `sandbox` 和 `coder` Agent，并调用它们来解决问题。

```typescript code-execution.ts icon=logos:typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

// 确保 OpenAI API 密钥在环境变量中可用。
const { OPENAI_API_KEY } = process.env;

// 1. 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 创建 Sandbox Agent
// 此 Agent 使用 FunctionAgent 安全地执行 JavaScript 代码。
const sandbox = FunctionAgent.from({
  name: "evaluateJs",
  description: "一个用于运行 JavaScript 代码的 JS 沙盒",
  inputSchema: z.object({
    code: z.string().describe("要运行的代码"),
  }),
  process: async (input: { code: string }) => {
    const { code } = input;
    // eval 的使用被隔离在此沙盒 Agent 中。
    // biome-ignore lint/security/noGlobalEval: This is an intentional use for a sandboxed environment.
    const result = eval(code);
    return { result };
  },
});

// 3. 创建 Coder Agent
// 此 AI Agent 被指示使用沙盒技能编写和执行代码。
const coder = AIAgent.from({
  name: "coder",
  instructions: `\
你是一名熟练的程序员。你通过编写代码来解决问题。
与沙盒协作以执行你的代码。
`,
  skills: [sandbox],
});

// 4. 初始化 AIGNE 框架
const aigne = new AIGNE({ model });

// 5. 调用工作流
const result = await aigne.invoke(coder, "10! = ?");
console.log(result);
```

预期的输出是一个 JSON 对象，其中包含来自 Agent 的最终消息：

```json
{
  "$message": "The value of \\(10!\\) (10 factorial) is 3,628,800."
}
```

## 调试

您可以使用 AIGNE 观察器工具来监控和分析 Agent 的执行情况。它提供了一个基于 Web 的界面，用于检查跟踪、查看详细调用，并了解 Agent 在运行时的行为。

首先，在另一个终端中启动观察服务器：

```bash icon=lucide:terminal
aigne observe
```

运行您的工作流后，您可以在观察器 UI 中查看执行跟踪。

![AIGNE Observe 执行](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-execute.png)

UI 提供了最近执行的列表，以供详细检查。

![AIGNE Observe 列表](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-list.png)