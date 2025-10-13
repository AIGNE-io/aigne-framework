```d2
direction: down

Invocation: {
  label: "调用\n（用户输入，历史记录）"
  shape: oval
}

AIAgent: {
  label: "AIAgent 核心逻辑"
  shape: rectangle
  style: {
    stroke-width: 2
    stroke-dash: 4
  }

  PromptBuilder: {
    label: "1. 构建提示"
    shape: rectangle
  }

  Response-Handler: {
    label: "3. 处理响应"
    shape: diamond
  }

  Tool-Executor: {
    label: "4a. 执行工具"
    shape: rectangle
  }

  Output-Processor: {
    label: "4b. 处理最终答案\n（结构化数据提取）"
    shape: rectangle
  }
}

Language-Model: {
  label: "语言模型"
  shape: cylinder
}

Tools: {
  label: "可用工具"
  shape: rectangle
  Tool-A: "工具 A"
  Tool-B: "工具 B"
}

Final-Response: {
  label: "流式响应"
  shape: oval
}

Invocation -> AIAgent.PromptBuilder
AIAgent.PromptBuilder -> Language-Model: "2. 发送提示"
Language-Model -> AIAgent.Response-Handler: "LLM 原始输出"
AIAgent.Response-Handler -> AIAgent.Tool-Executor: "工具调用"
AIAgent.Tool-Executor -> Tools
Tools -> AIAgent.PromptBuilder: "将工具结果返回到上下文" {
  style.stroke-dash: 2
}
AIAgent.Response-Handler -> AIAgent.Output-Processor: "最终答案"
AIAgent.Output-Processor -> Final-Response
```

## 创建 AIAgent

您可以使用 `AIAgent.from()` 工厂方法或直接使用构造函数来创建 `AIAgent` 实例。一个 Agent 至少需要指令或 `inputKey` 才能运行。

以下是创建聊天 Agent 的基本示例：

```typescript
import { AIAgent } from "@core/agents/ai-agent";
import { GoogleChatModel } from "@core/models/google";

// 假设模型已在别处配置，例如在中央上下文中
const model = new GoogleChatModel({ model: "gemini-1.5-flash" });

const chatAgent = AIAgent.from({
  name: "chat-bot",
  description: "一个能回答问题的乐于助人的助手。",
  instructions: "你是一个乐于助人的助手。你的目标是帮助用户找到他们需要的信息，并进行友好的交谈。",
  inputKey: "message",
  model: model,
});

async function runChat() {
  const responseStream = await chatAgent.invoke({ message: "Hello, world!" });
  for await (const chunk of responseStream) {
    if (chunk.delta.text?.message) {
      process.stdout.write(chunk.delta.text.message);
    }
  }
}

runChat();
```

此示例创建了一个简单的 Agent，它使用提供的指令来响应在 `message` 字段中传递的用户输入。

## 配置选项 (`AIAgentOptions`)

`AIAgentOptions` 接口提供了丰富的配置选项，用于定制 Agent 的行为。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="Agent 的唯一名称。"></x-field>
  <x-field data-name="description" data-type="string" data-required="true" data-desc="关于 Agent 用途和功能的描述。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="Agent 将使用的语言模型实例。也可以在调用时提供。"></x-field>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="false" data-desc="用于指导 AI 模型行为的指令。可以是简单字符串，也可以是用于复杂模板的 `PromptBuilder` 实例。"></x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false" data-desc="指定输入消息中的哪个键应被视为主用户消息。"></x-field>
  <x-field data-name="outputKey" data-type="string" data-default="message" data-desc="用于响应对象中文本输出的自定义键。默认为 `message`。"></x-field>
  <x-field data-name="toolChoice" data-type="AIAgentToolChoice | Agent" data-default="auto" data-desc="控制 Agent 如何使用工具。详情请参阅“工具使用”部分。"></x-field>
  <x-field data-name="keepTextInToolUses" data-type="boolean" data-required="false" data-desc="如果为 true，模型在工具调用期间生成的文本将保留在最终输出中。"></x-field>
  <x-field data-name="catchToolsError" data-type="boolean" data-default="true" data-desc="如果为 false，当工具执行失败时，Agent 将抛出错误。默认为 true，允许 Agent 处理该错误。"></x-field>
  <x-field data-name="structuredStreamMode" data-type="boolean" data-default="false" data-desc="启用一种模式，用于从模型的流式响应中提取结构化元数据（例如 JSON）。"></x-field>
  <x-field data-name="customStructuredStreamInstructions" data-type="object" data-required="false" data-desc="允许全面自定义结构化流的行为，包括提示指令和元数据解析逻辑。"></x-field>
  <x-field data-name="memoryAgentsAsTools" data-type="boolean" data-default="false" data-desc="当为 true 时，内存 Agent 将作为工具提供，模型可以调用这些工具来明确检索或存储信息。"></x-field>
</x-field-group>

## 工具使用

`AIAgent` 的一个关键特性是它能够将其他 Agent 用作工具。这使您能够构建复杂的系统，其中 AI Agent 可以将任务委托给专门的 Agent 来执行操作。`toolChoice` 选项控制此行为。

### `AIAgentToolChoice` 枚举

-   **`auto` (默认)**：语言模型根据对话上下文决定是否调用工具。这是最灵活的选项。
-   **`none`**：禁用 Agent 的所有工具使用，强制其仅依赖自身知识。
-   **`required`**：强制 Agent 使用可用工具之一。模型必须进行工具调用。
-   **`router`**：一种专门模式，其中 Agent 的唯一目的是选择最合适的工具，并将用户输入直接路由到该工具。`AIAgent` 本身不响应；所选工具的输出将成为最终响应。

### 示例：使用工具

```typescript
import { Agent } from "@core/agents/agent";
import { AIAgent, AIAgentToolChoice } from "@core/agents/ai-agent";

// 一个获取天气信息的简单工具（一个 Agent）
const weatherTool = new Agent({
  name: "get_weather",
  description: "获取特定地点的当前天气。",
  inputSchema: {
    type: "object",
    properties: {
      location: { type: "string", description: "城市和州，例如 San Francisco, CA" },
    },
    required: ["location"],
  },
  async *process(input) {
    yield {
      delta: {
        json: {
          weather: `The weather in ${input.location} is sunny.`,
        },
      },
    };
  },
});

// 一个配置为使用该工具的 AIAgent
const weatherAssistant = AIAgent.from({
  name: "weather-assistant",
  description: "一个可以提供天气预报的助手。",
  instructions: "你是一个天气助手。使用可用工具回答有关天气的问题。",
  tools: [weatherTool],
  toolChoice: AIAgentToolChoice.auto,
});

async function getWeather() {
  const responseStream = await weatherAssistant.invoke({
    message: "What's the weather like in New York?",
  });

  for await (const chunk of responseStream) {
    // 最终输出将是工具结果的综合
    console.log(chunk);
  }
}

getWeather();
```

## 结构化数据提取

`structuredStreamMode` 是一项强大的功能，适用于需要从语言模型的响应中提取结构化信息（如 JSON）以及纯文本的场景。启用后，Agent 会在模型的输出中查找特殊的元数据标签，并解析其中的内容。

### 启用结构化流模式

要使用此功能，您必须：
1.  在 Agent 的选项中设置 `structuredStreamMode: true`。
2.  通过 `instructions` 提示，指示模型将其结构化输出格式化到特定标签内（默认为 `<metadata>...</metadata>）。

### 示例：提取 JSON

```typescript
import { AIAgent } from "@core/agents/ai-agent";

const sentimentAnalyzer = AIAgent.from({
  name: "sentiment-analyzer",
  description: "分析消息的情感并提供评分。",
  instructions: `
    分析用户消息的情感。
    用简短的解释进行回应，然后在一个 <metadata> 标签中提供结构化的情感分析。
    元数据应该是一个 YAML 对象，包含 'sentiment'（positive、negative 或 neutral）和 'score'（0-1）字段。
  `,
  structuredStreamMode: true,
});

async function analyzeSentiment() {
  const responseStream = await sentimentAnalyzer.invoke({
    message: "I am absolutely thrilled with the new update! It's fantastic.",
  });

  for await (const chunk of responseStream) {
    if (chunk.delta.text?.message) {
      // 流式传输响应的文本部分
      process.stdout.write(chunk.delta.text.message);
    }
    if (chunk.delta.json) {
      // 解析后的 JSON 对象将出现在这里
      console.log("\n[METADATA]:", chunk.delta.json);
    }
  }
}

// 预期输出将流式传输文本解释，
// 随后是解析后的 JSON 对象：
// [METADATA]: { sentiment: 'positive', score: 0.95 }

analyzeSentiment();
```

对于 YAML 以外的格式（例如 JSON），您可以使用 `customStructuredStreamInstructions` 选项进一步自定义元数据标签和解析逻辑。