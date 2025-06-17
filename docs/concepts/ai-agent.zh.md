# AI Agent 框架：设计具有自适应工具使用的智能体

AI Agent 框架旨在促进创建利用自适应工具使用的智能代理，以增强其功能。此框架允许创建能够处理输入、生成响应并在各个领域执行特定功能的人工智能代理。典型使用场景包括构建会话代理、动态调整用户需求以及集成真实世界数据检索过程。

## 基本 AI Agent 初始化和调用

使用 AI Agent 的基础方面涉及使用必要的模型配置创建实例并调用其执行任务。AI Agent 利用底层语言模型来处理和响应输入，调整处理能力以满足上下文需求。在典型场景中，Agent 以语言模型进行初始化，调用时，提供从模型响应中提取的指定消息的处理输出。这概括了 AI Agent 运作的基本机制，实际上作为输入查询与基于模型的智能输出之间的桥梁。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-basic-create-agent"
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});

const agent = AIAgent.from({ model });
```

## 定制 AI Agent 指令

定制指令使 AI Agent 能够根据预定义的风格或格式调整其响应。这种定制通过在代理初始化阶段集成特定指令实现。指令可以从风格化元素（如以俳句格式说话）到更加专业化的命令模式。这种指令定制的灵活性使开发人员能够精确调整代理的响应，以适应应用程序上下文，从而增强代理与用户期望和功能角色的对齐。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-create-agent"
const agent = AIAgent.from({
  model,
  instructions: "Only speak in Haikus.",
});
```

## 可变指令模板

通过在指令模板中合并变量，AI Agent 获得了能够根据运行时输入动态调整其交流风格的能力。这种能力增强了响应的适应性，允许对代理如何表述信息进行细粒度控制。变量提供了上下文占位符，在调用时填充，促进了交互式定制体验。在响应风格需要根据输入条件或用户偏好广泛变化的场景中，这种动态模板方法尤其具有优势。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-with-variables-create-agent"
const agent = AIAgent.from({
  model,
  inputSchema: z.object({
    style: z.string().describe("The style of the response."),
  }),
  instructions: "Only speak in {{style}}.",
});
```

## 结构化输出处理

在紧凑数据表示至关重要的情况下，管理结构化输出的能力对 AI Agent 至关重要。通过定义输出结构，代理可以以结构化格式提供响应，这在需要从模型响应中精确提取数据的场景中非常有利。这种结构化方法促进了改进的数据集成，因为响应可以轻松解析并在更广泛的应用工作流中使用，增强了代理响应在技术生态系统中的实用性和集成性。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-structured-output-create-agent"
const agent = AIAgent.from({
  model,
  inputSchema: z.object({
    style: z.string().describe("The style of the response."),
  }),
  outputSchema: z.object({
    topic: z.string().describe("The topic of the request"),
    response: z.string().describe("The response to the request"),
  }),
  instructions: "Only speak in {{style}}."
});
```

## 集成功能技能以增强响应能力

将功能技能集成到 AI Agent 中，通过允许其执行超出单纯语言处理的任务来扩展其操作能力。例如，集成天气检索技能使代理能够在其响应过程中获取和报告真实世界数据。这种技能集成使代理能够作为更具多功能性和响应性的实体，能够执行复杂、多方面的任务，这些任务与命令输入和环境数据相一致，从而扩大了它们能够有效应对的应用和场景范围。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-with-skills-create-skill"
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
    return {
      temperature: 22,
      condition: "Sunny",
      humidity: 45,
    };
  },
});
```

总之，AI Agent 框架为开发能够适应各种需求的智能代理提供了广泛的能力。从初始设置和指令定制到动态模板和技能集成，每个组件协同工作以支持复杂场景并增强响应能力。鼓励开发人员探索这些功能的组合，以充分利用框架的灵活性，培养出专门针对其应用程序需求的高度专业化和响应迅速的代理。