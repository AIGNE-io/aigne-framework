# 顺序工作流

本指南演示了如何构建一个按保证顺序执行任务的分步处理管道。你将学习如何将多个 Agent 链接在一起，其中一个 Agent 的输出成为下一个 Agent 的输入，从而创建一个可靠且可预测的工作流。

此示例非常适用于需要一系列转换或分析的流程，例如起草内容、对其进行优化，然后将其格式化以供发布。对于可以从同步任务执行中受益的工作流，请参阅[并发工作流](./examples-workflow-concurrency.md)示例。

## 概述

顺序工作流按预定义的顺序处理任务。每个步骤必须完成后才能开始下一个步骤，从而确保从输入到最终输出的有序进行。这种模式是构建复杂、多阶段 Agent 系统的基础。

```d2
direction: down

Input: {
  label: "输入\n(产品描述)"
  shape: oval
}

Sequential-Workflow: {
  label: "顺序工作流 (TeamAgent)"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Concept-Extractor: {
    label: "1. 概念提取器"
    shape: rectangle
  }

  Writer: {
    label: "2. 撰写器"
    shape: rectangle
  }

  Format-Proofread: {
    label: "3. 格式化与校对"
    shape: rectangle
  }
}

Output: {
  label: "最终输出\n(概念、草稿、内容)"
  shape: oval
}

Input -> Sequential-Workflow.Concept-Extractor
Sequential-Workflow.Concept-Extractor -> Sequential-Workflow.Writer: "输出：概念"
Sequential-Workflow.Writer -> Sequential-Workflow.Format-Proofread: "输出：草稿"
Sequential-Workflow.Format-Proofread -> Output: "输出：内容"
```

## 快速入门

你可以使用 `npx` 直接运行此示例，无需任何本地安装。

### 前提条件

- [Node.js](https://nodejs.org) (20.0 或更高版本)
- 来自受支持模型提供商的 API 密钥（例如 [OpenAI](https://platform.openai.com/api-keys)）

### 执行工作流

该示例可以在默认的一次性模式、交互式聊天模式下运行，也可以通过直接管道输入来运行。

1.  **一次性模式**：使用预定义的输入执行工作流一次。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-sequential
    ```

2.  **交互式聊天模式**：启动一个会话，你可以在其中提供连续输入。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-sequential --chat
    ```

3.  **管道输入**：处理从另一个命令通过管道传入的输入。

    ```sh icon=lucide:terminal
    echo "Create marketing content for our new AI-powered fitness app" | npx -y @aigne/example-workflow-sequential
    ```

### 连接到 AI 模型

要执行工作流，你必须连接到一个 AI 模型。首次运行时，系统将提示你选择一种连接方法。

- **AIGNE Hub (推荐)**：最简单的入门方式。新用户可获得免费代币。
- **自托管 AIGNE Hub**：连接到你自己的 AIGNE Hub 实例。
- **第三方提供商**：使用来自 OpenAI 等提供商的 API 密钥配置你的环境。

要直接使用 OpenAI，请设置以下环境变量：

```sh icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

## 工作原理

顺序工作流是使用配置了 `ProcessMode.sequential` 的 `TeamAgent` 构建的。这确保了在 `skills` 数组中列出的 Agent 会按照它们定义的顺序执行。

### 代码实现

核心逻辑涉及定义三个不同的 `AIAgent` 实例，并将它们在一个顺序的 `TeamAgent` 中进行编排。

```typescript sequential-workflow.ts icon=logos:typescript
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. 初始化模型
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. 定义序列中的第一个 Agent：概念提取器
const conceptExtractor = AIAgent.from({
  instructions: `\
你是一名市场分析师。根据产品描述，识别出：
- 关键特性
- 目标受众
- 独特的卖点

产品描述：
{{product}}`,
  outputKey: "concept",
});

// 3. 定义第二个 Agent：撰写器
const writer = AIAgent.from({
  instructions: `\
你是一名营销文案撰写人。根据描述特性、受众和独特卖点的一段文本，
撰写一篇引人注目的营销文案（约 150 字）。

产品描述：
{{product}}

以下是关于该产品的信息：
{{concept}}`, // 使用前一个 Agent 的输出
  outputKey: "draft",
});

// 4. 定义最后一个 Agent：格式化与校对
const formatProof = AIAgent.from({
  instructions: `\
你是一名编辑。根据草稿文案，纠正语法错误，提高清晰度，并确保语调一致。
输出最终润色后的文案。

产品描述：
{{product}}

以下是关于该产品的信息：
{{concept}}

草稿文案：
{{draft}}`, // 使用前面 Agent 的输出
  outputKey: "content",
});

// 5. 配置 AIGNE 实例和 TeamAgent
const aigne = new AIGNE({ model });

const teamAgent = TeamAgent.from({
  skills: [conceptExtractor, writer, formatProof],
  mode: ProcessMode.sequential, // 将执行模式设置为顺序执行
});

// 6. 调用工作流
const result = await aigne.invoke(teamAgent, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);
```

### 执行分析

1.  **模型初始化**：使用必要的 API 密钥配置一个 `OpenAIChatModel`。
2.  **Agent 定义**：
    *   `conceptExtractor`：接收初始的 `product` 描述并生成一个 `concept` 输出。
    *   `writer`：使用原始的 `product` 描述和上一步的 `concept` 来创建一个 `draft`。
    *   `formatProof`：接收之前所有的输出（`product`、`concept`、`draft`）来生成最终的 `content`。
3.  **团队配置**：创建一个 `TeamAgent`，其中包含按期望执行顺序排列的三个 Agent。指定 `ProcessMode.sequential` 来强制执行此顺序。
4.  **调用**：`aigne.invoke` 方法使用一个初始输入对象来启动工作流。框架会自动管理状态，将累积的输出传递给每个后续的 Agent。
5.  **输出**：最终结果是一个对象，其中包含序列中所有 Agent 的输出。

```json 输出示例
{
  "concept": "**Product Description: AIGNE - No-code Generative AI Apps Engine**\n\nAIGNE is a cutting-edge No-code Generative AI Apps Engine designed to empower users to seamlessly create ...",
  "draft": "Unlock the power of creation with AIGNE, the revolutionary No-code Generative AI Apps Engine! Whether you're a small business looking to streamline operations, an entrepreneur ...",
  "content": "Unlock the power of creation with AIGNE, the revolutionary No-Code Generative AI Apps Engine! Whether you are a small business aiming to streamline operations, an entrepreneur ..."
}
```

## 命令行选项

你可以使用以下参数自定义执行：

| Parameter                 | Description                                                                                              | Default            |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------ |
| `--chat`                  | 以交互式聊天模式运行。                                                                                   | 已禁用             |
| `--model <provider[:model]>` | 指定要使用的 AI 模型（例如，`openai` 或 `openai:gpt-4o-mini`）。                                          | `openai`           |
| `--temperature <value>`   | 设置模型生成的温度。                                                                                     | 提供商默认值       |
| `--top-p <value>`         | 设置 top-p 采样值。                                                                                      | 提供商默认值       |
| `--presence-penalty <value>`| 设置存在惩罚值。                                                                                         | 提供商默认值       |
| `--frequency-penalty <value>`| 设置频率惩罚值。                                                                                         | 提供商默认值       |
| `--log-level <level>`     | 设置日志级别（`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`）。                                                 | `INFO`             |
| `--input, -i <input>`     | 通过命令行直接指定输入。                                                                                 | 无                 |

### 用法示例

```sh icon=lucide:terminal
# 以聊天模式运行，并指定一个模型
npx @aigne/example-workflow-sequential --chat --model openai:gpt-4o-mini

# 将日志级别设置为 debug 以获取详细输出
npx @aigne/example-workflow-sequential --log-level DEBUG
```

## 总结

本示例演示了如何使用 AIGNE 框架配置和执行顺序工作流。通过定义一系列 Agent 并将它们以 `ProcessMode.sequential` 模式安排在 `TeamAgent` 中，你可以为复杂的多步骤任务构建稳健、有序的管道。

要进一步阅读有关 Agent 协作的内容，请探索以下主题：

<x-cards data-columns="2">
  <x-card data-title="Team Agent" data-href="/developer-guide/agents/team-agent" data-icon="lucide:users">
    了解更多关于以顺序、并行或自我修正模式编排多个 Agent 的信息。
  </x-card>
  <x-card data-title="工作流：并发" data-href="/examples/workflow-concurrency" data-icon="lucide:git-fork">
    了解如何并行运行 Agent，以优化可同时执行的任务的性能。
  </x-card>
</x-cards>