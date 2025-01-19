# Runtime

`Runtime` 是 AIGNE Framework 中的一个核心概念，为多 `Agent` 应用提供一个统一的运行环境，负责多个 `Agent` 的管理、调度、运行、状态共享。

## 功能

- **llmModel** 设置 Agent 使用的 LLM 模型。
- **resolve** 通过 Agent 的名称或 ID 解析 Agent 实例。
- **state** 获取或设置上下文的状态信息（一般用于存储用户信息、配置信息等）。
- **copy** 复制 Runtime 实例并设置新的 `state`。

## 使用示例

以下是一个使用 `Runtime` 创建和运行 `Agent` 的示例：

```typescript
import { LLMAgent, OpenaiLLMModel, Runtime } from "@aigne/core";

const context = new Runtime({
  // 设置用户信息，所有该 Runtime 下的 Agent 都可以访问该信息
  state: {
    userId: "123456",
  },

  // 设置 Agent 使用的 LLM 模型
  llmModel: new OpenaiLLMModel({
    model: "gpt-4o-mini",
    apiKey: "YOUR_OPENAI_API_KEY",
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
  messages: [
    {
      role: "system",
      // 在 prompt 中使用 {{$context.state.xxx}} 可以获取上下文中的状态信息
      content: "User id is: {{$context.state.userId}}",
    },
    {
      role: "user",
      content: "{{question}}",
    },
  ],
});

const result = await agent.run({ question: "My id is?" });

console.log(result.$text); // 输出: "Your id is: 123456"
```

## 复制 Runtime

`Runtime` 实例可以通过 `copy` 方法复制一个示例并设置新的 `state`，用于创建一个新的 `Runtime` 实例。以下是一个示例：

```typescript
const newContext = context.copy({
  state: {
    userId: "654321",
  },
});
```

该功能可用于多用户场景，例如在多个用户之间共享 `Runtime` 实例，但每个用户有自己的状态信息。

## 总结

`Runtime` 是 AIGNE Framework 的核心组件，为多 `Agent` 应用提供了统一的运行环境和管理机制。通过使用 `Runtime`，开发者可以轻松管理和调度多个 `Agent`，并实现复杂的应用逻辑。
