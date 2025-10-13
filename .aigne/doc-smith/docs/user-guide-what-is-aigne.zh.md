# AIGNE 框架入门指南

欢迎使用 AIGNE 框架！本指南旨在帮助您在 30 分钟内启动并运行您的第一个 AI 应用程序。我们将逐步介绍如何设置环境、安装必要的软件包以及创建一个简单的 AI agent。

本指南面向希望将 AIGNE 集成到其项目中的开发人员。我们将重点介绍代码优先、可直接复制粘贴的示例，以帮助您尽快入门。

## 前提条件

在开始之前，请确保您的系统上已安装以下软件：

*   **Node.js**：AIGNE 框架需要 Node.js 20.0 或更高版本。

您可以在终端中运行以下命令来验证您的 Node.js 版本：

```bash
node -v
```

## 1. 安装

首先，创建一个新的项目目录并初始化一个 Node.js 项目：

```bash
mkdir aigne-quickstart
cd aigne-quickstart
npm init -y
```

现在，您可以使用您偏好的包管理器（npm、yarn 或 pnpm）安装 AIGNE 核心包和 OpenAI 模型提供程序。

<tabs>
<tab-item label="npm">

```bash
npm install @aigne/core @aigne/openai dotenv
```

</tab-item>
<tab-item label="yarn">

```bash
yarn add @aigne/core @aigne/openai dotenv
```

</tab-item>
<tab-item label="pnpm">

```bash
pnpm add @aigne/core @aigne/openai dotenv
```

</tab-item>
</tabs>

## 2. 设置您的第一个 AI Agent

框架安装完成后，让我们来创建您的第一个 AI 应用程序。本示例将使用 OpenAI API 来驱动我们的 agent，因此您需要一个 OpenAI API 密钥。

### a. 配置环境变量

管理 API 密钥的最佳实践是使用环境变量。在您的项目根目录中创建一个名为 `.env` 的文件，并将您的 OpenAI API 密钥添加进去：

```bash
# .env
OPENAI_API_KEY="your_openai_api_key_here"
```

我们已经安装了 `dotenv` 包，它会将此变量加载到我们应用程序的环境中。

### b. 创建应用程序文件

创建一个名为 `index.js` 的文件并添加以下代码。此脚本将初始化框架，定义一个简单的 agent，并向其发送一个提示。

```javascript
// index.js
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import "dotenv/config";

// 1. 创建一个 AI 模型实例
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. 创建一个带指令的 AI agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant who is an expert in creative writing.",
});

// 3. 初始化 AIGNE 执行引擎
const aigne = new AIGNE({ model });

// 4. 定义一个异步函数来运行 agent
async function main() {
  // 使用 AIGNE 引擎调用 agent
  const userAgent = await aigne.invoke(agent);

  // 向 agent 发送消息并获取响应
  const response = await userAgent.invoke(
    "Hello, can you help me write a short poem about the sunrise?",
  );
  
  console.log(response);
}

// 5. 运行应用程序
main();
```

### c. 代码解析

让我们一步步解析 `index.js` 文件：

1.  **模型初始化**：我们创建了一个 `OpenAIChatModel` 的实例，并从环境变量中传入我们的 API 密钥。该对象负责与 OpenAI API 进行通信。
2.  **Agent 创建**：我们定义了一个 `AIAgent`。该 agent 具有 `name` 和 `instructions`，用于告知 AI 模型如何行动。在本例中，它是一个擅长创意写作的得力助手。
3.  **引擎初始化**：`AIGNE` 类是主要的执行引擎。它接收 `model` 作为参数，并管理不同组件之间的通信。
4.  **Agent 调用**：我们使用 `aigne.invoke(agent)` 来准备 agent 以进行交互。然后，`userAgent.invoke(...)` 将我们的提示发送给 agent 并等待响应。
5.  **执行**：调用 `main` 函数来运行整个流程。

### d. 运行应用程序

在您的终端中执行该文件。请确保您的 `package.json` 文件中包含 `"type": "module"`，以便使用 ES 模块语法。

```bash
node index.js
```

您应该会在控制台中看到由 AI agent 生成的关于日出的创意诗歌。

## 核心概念交互

“入门”示例展示了 AIGNE 框架的基本工作流程。用户的提示通过 AIGNE 引擎进行处理，该引擎利用已定义的 agent 和底层的 AI 模型来生成最终响应。

<d2>
direction: down

User-Prompt: {
  label: "用户提示\n'写一首诗...'"
  shape: rectangle
}

AIGNE-Engine: {
  label: "AIGNE 引擎"
  shape: rectangle
}

AIAgent: {
  label: "AIAgent\n(指令)"
  shape: rectangle
}

AI-Model: {
  label: "AI 模型\n(例如 OpenAIChatModel)"
  shape: rectangle
}

OpenAI-API: {
  label: "外部 LLM API\n(例如 OpenAI)"
  shape: cylinder
}

Final-Response: {
  label: "最终响应\n(生成的诗歌)"
  shape: rectangle
}

User-Prompt -> AIGNE-Engine: "1. 输入"
AIAgent -> AIGNE-Engine: "2. 结合"
AIGNE-Engine -> AI-Model: "3. 传递组合后的提示"
AI-Model -> OpenAI-API: "4. 发起 API 调用"
OpenAI-API -> AI-Model: "5. 接收结果"
AI-Model -> AIGNE-Engine: "6. 返回结果"
AIGNE-Engine -> Final-Response: "7. 输出"

</d2>