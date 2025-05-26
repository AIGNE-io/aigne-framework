# AIAgent

[English](./ai-agent.md) | [中文](./ai-agent.zh.md)

## 概述

AIAgent 是 AIGNE 框架中的一个核心组件，它允许开发者轻松创建由大型语言模型（LLM）驱动的智能代理。本文档详细介绍了 AIAgent 的多种创建模式（基础、自定义指令、带变量的自定义指令、结构化输出和技能集成）以及如何调用这些代理。AIAgent 的主要优势在于其简单性和灵活性，支持多种语言模型、自定义指令和结构化输出，使开发者能够根据不同场景快速构建智能对话系统。无论是需要简单问答的应用，还是复杂的多技能代理，AIAgent 都能提供简洁而强大的解决方案。

## 基础模式

在基础示例中，我们使用 AIAgent.from() 方法并提供一个语言模型来创建一个基本的 AI 代理。这种方式创建的代理可以直接回答用户的问题，是最简单的创建方式。

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-basic-create-agent"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});

const agent = AIAgent.from({ model });
```

## 调用 Agent

创建 AIAgent 后，可以使用 invoke 方法向代理发送请求并获取响应。在基本调用中，只需传入一个字符串作为用户的问题或指令。

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-basic-invoke"
const result = await agent.invoke("What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

## 流式响应

流式响应是一种实时获取 AI 回答的方式，它允许应用程序在完整响应生成过程中逐步接收和显示内容，而不是等待整个响应完成后一次性返回。这种方式特别适合需要即时反馈的交互式应用，如聊天机器人或实时辅助工具。

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-basic-invoke-stream"
const stream = await agent.invoke("What is AIGNE?", { streaming: true });
let response = "";
for await (const chunk of stream) {
  if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
}
console.log(response);
// Output:  "AIGNE is a platform for building AI agents."
```

主要特点：

* 通过设置 `streaming: true` 选项启用流式响应
* 使用 `for await...of` 循环处理响应流中的每个数据块
* 支持实时显示 AI 生成的内容，提升用户体验
* 适合需要即时反馈的应用场景，如聊天界面或实时内容生成
* 可以在长回答生成过程中提前开始处理或显示部分内容

## 自定义指令

当需要控制 AI 代理的行为或风格时，可以通过提供自定义指令来创建代理。

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-create-agent"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel();

const agent = AIAgent.from({
  model,
  instructions: "Only speak in Haikus.",
});
```

下面的示例展示了如何调用带有自定义指令的代理，并获取符合指定风格（俳句）的回答：

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-invoke"
const result = await agent.invoke("What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE stands for  \nA new approach to learning,  \nKnowledge intertwined." }
```

主要特点：

* 通过 instructions 参数提供自定义指令
* 控制 AI 代理的回答风格或行为
* 适合需要特定风格或专业领域回答的场景

### 带变量的自定义指令

在某些场景中，需要根据用户输入动态调整指令。AIAgent 支持在指令中使用变量，实现更灵活的控制。

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-with-variables-create-agent"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const model = new OpenAIChatModel();

const agent = AIAgent.from({
  model,
  inputSchema: z.object({
    style: z.string().describe("The style of the response."),
  }),
  instructions: "Only speak in {{style}}.",
});
```

下面的示例展示了如何调用带有变量的自定义指令代理。通过 createMessage 函数创建一个包含用户问题和变量值的消息，使代理能够根据提供的风格（Haikus）生成回答：

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-with-variables-invoke"
import { createMessage } from "@aigne/core";

const result = await agent.invoke(
  createMessage("What is AIGNE?", { style: "Haikus" }),
);
console.log(result);
// Output: { $message: "AIGNE, you ask now  \nArtificial Intelligence  \nGuidance, new tech blooms." }
```

主要特点：

* 使用双大括号 `{{变量名}}` 在指令中插入变量
* 通过 inputSchema 定义输入参数的结构和类型
* 适合需要动态调整 AI 行为的场景

### 结构化输出

当需要 AI 代理返回特定结构的数据时，可以通过定义输出模式来实现。

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-structured-output-create-agent"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const model = new OpenAIChatModel();

const agent = AIAgent.from({
  model,
  inputSchema: z.object({
    style: z.string().describe("The style of the response."),
  }),
  outputSchema: z.object({
    topic: z.string().describe("The topic of the request"),
    response: z.string().describe("The response to the request"),
  }),
  instructions: "Only speak in {{style}}.",
});
```

下面的示例展示了如何调用具有结构化输出的代理。与带变量的自定义指令类似，我们使用 createMessage 函数传递用户问题和变量值，但这次代理会返回符合我们定义的输出模式的结构化数据：

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-structured-output-invoke"
import { createMessage } from "@aigne/core";

const result = await agent.invoke(
  createMessage("What is AIGNE?", { style: "Haikus" }),
);
console.log(result);
// Output: { topic: "AIGNE", response: "AIGNE, you ask now  \nArtificial Intelligence  \nGuidance, new tech blooms." }
```

主要特点：

* 通过 outputSchema 定义输出数据的结构和类型
* 确保 AI 返回的数据符合预期格式
* 适合需要处理结构化数据的应用场景

### 技能集成

AIAgent 可以集成其他代理作为技能，扩展其功能范围。

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-with-skills-create-skill"
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const getWeather = FunctionAgent.from({
  name: "get_weather",
  description: "Get the current weather for a location.",
  inputSchema: z.object({
    location: z.string().describe("The location to get weather for"),
  }),
  outputSchema: z.object({
    temperature: z.number().describe("The current temperature in Celsius"),
    condition: z.string().describe("The current weather condition"),
    humidity: z.number().describe("The current humidity percentage"),
  }),
  process: async ({ location }) => {
    console.log(`Fetching weather for ${location}`);
    // This would typically call a weather API
    return {
      temperature: 22,
      condition: "Sunny",
      humidity: 45,
    };
  },
});
```

下面的示例展示了如何创建一个集成了天气查询技能的 AIAgent。通过将之前创建的 getWeather 函数代理添加到 skills 数组中，使 AI 代理能够访问和使用这个技能：

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-with-skills-create-agent"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  instructions:
    "You are a helpful assistant that can provide weather information.",
  skills: [getWeather],
});
```

下面的示例展示了如何调用具有技能的代理。当用户询问北京的天气时，代理会自动识别这是一个天气查询请求，并调用 getWeather 技能来获取天气数据，然后以自然语言形式返回结果：

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-with-skills-invoke"
const result = await agent.invoke("What's the weather like in Beijing today?");
console.log(result);
// Output: { $message: "The current weather in Beijing is 22°C with sunny conditions and 45% humidity." }
```

主要特点：

* 通过 skills 参数集成其他代理作为技能
* 扩展 AI 代理的功能范围
* 适合构建多功能、复杂的智能代理

## 总结

AIAgent 是 AIGNE 中一个强大且灵活的工具，为用户提供了多种创建和调用的方式，适合不同场景的需求：

1. 基础模式：快速创建简单的 AI 代理，适合基本问答场景。
2. 自定义指令模式：控制 AI 代理的行为和风格，适合特定领域或风格的应用。
3. 带变量的自定义指令模式：根据用户输入动态调整指令，实现更灵活的控制。
4. 结构化输出模式：确保 AI 返回符合预期格式的数据，适合需要处理结构化数据的应用。
5. 技能集成模式：扩展 AI 代理的功能范围，构建多功能、复杂的智能代理。

根据实际需求，开发者可以灵活选择合适的模式来实现功能丰富的 AI 代理。
