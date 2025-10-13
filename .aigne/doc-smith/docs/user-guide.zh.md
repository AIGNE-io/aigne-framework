# AIGNE 框架入门指南

欢迎使用 AIGNE 框架！本指南旨在帮助开发者在 30 分钟内从零开始构建一个可运行的应用程序。我们将介绍入门所需的基本步骤和核心概念，并提供一个可供您参考构建的工作示例。

AIGNE \[ ˈei dʒən ] 是一个函数式 AI 应用开发框架，旨在简化和加速构建现代、可扩展且功能强大的 AI 驱动解决方案。它采用模块化设计，融合了函数式编程特性与先进的 AI 功能。

## 快速入门

让我们直接开始吧。本节将引导您完成环境设置、框架安装以及第一个 AIGNE 应用程序的运行。

### 环境要求

在开始之前，请确保您已安装以下软件：

*   **Node.js**：20.0 或更高版本。

### 安装

您可以使用您偏好的包管理器将 AIGNE 添加到您的项目中：

#### npm

```bash
npm install @aigne/core
```

#### yarn

```bash
yarn add @aigne/core
```

#### pnpm

```bash
pnpm add @aigne/core
```

### 您的第一个 AIGNE 应用

以下是一个简单的示例，演示了一个 AI Agent 将控制权转移给另一个 AI Agent 的“交接”工作流。

首先，设置您的环境变量。例如，您需要一个 OpenAI API 密钥。

```bash
export OPENAI_API_KEY="your-api-key-here"
```

现在，创建一个 TypeScript 文件（例如 `index.ts`），并添加以下代码：

```ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. 初始化 AI 模型
const { OPENAI_API_KEY } = process.env;
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定义一个交接函数和 AI Agent
function transferToB() {
  return agentB;
}

const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent. If the user asks to talk to agent B, use the transferToB skill.",
  outputKey: "A",
  skills: [transferToB], // Agent A 可以交接给 Agent B
  inputKey: "message",
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  inputKey: "message",
});

// 3. 初始化 AIGNE 执行环境
const aigne = new AIGNE({ model });

async function main() {
  // 4. 调用初始 Agent
  const userAgent = aigne.invoke(agentA);

  // 5. 与 Agent 交互
  console.log("Invoking Agent A to request a transfer...");
  const result1 = await userAgent.invoke({ message: "transfer to agent b" });
  console.log(result1);
  // 预期输出：
  // {
  //   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
  // }

  console.log("\nSpeaking with Agent B...");
  const result2 = await userAgent.invoke({ message: "It's a beautiful day" });
  console.log(result2);
  // 预期输出：
  // {
  //   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
  // }
}

main();
```

此示例说明了如何创建两个不同的 Agent，并根据用户输入在它们之间转移控制权，展示了该框架的灵活性。

## 核心概念

AIGNE 框架建立在几个协同工作的关键概念之上，以创建强大的 AI 工作流。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne.png" alt="AIGNE 架构图" />
</picture>

*   **AI Agent**：这些是框架中的基本执行单元。一个 Agent 可以是具有特定指令（如只会用俳句作答的 `AgentB`）的专用 AI，也可以是一个简单的函数。它们被设计为模块化和可重用的。

*   **AI 模型**：AIGNE 开箱即用支持多种 AI 模型（如 OpenAI、Gemini、Claude）。您可以轻松更换模型或扩展框架以包含自定义模型。

*   **AIGNE**：这是负责编排 Agent 和工作流的主执行引擎。它管理不同组件之间的状态和通信。

*   **工作流模式**：AIGNE 提供了几种内置模式来构建 Agent 之间的复杂交互，例如按顺序、并行运行它们，或根据输入路由任务。

## 主要特性

*   **模块化设计**：清晰的模块化结构让您能够高效组织代码，简化维护。
*   **TypeScript 支持**：全面的类型定义确保了类型安全和卓越的开发体验。
*   **支持多种 AI 模型**：内置支持 OpenAI、Gemini、Claude、Nova 等主流 AI 模型。
*   **灵活的工作流模式**：轻松实现顺序、并发、路由和交接等工作流，满足复杂的应用需求。
*   **集成 MCP 协议**：通过模型上下文协议（MCP）无缝集成外部系统和服务。
*   **代码执行**：在安全的沙箱中执行动态生成的代码，实现强大的自动化功能。
*   **集成 Blocklet 生态系统**：与 ArcBlock 的 Blocklet 生态系统深度集成，提供一站式开发和部署解决方案。

## 后续步骤

您现在已经安装了 AIGNE 框架并运行了您的第一个应用程序。接下来您可以：

*   **探索更多示例**：通过探索框架代码仓库中的示例项目，深入了解各种工作流模式和 MCP 集成。
*   **阅读文档**：要深入了解 API 和概念，请查阅完整的 [AIGNE 框架文档](https://www.arcblock.io/docs/aigne-framework)。
*   **加入社区**：有任何问题或想分享您的成果？欢迎加入我们的[技术社区](https://community.arcblock.io/discussions/boards/aigne)。