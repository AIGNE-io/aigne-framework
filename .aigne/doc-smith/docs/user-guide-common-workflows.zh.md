本指南将为你提供所需的一切，帮助你在几分钟内安装 AIGNE 框架并运行你的第一个 AI 应用程序。我们将逐步引导你完成环境设置、必要软件包的安装，并构建一个简单而强大的多 Agent 工作流。

## 1. 前提条件

在开始之前，请确保你的系统中已安装 Node.js。AIGNE 框架需要较新版本的 Node.js 才能正常运行。

*   **Node.js**：20.0 或更高版本

你可以在终端中运行以下命令来检查你的 Node.js 版本：

```bash
node -v
```

如果你尚未安装 Node.js 或需要升级，我们建议使用像 `nvm` 这样的版本管理器，或从 [Node.js 官网](https://nodejs.org/) 下载。

## 2. 安装

你可以使用你偏好的包管理器将 AIGNE 框架添加到你的项目中：`npm`、`yarn` 或 `pnpm`。

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

此命令会安装核心包，该包为创建 AI Agent 和工作流提供了基础构建模块。

## 3. 你的第一个 AIGNE 应用程序

让我们构建一个简单的应用程序来演示“切换”（Handoff）工作流模式。在此示例中，`AgentA` 将接收初始提示，然后将对话切换给具有不同个性的 `AgentB`。

此示例还需要一个模型提供商来驱动 Agent。本指南中我们将使用 OpenAI。

首先，安装 OpenAI 模型包：

```bash
npm install @aigne/openai
```

现在，创建一个新的 TypeScript 文件（例如 `index.ts`）并添加以下代码：

```ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 用于加载环境变量
import * as dotenv from "dotenv";
dotenv.config();

// 1. 配置 AI 模型
// 确保你已在 .env 文件中设置了 OPENAI_API_KEY
const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in the environment variables.");
}

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定义一个“切换”技能
// 此函数定义了将控制权从 AgentA 转移到 AgentB 的条件。
function transferToB() {
  return agentB;
}

// 3. 定义你的 Agent
const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent. When the user asks to talk to agent b, use the transferToB skill.",
  outputKey: "A",
  skills: [transferToB], // 附加切换技能
  inputKey: "message",
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  inputKey: "message",
});

// 4. 初始化 AIGNE 框架
const aigne = new AIGNE({ model });

// 运行应用程序的主函数
async function main() {
  // 5. 与 AgentA 启动一个会话
  const userAgent = aigne.invoke(agentA);

  // 6. 第一次交互：触发切换
  console.log("User: transfer to agent b");
  const result1 = await userAgent.invoke({ message: "transfer to agent b" });
  console.log("Agent:", result1);
  // 预期输出：
  // {
  //   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
  // }

  // 7. 第二次交互：与 AgentB 对话
  // 该会话现在永久地与 AgentB 保持
  console.log("\nUser: It's a beautiful day");
  const result2 = await userAgent.invoke({ message: "It's a beautiful day" });
  console.log("Agent:", result2);
  // 预期输出：
  // {
  //   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
  // }
}

main().catch(console.error);
```

### 代码解析

1.  **配置 AI 模型**：我们导入 `OpenAIChatModel` 并使用 API 密钥对其进行初始化。最佳实践是从环境变量中加载 API 密钥等机密信息。
2.  **定义“切换”技能**：`transferToB` 函数是一个*技能*。执行时，它会返回 `agentB` 的定义，向 AIGNE 发出信号，表明控制权应转移给该 Agent。
3.  **定义你的 Agent**：我们使用 `AIAgent.from()` 创建了两个不同的 Agent。
    *   `agentA` 是初始接触点。其 `skills` 数组包含 `transferToB` 函数，使其能够执行切换操作。
    *   `agentB` 有一个特定的个性——它只用俳句（haikus）说话。
4.  **初始化 AIGNE 框架**：我们创建 `AIGNE` 的一个实例，并传入它将用于驱动 Agent 的模型。
5.  **启动会话**：`aigne.invoke(agentA)` 会创建一个有状态的用户会话，并从 `agentA` 开始。
6.  **触发切换**：第一条消息 “transfer to agent b” 与 `agentA` 的指令相匹配，`agentA` 随之执行 `transferToB` 技能。对话现在被永久切换给 `agentB`。输出键为 `B`，表示响应来自 `agentB`。
7.  **与 AgentB 对话**：第二条消息被发送到同一个 `userAgent` 会话中。由于切换已经发生，`agentB` 会接收到该消息，并根据其指令用俳句进行回应。

## 4. 运行代码

要运行该示例，请按以下步骤操作：

1.  在你的项目根目录中**创建一个 `.env` 文件**，用于存储你的 OpenAI API 密钥：
    ```
    OPENAI_API_KEY="your_openai_api_key_here"
    ```

2.  **安装 `dotenv` 和 `ts-node`**，用于管理环境变量和直接运行 TypeScript：
    ```bash
    npm install dotenv ts-node typescript
    ```

3.  使用 `ts-node` **执行脚本**：
    ```bash
    npx ts-node index.ts
    ```

你将在控制台中看到 Agent 互动并执行切换的输出。

## 后续步骤

恭喜！你已成功构建并运行了你的第一个 AIGNE 应用程序。

接下来，你可以探索该框架更高级的功能：

*   **发现主要特性**：了解模块化设计、多模型支持和代码执行能力。
*   **探索工作流模式**：深入研究其他强大的模式，如顺序（Sequential）、路由（Router）和并发（Concurrency），以构建更复杂的应用程序。
*   **查阅 API 参考**：获取关于所有可用类、方法和配置的详细信息。