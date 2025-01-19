# LLM Agent

LLM Agent 依托于大语言模型的能力，可以通过人类语言设计 Agent 的运行逻辑。

## 定义

在 `Agent` 的基本定义基础上，`LLMAgent` 允许通过 `messages` 属性来定义与模型的交互逻辑，具体定义如下所示：

```ts
import { LLMAgent, OpenaiLLMModel, Runtime } from "@aigne/core";

const context = new Runtime({
  llmModel: new OpenaiLLMModel({
    model: "gpt-4o-mini",
    apiKey: "YOUR_OPEN_AI_API_KEY",
  }),
});

const agent = LLMAgent.create({
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
  modelOptions: {
    temperature: 0.5,
  },
  messages: [
    {
      role: "user",
      content: "{{question}}",
    },
  ],
});
```

## 配置说明

- **inputs** - 定义 `Agent` 运行时所需的输入数据结构。可以在 `messages` 中使用反引号 `{{xxx}}` 语法来引用输入参数。

- **outputs** - 定义 `Agent` 运行时返回的输出数据结构。

  - **$text** - LLM Agent 的默认输出数据，用于返回模型生成的文本内容。
  - **其他输出** - 可自定义其他输出数据，包含下述字段：
    - **description** - 描述数据的用途和含义，帮助大语言模型更好地理解如何生成该数据。有关详细信息，请参见 [OpenAI Structured Output](https://platform.openai.com/docs/guides/structured-outputs)。

- **messages** - 定义消息，用于定义与模型的交互逻辑（LLM Agent 至少需要定义一个消息）。

  - **role** - 消息的角色，可能是 `system`、`user` 或 `assistant`。
  - **content** - 消息的具体内容，支持使用反引号 `` 语法引用输入参数。

- **modelOptions** - （可选）模型配置选项，用于调整模型的行为。
  - **temperature** - 温度参数，用于调节模型生成文本的多样性。
  - **topP** - Top-p 参数，同样用于控制模型生成文本的多样性。
  - **frequencyPenalty** - 频率惩罚参数，用于降低模型对常见词汇的生成倾向。
  - **presencePenalty** - 存在惩罚参数，用于鼓励模型生成更少重复的内容。

通过优化的文档结构与清晰的表达，用户可以更容易地理解 LLM Agent 的定义和配置方式。
