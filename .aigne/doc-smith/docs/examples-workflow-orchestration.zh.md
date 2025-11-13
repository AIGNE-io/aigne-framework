# 工作流编排

本文档提供了一份技术指南，通过协调多个专业化 AI Agent 来构建复杂的处理流程。通过本示例，您将学习如何构建一个工作流，其中编排器 Agent 将任务（如研究、写作和事实核查）委托给一组协同工作的 Agent，以完成一个复杂的目标。

## 概述

在本示例中，我们创建了一个多 Agent 系统，旨在对给定主题进行深入研究并撰写一份详细报告。该工作流由一个 `OrchestratorAgent` 管理，它指导一组专业 Agent 并行执行特定的子任务。

信息流如下：

1.  初始请求被发送给 `Orchestrator` Agent。
2.  `Orchestrator` 将请求分解为多个任务，并将其分发给专业 Agent，如 `Finder`、`Writer`、`Proofreader`、`Fact Checker` 和 `Style Enforcer`。
3.  这些 Agent 并行执行各自的任务。例如，`Finder` 使用网页抓取工具收集信息，而 `Writer` 开始构建报告结构。
4.  所有 Agent 的输出被发送给一个 `Synthesizer` Agent。
5.  `Synthesizer` 整合信息并生成最终的综合报告。

该工作流可用下图表示：```d2
direction: down

Request: {
  label: "初始请求"
  shape: oval
}

Orchestrator: {
  label: "Orchestrator Agent"
  shape: rectangle
}

Specialized-Agents: {
  label: "专业 Agent（并行执行）"
  shape: rectangle
  grid-columns: 3
  style: {
    stroke-dash: 2
  }

  Finder: {
    shape: rectangle
  }

  Writer: {
    shape: rectangle
  }

  Proofreader: {
    shape: rectangle
  }

  Fact-Checker: {
    label: "Fact Checker"
    shape: rectangle
  }

  Style-Enforcer: {
    label: "Style Enforcer"
    shape: rectangle
  }
}

Synthesizer: {
  label: "Synthesizer Agent"
  shape: rectangle
}

Report: {
  label: "最终报告"
  shape: oval
}

Request -> Orchestrator: "1. 发送请求"
Orchestrator -> Specialized-Agents: "2. 分发任务"
Specialized-Agents -> Synthesizer: "4. 发送输出"
Synthesizer -> Report: "5. 生成最终报告"
```

## 前提条件

在运行本示例前，请确保满足以下要求：

*   **Node.js**: 必须安装 20.0 或更高版本。
*   **OpenAI API 密钥**: Agent 需要 API 密钥与语言模型进行交互。您可以从 [OpenAI API 密钥页面](https://platform.openai.com/api-keys) 获取。

## 快速开始

您可以使用 `npx` 直接从命令行运行此示例，无需手动安装。

### 运行示例

该脚本可以在默认的单次模式或交互式聊天模式下执行。

```bash 以单次模式运行 icon=lucide:terminal
npx -y @aigne/example-workflow-orchestrator
```

```bash 以交互式聊天模式运行 icon=lucide:terminal
npx -y @aigne/example-workflow-orchestrator --chat
```

也可以通过标准管道直接提供输入：

```bash 使用管道输入 icon=lucide:terminal
echo "Research ArcBlock and compile a report about their products and architecture" | npx -y @aigne/example-workflow-orchestrator
```

### 连接 AI 模型

首次运行时，脚本会提示您连接到一个 AI 模型提供商。

![连接模型提供商](./run-example.png)

有三种连接选项：

1.  **AIGNE Hub (官方)**：这是推荐选项。您的浏览器将打开官方 AIGNE Hub，供您登录并连接。新用户会获得免费的 token 赠款。
2.  **AIGNE Hub (自托管)**：如果您托管自己的 AIGNE Hub 实例，请选择此选项并输入其 URL 以建立连接。
3.  **第三方模型提供商**：您可以通过配置相应的环境变量并填入您的 API 密钥，直接连接到像 OpenAI 这样的提供商。

例如，要使用 OpenAI，请设置 `OPENAI_API_KEY` 环境变量：

```bash 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

配置模型后，再次执行运行命令。

## 从源代码安装

对于希望修改或查看源代码的开发者，请按照以下步骤从本地仓库运行示例。

### 1. 克隆仓库

```bash 克隆仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖

导航至示例目录并使用 `pnpm` 安装所需软件包。

```bash 安装依赖 icon=lucide:terminal
cd aigne-framework/examples/workflow-orchestrator
pnpm install
```

### 3. 运行示例

使用 `pnpm start` 命令从源代码目录执行脚本。

```bash 以单次模式运行 icon=lucide:terminal
pnpm start
```

要在交互式聊天模式下运行，请添加 `--chat` 标志。额外的 `--` 是必需的，以便通过 `pnpm` 脚本运行器传递参数。

```bash 以交互式聊天模式运行 icon=lucide:terminal
pnpm start -- --chat
```

## 代码实现

以下 TypeScript 代码演示了如何定义和编排 Agent 团队。它初始化了两个专业 Agent——一个 `finder` 和一个 `writer`——并使用一个 `OrchestratorAgent` 来管理它们的执行。

`finder` Agent 配备了 `puppeteer` 和 `filesystem` 技能，使其能够浏览网页并保存信息。`writer` Agent 负责编写最终报告并将其写入文件系统。

```typescript orchestrator-workflow.ts icon=logos:typescript
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator/index.js";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
  modelOptions: {
    parallelToolCalls: false, // puppeteer 一次只能运行一个任务
  },
});

const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  env: process.env as Record<string, string>,
});

const filesystem = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", import.meta.dir],
});

const finder = AIAgent.from({
  name: "finder",
  description: "Find the closest match to a user's request",
  instructions: `You are an agent that can find information on the web.
You are tasked with finding the closest match to the user's request.
You can use puppeteer to scrape the web for information.
You can also use the filesystem to save the information you find.

Rules:
- do not use screenshot of puppeteer
- use document.body.innerText to get the text content of a page
- if you want a url to some page, you should get all link and it's title of current(home) page,
then you can use the title to search the url of the page you want to visit.
  `,
  skills: [puppeteer, filesystem],
});

const writer = AIAgent.from({
  name: "writer",
  description: "Write to the filesystem",
  instructions: `You are an agent that can write to the filesystem.
  You are tasked with taking the user's input, addressing it, and
  writing the result to disk in the appropriate location.`,
  skills: [filesystem],
});

const agent = OrchestratorAgent.from({
  skills: [finder, writer],
  maxIterations: 3,
  tasksConcurrency: 1, // puppeteer 一次只能运行一个任务
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(
  agent,
  `\
Conduct an in-depth research on ArcBlock using only the official website\
(avoid search engines or third-party sources) and compile a detailed report saved as arcblock.md. \
The report should include comprehensive insights into the company's products \
(with detailed research findings and links), technical architecture, and future plans.`,
);
console.log(result);
```

当被调用时，`AIGNE` 实例将提示传递给 `OrchestratorAgent`，后者会协调 `finder` 和 `writer` Agent，根据提供的指令生成最终报告。

## 命令行选项

该脚本接受多个命令行参数以自定义其行为和模型的生成参数。

| 参数 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `--chat` | 以交互式聊天模式运行。 | 禁用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型。格式为 'provider\[:model]'。例如：'openai' 或 'openai:gpt-4o-mini'。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度值。 | 提供商默认值 |
| `--top-p <value>` | 设置 top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>` | 设置存在惩罚值。 | 提供商默认值 |
| `--frequency-penalty <value>` | 设置频率惩罚值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志详细程度。接受 `ERROR`、`WARN`、`INFO`、`DEBUG` 或 `TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接通过命令行参数指定输入。 | 无 |

### 用法示例

```bash 设置日志级别 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## 调试

要监控和分析 Agent 的执行情况，请使用 `aigne observe` 命令。该命令会启动一个本地 Web 服务器，提供一个用户友好的界面来检查追踪信息、查看详细的调用信息，并了解 Agent 的运行时行为。

首先，在您的终端中启动观察服务器：
![启动 aigne observe](../images/aigne-observe-execute.png)

该界面提供了一个最近执行的列表。您可以选择一个执行以深入查看其详细的追踪信息。
![查看执行列表](../images/aigne-observe-list.png)

该工具对于调试、性能调优以及深入了解 Agent 如何处理信息并与模型和工具交互至关重要。

## 总结

本示例展示了 `OrchestratorAgent` 在协调多个专业 Agent 以解决复杂问题方面的功能。通过将一个大任务分解为更小、可管理的子任务，并将其分配给具备相应技能的 Agent，您可以构建强大且可扩展的 AI 驱动工作流。

要探索其他工作流模式，请参考以下示例：
<x-cards data-columns="2">
  <x-card data-title="顺序工作流" data-href="/examples/workflow-sequential" data-icon="lucide:arrow-right">构建保证执行顺序的逐步处理流程。</x-card>
  <x-card data-title="并发工作流" data-href="/examples/workflow-concurrency" data-icon="lucide:git-compare-arrows">通过同时处理多个任务来优化性能。</x-card>
</x-cards>