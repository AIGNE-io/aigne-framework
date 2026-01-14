# 工作流切换

本指南演示了如何构建一个工作流，其中一个 Agent 可以将控制权无缝切换给另一个专门的 Agent。读完本指南后，您将理解如何创建多 Agent 系统，该系统能根据用户输入委派任务，从而实现更复杂、更动态的问题解决。

## 概述

在许多复杂的 AI 应用中，单个 Agent 可能不具备处理各种任务所需的所有技能。工作流切换模式通过允许一个主 Agent 充当调度器，在满足特定触发器或条件时将控制权转移给专门的 Agent，从而解决了这个问题。这创造了无缝的过渡，使得不同的 Agent 能够协作解决复杂问题。

本示例实现了一个简单的切换：
*   **Agent A：** 一个通用 Agent。
*   **Agent B：** 一个只用俳句交流的专门 Agent。

当用户指示 Agent A“切换到 Agent B”时，系统会将后续所有交互无缝切换给 Agent B。

```d2
shape: sequence_diagram

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
}

Agent-A: {
  label: "Agent A\n（通用）"
}

Agent-B: {
  label: "Agent B\n（俳句专家）"
}

User -> AIGNE-Framework: "1. '切换到 agent b'"
AIGNE-Framework -> Agent-A: "2. 使用输入调用"
Agent-A -> Agent-A: "3. 执行技能：transfer_to_b()"
Agent-A -> AIGNE-Framework: "4. 返回 Agent B 对象"
AIGNE-Framework -> AIGNE-Framework: "5. 切换：用 B 替换 Agent A"
AIGNE-Framework -> Agent-B: "6. 调用 Agent B 获取响应"
Agent-B -> AIGNE-Framework: "7. 生成俳句响应"
AIGNE-Framework -> User: "8. 显示 Agent B 的响应"

User -> AIGNE-Framework: "9. '今天天气真好'"
AIGNE-Framework -> Agent-B: "10. 使用新输入调用"
Agent-B -> AIGNE-Framework: "11. 生成另一首俳句"
AIGNE-Framework -> User: "12. 显示 Agent B 的响应"
```

## 前置条件

在运行示例之前，请确保您的开发环境满足以下要求：

*   **Node.js：** 20.0 或更高版本。
*   **npm：** Node.js 自带。
*   **AI 模型提供商账户：** 需要一个来自 OpenAI 等提供商的 API 密钥来驱动 Agent。

## 快速开始

您可以使用 `npx` 直接运行此示例，无需克隆代码仓库。

### 步骤 1：运行示例

打开您的终端并执行以下命令之一。`--interactive` 标志会启用一个交互式会话，您可以在其中进行连续对话。

```bash 以单次模式运行 icon=lucide:terminal
npx -y @aigne/example-workflow-handoff
```

```bash 以交互式聊天模式运行 icon=lucide:terminal
npx -y @aigne/example-workflow-handoff --interactive
```

您也可以直接将输入通过管道传递给命令：

```bash 使用管道输入 icon=lucide:terminal
echo "transfer to agent b" | npx -y @aigne/example-workflow-handoff
```

### 步骤 2：连接到 AI 模型

如果您是第一次运行该示例，系统会提示您连接到一个 AI 模型，因为尚未配置任何 API 密钥。

![run example](../../../examples/workflow-handoff/run-example.png)

您有以下几种选择：

1.  **连接到 AIGNE Hub（推荐）**
    这是最简单的入门方式。官方 AIGNE Hub 为新用户提供免费额度。选择第一个选项，您的浏览器将打开一个页面以授权连接。

    ![connect to official aigne hub](../../../examples/images/connect-to-aigne-hub.png)

2.  **连接到自托管的 AIGNE Hub**
    如果您有自己的 AIGNE Hub 实例，请选择第二个选项并输入其 URL 进行连接。

    ![connect to self hosted aigne hub](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **配置第三方模型提供商**
    您可以直接连接到 OpenAI、DeepSeek 或 Google Gemini 等提供商，只需设置相应的环境变量即可。例如，要使用 OpenAI，请在终端中设置您的 API 密钥：

    ```bash 配置 OpenAI API 密钥 icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    配置环境变量后，再次运行 `npx` 命令。

## 代码深度解析

本示例的核心是一个充当第一个 Agent“技能”的函数。当模型根据用户输入判断应使用此技能时，该函数会返回一个新的 Agent，从而有效地转移控制权。

### 工作原理

1.  **Agent A（调度器）：** 该 Agent 配置了 `transfer_to_b` 技能。其指令是通用的。
2.  **Agent B（专家）：** 该 Agent 有一个非常具体的指令：“只用俳句说话。” 它没有特殊技能。
3.  **切换机制：** `transfer_to_b` 函数简单地返回 `agentB` 对象。当 AIGNE 框架收到一个 Agent 对象作为技能执行结果时，它会将会话中的当前 Agent 替换为新的 Agent。

### 示例实现

以下代码演示了如何定义两个 Agent 并实现切换逻辑。

```typescript index.ts icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 1. 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定义执行切换的技能
function transfer_to_b() {
  return agentB;
}

// 3. 定义带有切换技能的 Agent A
const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "你是一个乐于助人的 Agent。",
  outputKey: "A",
  skills: [transfer_to_b],
});

// 4. 定义专家 Agent B
const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "只用俳句说话。",
  outputKey: "B",
});

// 5. 初始化 AIGNE 运行时
const aigne = new AIGNE({ model });

// 6. 使用 Agent A 启动会话
const userAgent = aigne.invoke(agentA);

// 7. 第一次调用：触发切换
const result1 = await userAgent.invoke("transfer to agent b");
console.log(result1);
// 预期输出：
// {
//   B: "切换现已完成， \nAgent B 在此帮助。 \n朋友，你需要什么？",
// }

// 8. 第二次调用：现在与 Agent B 对话
const result2 = await userAgent.invoke("It's a beautiful day");
console.log(result2);
// 预期输出：
// {
//   B: "阳光温暖大地， \n微风轻声低语， \n自然欢歌喜悦。",
// }
```

## 从源码运行（可选）

如果您希望在本地修改或检查代码，请按照以下步骤操作。

### 1. 克隆代码仓库

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

导航到示例目录并使用 `pnpm` 安装必要的软件包。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-handoff
pnpm install
```

### 3. 运行示例

使用 `pnpm start` 命令。要传递像 `--interactive` 这样的额外参数，请在它们前面添加一个额外的 `--`。

```bash 以单次模式运行 icon=lucide:terminal
pnpm start
```

```bash 以交互式聊天模式运行 icon=lucide:terminal
pnpm start -- --interactive
```

## 命令行选项

该示例脚本接受多个命令行参数以自定义其行为。

| 参数 | 描述 | 默认值 |
|-----------|-------------|---------|
| `--interactive` | 以交互式聊天模式运行。 | 禁用 |
| `--model <provider[:model]>` | 要使用的 AI 模型（例如，`openai` 或 `openai:gpt-4o-mini`）。 | `openai` |
| `--temperature <value>` | 模型生成的温度值。 | 提供商默认值 |
| `--top-p <value>` | Top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>` | 存在惩罚值。 | 提供商默认值 |
| `--frequency-penalty <value>` | 频率惩罚值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志级别（ERROR、WARN、INFO、DEBUG、TRACE）。 | INFO |
| `--input`, `-i <input>` | 直接通过命令行指定输入。 | 无 |

## 调试与观察

要检查 Agent 的执行流程，您可以使用 `aigne observe` 命令。该工具会启动一个本地 Web 服务器，提供对追踪、调用和其他运行时数据的详细视图，这对于调试非常有价值。

首先，在另一个终端中启动观察服务器：

```bash 启动观察服务器 icon=lucide:terminal
aigne observe
```

![aigne-observe-execute](../../../examples/images/aigne-observe-execute.png)

运行示例后，您可以在 Web 界面中查看执行追踪，该界面通常位于 `http://localhost:7893`。

![aigne-observe-list](../../../examples/images/aigne-observe-list.png)

## 总结

您现在已经学会了如何实现工作流切换，这是一种构建多 Agent 系统的强大模式，可以将任务委派给专门的 Agent。这种方法允许您通过组合具有不同技能的 Agent 来构建更强大、更有能力的 AI 应用。

要探索更高级的 Agent 编排，请查看这些相关示例：

<x-cards data-columns="2">
  <x-card data-title="工作流编排" data-icon="lucide:milestone" data-href="/examples/workflow-orchestration">协调多个 Agent 在复杂的处理管道中协同工作。</x-card>
  <x-card data-title="工作流路由器" data-icon="lucide:git-fork" data-href="/examples/workflow-router">实现智能路由逻辑，根据内容将请求定向到适当的处理程序。</x-card>
</x-cards>
