# 你的第一个 Agent

本指南提供了一个完整的分步教程，指导你使用 AIGNE 框架创建并运行你的第一个 AI Agent。完成本节后，你将拥有一个能够响应你输入的、功能完备的 Agent。

## 前提条件

在继续之前，请确保你已完成以下事项：

1.  **安装**：必须在你的项目中安装 `@aigne/core` 包。如果尚未安装，请参阅[安装指南](./developer-guide-getting-started-installation.md)。
2.  **OpenAI API 密钥**：你需要一个来自 OpenAI 的 API 密钥。此密钥应设置为名为 `OPENAI_API_KEY` 的环境变量。

## 分步指南

我们现在将构建一个基础的“助手” Agent。

### 步骤 1：设置文件

创建一个新的 TypeScript 文件（例如 `index.ts`），并首先从 `@aigne/core` 中导入必要的类。

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
```

### 步骤 2：配置 AI 模型

实例化你希望使用的聊天模型。在本例中，我们将使用 OpenAI 的 `gpt-4-turbo`。该模型需要你的 API 密钥进行身份验证。

```typescript
// 创建 AI 模型实例
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});
```

### 步骤 3：创建 AI Agent

使用 `AIAgent.from()` 定义你的 Agent。一个 Agent 至少需要一个 `name` 和 `instructions` 来定义其目的和行为。

```typescript
// 创建 AI Agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});
```

### 步骤 4：初始化 AIGNE 引擎

`AIGNE` 类是协调 Agent 和模型的主要执行引擎。创建一个引擎实例，并将模型作为所有 Agent 的全局默认设置。

```typescript
// AIGNE: AIGNE 框架的主要执行引擎。
const aigne = new AIGNE({ model });
```

### 步骤 5：调用 Agent

要与 Agent 交互，你首先需要使用 `aigne.invoke()` 创建一个面向用户的实例。这将为对话做好准备。

```typescript
// 使用 AIGNE 调用 Agent
const userAgent = await aigne.invoke(agent);
```

### 步骤 6：发送消息

最后，使用 `userAgent.invoke()` 向 Agent 发送一条消息，并将响应打印到控制台。

```typescript
// 向 Agent 发送消息
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);
console.log(response);
```

## 完整代码示例

以下是完整的代码，可以直接复制并粘贴到你的文件中。

```typescript 你的第一个 Agent icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 步骤 1：创建 AI 模型实例
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});

// 步骤 2：创建 AI Agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 步骤 3：初始化 AIGNE 引擎
const aigne = new AIGNE({ model });

async function main() {
  // 步骤 4：调用 Agent 以获取面向用户的实例
  const userAgent = await aigne.invoke(agent);

  // 步骤 5：向 Agent 发送消息并获取响应
  const response = await userAgent.invoke(
    "Hello, can you help me write a short article about the AIGNE framework?",
  );
  
  console.log(response);
}

main();
```

## 运行代码

要运行此示例，请从终端执行该脚本。请确保首先设置 `OPENAI_API_KEY` 环境变量。

```bash
OPENAI_API_KEY="your-api-key-here" ts-node index.ts
```

你应该会在控制台中看到 AI 助手的响应。

## 总结

你已成功创建、配置并运行了一个基础的 AI Agent。此示例展示了 AIGNE 框架的基本工作流程：定义模型、创建具有特定指令的 Agent，以及使用 AIGNE 引擎来促进通信。

要更深入地了解此处介绍的概念，请继续阅读[核心概念](./developer-guide-core-concepts.md)部分。