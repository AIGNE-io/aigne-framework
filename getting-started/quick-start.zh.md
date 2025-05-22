# 🚀 快速开始

AIGNE Framework 让你用极简代码构建强大的 AI Agent 和工作流。跟着下面的步骤，马上体验 AI 魔法，享受"写一点点，玩很大"的乐趣吧！✨

## 安装 🛠️

第一步，安装依赖！只需一条命令，立刻拥有构建 AI Agent 的全部能力。支持 npm/yarn/pnpm，随你喜欢。

AIGNE Framework 依赖于核心包 `@aigne/core` 和模型包（如 `@aigne/openai`）。你可以根据自己的包管理工具选择合适的安装命令。安装完成后，即可开始构建属于你的 Agent。

```bash
npm install @aigne/core @aigne/openai
```

也可使用 yarn 或 pnpm：

```bash
yarn add @aigne/core @aigne/openai
# 或
pnpm add @aigne/core @aigne/openai
```

## 创建你的第一个 Agent 🎉

接下来我们将一步步构建一个简单但功能完整的 AI Agent。下面的每个步骤都是构建过程的重要组成部分。

### 导入必要的模块

首先，我们需要导入 AIGNE 框架的核心组件和模型实现：

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-basic" only_imports
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
```

这里我们导入了两个核心组件：

* `AIAgent` - 用于创建和配置 AI Agent 的类
* `AIGNE` - 框架的主类，负责协调 Agent 和模型
* `OpenAIChatModel` - OpenAI 聊天模型的实现，用于处理实际的 AI 交互

### 创建 AIGNE 实例

接下来，我们需要创建一个 AIGNE 实例，并配置它使用 OpenAI 的模型：

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-create-aigne" exclude_imports
const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});
```

这段代码：

* 创建一个 AIGNE 框架实例
* 配置使用 OpenAI 的 `gpt-4o-mini` 模型
* 从环境变量 `OPENAI_API_KEY` 获取 API 密钥（确保你已设置此环境变量）

你可以根据需要选择不同的模型，如 `gpt-4o`、`o1` 或其他 OpenAI 支持的模型。

### 创建 Agent

现在，让我们创建一个简单的 AI Agent：

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-create-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
});
```

这里：

* 使用 `AIAgent.from()` 方法创建一个 Agent
* 通过 `instructions` 参数设置 Agent 的行为指南
* 这个简单指令告诉 AI 它应该扮演一个乐于助人的助手角色

你可以根据需要自定义指令，使 Agent 扮演不同角色或专注于特定领域的任务。

### 运行 Agent

现在我们可以调用 Agent 来处理用户的请求：

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-invoke" exclude_imports
const result = await aigne.invoke(agent, "What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

这段代码：

* 使用 `aigne.invoke()` 方法调用 Agent
* 传入之前创建的 Agent 实例和用户的问题
* 异步等待响应并输出结果
* 输出结果包含在 `$message` 字段中

`invoke` 方法是与 Agent 交互的主要方式，它会返回一个包含 AI 响应的 Promise。

### Streaming 模式

对于长回答或需要实时显示生成内容的场景，AIGNE 支持流式输出：

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-streaming" exclude_imports
const stream = await aigne.invoke(agent, "What is AIGNE?", { streaming: true });

let response = "";
for await (const chunk of stream) {
  console.log(chunk);
  if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
}
console.log(response);
// Output:  "AIGNE is a platform for building AI agents."
```

这段代码：

* 通过设置 `{ streaming: true }` 选项启用流式输出
* 使用 `for await...of` 循环处理每个响应片段
* 将每个片段中的 `delta.text.$message` 追加到最终响应
* 最后输出完整的响应

流式输出对于构建实时聊天界面或需要逐步显示长回答的应用特别有用。

### 完整示例

下面是一个完整的示例，包含了以上所有步骤：

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-basic"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
});

const result = await aigne.invoke(agent, "What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }

const stream = await aigne.invoke(agent, "What is AIGNE?", { streaming: true });

let response = "";
for await (const chunk of stream) {
  console.log(chunk);
  if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
}
console.log(response);
// Output:  "AIGNE is a platform for building AI agents."
```
