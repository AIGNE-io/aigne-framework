# 快速入门

本指南提供了在几分钟内安装并运行 AIGNE Framework 所需的全部内容。读完本指南后，你将构建并运行你的第一个由 AI 驱动的 Agent。

## 什么是 AIGNE Framework？

AIGNE Framework [ˈei dʒən] 是一个功能性 AI 应用开发框架，旨在简化和加速构建现代 AI 驱动的应用程序。它结合了函数式编程、强大的人工智能功能和模块化设计，可帮助你创建可扩展且可维护的解决方案。

**主要特性：**

*   **模块化设计**：结构清晰，可提高开发效率并简化维护。
*   **TypeScript 支持**：全面的类型定义，提供更佳、更安全的开发体验。
*   **支持多种 AI 模型**：内置支持 OpenAI、Gemini 和 Claude 等主流 AI 模型，并易于扩展。
*   **灵活的工作流模式**：通过顺序、并发、路由和切换等模式简化复杂操作。
*   **MCP 协议集成**：通过模型上下文协议（Model Context Protocol）与外部系统无缝集成。

## 1. 前提条件

在开始之前，请确保你的系统上已安装 Node.js。

*   **Node.js**：20.0 或更高版本。

你可以在终端中运行以下命令来验证你的 Node.js 版本：

```bash
node -v
```

## 2. 安装

你可以使用你喜欢的包管理器安装 AIGNE 核心包。

### 使用 npm

```bash
npm install @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/core
```

## 3. 你的第一个 AIGNE 应用

让我们用一个乐于助人的助手 Agent 创建一个简单的 “Hello, World!” 风格的应用程序。

#### 第 1 步：设置你的项目文件

创建一个名为 `index.ts` 的新文件。

#### 第 2 步：添加代码

此示例演示了 AIGNE Framework 的三个核心组件：**模型（Model）**、**Agent** 和 **AIGNE**。

*   **模型（Model）**：AI 模型的一个实例（例如 `OpenAIChatModel`），它将为你的 Agent 提供支持。
*   **Agent**：定义 AI 的个性和指令（例如 `AIAgent`）。
*   **AIGNE**：运行 Agent 并处理通信的主要执行器。

将以下代码复制并粘贴到你的 `index.ts` 文件中：

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

async function main() {
  // 1. 创建一个 AI 模型实例
  // 这将连接到 AI 提供商（例如 OpenAI）。
  // 确保你已将 API 密钥设置为环境变量。
  const model = new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
  });

  // 2. 创建一个 AI Agent
  // 这定义了 Agent 的身份和目的。
  const agent = AIAgent.from({
    name: "Assistant",
    instructions: "You are a helpful assistant.",
  });

  // 3. 初始化 AIGNE
  // 这是将所有部分整合在一起的主要执行引擎。
  const aigne = new AIGNE({ model });

  // 4. 与 Agent 开始一个交互式会话
  const userAgent = aigne.invoke(agent);

  // 5. 向 Agent 发送消息并获取响应
  const response = await userAgent.invoke(
    "Hello, can you help me write a short article?",
  );

  console.log(response);
}

main();
```

#### 第 3 步：设置你的 API 密钥

在运行脚本之前，你需要提供你的 OpenAI API 密钥。你可以在终端中设置一个环境变量来完成此操作。

```bash
export OPENAI_API_KEY="your-api-key-here"
```

#### 第 4 步：运行应用

使用像 `ts-node` 这样的 TypeScript 运行器来执行该文件。

```bash
npx ts-node index.ts
```

你应该会在控制台中看到你的助手 Agent 打印出的有用回复！

## 工作原理：简要概述

AIGNE Framework 设计为模块化和可扩展的。`AIGNE` 负责协调用户、Agent 和 AI 模型之间的交互。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne.png" alt="AIGNE Architecture Diagram" />
</picture>

## 后续步骤

你已成功构建并运行了你的第一个 AIGNE 应用程序。现在你可以探索更多高级功能了。

*   **深入了解核心概念**：更深入地了解 [AIGNE、Agent 和模型](./developer-guide-core-concepts.md)。
*   **探索 Agent 类型**：在 [Agent 类型](./developer-guide-agents.md)部分，了解可以构建的不同类型的专用 Agent。
*   **简化工作流**：通过查阅[顺序和并行](./developer-guide-agents-team-agent.md)执行等模式，了解如何编排复杂的多 Agent 任务。
*   **浏览完整文档**：如需深入的指南和 API 参考，请访问完整的 [AIGNE Framework 文档](https://www.arcblock.io/docs/aigne-framework)。