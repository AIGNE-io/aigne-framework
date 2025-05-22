# 什么是 AIGNE？

AIGNE 是一个面向大语言模型（LLM）应用开发的前沿框架与运行时引擎。它为 Agent 编排、复杂 AI 工作流设计，以及多种 AI 模型与外部工具的集成提供了统一的平台，注重灵活性、可扩展性和易用性。

```ts file="../../docs-examples/test/what-is-aigne.test.ts" region="example-what-is-aigne-basic"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const agent = AIAgent.from({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
  instructions: "You are a helpful assistant",
});

const result = await agent.invoke("What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

## 主要特性

* **Agent 架构**：AIGNE 允许你定义、组合和协作多个具备不同技能或角色的 Agent，共同解决复杂任务。
* **工作流引擎**：可用极少代码设计并执行复杂的 AI 工作流，支持顺序、并发、事件驱动等多种模式。
* **无代码/低代码能力**：通过高级抽象和配置驱动设计，让没有深厚编程经验的用户也能轻松创建生成式 AI 应用。
* **模型无关性**：可无缝集成主流 LLM 提供商（如 OpenAI、Anthropic、Gemini 等），并灵活切换模型。
* **MCP 扩展**：通过连接外部 Model Context Protocol (MCP) 服务器，扩展 AIGNE 能力，实现工具调用、网页自动化、数据库访问等。

## 核心概念

* **Agent**：AIGNE 的基本构建单元。Agent 封装了处理输入和生成输出的逻辑、指令和能力，可为单一功能，也可组成团队或编排器。
* **工作流（Workflow）**：为实现特定目标而设计的 Agent 交互序列或网络，支持线性、并行或动态流程。
* **模型（Model）**：为 Agent 推理和生成提供支持的底层 LLM 或 AI 模型。AIGNE 对模型细节做了抽象，便于集成和切换。
* **MCP 集成**：AIGNE 可连接外部 MCP 服务器，访问更多工具、API 和资源，大幅扩展功能边界。
