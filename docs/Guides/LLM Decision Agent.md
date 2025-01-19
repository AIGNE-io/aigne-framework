# LLM Decision Agent

LLM Decision Agent 利用大语言模型的能力，根据人类语言设计的规则，从一系列 Agents 中选择最合适的一个来运行。

## 定义

LLM Decision Agent 和 LLM Agent 一样，都是基于大语言模型的 Agent，但 LLM Decision Agent 不需要定义 inputs/outputs 结构，会自动根据 `cases` 中的 `Agent` 的 inputs/outputs 自动推断。

```ts
import {
  FunctionAgent,
  LLMAgent,
  LLMDecisionAgent,
  OpenaiLLMModel,
  Runtime,
} from "@aigne/core";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("process.env.OPENAI_API_KEY is required");
}

const context = new Runtime({
  llmModel: new OpenaiLLMModel({
    model: "gpt-4o-mini",
    apiKey,
  }),
});

// 使用 FunctionAgent 定义一个获取当前时间的 Agent
const currentTime = FunctionAgent.create({
  context,
  name: "currentTime",
  inputs: {},
  outputs: {
    $text: {
      type: "string",
      required: true,
    },
  },
  function: async () => {
    return {
      $text: `The current time is ${new Date().toLocaleTimeString()}`,
    };
  },
});

// 使用 LLMAgent 定义一个聊天机器人的 Agent
const llmAgent = LLMAgent.create({
  context,
  inputs: {
    question: {
      type: "string",
      required: true,
    },
  },
  outputs: {
    $text: {
      type: "string",
      required: true,
    },
  },
  messages: [
    {
      role: "user",
      content: "{{question}}",
    },
  ],
});

// 使用 LLMDecisionAgent 定义一个决策 Agent，根据用户输入的问题，选择聊天机器人或获取当前时间
const decision = LLMDecisionAgent.create({
  context,
  modelOptions: {
    temperature: 0.5,
  },
  messages: [
    {
      role: "user",
      content: "{{question}}",
    },
  ],
  cases: {
    chatBot: {
      description: "Chat with the chat bot",
      runnable: llmAgent,
    },
    currentTime: {
      description: "Get the current time",
      runnable: currentTime,
    },
  },
});
```

## 配置说明

注意：LLM Decision Agent 不需要定义 inputs/outputs 结构，会自动根据 `cases` 中的 `Agent` 的 inputs/outputs 自动推断。

- `messages` - 定义和模型的交互逻辑（LLM Decision Agent 要求至少定义一个 `message`）
  - `role` - 消息的角色，可能为 `system`、`user` 或 `assistant`
  - `content` - 消息的内容，支持使用 `{{xxx}}` 语法引用输入参数
- `modelOptions` - (可选) 模型的配置选项，用于调整模型的行为
  - `temperature` - 温度参数，用于调整模型生成文本的多样性
  - `topP` - Top-p 参数，用于调整模型生成文本的多样性
  - `frequencyPenalty` - 频率惩罚参数，用于调整模型生成文本的多样性
  - `presencePenalty` - 存在惩罚参数，用于调整模型生成文本的多样性
- `cases` - 定义了该 Decision 可用的选项，每个选项包含以下属性：
  - `description` - 用于向大语言模型描述该 Agent 的用途，帮助模型更好地理解如何在这些选项中做出更合适的选择
  - `runnable` - 该决策对应的 Agent

### LLM Decision Agent 的 inputs 和 outputs

注意：LLM Decision Agent 不需显示定义 `inputs` 和 `outputs`，会自动根据 `cases` 中的 `Agent` 的 inputs/outputs 自动推断。

- `inputs` - `cases` 中所有的 `Agent` 的 inputs 的并集
- `outputs` - `cases` 中所有的 `Agent` 的 outputs 的并集

`inputs` 的自动推断示例，注意自动推断出的 Decision 的 inputs 中 `a` 和 `c` **都是 required 的**，因为可能选中其中任意一个 Agent 运行：

```ts
// Agent 1 的 inputs
const agent1Inputs = {
  a: {
    type: "string",
    required: true,
  },
  b: {
    type: "string",
  },
};

// Agent 2 的 inputs
const agent2Inputs = {
  c: {
    type: "string",
    required: true,
  },
};

// 包含 Agent 1 和 Agent 2 的 Decision Agent 的 inputs 会自动推断为：
const decisionAgentInputs = {
  a: {
    type: "string",
    required: true,
  },
  b: {
    type: "string",
  },
  c: {
    type: "string",
    required: true,
  },
};
```

`outputs` 的自动推断示例，注意自动推断出的 Decision 的 outputs 中 `a` 和 `b` 都**不是 required 的**，因为 Decision 的结果只会包含其中一个 Agent 的 outputs：

```ts
// Agent 1 的 outputs
const agent1Outputs = {
  a: {
    type: "string",
    required: true,
  },
};

// Agent 2 的 outputs
const agent2Outputs = {
  b: {
    type: "string",
    required: true,
  },
  c: {
    type: "string",
  },
};

// 包含 Agent 1 和 Agent 2 的 Decision Agent 的 outputs 会自动推断为：
const decisionAgentOutputs = {
  a: {
    type: "string",
  },
  b: {
    type: "string",
  },
  c: {
    type: "string",
  },
};
```

## 运行示例

Decision Agent 会根据用户输入的问题，选择合适的 Agent 运行：

- 如果用户输入的问题是 "What time is it now?"，Decision Agent 会选择 `currentTime` Agent 运行，返回当前时间

```ts
const result1 = await decision.run({ question: "What time is it now?" });

console.log(result1); // Output: { $text: "The current time is 7:25:58 PM" }
```

- 如果用户输入的问题是 "Hello, I am Bob"，Decision Agent 会选择 `chatBot` Agent 运行，返回聊天机器人的回复

```ts
const result2 = await decision.run({ question: "Hello, I am Bob" });

console.log(result2); // Output: { $text: "Hello, Bob! How can I help you today?" }
```
