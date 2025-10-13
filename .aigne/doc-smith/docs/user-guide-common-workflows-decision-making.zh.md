本文档为 `AIAgent` 类提供了一份详细指南，该类是在 AIGNE 框架中创建 AI Agent 的核心组件。`AIAgent` 利用大型语言模型（LLM）处理输入、执行复杂任务并生成智能响应。

## 概述

`AIAgent` 是一个多功能的 Agent，它连接到指定的语言模型来解释用户输入并执行操作。它为构建复杂的 AI 应用奠定了基础，并内置了对可自定义指令、工具使用（函数调用）和响应流的支持。

主要功能包括：
- **语言模型集成**：无缝连接到任何支持的聊天模型（例如 OpenAI、Gemini、Claude）。
- **可自定义的行为**：使用强大的提示指令来定义 Agent 的个性、目标和约束。
- **工具使用与函数调用**：通过为 Agent 提供可调用的工具（技能）来扩展其能力，以执行特定操作，例如与 API 或数据库交互。
- **灵活的工作流模式**：支持多种执行模式，包括自动工具选择、强制工具使用以及用于将任务定向到其他 Agent 的专用“路由器”模式。
- **流式传输支持**：能够在模型生成响应时以流式方式传输响应，从而支持实时应用。
- **结构化数据提取**：可配置为从模型的流式输出中解析和提取结构化数据（例如 JSON、YAML）。

## 核心概念

理解这些核心概念是有效使用 `AIAgent` 的关键。

### 指令

`instructions` 属性是指导 Agent 行为的主要方式。对于更复杂的场景，它可以是一个简单的字符串或一个 `PromptBuilder` 实例。这些指令通常用于构建发送给语言模型的系统提示，为整个对话设置上下文。

**示例：**
```typescript
const agent = AIAgent.from({
  name: "HaikuBot",
  instructions: "You are a poetic assistant who only responds in haikus.",
});
```

### 输入和输出键

`AIAgent` 使用键来映射输入消息、模型和输出消息之间的数据。
- `inputKey`：指定输入消息中的哪个属性应被视为主用户文本。
- `outputKey`：定义输出消息中放置模型最终文本响应的属性。默认为 `message`。

**示例：**
```typescript
const agent = AIAgent.from({
  inputKey: "question", // 期望输入格式为 { question: "..." }
  outputKey: "answer",  // 生成输出格式为 { answer: "..." }
  instructions: "Answer the user's question.",
});
```

### 工具选择

`toolChoice` 选项控制 Agent 如何使用其技能（工具）。这是构建面向行动的 Agent 的一项强大功能。

- `AIAgentToolChoice.auto`（默认）：模型根据用户输入决定是否调用工具。
- `AIAgentToolChoice.none`：模型不会调用任何工具。
- `AIAgentToolChoice.required`：模型被强制调用可用工具之一。
- `AIAgentToolChoice.router`：一种特殊模式，其中 Agent 的唯一目的是选择单个最佳工具（或其他 Agent）来处理请求，然后将输入直接路由给它。

## 创建 AIAgent

创建 `AIAgent` 最直接的方法是使用静态的 `AIAgent.from()` 方法。

### 基本示例

以下是一个 `AIAgent` 的最小示例，它使用 OpenAI 模型来响应消息。

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. 初始化模型
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. 创建 AIAgent 实例
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful and friendly assistant.",
});

// 3. 初始化 AIGNE 运行时
const aigne = new AIGNE({ model });

// 4. 调用 Agent
const userAgent = aigne.invoke(assistantAgent);
const result = await userAgent.invoke({ message: "Hello, who are you?" });

console.log(result);
// Output: { message: "I am a helpful and friendly assistant. How can I assist you today?" }
```

### 带工具的 Agent

为了让 Agent 更强大，你可以为其提供 `skills`（工具）。在此示例中，我们创建了一个 `Calculator` Agent，并将其作为技能提供给一个主 `Assistant` Agent。

```typescript
import { AIAgent, AIGNE, Skill } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
});

// 1. 定义一个用于计算的技能（工具）
const calculatorSkill = Skill.from({
  name: "calculator",
  description: "A simple calculator for basic arithmetic operations.",
  input: z.object({
    expression: z.string().describe("The mathematical expression to evaluate, e.g., '2+2'"),
  }),
  func: async ({ expression }) => {
    // 在实际场景中，应使用安全的求值库
    return { result: eval(expression) };
  },
});

// 2. 创建一个带有该技能的 Agent
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant. Use the calculator tool for any math questions.",
  skills: [calculatorSkill],
  toolChoice: "auto", // 模型将决定何时使用计算器
});

const aigne = new AIGNE({ model });
const userAgent = aigne.invoke(assistantAgent);

// Agent 将自动使用计算器工具
const result = await userAgent.invoke({ message: "What is 127 + 345?" });

console.log(result);
// Output: { message: "127 + 345 is 472." }
```

## AIAgent 工作流

下图说明了 `AIAgent` 在处理请求时遵循的内部流程，包括它如何与语言模型交互以及如何执行工具。

```d2
direction: down

User: {
  shape: c4-person
}

AIAgent: {
  label: "AIAgent 内部工作流"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Input-Message: {
    label: "输入消息\n{ [inputKey]: '...' }"
    shape: rectangle
  }

  Prompt-Builder: {
    label: "构建提示\n(输入 + 指令 + 技能)"
    shape: rectangle
  }

  Tool-Executor: {
    label: "执行工具"
    shape: rectangle
  }

  Skill-Library: {
    label: "技能库"
    shape: cylinder
  }

  Response-Formatter: {
    label: "格式化最终响应\n(映射到 outputKey)"
    shape: rectangle
  }

  Output-Message: {
    label: "输出消息\n{ [outputKey]: '...' }"
    shape: rectangle
  }
}

LLM: {
  label: "LLM (聊天模型)"
  shape: rectangle
}

Tool-Decision: {
  label: "需要调用工具吗？"
  shape: diamond
}

User -> AIAgent.Input-Message: "1. 调用 Agent"
AIAgent.Input-Message -> AIAgent.Prompt-Builder
AIAgent.Prompt-Builder -> LLM: "2. 发送请求"
LLM -> Tool-Decision: "3. 模型响应"
Tool-Decision -> AIAgent.Tool-Executor: "是"
AIAgent.Tool-Executor -> AIAgent.Skill-Library: "4. 查找并运行技能"
AIAgent.Skill-Library -> AIAgent.Tool-Executor: "返回结果"
AIAgent.Tool-Executor -> LLM: "5. 发送工具结果"
LLM -> AIAgent.Response-Formatter: "6. 生成最终响应"
Tool-Decision -> AIAgent.Response-Formatter: "否"
AIAgent.Response-Formatter -> AIAgent.Output-Message: "7. 格式化输出"
AIAgent.Output-Message -> User: "8. 返回结果"

```