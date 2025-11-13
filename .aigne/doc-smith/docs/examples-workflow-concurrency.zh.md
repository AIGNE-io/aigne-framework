# 工作流并发

您是否希望加快 AI 工作流的速度？本指南将演示如何使用 AIGNE 框架构建并发工作流，使您能够并行处理多个任务。您将学习如何配置 `TeamAgent` 以同时执行不同的分析并高效地合并结果。

## 概述

在许多现实场景中，一个复杂的问题可以被分解为更小的、独立的子任务。这些任务可以并发执行以节省时间，而不是按顺序处理。本示例演示了一种常见的并发模式，其中单个输入（产品描述）由不同的 Agent 从多个角度进行分析。然后，它们的各自输出被聚合成一个最终的、全面的结果。

该工作流的结构如下：

```d2
direction: down

Input: {
  label: "输入\n(产品描述)"
  shape: oval
}

TeamAgent: {
  label: "并行处理 (TeamAgent)"
  shape: rectangle

  Feature-Extractor: {
    label: "特征提取器"
    shape: rectangle
  }

  Audience-Analyzer: {
    label: "受众分析器"
    shape: rectangle
  }
}

Aggregation: {
  label: "聚合"
  shape: diamond
}

Output: {
  label: "输出\n({ features, audience })"
  shape: oval
}

Input -> TeamAgent.Feature-Extractor
Input -> TeamAgent.Audience-Analyzer
TeamAgent.Feature-Extractor -> Aggregation: "features"
TeamAgent.Audience-Analyzer -> Aggregation: "audience"
Aggregation -> Output
```

-   **输入**：向工作流提供一个产品描述。
-   **并行处理**：
    -   一个 `Feature Extractor` Agent 分析描述以识别关键产品特性。
    -   一个 `Audience Analyzer` Agent 同时分析相同的描述以确定目标受众。
-   **聚合**：收集来自两个 Agent 的输出（`features` 和 `audience`）。
-   **输出**：返回一个包含提取的特性和受众分析的单一结构化对象。

本示例支持用于单个输入的一次性执行模式和用于对话式分析的交互式聊天模式。

## 前置要求

在运行此示例之前，请确保您的系统满足以下要求：

-   [Node.js](https://nodejs.org) (版本 20.0 或更高)。
-   一个 [OpenAI API 密钥](https://platform.openai.com/api-keys)。

## 快速开始

您可以使用 `npx` 直接从命令行运行此示例，而无需克隆代码仓库。

### 运行示例

在您的终端中执行以下命令之一。

要在默认的一次性模式下运行：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-workflow-concurrency
```

要在交互式聊天会话中运行：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-workflow-concurrency --chat
```

要通过管道提供输入：
```bash npx command icon=lucide:terminal
echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | npx -y @aigne/example-workflow-concurrency
```

### 连接到 AI 模型

首次运行该示例时，系统将提示您连接到一个 AI 模型提供商。

![连接到模型提供商](/media/examples/workflow-concurrency/run-example.png)

您有以下几种连接选项：

1.  **AIGNE Hub (官方)**：推荐给新用户的选项。它提供免费的 token 供您入门。
2.  **AIGNE Hub (自托管)**：适用于运行自己 AIGNE Hub 实例的用户。
3.  **第三方模型提供商**：您可以通过设置所需 API 密钥作为环境变量，直接连接到像 OpenAI 这样的提供商。

例如，要直接使用 OpenAI：
```bash 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```
配置环境变量后，再次运行 `npx` 命令。

## 安装与本地设置

出于开发目的，您可以克隆代码仓库并从源代码运行该示例。

### 1. 克隆代码仓库

```bash 克隆代码仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖

导航到示例目录并使用 `pnpm` 安装必要的软件包。

```bash 安装依赖 icon=lucide:terminal
cd aigne-framework/examples/workflow-concurrency
pnpm install
```

### 3. 本地运行示例

使用 `pnpm start` 命令执行脚本。

在一次性模式下运行：
```bash 在一次性模式下运行 icon=lucide:terminal
pnpm start
```

要在交互式聊天模式下运行，请添加 `--chat` 标志。请注意，传递给 `pnpm start` 的参数必须以 `--` 开头。
```bash 在聊天模式下运行 icon=lucide:terminal
pnpm start -- --chat
```

要使用管道输入：
```bash 使用管道输入运行 icon=lucide:terminal
echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | pnpm start
```

## 代码实现

核心逻辑是使用一个配置为并行执行的 `TeamAgent` 来实现的。两个 `AIAgent` 实例在团队中被定义为技能：一个用于特征提取，另一个用于受众分析。

```typescript index.ts icon=logos:typescript
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 初始化 OpenAI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 定义第一个 Agent 来提取产品特性
const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.\n\nProduct description:\n{{product}}`,
  outputKey: "features",
});

// 定义第二个 Agent 来分析目标受众
const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.\n\nProduct description:\n{{product}}`,
  outputKey: "audience",
});

// 初始化 AIGNE 实例
const aigne = new AIGNE({ model });

// 创建一个 TeamAgent 来管理并行工作流
const teamAgent = TeamAgent.from({
  skills: [featureExtractor, audienceAnalyzer],
  mode: ProcessMode.parallel, // 将执行模式设置为并行
});

// 使用产品描述调用团队
const result = await aigne.invoke(teamAgent, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);

/* 预期输出:
{
  features: "**Product Name:** AIGNE\n\n**Product Type:** No-code Generative AI Apps Engine\n\n...",
  audience: "**Small to Medium Enterprises (SMEs)**: \n   - Businesses that may not have extensive IT resources or budget for app development but are looking to leverage AI to enhance their operations or customer engagement.\n\n...",
}
*/
```

### 关键概念

-   **`AIAgent`**：代表一个具有特定指令的独立 AI 驱动的工作单元。在这里，`featureExtractor` 和 `audienceAnalyzer` 都是 `AIAgent` 实例。
-   **`TeamAgent`**：一个协调其他 Agent (技能) 的 Agent。它可以按顺序或并行运行它们。
-   **`ProcessMode.parallel`**：`TeamAgent` 上的此配置指示它同时执行其所有技能。`TeamAgent` 会等待所有并行任务完成后再聚合它们的输出。
-   **`outputKey`**：每个 `AIAgent` 中的这个属性定义了其结果在最终输出对象中存储时所使用的键。

## 命令行选项

该示例脚本接受几个命令行参数来自定义其行为。

| 参数 | 描述 | 默认值 |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------ |
| `--chat` | 以交互式聊天模式运行 Agent，而不是单次执行。 | 禁用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型，例如 `openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度以控制创造性。 | 提供商默认值 |
| `--top-p <value>` | 设置 top-p (nucleus sampling) 的值。 | 提供商默认值 |
| `--presence-penalty <value>` | 设置存在惩罚值以阻止重复的 token。 | 提供商默认值 |
| `--frequency-penalty <value>` | 设置频率惩罚值以阻止重复频繁的 token。 | 提供商默认值 |
| `--log-level <level>` | 设置日志记录的详细程度。可接受的值为 `ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接以参数形式提供输入。 | 无 |

#### 用法示例

要在聊天模式下使用特定模型和日志级别运行：
```bash 命令示例 icon=lucide:terminal
pnpm start -- --chat --model openai:gpt-4o-mini --log-level DEBUG
```

## 调试

您可以使用 AIGNE 观察服务器来监控和分析 Agent 的执行情况。该工具提供了一个基于 Web 的界面，用于检查跟踪、查看每个步骤的详细信息，并了解 Agent 的运行时行为。

首先，在另一个终端窗口中启动观察服务器：
```bash 启动观察器 icon=lucide:terminal
aigne observe
```

![启动观察服务器](/media/examples/images/aigne-observe-execute.png)

运行示例后，您可以打开 Web 界面（通常在 `http://localhost:3333`）查看最近的执行列表，并深入了解并发工作流的详细信息。

![查看执行列表](/media/examples/images/aigne-observe-list.png)