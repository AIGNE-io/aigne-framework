# AI Agent

`AIAgent` 是 AIGNE 框架中用于执行 AI 驱动任务的核心组件。它充当与大语言模型 (LLM) 交互的主要接口，处理用户指令、管理对话并协调工具以生成智能响应。

可以将 `AIAgent` 想象成操作的大脑。它接收输入，使用 LLM 进行思考，然后产生输出。它还可以使用专门的工具来执行特定操作，例如计算或从 API 获取数据。

## 创建 AI Agent

创建 `AIAgent` 最简单的方法是使用 `AIAgent.from()` 工厂方法。至少，你需要提供一个语言模型，并指定输入的哪个部分包含用户的消息。

```javascript Basic AIAgent creation icon=logos:javascript
// 导入必要的组件
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "../_mocks/mock-models.js"; // 替换为你的实际模型导入

// 1. 实例化一个语言模型
const model = new OpenAIChatModel();

// 2. 创建 Agent，指定模型和输入键
const agent = AIAgent.from({
  model,
  name: "assistant",
  description: "一个有用的助手",
  inputKey: "message", // 告诉 Agent 在输入的 'message' 字段中查找用户查询
});

// 3. 使用一些输入调用 Agent
async function runAgent() {
  const result = await agent.invoke({ message: "What is the weather today?" });
  console.log(result); // 预期输出：{ message: "Hello, How can I help you?" }
}

runAgent();
```

## 配置选项

你可以通过配置选项自定义 `AIAgent` 的行为。以下是一些最常见的选项：

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="false">
    <x-field-desc markdown>为 AI 模型提供关于其角色、个性和响应方式的指导。这可以是一个简单的字符串，也可以是一个用于动态提示的更复杂的 `PromptBuilder` 实例。</x-field-desc>
  </x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false">
    <x-field-desc markdown>指定输入对象中 Agent 应用于查找主要用户消息的键。如果未提供，则必须设置 `instructions`。</x-field-desc>
  </x-field>
  <x-field data-name="outputKey" data-type="string" data-default="message" data-required="false">
    <x-field-desc markdown>定义 Agent 响应中主要文本输出所使用的键。默认为 `message`。</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="AIAgentToolChoice | Agent" data-default="auto" data-required="false">
    <x-field-desc markdown>控制 Agent 如何使用工具。可以设置为 `auto`、`none`、`required` 或 `router`。</x-field-desc>
  </x-field>
  <x-field data-name="catchToolsError" data-type="boolean" data-default="true" data-required="false">
    <x-field-desc markdown>如果为 `true`，Agent 将捕获工具执行中的错误并尝试继续。如果为 `false`，它将停止并抛出错误。</x-field-desc>
  </x-field>
  <x-field data-name="structuredStreamMode" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown>启用后，Agent 会处理模型的流式响应，以在文本之外提取结构化数据（如 JSON 或 YAML），这对于需要元数据的任务非常有用。</x-field-desc>
  </x-field>
</x-field-group>

## 主要功能与用法

### 自定义指令

你可以通过提供系统指令来指导 Agent 的行为。这有助于为对话设置背景和基调。

#### 简单指令

对于简单情况，一个字符串就足够了。

```javascript AI agent with custom instructions icon=logos:javascript
const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  name: "tutor",
  description: "一位数学导师",
  instructions: "你是一位帮助学生清晰理解概念的数学导师。",
  inputKey: "message",
});

async function run() {
  const result = await agent.invoke({ message: "What is 10 factorial?" });
  console.log(result); // { message: "10 factorial is 3628800." }
}
run();
```

#### 使用 PromptBuilder 的高级提示

对于需要使用不同消息类型（系统、用户、助手）来构造提示的更复杂场景，你可以使用 `PromptBuilder`。

```javascript AI agent with PromptBuilder icon=logos:javascript
import { PromptBuilder, SystemMessageTemplate, UserMessageTemplate, ChatMessagesTemplate } from "@aigne/core";

// 为系统和用户消息创建一个模板
const systemMessage = SystemMessageTemplate.from("你是一名技术支持专家。");
const userMessage = UserMessageTemplate.from("请帮我排查这个问题：{{issue}}");
const promptTemplate = ChatMessagesTemplate.from([systemMessage, userMessage]);

// 使用模板创建一个 PromptBuilder
const promptBuilder = new PromptBuilder({
  instructions: promptTemplate,
});

const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  name: "support",
  description: "技术支持专家",
  instructions: promptBuilder,
});

async function run() {
  const result = await agent.invoke({ issue: "My computer won't start." });
  console.log(result); // { message: "Is there any message on the screen?" }
}
run();
```

### 使用工具（函数调用）

`AIAgent` 可以配备 `skills`（其他 Agent，通常是 `FunctionAgent`），这些技能充当它可以调用以执行特定任务的工具。`toolChoice` 选项控制此行为。

#### 自动工具选择 (`auto`)

在 `auto` 模式下，语言模型会根据用户的查询决定是直接响应还是使用其中一个可用工具。

```javascript Automatic Tool Usage icon=logos:javascript
import { FunctionAgent, AIAgent, AIAgentToolChoice } from "@aigne/core";
import { z } from "zod";

// 定义一个用于天气预报的工具
const weatherService = FunctionAgent.from({
  name: "weather",
  inputSchema: z.object({ location: z.string() }),
  process: ({ location }) => ({
    forecast: `Weather forecast for ${location}: Sunny, 75°F`,
  }),
});

// 创建一个可以使用该工具的 AIAgent
const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  toolChoice: AIAgentToolChoice.auto, // 让模型来决定
  skills: [weatherService],
  inputKey: "message",
});

async function run() {
  // 模型将看到查询并决定调用 'weather' 工具
  const result = await agent.invoke({ message: "What is the weather in San Francisco?" });
  console.log(result); // { message: "Weather forecast for San Francisco: Sunny, 75°F" }
}
run();
```

#### 路由器工具选择 (`router`)

在 `router` 模式下，Agent 的唯一工作是为用户的查询选择最合适的单个工具，并将输入直接传递给它。最终输出直接来自所选工具，而不是来自 LLM。

这对于创建一个将请求路由到专门 Agent 的分发器非常有用。

```javascript Router Tool Usage icon=logos:javascript
import { FunctionAgent, AIAgent, AIAgentToolChoice } from "@aigne/core";
import { z } from "zod";

// 定义专门的 Agent
const weatherAgent = FunctionAgent.from({
  name: "weather",
  inputSchema: z.object({ location: z.string() }),
  outputSchema: z.object({ forecast: z.string() }),
  process: ({ location }) => ({ forecast: `Weather in ${location}: Sunny, 75°F` }),
});

const translator = FunctionAgent.from({
  name: "translator",
  inputSchema: z.object({ text: z.string(), language: z.string() }),
  outputSchema: z.object({ translation: z.string() }),
  process: ({ text, language }) => ({ translation: `Translated ${text} to ${language}` }),
});

// 创建一个路由器 Agent
const routerAgent = AIAgent.from({
  model: new OpenAIChatModel(),
  toolChoice: AIAgentToolChoice.router, // 使用路由器模式
  skills: [weatherAgent, translator],
  inputKey: "message",
});

async function run() {
  // 路由器将选择 'weatherAgent' 并执行它。
  // 结果是来自 weatherAgent 的直接输出。
  const result = await routerAgent.invoke({ message: "What's the weather in San Francisco?" });
  console.log(result); // { forecast: "Weather in San Francisco: Sunny, 75°F" }
}
run();
```

## 总结

`AIAgent` 是一个多功能且强大的组件，用于构建由 LLM 驱动的应用程序。它提供了一种结构化的方式来与语言模型交互、管理提示并集成外部工具。对于更高级的场景，你可以将 `AIAgent` 与其他 Agent 类型结合使用：

*   **[Function Agent](./core-agents-function-agent.md):** 用于创建可供 `AIAgent` 使用的自定义工具。
*   **[Team Agent](./core-agents-team-agent.md):** 用于协调多个 `AIAgent` 实例以协作完成复杂任务。