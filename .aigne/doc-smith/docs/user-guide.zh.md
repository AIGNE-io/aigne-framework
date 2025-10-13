我需要修复生成内容中的失效链接。用户指出了几个与示例相关的损坏链接。`/examples` 上的初始 `afs_list` 返回了一个空目录，根据提供的 `README.md` 内容（其中引用了多个示例）来看，这似乎是不正确的。我现在将列出根目录，以便更好地了解整体文件结构，并找到示例的正确路径。# AIGNE 框架入门指南

欢迎使用 AIGNE 框架！本指南专为开发者设计，旨在帮助您在 30 分钟内从零开始构建一个可运行的应用程序。我们将介绍入门的基本步骤、核心概念，并提供一个可供您扩展的工作示例。

AIGNE \[ ˈei dʒən ] 是一个功能性 AI 应用程序开发框架，旨在简化和加速构建现代化、可扩展且功能强大的 AI 驱动解决方案的过程。它在模块化设计中结合了函数式编程特性与先进的 AI 功能。

## 快速入门

让我们直接开始吧。本节将引导您完成环境设置、框架安装以及运行您的第一个 AIGNE 应用程序。

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

### 您的第一个 AIGNE 应用程序

这是一个简单的示例，演示了一个 AI Agent 将控制权移交给另一个 AI Agent 的“移交”工作流。

首先，设置您的环境变量。例如，您需要一个 OpenAI API 密钥。

```bash
export OPENAI_API_KEY="your-api-key-here"
```

现在，创建一个 TypeScript 文件（例如 `index.ts`）并添加以下代码：

```ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. 初始化 AI 模型
const { OPENAI_API_KEY } = process.env;
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定义移交函数和 AI Agent
function transferToB() {
  return agentB;
}

const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent. If the user asks to talk to agent B, use the transferToB skill.",
  outputKey: "A",
  skills: [transferToB], // Agent A 可以移交给 Agent B
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

此示例说明了如何创建两个不同的 Agent，并根据用户输入在它们之间移交控制权，展示了该框架的灵活性。

## 核心概念

AIGNE 框架建立在几个协同工作的关键概念之上，用以创建强大的 AI 工作流。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne.png" alt="AIGNE Architecture Diagram" />
</picture>

*   **AI Agent**：这些是框架中的基本行动者。一个 Agent 可以是带有特定指令（如只会用俳句作答的 `AgentB`）的专用 AI，也可以是一个简单的函数。它们被设计为模块化和可重用的。

*   **AI 模型**：AIGNE 开箱即用地支持各种 AI 模型（如 OpenAI、Gemini、Claude）。您可以轻松更换模型或扩展框架以包含自定义模型。

*   **AIGNE**：这是编排 Agent 和工作流的主要执行引擎。它管理不同组件之间的状态和通信。

*   **工作流模式**：AIGNE 提供了几种内置模式来构建 Agent 之间的复杂交互，例如按顺序、并行运行它们，或根据输入路由任务。

## 主要特性

*   **模块化设计**：清晰的模块化结构使您能够高效地组织代码并简化维护。
*   **TypeScript 支持**：全面的类型定义确保了类型安全和卓越的开发者体验。
*   **多 AI 模型支持**：内置支持 OpenAI、Gemini、Claude、Nova 及其他主流 AI 模型。
*   **灵活的工作流模式**：轻松实现顺序、并发、路由和移交等工作流，以满足复杂的应用需求。
*   **MCP 协议集成**：通过模型上下文协议（MCP）与外部系统和服务无缝集成。
*   **代码执行**：在安全的沙箱中执行动态生成的代码，实现强大的自动化。
*   **Blocklet 生态系统集成**：与 ArcBlock 的 Blocklet 生态系统深度集成，为开发和部署提供一站式解决方案。

## 后续步骤

您现在已经安装了 AIGNE 框架并运行了您的第一个应用程序。接下来，您可以进行以下操作：

*   **探索更多示例**：通过探索框架代码仓库中的示例项目，深入了解各种工作流模式和 MCP 集成。
*   **阅读文档**：要深入了解 API 和概念，请查阅完整的 [AIGNE 框架文档](https://www.arcblock.io/docs/aigne-framework)。
*   **加入社区**：有疑问或想分享您的工作？请加入我们的[技术论坛](https://community.arcblock.io/discussions/boards/aigne)。