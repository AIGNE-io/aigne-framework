# AIGNE Framework Cookbook

[English](./cookbook.md) | **中文**

## 目录

- [AIGNE Framework Cookbook](#aigne-framework-cookbook)
  - [目录](#目录)
  - [介绍](#介绍)
  - [安装](#安装)
    - [安装 AIGNE Framework](#安装-aigne-framework)
    - [在 CommonJS 环境中使用 @aigne/core](#在-commonjs-环境中使用-aignecore)
  - [基础概念](#基础概念)
    - [聊天模型（ChatModel）](#聊天模型chatmodel)
    - [Agent](#agent)
    - [工作流](#工作流)
    - [执行引擎](#执行引擎)
  - [工作流模式](#工作流模式)
    - [代码执行工作流 (Code Execution)](#代码执行工作流-code-execution)
    - [顺序工作流 (Sequential)](#顺序工作流-sequential)
    - [并发工作流 (Concurrency)](#并发工作流-concurrency)
    - [反思工作流 (Reflection)](#反思工作流-reflection)
    - [交接工作流 (Handoff)](#交接工作流-handoff)
    - [路由工作流 (Router)](#路由工作流-router)
    - [编排工作流 (Orchestrator)](#编排工作流-orchestrator)
  - [MCP服务器集成](#mcp服务器集成)
    - [Puppeteer MCP服务器](#puppeteer-mcp服务器)
    - [SQLite MCP服务器](#sqlite-mcp服务器)
  - [使用模式与最佳实践](#使用模式与最佳实践)
    - [选择合适的工作流模式](#选择合适的工作流模式)
    - [设计有效的Agent提示](#设计有效的agent提示)
    - [组合多种工作流模式](#组合多种工作流模式)
  - [常见问题解答](#常见问题解答)

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

### 在 CommonJS 环境中使用 @aigne/core

@aigne/core 支持在 CommonJS 和 ES Module 环境中使用。如果你的项目使用 CommonJS 模块系统，但由于一个[第三方 lib 不支持 ESM](https://github.com/AIGNE-io/aigne-framework/issues/36)，在问题修复前，需要在项目中的 package.json 中加入下面的配置：

**npm**

```json
{
  "overrides": {
    "pkce-challenge": "https://github.com/AIGNE-io/pkce-challenge#dist"
  }
}
```

**yarn or pnpm**

```json
{
  "resolutions": {
    "pkce-challenge": "https://github.com/AIGNE-io/pkce-challenge#dist"
  }
}
```


## 基础概念

### 聊天模型（ChatModel）

在AIGNE Framework中，ChatModel是与大型语言模型（LLM）交互的抽象基类。它提供了统一的接口来处理不同的底层模型实现，包括：

- **OpenAIChatModel**: 用于与OpenAI的GPT系列模型进行通信
- **ClaudeChatModel**: 用于与Anthropic的Claude系列模型进行通信
- **XAIChatModel**: 用于与X.AI的Grok系列模型进行通信

ChatModel可以直接使用，但通常建议通过 AIGNE 来使用，以获得更高级的功能如工具集成、错误处理和状态管理。

**示例**:

```typescript
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js";
import { XAIChatModel } from "@aigne/core/models/xai-chat-model.js";

// 初始化OpenAI模型
const openaiModel = new OpenAIChatModel({
  apiKey: "YOUR_OPENAI_API_KEY",
  model: "gpt-4o-mini", // 可选，默认为"gpt-4o-mini"
});

// 初始化Claude模型
const claudeModel = new ClaudeChatModel({
  apiKey: "YOUR_ANTHROPIC_API_KEY",
  model: "claude-3-7-sonnet-latest", // 可选，默认为"claude-3-7-sonnet-latest"
});

// 初始化X.AI Grok模型
const xaiModel = new XAIChatModel({
  apiKey: "YOUR_XAI_API_KEY",
  model: "grok-2-latest", // 可选，默认为"grok-2-latest"
});

// 创建 AIGNE
const aigne = new AIGNE({ model: openaiModel });
```

更多信息请参考[ChatModel API文档](./apis/chat-model.zh.md)。

### Agent

在AIGNE Framework中，Agent是工作流的基本构建块。每个Agent有特定的指令和能力，可以处理输入并产生输出。框架提供了多种类型的Agent：

- **AIAgent**: 使用大型语言模型的Agent，能够理解和生成自然语言
- **FunctionAgent**: 执行特定函数的Agent，通常用于与外部系统交互
- **MCPAgent**: 连接到Model Context Protocol (MCP)服务器的Agent，提供额外的能力

### 工作流

AIGNE Framework支持多种工作流模式，每种模式适用于不同的场景：

- **顺序工作流**: Agents按顺序执行
- **并发工作流**: 多个Agents并行执行
- **反思工作流**: Agents通过反馈循环改进输出
- **交接工作流**: Agents之间相互交接任务
- **路由工作流**: 根据输入动态选择Agent
- **编排工作流**: 组织多个Agents协同工作

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

```typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

// 创建JavaScript沙箱
const sandbox = FunctionAgent.from({
  name: "js-sandbox",
  description: "A js sandbox for running javascript code",
  inputSchema: z.object({
    code: z.string().describe("The code to run"),
  }),
  process: async (input: { code: string }) => {
    const { code } = input;
    const result = eval(code);
    return { result };
  },
});

// 创建编码Agent
const coder = AIAgent.from({
  name: "coder",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the sandbox to execute your code.
`,
  skills: [sandbox],
});

// 创建执行引擎并运行
const aigne = new AIGNE({ model });
const result = await aigne.invoke(coder, "10! = ?");
console.log(result);
// 输出: { text: "The value of \\(10!\\) (10 factorial) is 3,628,800." }
```

### 顺序工作流 (Sequential)

**场景**: 需要多个步骤按顺序处理数据，如内容生成管道

**工作流程**:
1. 按顺序执行多个Agent
2. 每个Agent的输出作为下一个Agent的输入
3. 最终输出是最后一个Agent的结果

**示例**:

```typescript
import { AIAgent, AIGNE, TeamAgent, ProcessMode } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 概念提取Agent
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

// 文案撰写Agent
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

// 格式校对Agent
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

// 按顺序执行三个Agent
const aigne = new AIGNE({ model });
const result = await aigne.invoke(
  TeamAgent.from({
    skills: [conceptExtractor, writer, formatProof],
    mode: ProcessMode.sequential,
  }),
  { product: "AIGNE is a No-code Generative AI Apps Engine" }
);

console.log(result);
// 输出包含concept, draft和content三个阶段的结果
```

### 并发工作流 (Concurrency)

**场景**: 需要并行执行多个独立任务，然后聚合结果

**工作流程**:
1. 同时执行多个Agent
2. 收集所有Agent的结果
3. 返回包含所有结果的对象

**示例**:

```typescript
import { AIAgent, AIGNE, TeamAgent, ProcessMode } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 功能提取Agent
const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.

Product description:
{{product}}`,
  outputKey: "features",
});

// 受众分析Agent
const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.

Product description:
{{product}}`,
  outputKey: "audience",
});

// 并行执行两个Agent
const aigne = new AIGNE({ model });
const result = await aigne.invoke(
  TeamAgent.from({
    skills: [featureExtractor, audienceAnalyzer],
    mode: ProcessMode.parallel,
  }),
  { product: "AIGNE is a No-code Generative AI Apps Engine" }
);

console.log(result);
// 输出同时包含features和audience的结果
```

### 反思工作流 (Reflection)

**场景**: 需要通过多次迭代改进输出，如代码审查与修复

**工作流程**:
1. 初始Agent生成解决方案
2. 审查Agent评估解决方案
3. 如果审查不通过，返回初始Agent进行改进
4. 如果审查通过，返回最终结果

**示例**:

```typescript
import {
  AIAgent,
  AIGNE,
  UserInputTopic,
  UserOutputTopic,
} from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

// 编码Agent
const coder = AIAgent.from({
  subscribeTopic: [UserInputTopic, "rewrite_request"],
  publishTopic: "review_request",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the reviewer to improve your code.
Always put all finished code in a single Markdown code block.

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

// 审查Agent
const reviewer = AIAgent.from({
  subscribeTopic: "review_request",
  publishTopic: (output) => (output.approval ? UserOutputTopic : "rewrite_request"),
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
      suggested_changes: z.string().describe("Your comments on suggested changes"),
    }),
  }),
  includeInputInOutput: true,
});

// 执行反思工作流
const aigne = new AIGNE({ model, agents: [coder, reviewer] });
const result = await aigne.invoke("Write a function to find the sum of all even numbers in a list.");
console.log(result);
// 输出包含通过审查的代码及反馈
```

### 交接工作流 (Handoff)

**场景**: 需要根据交互状态在不同Agent之间切换，如转接客服

**工作流程**:
1. 初始Agent处理用户请求
2. 如果需要转接，初始Agent将控制权交给另一个Agent
3. 新的Agent接管会话并继续处理

**示例**:

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 转交给Agent B的函数
function transfer_to_b() {
  return agentB;
}

// Agent A
const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent.",
  outputKey: "A",
  skills: [transfer_to_b],
});

// Agent B
const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
});

// 执行交接工作流
const aigne = new AIGNE({ model });
const userAgent = aigne.invoke(agentA);

// 转交给Agent B
const result1 = await userAgent.invoke("transfer to agent b");
console.log(result1);
// { B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?" }

// 继续与Agent B交互
const result2 = await userAgent.invoke("It's a beautiful day");
console.log(result2);
// { B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy." }
```

### 路由工作流 (Router)

**场景**: 需要根据用户输入自动选择适当的处理Agent，如客服分流

**工作流程**:
1. 路由Agent分析用户请求
2. 自动选择最合适的处理Agent
3. 选中的Agent处理请求并返回结果

**示例**:

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 产品支持Agent
const productSupport = AIAgent.from({
  enableHistory: true,
  name: "product_support",
  description: "Agent to assist with any product-related questions.",
  instructions: `You are an agent capable of handling any product-related questions.
  Your goal is to provide accurate and helpful information about the product.
  Be polite, professional, and ensure the user feels supported.`,
  outputKey: "product_support",
});

// 反馈Agent
const feedback = AIAgent.from({
  enableHistory: true,
  name: "feedback",
  description: "Agent to assist with any feedback-related questions.",
  instructions: `You are an agent capable of handling any feedback-related questions.
  Your goal is to listen to the user's feedback, acknowledge their input, and provide appropriate responses.
  Be empathetic, understanding, and ensure the user feels heard.`,
  outputKey: "feedback",
});

// 一般查询Agent
const other = AIAgent.from({
  enableHistory: true,
  name: "other",
  description: "Agent to assist with any general questions.",
  instructions: `You are an agent capable of handling any general questions.
  Your goal is to provide accurate and helpful information on a wide range of topics.
  Be friendly, knowledgeable, and ensure the user feels satisfied with the information provided.`,
  outputKey: "other",
});

// 分流Agent
const triage = AIAgent.from({
  name: "triage",
  instructions: `You are an agent capable of routing questions to the appropriate agent.
  Your goal is to understand the user's query and direct them to the agent best suited to assist them.
  Be efficient, clear, and ensure the user is connected to the right resource quickly.`,
  skills: [productSupport, feedback, other],
  toolChoice: "router", // 设置为路由模式
});

// 执行路由工作流
const aigne = new AIGNE({ model });

// 产品相关问题自动路由到产品支持
const result1 = await aigne.invoke(triage, "How to use this product?");
console.log(result1);
// { product_support: "I'd be happy to help you with that! However, I need to know which specific product you're referring to..." }

// 反馈相关问题自动路由到反馈
const result2 = await aigne.invoke(triage, "I have feedback about the app.");
console.log(result2);
// { feedback: "Thank you for sharing your feedback! I'm here to listen..." }

// 一般问题自动路由到一般查询
const result3 = await aigne.invoke(triage, "What is the weather today?");
console.log(result3);
// { other: "I can't provide real-time weather updates. However, you can check a reliable weather website..." }
```

### 编排工作流 (Orchestrator)

**场景**: 需要协调多个专业Agent完成复杂任务，如研究报告生成

**工作流程**:
1. 编排Agent分析任务并确定所需的子任务
2. 调用专业Agent执行各子任务
3. 合成所有结果成为最终输出

**示例**:

```typescript
import { OrchestratorAgent } from "@aigne/agent-library";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 创建各专业Agent
const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
});

const finder = AIAgent.from({
  name: "finder",
  description: "Find the closest match to a user's request",
  instructions: `You are an agent with access to the filesystem,
  as well as the ability to fetch URLs. Your job is to identify
  the closest match to a user's request, make the appropriate tool calls,
  and return the URI and CONTENTS of the closest match.

  Rules:
  - use document.body.innerText to get the text content of a page
  - if you want a url to some page, you should get all link and it's title of current(home) page,
  then you can use the title to search the url of the page you want to visit.
  `,
  skills: [puppeteer],
});

const enhancedFinder = OrchestratorAgent.from({
  name: "enhanced_finder",
  description: "Enhanced finder with more skills",
  skills: [finder],
});

const filesystem = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", import.meta.dir],
});

const writer = AIAgent.from({
  name: "writer",
  description: "Write to the filesystem",
  instructions: `You are an agent that can write to the filesystem.
  You are tasked with taking the user's input, addressing it, and
  writing the result to disk in the appropriate location.`,
  skills: [filesystem],
});

// 各种审查Agent
const proofreader = AIAgent.from({
  name: "proofreader",
  description: "Review the short story for grammar, spelling, and punctuation errors",
  instructions: `Review the short story for grammar, spelling, and punctuation errors.
  Identify any awkward phrasing or structural issues that could improve clarity.
  Provide detailed feedback on corrections.`,
  skills: [],
});

const fact_checker = AIAgent.from({
  name: "fact_checker",
  description: "Verify the factual consistency within the story",
  instructions: `Verify the factual consistency within the story. Identify any contradictions,
  logical inconsistencies, or inaccuracies in the plot, character actions, or setting.
  Highlight potential issues with reasoning or coherence.`,
  skills: [],
});

const style_enforcer = AIAgent.from({
  name: "style_enforcer",
  description: "Analyze the story for adherence to style guidelines",
  instructions: `Analyze the story for adherence to style guidelines.
  Evaluate the narrative flow, clarity of expression, and tone. Suggest improvements to
  enhance storytelling, readability, and engagement.`,
  skills: [],
});

// 创建编排Agent
const agent = OrchestratorAgent.from({
  skills: [enhancedFinder, writer, proofreader, fact_checker, style_enforcer],
});

// 执行编排工作流
const aigne = new AIGNE({ model });
const result = await aigne.invoke(
  agent,
  `Conduct an in-depth research on ArcBlock using only the official website\
(avoid search engines or third-party sources) and compile a detailed report saved as arcblock.md. \
The report should include comprehensive insights into the company's products \
(with detailed research findings and links), technical architecture, and future plans.`
);
console.log(result);
```

## MCP服务器集成

AIGNE Framework可以通过Model Context Protocol (MCP)与外部服务器集成，扩展其功能。

### Puppeteer MCP服务器

Puppeteer MCP服务器允许AIGNE Framework访问和操作网页内容。

**功能**:
- 导航到URL
- 执行JavaScript
- 提取网页内容

**示例**:

```typescript
import {
  AIAgent,
  AIGNE,
  MCPAgent,
} from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 创建Puppeteer MCP Agent
const puppeteerMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
});

// 创建执行引擎
const aigne = new AIGNE({
  model,
  skills: [puppeteerMCPAgent],
});

// 创建使用Puppeteer的Agent
const agent = AIAgent.from({
  instructions: `\
## Steps to extract content from a website
1. navigate to the url
2. evaluate document.body.innerText to get the content
`,
});

// 执行内容提取
const result = await aigne.invoke(
  agent,
  "extract content from https://www.arcblock.io"
);

console.log(result);
// 输出提取的网页内容

await aigne.shutdown();
```

### SQLite MCP服务器

SQLite MCP服务器允许AIGNE Framework与SQLite数据库交互。

**功能**:
- 执行读取查询
- 执行写入查询
- 创建表
- 列出表
- 描述表结构

**示例**:

```typescript
import { join } from "node:path";
import {
  AIAgent,
  AIGNE,
  MCPAgent,
} from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 创建SQLite MCP Agent
const sqlite = await MCPAgent.from({
  command: "uvx",
  args: [
    "-q",
    "mcp-server-sqlite",
    "--db-path",
    join(process.cwd(), "usages.db"),
  ],
});

// 创建执行引擎
const aigne = new AIGNE({
  model,
  skills: [sqlite],
});

// 创建数据库管理Agent
const agent = AIAgent.from({
  instructions: "You are a database administrator",
});

// 创建表
console.log(
  await aigne.invoke(
    agent,
    "create a product table with columns name description and createdAt"
  )
);

// 插入数据
console.log(await aigne.invoke(agent, "create 10 products for test"));

// 查询数据
console.log(await aigne.invoke(agent, "how many products?"));
// 输出: { text: "There are 10 products in the database." }

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
   - 使用`outputKey`将一个Agent的输出映射到上下文中的特定键
   - 下一个Agent可以通过`{{key}}`访问这些数据

2. **如何处理Agent失败或错误？**
   - 使用try/catch包装aigne.invoke调用
   - 设计工作流时考虑可能的失败路径，添加错误处理Agent

3. **如何限制Agent的输出格式？**
   - 使用`outputSchema`定义期望的输出结构
   - 使用Zod schema验证和类型检查

4. **如何自定义Agent之间的通信路径？**
   - 使用`subscribeTopic`和`publishTopic`定义消息主题
   - 创建自定义主题路由逻辑

5. **如何集成外部系统和API？**
   - 使用MCPAgent连接到相应的MCP服务器
   - 创建自定义FunctionAgent封装API调用
