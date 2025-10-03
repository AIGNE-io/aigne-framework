# 快速入门

本指南提供了安装 @aigne/core 框架并运行您的第一个 AI Agent 的最直接路径。整个过程设计在 30 分钟内完成，使您能够快速开始开发并看到实际成果。

以下各节将引导您安装必要的软件包，然后构建一个完整、功能齐全的 AI Agent。

<x-cards data-columns="2">
  <x-card data-title="安装" data-icon="lucide:download" data-href="/developer-guide/getting-started/installation">
    首先，使用您偏好的包管理器（npm、yarn 或 pnpm）将 @aigne/core 包添加到您的项目中。
  </x-card>
  <x-card data-title="您的第一个 Agent" data-icon="lucide:rocket" data-href="/developer-guide/getting-started/your-first-agent">
    遵循分步教程，通过完整的代码示例来创建、配置并运行一个功能齐全的 AI Agent。
  </x-card>
</x-cards>

## 一个完整的示例

为了简要概述，以下是一个基本 AIGNE 实现的完整、自包含的示例。详细的步骤和解释将在后续章节中提供。此示例演示了核心组件如何协同工作以处理请求。

```typescript 一个基本的 AIGNE 实现 icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. 创建一个 AI 模型实例，以连接到像 OpenAI 这样的提供商。
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});

// 2. 定义一个带有名称和指令的 AI Agent。
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 3. 初始化 AIGNE 引擎，它负责协调执行。
const aigne = new AIGNE({ model });

// 4. 使用引擎调用 Agent 并获取一个面向用户的实例。
const userAgent = await aigne.invoke(agent);

// 5. 向 Agent 发送消息并记录响应。
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);
console.log(response);
```

### 后续步骤

首先，请转到[安装](./developer-guide-getting-started-installation.md)指南来设置您的环境。