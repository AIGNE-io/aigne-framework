# 快速入门

本指南提供了设置开发环境并使用 AIGNE 框架运行您的第一个 AI Agent 所需的步骤。整个过程预计在 30 分钟内完成，通过实际操作，帮助您上手框架的基本工作流程。

我们将介绍系统先决条件、所需包的安装，并提供一个完整、可直接复制粘贴的示例，演示如何定义、配置和执行一个基本的 AI Agent。

## 先决条件

在继续之前，请确保您的开发环境满足以下要求：

*   **Node.js**：需要 20.0 或更高版本。

您可以通过在终端中执行以下命令来验证您的 Node.js 版本：

```bash
node -v
```

## 安装

首先，您需要安装 AIGNE 核心包和一个模型提供商包。在本指南中，我们将使用官方的 OpenAI 模型提供商。

使用您偏好的包管理器安装必要的包：

<x-cards data-columns="3">
  <x-card data-title="npm" data-icon="logos:npm-icon">
    ```bash
    npm install @aigne/core @aigne/openai
    ```
  </x-card>
  <x-card data-title="yarn" data-icon="logos:yarn">
    ```bash
    yarn add @aigne/core @aigne/openai
    ```
  </x-card>
  <x-card data-title="pnpm" data-icon="logos:pnpm">
    ```bash
    pnpm add @aigne/core @aigne/openai
    ```
  </x-card>
</x-cards>

此外，您还需要一个 OpenAI API 密钥。请将其设置为名为 `OPENAI_API_KEY` 的环境变量。

```bash title=".env"
OPENAI_API_KEY="sk-..."
```

## 快速入门示例

此示例演示了创建并运行一个简单的“助手” Agent 的完整过程。

1.  创建一个名为 `index.ts` 的新 TypeScript 文件。
2.  将以下代码复制并粘贴到该文件中。

```typescript index.ts icon=logos:typescript-icon
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. 实例化 AI 模型
// 这将使用指定的模型创建与 OpenAI API 的连接。
// API 密钥会从 OPENAI_API_KEY 环境变量中读取。
const model = new OpenAIChatModel({
  model: "gpt-4o-mini",
});

// 2. 定义 AI Agent
// Agent 是一个工作单元。这个 AIAgent 配置了
// 定义其个性和任务的指令。
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful and friendly assistant.",
});

// 3. 实例化 AIGNE
// AIGNE 类是管理和运行 Agent 的中央协调器。
// 它配置了其 Agent 将要使用的模型。
const aigne = new AIGNE({ model });

async function main() {
  // 4. 调用 Agent
  // invoke 方法使用给定的输入运行 Agent。
  // 框架会处理与模型的交互。
  const response = await aigne.invoke(
    assistantAgent,
    "Why is the sky blue?"
  );

  // 5. 打印响应
  console.log(response);
}

main();
```

### 运行示例

从您的终端执行该脚本。如果您使用的是 TypeScript，可以使用像 `ts-node` 这样的工具。

```bash
npx ts-node index.ts
```

### 预期输出

输出将是 Agent 对问题的响应，格式为 JSON 对象。`message` 字段的内容会有所不同，因为它是由 AI 模型生成的。

```json
{
  "message": "The sky appears blue because of a phenomenon called Rayleigh scattering..."
}
```

## 代码分解

该示例由四个主要步骤组成，代表了 AIGNE 框架的核心工作流程。

1.  **模型初始化**：创建了一个 `OpenAIChatModel` 的实例。该对象作为与指定的 OpenAI 模型（例如 `gpt-4o-mini`）的直接接口。它需要一个 API 密钥进行身份验证，该密钥会自动从 `OPENAI_API_KEY` 环境变量中获取。

2.  **Agent 定义**：使用静态的 `from` 方法定义了一个 `AIAgent`。这是框架中的基本工作单元。其行为由 `instructions` 属性定义，该属性充当系统提示，指导 AI 模型的响应。

3.  **AIGNE 实例化**：`AIGNE` 类被实例化。它充当所有 Agent 的执行引擎和协调器。通过将 `model` 实例传递到其构造函数中，我们为这个 AIGNE 实例管理的所有 Agent 建立了一个默认模型。

4.  **Agent 调用**：调用 `aigne.invoke()` 方法来执行 `assistantAgent`。第一个参数是要运行的 Agent，第二个是输入消息。框架管理请求的完整生命周期：将提示和指令发送到模型，接收响应，并将其作为结构化输出返回。

这个简单的示例说明了该框架的模块化和声明性特性，其中模型、Agent 和执行引擎被配置和组合以构建强大的 AI 驱动的应用程序。

## 总结

在本指南中，您已成功设置好环境，安装了必要的 AIGNE 包，并构建和运行了一个可用的 AI Agent。您已经学习了基本的工作流程：定义模型、使用特定指令创建 Agent，以及使用 AIGNE 通过用户提示调用它。

有了这个基础，您现在可以探索更高级的主题了。

*   要更详细地了解框架的基本构建块，请继续阅读 [核心概念](./developer-guide-core-concepts.md) 文档。
*   要了解不同类型的专用 Agent 及其用例，请参阅 [Agent 类型](./developer-guide-agents.md) 部分。