# 概述

`@aigne/core` 是 AIGNE 框架的基础组件，提供了构建 AI 驱动应用程序所需的基本模块和工具。该软件包实现了框架的核心功能，包括 agent 系统、AIGNE 环境、模型集成以及对各种工作流模式的支持。它是创建复杂 agentic AI 的功能核心。

该框架设计为模块化和可扩展的，允许开发人员通过组合不同类型的 agents 和模型来构建复杂的 AI 驱动工作流。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  AIGNE-Engine: {
    label: "AIGNE 引擎"
    shape: rectangle
  }

  Context: {
    label: "上下文"
    shape: rectangle
    MessageQueue: {
      shape: queue
    }
  }

  Agents: {
    label: "Agents"
    shape: rectangle
    grid-columns: 2

    UserAgent: { label: "UserAgent" }
    AIAgent: { label: "AIAgent" }
    TeamAgent: { label: "TeamAgent" }
    ImageAgent: { label: "ImageAgent" }
    FunctionAgent: { label: "FunctionAgent" }
    MCPAgent: { label: "MCPAgent" }
  }

  Models: {
    label: "模型"
    shape: rectangle
    grid-columns: 2

    ChatModel: { label: "聊天模型" }
    ImageModel: { label: "图像模型" }
  }

  Skills: {
    shape: rectangle
  }

  PromptBuilder: {
    shape: rectangle
  }
}

User -> AIGNE-Framework.Agents.UserAgent: "交互方式"
AIGNE-Framework.Agents.UserAgent -> AIGNE-Framework.AIGNE-Engine: "调用"
AIGNE-Framework.AIGNE-Engine -> AIGNE-Framework.Agents: "编排"
AIGNE-Framework.AIGNE-Engine -> AIGNE-Framework.Skills: "管理"
AIGNE-Framework.AIGNE-Engine -> AIGNE-Framework.Context: "使用"

AIGNE-Framework.Agents <-> AIGNE-Framework.Context.MessageQueue: "通过...通信"
AIGNE-Framework.Agents.AIAgent -> AIGNE-Framework.PromptBuilder: "使用"
AIGNE-Framework.Agents.AIAgent -> AIGNE-Framework.Models.ChatModel: "与...交互"
AIGNE-Framework.Agents.ImageAgent -> AIGNE-Framework.Models.ImageModel: "与...交互"
AIGNE-Framework.Agents.TeamAgent -> AIGNE-Framework.Agents: "管理"
```

## 主要特性

AIGNE Core 框架内置了一套全面的功能，以支持强大的 AI 应用程序开发。

*   **支持多种 AI 模型**：内置支持包括 OpenAI、Gemini、Claude 和 Nova 在内的主要 AI 模型，并提供可扩展的架构以集成其他模型。
*   **强大的 Agent 系统**：为不同类型的 agents（如 AI agents、function agents 和 team agents）提供强大的抽象，实现专门的任务处理。
*   **灵活的 AIGNE 环境**：管理 agents 之间的通信，并精确地编排复杂工作流的执行。
*   **高级工作流模式**：支持顺序、并发、路由和交接等多种工作流模式，允许创建复杂的流程自动化。
*   **MCP 协议集成**：通过模型上下文协议（MCP）实现与外部系统的无缝集成。
*   **完整的 TypeScript 支持**：包含全面的类型定义，以确保类型安全和自动补全，提供卓越的开发体验。

## 快速入门

要开始使用 `@aigne/core`，您首先需要将该软件包安装到您的项目中。

### 安装

您可以使用您喜欢的包管理器来安装该软件包。

```bash 使用 npm
npm install @aigne/core
```

```bash 使用 yarn
yarn add @aigne/core
```

```bash 使用 pnpm
pnpm add @aigne/core
```

### 基本用法

以下是一个简单的示例，展示了如何使用 AIGNE 框架创建并运行一个基本的 AI agent。

```typescript 基础 Agent 示例 icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. 创建一个 AI 模型实例
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});

// 2. 创建一个带指令的 AI agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 3. 使用模型初始化 AIGNE 引擎
const aigne = new AIGNE({ model });

// 4. 使用引擎调用 agent，创建一个面向用户的实例
const userAgent = await aigne.invoke(agent);

// 5. 向 agent 发送消息并接收响应
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);

console.log(response);
```

## 下一步

本文档的结构旨在满足不同受众的需求。请选择最适合您角色和目标的路径。

<x-cards data-columns="2">
  <x-card data-title="用户指南" data-icon="lucide:user" data-href="/user-guide">
    为非技术用户准备的概念指南。用通俗易懂的语言了解 AIGNE、agents 和 AI 工作流背后的核心思想。
  </x-card>
  <x-card data-title="开发者指南" data-icon="lucide:code" data-href="/developer-guide">
    为开发者准备的完整技术指南。查找安装步骤、教程以及使用 AIGNE Core 构建所需的一切。
  </x-card>
</x-cards>