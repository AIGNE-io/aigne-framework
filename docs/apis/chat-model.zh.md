# ChatModel API

[English](./chat-model.md) | **中文**

ChatModel 是 aigne-framework 中用于与 AI 大型语言模型交互的抽象基类。它提供了统一的接口来处理不同的底层模型实现，如 OpenAI 和 Anthropic Claude 等。

## 支持的模型类型

目前 aigne-framework 支持以下聊天模型：

- **OpenAIChatModel**: 用于与 OpenAI 的 GPT 系列模型（如 GPT-4o）进行通信
- **ClaudeChatModel**: 用于与 Anthropic 的 Claude 系列模型进行通信
- **XAIChatModel**: 用于与 X.AI 的 Grok 系列模型进行通信

## 模型初始化

创建 ChatModel 实例，用于直接使用或提供给 AIGNE：

```typescript
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js";
import { XAIChatModel } from "@aigne/core/models/xai-chat-model.js";

// 初始化 OpenAI 模型
const openaiModel = new OpenAIChatModel({
  apiKey: "YOUR_OPENAI_API_KEY",
  model: "gpt-4o-mini", // 可选，默认为 "gpt-4o-mini"
});

// 初始化 Claude 模型
const claudeModel = new ClaudeChatModel({
  apiKey: "YOUR_ANTHROPIC_API_KEY",
  model: "claude-3-7-sonnet-latest", // 可选，默认为 "claude-3-7-sonnet-latest"
});

// 初始化 X.AI Grok 模型
const xaiModel = new XAIChatModel({
  apiKey: "YOUR_XAI_API_KEY",
  model: "grok-2-latest", // 可选，默认为 "grok-2-latest"
});
```

## 在 AIGNE 中使用

AIGNE 是 aigne-framework 中与 ChatModel 结合使用的推荐方式，它提供了更高级的功能，如工具集成、错误处理和状态管理等：

```typescript
import {
  AIAgent,
  AIGNE,
} from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 初始化模型
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// 创建执行引擎
const aigne = new AIGNE({
  model,
});

// 创建 AI Agent
const agent = AIAgent.from({
  instructions: `你是 AIGNE 的官方助手...`,
  memory: true,
});

// 运行 AI Agent
const result = aigne.invoke(agent, "怎么使用 AIGNE API?");
console.log(result);
```

## 直接使用 ChatModel

### 基本用法

尽管在实际应用中通常会通过 AIGNE 使用 ChatModel，但您也可以直接使用 ChatModel 类：

```typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";
import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js";  // 或 OpenAIChatModel

// 初始化模型
const model = new ClaudeChatModel({
  apiKey: "YOUR_API_KEY",
});

// 基本用法
const result = await model.invoke({
  messages: ChatMessagesTemplate.from([
    SystemMessageTemplate.from("You are a helpful assistant"),
    UserMessageTemplate.from("Hello, what's the weather like today?")
  ]).format()
});

console.log(result.text); // 输出模型回复
```

### 结构化输出

ChatModel 支持请求结构化 JSON 输出：

```typescript
const result = await model.invoke({
  messages: messages,
  responseFormat: {
    type: "json_schema",
    jsonSchema: {
      name: "output",
      schema: {
        type: "object",
        properties: {
          text: {
            type: "string",
          },
          sentiment: {
            type: "string",
            enum: ["positive", "neutral", "negative"]
          }
        },
        required: ["text", "sentiment"],
        additionalProperties: false,
      },
      strict: true,
    },
  }
});

// 使用结构化的 JSON 输出
console.log(result.json);
```

### 工具集成

请在 [AIAgent](./ai-agent-api.zh.md) 中使用 ChatModel 的工具集成功能。
