# 工作流并发

并行执行任务可以显著提高复杂工作流的效率。本指南演示如何使用 AIGNE 框架构建一个并发工作流，其中多个 Agent 同时处理相同的输入，并将其输出进行聚合。您将学习如何设置并运行一个实际示例，该示例从不同角度同时分析一个产品。

## 概述

在此示例中，我们将构建一个以产品描述为输入的工作流。然后，两个专门的 Agent 将并行工作：

1.  **功能提取器**：分析描述以识别和总结关键产品功能。
2.  **受众分析器**：分析相同的描述以确定目标受众。

最后，一个**聚合器**将两个 Agent 的输出合并成一个统一的结果。这种并行处理模型非常适合可以分解为独立子任务的任务，从而减少总执行时间。

下图说明了此并发工作流：

```d2
direction: down

Input: {
  label: "产品描述"
  shape: oval
}

Parallel-Processing: {
  label: "并行处理"
  style.stroke-dash: 2

  Feature-Extractor: {
    label: "功能提取器\n(Agent 1)"
  }

  Audience-Analyzer: {
    label: "受众分析器\n(Agent 2)"
  }
}

Aggregator: {
  label: "聚合器"
}

Result: {
  label: "统一结果"
  shape: oval
}

Input -> Parallel-Processing.Feature-Extractor: "分析功能"
Input -> Parallel-Processing.Audience-Analyzer: "分析受众"
Parallel-Processing.Feature-Extractor -> Aggregator: "功能总结"
Parallel-Processing.Audience-Analyzer -> Aggregator: "受众画像"
Aggregator -> Result
```

## 前置要求

在继续之前，请确保您的开发环境满足以下要求：
*   **Node.js**：版本 20.0 或更高。
*   **npm**：随 Node.js 一同提供。
*   **OpenAI API 密钥**：用于连接 OpenAI 模型。您可以从 [OpenAI 平台](https://platform.openai.com/api-keys)获取。

## 快速上手

您可以使用 `npx` 直接运行此示例，无需任何安装。

### 运行示例

在您的终端中执行以下命令，以不同模式运行工作流。

*   **一次性模式（默认）**：处理单个预定义的输入后退出。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-concurrency
    ```

*   **交互式聊天模式**：启动一个聊天会话，您可以在其中提供多个输入。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-concurrency --interactive
    ```

*   **管道模式**：使用从另一个命令通过管道传入的输入。

    ```bash icon=lucide:terminal
    echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | npx -y @aigne/example-workflow-concurrency
    ```

### 连接到 AI 模型

首次运行该示例时，系统将提示您连接到一个 AI 模型提供商，因为尚未配置任何 API 密钥。

![初次连接 AI 模型设置的提示](../../../examples/workflow-concurrency/run-example.png)

您有以下几种选择：

1.  **通过官方 AIGNE Hub 连接（推荐）**

    这是最简单的入门方式。新用户可获得免费额度。选择第一个选项，您的浏览器将打开 AIGNE Hub 授权页面。按照屏幕上的说明批准连接。

    ![授权 AIGNE CLI 连接到 AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

2.  **通过自托管的 AIGNE Hub 连接**

    如果您有自己的 AIGNE Hub 实例，请选择第二个选项。系统将提示您输入自托管 Hub 的 URL 以完成连接。

    ![为自托管的 AIGNE Hub 输入 URL](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **通过第三方模型提供商连接**

    您可以通过设置包含 API 密钥的环境变量直接连接到像 OpenAI 这样的提供商。例如，要使用 OpenAI，请导出您的密钥并重新运行命令：

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    npx -y @aigne/example-workflow-concurrency --interactive
    ```

## 从源码安装

如需进行开发或自定义，您可以克隆仓库并在本地运行该示例。

### 1. 克隆仓库

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖

导航到示例目录并使用 pnpm 安装所需包。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-concurrency
pnpm install
```

### 3. 运行示例

使用 `pnpm start` 命令执行工作流。命令行参数必须在 `--` 之后传递。

*   **以一次性模式运行：**

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **以交互式聊天模式运行：**

    ```bash icon=lucide:terminal
    pnpm start -- --interactive
    ```

*   **使用管道输入：**

    ```bash icon=lucide:terminal
    echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | pnpm start
    ```

## 运行选项

该应用程序支持多个用于自定义的命令行参数：

| 参数 | 描述 | 默认值 |
|-----------|-------------|---------|
| `--interactive` | 以交互式聊天模式运行。 | 禁用（一次性模式） |
| `--model <provider[:model]>` | 指定要使用的 AI 模型（例如 `openai` 或 `openai:gpt-4o-mini`）。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度。 | 提供商默认值 |
| `--top-p <value>` | 设置 top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>` | 设置存在惩罚值。 | 提供商默认值 |
| `--frequency-penalty <value>` | 设置频率惩罚值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志级别（`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`）。 | `INFO` |
| `--input`, `-i <input>` | 通过命令行直接指定输入。 | 无 |

## 代码示例

以下 TypeScript 代码演示了如何使用带有 `ProcessMode.parallel` 的 `TeamAgent` 来定义和编排并发工作流。

```typescript concurrency-workflow.ts
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 定义第一个 Agent 来提取产品功能
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
  mode: ProcessMode.parallel,
});

// 使用产品描述调用团队
const result = await aigne.invoke(teamAgent, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);

/*
预期输出:
{
  features: "**Product Name:** AIGNE\n\n**Product Type:** No-code Generative AI Apps Engine\n\n...",
  audience: "**Small to Medium Enterprises (SMEs)**: \n   - Businesses that may not have extensive IT resources or budget for app development but are looking to leverage AI to enhance their operations or customer engagement.\n\n...",
}
*/
```

## 调试

AIGNE 框架包含一个内置的可观测性工具，以帮助您监控和调试 Agent 的执行。

通过运行以下命令启动可观测性服务器：

```bash icon=lucide:terminal
aigne observe
```

![显示 aigne observe 命令正在运行的终端输出](../../../examples/images/aigne-observe-execute.png)

该命令会启动一个本地 Web 服务器，通常地址为 `http://localhost:7893`。在浏览器中打开此 URL 以访问可观测性界面，您可以在其中检查每个 Agent 执行的详细跟踪信息，包括输入、输出和性能指标。

![Aigne 可观测性界面显示了最近的跟踪列表](../../../examples/images/aigne-observe-list.png)

## 总结

本指南介绍了如何使用 AIGNE 框架创建并运行一个并发工作流。通过利用并行模式下的 `TeamAgent`，您可以高效地同时处理多个独立任务。要探索其他工作流模式，请参阅以下示例：

<x-cards data-columns="2">
  <x-card data-title="顺序工作流" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    了解如何按特定、有序的顺序执行 Agent。
  </x-card>
  <x-card data-title="工作流编排" data-icon="lucide:milestone" data-href="/examples/workflow-orchestration">
    在更复杂、精密的管道中协调多个 Agent。
  </x-card>
</x-cards>
