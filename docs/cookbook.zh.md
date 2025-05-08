# AIGNE Framework Cookbook

[English](./cookbook.md) | **中文**

## 目录

* [AIGNE Framework Cookbook](#aigne-framework-cookbook)
  * [目录](#目录)
  * [介绍](#介绍)
  * [安装](#安装)
    * [安装 AIGNE Framework](#安装-aigne-framework)
  * [基础概念](#基础概念)
    * [聊天模型（ChatModel）](#聊天模型chatmodel)
    * [Agent](#agent)
    * [工作流](#工作流)
    * [执行引擎](#执行引擎)
  * [工作流模式](#工作流模式)
    * [代码执行工作流 (Code Execution)](#代码执行工作流-code-execution)
    * [顺序工作流 (Sequential)](#顺序工作流-sequential)
    * [并发工作流 (Concurrency)](#并发工作流-concurrency)
    * [反思工作流 (Reflection)](#反思工作流-reflection)
    * [交接工作流 (Handoff)](#交接工作流-handoff)
    * [路由工作流 (Router)](#路由工作流-router)
    * [编排工作流 (Orchestrator)](#编排工作流-orchestrator)
  * [MCP服务器集成](#mcp服务器集成)
    * [Puppeteer MCP服务器](#puppeteer-mcp服务器)
    * [SQLite MCP服务器](#sqlite-mcp服务器)
  * [使用模式与最佳实践](#使用模式与最佳实践)
    * [选择合适的工作流模式](#选择合适的工作流模式)
    * [设计有效的Agent提示](#设计有效的agent提示)
    * [组合多种工作流模式](#组合多种工作流模式)
  * [常见问题解答](#常见问题解答)

## 介绍

AIGNE Framework是一个用于构建基于大型语言模型(LLM)的应用程序的框架。它提供了一系列工具和抽象，使开发者能够轻松地创建复杂的AI工作流程。本Cookbook旨在帮助开发者理解AIGNE Framework的核心概念，并通过示例展示如何使用不同的工作流模式来解决实际问题。

## 安装

要开始使用AIGNE Framework，你需要安装相关依赖。

### 安装 AIGNE Framework

**npm**

```bash
npm install @aigne/core

# 如果需要 Agent Library 中的高级 Agent
npm install @aigne/agent-library

# 根据需要选择安装 LLM
npm install openai @anthropic-ai/sdk @google/generative-ai
```

**yarn**

```bash
yarn add @aigne/core

# 如果需要 Agent Library 中的高级 Agent
yarn add @aigne/agent-library

# 根据需要选择安装 LLM
yarn add openai @anthropic-ai/sdk @google/generative-ai
```

**pnpm**

```bash
pnpm install @aigne/core

# 如果需要 Agent Library 中的高级 Agent
pnpm install @aigne/agent-library

# 根据需要选择安装 LLM
pnpm install openai @anthropic-ai/sdk @google/generative-ai
```

## 基础概念

### 聊天模型（ChatModel）

在AIGNE Framework中，ChatModel是与大型语言模型（LLM）交互的抽象基类。它提供了统一的接口来处理不同的底层模型实现，包括：

* **OpenAIChatModel**: 用于与OpenAI的GPT系列模型进行通信
* **ClaudeChatModel**: 用于与Anthropic的Claude系列模型进行通信
* **XAIChatModel**: 用于与X.AI的Grok系列模型进行通信

ChatModel可以直接使用，但通常建议通过 AIGNE 来使用，以获得更高级的功能如工具集成、错误处理和状态管理。

**示例**:

```typescript file=../packages/core/test/models/model-simple-usage.test.ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// Initialize OpenAI model
const model = new OpenAIChatModel({
  apiKey: "YOUR_OPENAI_API_KEY",
  model: "gpt-4o-mini", // Optional, defaults to "gpt-4o-mini"
});

// Use with AIGNE
const aigne = new AIGNE({ model });

// Or use with AIAgent directly
const agent = AIAgent.from({
  model,
  instructions: "You are a helpful assistant.",
});

const result = await aigne.invoke(agent, "Hello");

console.log(result);
// Output:
// {
//   $message: "Hello! How can I assist you today?",
// }
```

更多信息请参考[ChatModel API文档](./apis/chat-model.zh.md)。

### Agent

在AIGNE Framework中，Agent是工作流的基本构建块。每个Agent有特定的指令和能力，可以处理输入并产生输出。框架提供了多种类型的Agent：

* **AIAgent**: 使用大型语言模型的Agent，能够理解和生成自然语言
* **FunctionAgent**: 执行特定函数的Agent，通常用于与外部系统交互
* **MCPAgent**: 连接到Model Context Protocol (MCP)服务器的Agent，提供额外的能力

### 工作流

AIGNE Framework支持多种工作流模式，每种模式适用于不同的场景：

* **顺序工作流**: Agents按顺序执行
* **并发工作流**: 多个Agents并行执行
* **反思工作流**: Agents通过反馈循环改进输出
* **交接工作流**: Agents之间相互交接任务
* **路由工作流**: 根据输入动态选择Agent
* **编排工作流**: 组织多个Agents协同工作

### AIGNE

AIGNE 是工作流的运行时环境，负责协调 Agents 之间的通信和执行流程。

```typescript
const aigne = new AIGNE({ model });
```

## 工作流模式

### 代码执行工作流 (Code Execution)

**场景**: 需要动态执行代码来解决问题，如计算、算法实现

**工作流程**:

1. 用户提供问题
2. Coder Agent生成代码
3. Sandbox Agent执行代码
4. Coder返回结果

**示例**:

```typescript file=../examples/workflow-code-execution/usages.ts
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const sandbox = FunctionAgent.from({
  name: "evaluateJs",
  description: "A js sandbox for running javascript code",
  inputSchema: z.object({
    code: z.string().describe("The code to run"),
  }),
  process: async (input: { code: string }) => {
    const { code } = input;
    // biome-ignore lint/security/noGlobalEval: <explanation>
    const result = eval(code);
    return { result };
  },
});

const coder = AIAgent.from({
  name: "coder",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the sandbox to execute your code.
`,
  skills: [sandbox],
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(coder, "10! = ?");
console.log(result);
// Output:
// {
//   $message: "The value of \\(10!\\) (10 factorial) is 3,628,800.",
// }
```

### 顺序工作流 (Sequential)

**场景**: 需要多个步骤按顺序处理数据，如内容生成管道

**工作流程**:

1. 按顺序执行多个Agent
2. 每个Agent的输出作为下一个Agent的输入
3. 最终输出是最后一个Agent的结果

**示例**:

```typescript file=../examples/workflow-sequential/usages.ts
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const conceptExtractor = AIAgent.from({
  instructions: `\
You are a marketing analyst. Give a product description, identity:
- Key features
- Target audience
- Unique selling points

Product description:
{{product}}`,
  outputKey: "concept",
});

const writer = AIAgent.from({
  instructions: `\
You are a marketing copywriter. Given a block of text describing features, audience, and USPs,
compose a compelling marketing copy (like a newsletter section) that highlights these points.
Output should be short (around 150 words), output just the copy as a single text block.

Product description:
{{product}}

Below is the info about the product:
{{concept}}`,
  outputKey: "draft",
});

const formatProof = AIAgent.from({
  instructions: `\
You are an editor. Given the draft copy, correct grammar, improve clarity, ensure consistent tone,
give format and make it polished. Output the final improved copy as a single text block.

Product description:
{{product}}

Below is the info about the product:
{{concept}}

Draft copy:
{{draft}}`,
  outputKey: "content",
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(
  TeamAgent.from({
    skills: [conceptExtractor, writer, formatProof],
    mode: ProcessMode.sequential,
  }),
  {
    product: "AIGNE is a No-code Generative AI Apps Engine",
  },
);

console.log(result);

// Output:
// {
//   concept: "**Product Description: AIGNE - No-code Generative AI Apps Engine**\n\nAIGNE is a cutting-edge No-code Generative AI Apps Engine designed to empower users to seamlessly create ...",
//   draft: "Unlock the power of creation with AIGNE, the revolutionary No-code Generative AI Apps Engine! Whether you're a small business looking to streamline operations, an entrepreneur ...",
//   content: "Unlock the power of creation with AIGNE, the revolutionary No-Code Generative AI Apps Engine! Whether you are a small business aiming to streamline operations, an entrepreneur ...",
// }
```

### 并发工作流 (Concurrency)

**场景**: 需要并行执行多个独立任务，然后聚合结果

**工作流程**:

1. 同时执行多个Agent
2. 收集所有Agent的结果
3. 返回包含所有结果的对象

**示例**:

```typescript file=../examples/workflow-concurrency/usages.ts
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.

Product description:
{{product}}`,
  outputKey: "features",
});

const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.

Product description:
{{product}}`,
  outputKey: "audience",
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(
  TeamAgent.from({
    skills: [featureExtractor, audienceAnalyzer],
    mode: ProcessMode.parallel,
  }),
  {
    product: "AIGNE is a No-code Generative AI Apps Engine",
  },
);

console.log(result);

// Output:
// {
//   features: "**Product Name:** AIGNE\n\n**Product Type:** No-code Generative AI Apps Engine\n\n...",
//   audience: "**Small to Medium Enterprises (SMEs)**: \n   - Businesses that may not have extensive IT resources or budget for app development but are looking to leverage AI to enhance their operations or customer engagement.\n\n...",
// }
```

### 反思工作流 (Reflection)

**场景**: 需要通过多次迭代改进输出，如代码审查与修复

**工作流程**:

1. 初始Agent生成解决方案
2. 审查Agent评估解决方案
3. 如果审查不通过，返回初始Agent进行改进
4. 如果审查通过，返回最终结果

**示例**:

```typescript file=../examples/workflow-reflection/usages.ts
import {
  AIAgent,
  AIGNE,
  UserInputTopic,
  UserOutputTopic,
  createPublishMessage,
} from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const coder = AIAgent.from({
  subscribeTopic: [UserInputTopic, "rewrite_request"],
  publishTopic: "review_request",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the reviewer to improve your code.
Always put all finished code in a single Markdown code block.
For example:
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

Respond using the following format:

Thoughts: <Your comments>
Code: <Your code>

Previous review result:
{{feedback}}

User's question:
{{question}}
`,
  outputSchema: z.object({
    code: z.string().describe("Your code"),
  }),
});

const reviewer = AIAgent.from({
  subscribeTopic: "review_request",
  publishTopic: (output) =>
    output.approval ? UserOutputTopic : "rewrite_request",
  instructions: `\
You are a code reviewer. You focus on correctness, efficiency and safety of the code.

The problem statement is: {{question}}
The code is:
\`\`\`
{{code}}
\`\`\`

Previous feedback:
{{feedback}}

Please review the code. If previous feedback was provided, see if it was addressed.
`,
  outputSchema: z.object({
    approval: z.boolean().describe("APPROVE or REVISE"),
    feedback: z.object({
      correctness: z.string().describe("Your comments on correctness"),
      efficiency: z.string().describe("Your comments on efficiency"),
      safety: z.string().describe("Your comments on safety"),
      suggested_changes: z
        .string()
        .describe("Your comments on suggested changes"),
    }),
  }),
  includeInputInOutput: true,
});

const aigne = new AIGNE({ model, agents: [coder, reviewer] });
aigne.publish(
  UserInputTopic,
  createPublishMessage(
    "Write a function to find the sum of all even numbers in a list.",
  ),
);

const { message } = await aigne.subscribe(UserOutputTopic);
console.log(message);
// Output:
// {
//   code: "def sum_of_even_numbers(numbers):\n    \"\"\"Function to calculate the sum of all even numbers in a list.\"\"\"\n    return sum(number for number in numbers if number % 2 == 0)",
//   approval: true,
//   feedback: {
//     correctness: "The function correctly calculates the sum of all even numbers in the given list. It properly checks for evenness using the modulus operator and sums the valid numbers.",
//     efficiency: "The implementation is efficient as it uses a generator expression which computes the sum in a single pass over the list. This minimizes memory usage as compared to creating an intermediate list of even numbers.",
//     safety: "The function does not contain any safety issues. However, it assumes that all elements in the input list are integers. It would be prudent to handle cases where the input contains non-integer values (e.g., None, strings, etc.).",
//     suggested_changes: "Consider adding type annotations to the function for better clarity and potential type checking, e.g. `def sum_of_even_numbers(numbers: list[int]) -> int:`. Also, include input validation to ensure 'numbers' is a list of integers.",
//   },
// }
```

### 交接工作流 (Handoff)

**场景**: 需要根据交互状态在不同Agent之间切换，如转接客服

**工作流程**:

1. 初始Agent处理用户请求
2. 如果需要转接，初始Agent将控制权交给另一个Agent
3. 新的Agent接管会话并继续处理

**示例**:

```typescript file=../examples/workflow-handoff/usages.ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

function transfer_to_b() {
  return agentB;
}

const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent.",
  outputKey: "A",
  skills: [transfer_to_b],
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
});

const aigne = new AIGNE({ model });

const userAgent = aigne.invoke(agentA);

const result1 = await userAgent.invoke("transfer to agent b");
console.log(result1);
// Output:
// {
//   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
// }

const result2 = await userAgent.invoke("It's a beautiful day");
console.log(result2);
// Output:
// {
//   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
// }
```

### 路由工作流 (Router)

**场景**: 需要根据用户输入自动选择适当的处理Agent，如客服分流

**工作流程**:

1. 路由Agent分析用户请求
2. 自动选择最合适的处理Agent
3. 选中的Agent处理请求并返回结果

**示例**:

```typescript file=../examples/workflow-router/usages.ts
import { AIAgent, AIAgentToolChoice, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const productSupport = AIAgent.from({
  name: "product_support",
  description: "Agent to assist with any product-related questions.",
  instructions: `You are an agent capable of handling any product-related questions.
  Your goal is to provide accurate and helpful information about the product.
  Be polite, professional, and ensure the user feels supported.`,
  outputKey: "product_support",
});

const feedback = AIAgent.from({
  name: "feedback",
  description: "Agent to assist with any feedback-related questions.",
  instructions: `You are an agent capable of handling any feedback-related questions.
  Your goal is to listen to the user's feedback, acknowledge their input, and provide appropriate responses.
  Be empathetic, understanding, and ensure the user feels heard.`,
  outputKey: "feedback",
});

const other = AIAgent.from({
  name: "other",
  description: "Agent to assist with any general questions.",
  instructions: `You are an agent capable of handling any general questions.
  Your goal is to provide accurate and helpful information on a wide range of topics.
  Be friendly, knowledgeable, and ensure the user feels satisfied with the information provided.`,
  outputKey: "other",
});

const triage = AIAgent.from({
  name: "triage",
  instructions: `You are an agent capable of routing questions to the appropriate agent.
  Your goal is to understand the user's query and direct them to the agent best suited to assist them.
  Be efficient, clear, and ensure the user is connected to the right resource quickly.`,
  skills: [productSupport, feedback, other],
  toolChoice: AIAgentToolChoice.router, // Set toolChoice to "router" to enable router mode
});

const aigne = new AIGNE({ model });

const result1 = await aigne.invoke(triage, "How to use this product?");
console.log(result1);
// {
//   product_support: "I’d be happy to help you with that! However, I need to know which specific product you’re referring to. Could you please provide me with the name or type of product you have in mind?",
// }

const result2 = await aigne.invoke(triage, "I have feedback about the app.");
console.log(result2);
// {
//   feedback: "Thank you for sharing your feedback! I'm here to listen. Please go ahead and let me know what you’d like to share about the app.",
// }

const result3 = await aigne.invoke(triage, "What is the weather today?");
console.log(result3);
// {
//   other: "I can't provide real-time weather updates. However, you can check a reliable weather website or a weather app on your phone for the current conditions in your area. If you tell me your location, I can suggest a few sources where you can find accurate weather information!",
// }
```

### 编排工作流 (Orchestrator)

**场景**: 需要协调多个专业Agent完成复杂任务，如研究报告生成

**工作流程**:

1. 编排Agent分析任务并确定所需的子任务
2. 调用专业Agent执行各子任务
3. 合成所有结果成为最终输出

**示例**:

```typescript file=../examples/workflow-orchestrator/usage.ts
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator/index.js";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
  modelOptions: {
    parallelToolCalls: false, // puppeteer can only run one task at a time
  },
});

const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  env: process.env as Record<string, string>,
});

const filesystem = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", import.meta.dir],
});

const finder = AIAgent.from({
  name: "finder",
  description: "Find the closest match to a user's request",
  instructions: `You are an agent that can find information on the web.
You are tasked with finding the closest match to the user's request.
You can use puppeteer to scrape the web for information.
You can also use the filesystem to save the information you find.

Rules:
- do not use screenshot of puppeteer
- use document.body.innerText to get the text content of a page
- if you want a url to some page, you should get all link and it's title of current(home) page,
then you can use the title to search the url of the page you want to visit.
  `,
  skills: [puppeteer, filesystem],
});

const writer = AIAgent.from({
  name: "writer",
  description: "Write to the filesystem",
  instructions: `You are an agent that can write to the filesystem.
  You are tasked with taking the user's input, addressing it, and
  writing the result to disk in the appropriate location.`,
  skills: [filesystem],
});

const agent = OrchestratorAgent.from({
  skills: [finder, writer],
  maxIterations: 3,
  tasksConcurrency: 1, // puppeteer can only run one task at a time
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(
  agent,
  `\
Conduct an in-depth research on ArcBlock using only the official website\
(avoid search engines or third-party sources) and compile a detailed report saved as arcblock.md. \
The report should include comprehensive insights into the company's products \
(with detailed research findings and links), technical architecture, and future plans.`,
);
console.log(result);
// Output:
// {
//   $message: "The objective of conducting in-depth research on ArcBlock using only the official website has been successfully completed...",
// }
```

## MCP服务器集成

AIGNE Framework可以通过Model Context Protocol (MCP)与外部服务器集成，扩展其功能。

### Puppeteer MCP服务器

Puppeteer MCP服务器允许AIGNE Framework访问和操作网页内容。

**功能**:

* 导航到URL
* 执行JavaScript
* 提取网页内容

**示例**:

```typescript file=../examples/mcp-puppeteer/usages.ts
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const puppeteerMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
});

const aigne = new AIGNE({
  model,
  skills: [puppeteerMCPAgent],
});

const agent = AIAgent.from({
  instructions: `\
## Steps to extract content from a website
1. navigate to the url
2. evaluate document.body.innerText to get the content
`,
  memory: true,
});

const result = await aigne.invoke(
  agent,
  "extract content from https://www.arcblock.io",
);

console.log(result);
// output:
// {
//   $message: "The content extracted from the website [ArcBlock](https://www.arcblock.io) is as follows:\n\n---\n\n**Redefining Software Architect and Ecosystems**\n\nA total solution for building decentralized applications ...",
// }

await aigne.shutdown();
```

### SQLite MCP服务器

SQLite MCP服务器允许AIGNE Framework与SQLite数据库交互。

**功能**:

* 执行读取查询
* 执行写入查询
* 创建表
* 列出表
* 描述表结构

**示例**:

```typescript file=../examples/mcp-sqlite/usages.ts
import { join } from "node:path";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const sqlite = await MCPAgent.from({
  command: "uvx",
  args: [
    "-q",
    "mcp-server-sqlite",
    "--db-path",
    join(process.cwd(), "usages.db"),
  ],
});

const aigne = new AIGNE({
  model,
  skills: [sqlite],
});

const agent = AIAgent.from({
  instructions: "You are a database administrator",
  memory: true,
});

console.log(
  await aigne.invoke(
    agent,
    "create a product table with columns name description and createdAt",
  ),
);
// output:
// {
//   $message: "The product table has been created successfully with the columns: `name`, `description`, and `createdAt`.",
// }

console.log(await aigne.invoke(agent, "create 10 products for test"));
// output:
// {
//   $message: "I have successfully created 10 test products in the database. Here are the products that were added:\n\n1. Product 1: $10.99 - Description for Product 1\n2. Product 2: $15.99 - Description for Product 2\n3. Product 3: $20.99 - Description for Product 3\n4. Product 4: $25.99 - Description for Product 4\n5. Product 5: $30.99 - Description for Product 5\n6. Product 6: $35.99 - Description for Product 6\n7. Product 7: $40.99 - Description for Product 7\n8. Product 8: $45.99 - Description for Product 8\n9. Product 9: $50.99 - Description for Product 9\n10. Product 10: $55.99 - Description for Product 10\n\nIf you need any further assistance or operations, feel free to ask!",
// }

console.log(await aigne.invoke(agent, "how many products?"));
// output:
// {
//   $message: "There are 10 products in the database.",
// }

await aigne.shutdown();
```

## 使用模式与最佳实践

### 选择合适的工作流模式

选择工作流模式时应考虑以下因素：

1. **任务复杂度**: 简单任务可以使用单一Agent，复杂任务应使用多Agent工作流
2. **交互需求**: 需要用户参与的任务适合使用反思或交接工作流
3. **并行性**: 可独立执行的子任务适合并发工作流
4. **流程控制**: 严格按步骤进行的任务适合顺序工作流
5. **决策分支**: 需要根据输入动态选择处理路径的任务适合路由工作流
6. **复杂协调**: 需要多个专业Agent协同工作的任务适合编排工作流

### 设计有效的Agent提示

编写Agent指令时的最佳实践：

1. **明确角色**: 清晰定义Agent的身份和职责
2. **具体指令**: 提供明确的步骤和指导
3. **输出格式**: 指定期望的输出格式，特别是使用Schema时
4. **上下文变量**: 使用双大括号`{{variable}}`引用上下文变量
5. **思维链**: 鼓励Agent展示思考过程
6. **限制范围**: 明确Agent可以做什么，不能做什么

### 组合多种工作流模式

复杂应用可能需要组合多种工作流模式：

1. **顺序+并发**: 某些步骤顺序执行，其中一个步骤内部并发执行多个任务
2. **反思+顺序**: 顺序工作流的输出经过反思工作流改进
3. **路由+专业Agent**: 使用路由选择合适的专业Agent处理请求
4. **编排+所有其他**: 编排工作流可以协调使用所有其他工作流模式

## 常见问题解答

1. **如何在不同Agent之间共享数据？**
   * 使用`outputKey`将一个Agent的输出映射到上下文中的特定键
   * 下一个Agent可以通过`{{key}}`访问这些数据

2. **如何处理Agent失败或错误？**
   * 使用try/catch包装aigne.invoke调用
   * 设计工作流时考虑可能的失败路径，添加错误处理Agent

3. **如何限制Agent的输出格式？**
   * 使用`outputSchema`定义期望的输出结构
   * 使用Zod schema验证和类型检查

4. **如何自定义Agent之间的通信路径？**
   * 使用`subscribeTopic`和`publishTopic`定义消息主题
   * 创建自定义主题路由逻辑

5. **如何集成外部系统和API？**
   * 使用MCPAgent连接到相应的MCP服务器
   * 创建自定义FunctionAgent封装API调用
