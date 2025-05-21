# 🚀 快速开始

AIGNE Framework 让你用极简代码构建强大的 AI 代理和工作流。跟着下面的步骤，马上体验 AI 魔法，享受“写一点点，玩很大”的乐趣吧！✨

## 安装 🛠️

第一步，安装依赖！只需一条命令，立刻拥有构建 AI 代理的全部能力。支持 npm/yarn/pnpm，随你喜欢。

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

## 基础 Agent 🤖

只需几行代码，你就能拥有一个会聊天、能理解你的专属 AI 伙伴！指定模型、加点指令，马上体验“AI 回你消息”的快乐。下面的示例展示了如何初始化 agent 并进行一次简单的对话调用。

```ts file="../examples/test/quick-start.test.ts" region="example-quick-start"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const agent = AIAgent.from({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
  instructions: "You are a helpful assistant",
});

const result = await agent.invoke("What is Aigne?");

console.log(result);
// Output: { $message: "Aigne is a platform for building AI agents." }
```

## 为 Agent 添加技能 🦸

让你的 AI 变身“超能力者”！只需加一行，Agent 就能调用外部服务、查行情、查天气、甚至远程控制。每个技能都是一个新 superpower，组合越多，玩法越多！

AIGNE 支持通过“技能”扩展 agent 的能力。例如，你可以集成 MCP 服务器（如 ccxt）让 agent 具备获取加密货币行情等能力。只需将技能对象添加到 agent 的 `skills` 配置项，agent 即可自动调用这些技能完成复杂任务。

```ts file="../examples/test/quick-start.test.ts" region="example-quick-start-with-skills"
import { AIAgent, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const ccxt = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});

const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  instructions: "You are a helpful assistant",
  skills: [ccxt],
});

const result = await agent.invoke(
  "What is the crypto price of ABT/USD in coinbase?",
);

console.log(result);
// Output: { $message:"The current price of ABT/USD on Coinbase is $0.9684." }
```

## 为 Agent 启用 Memory 🧠

让你的 AI 拥有“记忆力”！开启 memory 后，Agent 能记住你说过的话，实现多轮对话、上下文追踪，体验“AI 真的懂你”的感觉。只需加一行配置，AI 变得更聪明！

```ts file="../examples/test/quick-start.test.ts" region="example-quick-start-with-memory"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  instructions: "You are a helpful assistant",
  memory: true,
});

const result1 = await agent.invoke(
  "My name is John Doe and I like to play football.",
);
console.log(result1);
// Output: { $message: "Nice to meet you, John Doe! Football is a great sport. Do you play on a team or just for fun? What position do you enjoy playing the most?" }

const result2 = await agent.invoke("What is my favorite sport?");
console.log(result2);
// Output: { $message: "Your favorite sport is football." }

const result3 = await agent.invoke("My favorite color is blue.");
console.log(result3);
// Output: { $message: "Got it, your favorite color is blue! If there's anything else you'd like to share or ask, feel free!" }

const result4 = await agent.invoke("What is my favorite color?");
console.log(result4);
// Output: { $message: "Your favorite color is blue!" }
```

## 使用函数创建 FunctionAgent 🛠️

不仅能聊天，AIGNE 还能让你的任意函数一键变身“智能工具”！用类型安全的 schema 保护输入输出，写工具、做数据处理都超丝滑。让你的代码既聪明又可靠！

除了对话式 Agent，AIGNE 还支持通过 FunctionAgent 快速封装任意函数，具备类型安全的输入输出校验。你可以用 zod 定义输入输出 schema，让函数调用更安全、更易组合。适合需要结构化数据处理、工具函数封装等场景。

```ts file="../examples/test/quick-start.test.ts" region="example-quick-start-with-function"
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const plus = FunctionAgent.from({
  name: "plus",
  inputSchema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
  outputSchema: z.object({
    sum: z.number().describe("Sum of the two numbers"),
  }),
  process({ a, b }) {
    return { sum: a + b };
  },
});

const result = await plus.invoke({ a: 1, b: 2 });
console.log(result);
// Output: { sum: 3 }
```

## 使用 FunctionAgent 作为增强 Agent 🧩

让自然语言和你的函数工具无缝协作！把 FunctionAgent 加到 AIAgent 的技能里，AI 就能自动调用你的函数，做推理、算账、查数据，组合玩法无限，体验“AI+工具=超强大脑”！

FunctionAgent 也可以作为“技能”集成到 AIAgent，实现自然语言与结构化工具的无缝协作。只需将 FunctionAgent 添加到 skills，AIAgent 即可在对话中自动调用这些函数，完成计算、数据处理等复杂任务。

```ts file="../examples/test/quick-start.test.ts" region="example-quick-start-with-function-skill"
import { AIAgent, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const calculator = FunctionAgent.from({
  name: "calculator",
  description: "A simple calculator",
  inputSchema: z.object({
    operation: z
      .enum(["add", "subtract", "multiply", "divide"])
      .describe("Operation to perform"),
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
  outputSchema: z.object({
    result: z.number().describe("Result of the operation"),
  }),
  process({ operation, a, b }) {
    switch (operation) {
      case "add":
        return { result: a + b };
      case "subtract":
        return { result: a - b };
      case "multiply":
        return { result: a * b };
      case "divide":
        return { result: a / b };
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  },
});

const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  instructions: "You are a helpful assistant",
  skills: [calculator],
});

const result = await agent.invoke("What is 1 + 2?");
console.log(result);
// Output: { $message: "The result is 3." }
```
