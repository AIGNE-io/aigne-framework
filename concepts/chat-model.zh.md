# ChatModel

[English](./chat-model.md) | [中文](./chat-model.zh.md)

## 概述

ChatModel 是 AIGNE 框架中的一个核心组件，它为与大型语言模型（LLM）的交互提供了统一的接口。作为 Agent 类的扩展，ChatModel 抽象了不同 AI 服务提供商的细节差异，使开发者能够以一致的方式使用各种语言模型，如 OpenAI、Anthropic、Bedrock 等。ChatModel 支持文本生成、工具调用、JSON 结构化输出和图像理解等功能，为构建复杂的 AI 应用提供了坚实的基础。

## 使用现有的 ChatModel

AIGNE 框架提供了多种预定义的 ChatModel 实现，使开发者可以轻松连接到不同的 AI 服务。以下是使用 OpenAI ChatModel 的示例：

```ts file="../../docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-openai-create-model"
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});
```

在上面的示例中，我们创建了一个 OpenAIChatModel 实例，指定了 API 密钥和模型名称。这个模型实例可以用于发送请求到 OpenAI 的 API。

### 调用 ChatModel

创建 ChatModel 实例后，可以使用 `invoke` 方法向模型发送请求并获取响应：

```ts file="../../docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-openai-invoke"
const result = await model.invoke({
  messages: [{ role: "user", content: "Hello" }],
});
console.log(result);
// Output:
// {
//   text: "Hello! How can I assist you today?",
//   usage: {
//     inputTokens: 8,
//     outputTokens: 9,
//   },
//   model: "gpt-4o-mini-2024-07-18",
// };
```

在这个示例中，我们调用 `model.invoke()` 方法，传入一个包含用户消息的对象。模型处理这个请求并返回一个包含响应文本、使用的令牌数量和模型信息的对象。

## 创建自定义 ChatModel

除了使用预定义的 ChatModel 实现外，AIGNE 框架还允许开发者创建自定义的 ChatModel。这对于集成新的 AI 服务、模拟响应进行测试或实现特定的处理逻辑非常有用。

要创建自定义 ChatModel，需要扩展 ChatModel 基类并实现 `process` 方法：

```ts file="../../docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-custom-implementation"
import {
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";

class CustomChatModel extends ChatModel {
  override process(input: ChatModelInput): ChatModelOutput {
    // Extract the user's message
    const userMessage =
      input.messages.find((msg) => msg.role === "user")?.content || "";

    // Create a simulated response
    return {
      text: `Mock AI response to: ${userMessage}`,
      model: "mock-model-v1",
      usage: {
        inputTokens: typeof userMessage === "string" ? userMessage.length : 0,
        outputTokens: 20, // Simulated token count
      },
    };
  }
}
```

在上面的示例中，我们创建了一个名为 `CustomChatModel` 的类，它继承自 ChatModel 并重写了 `process` 方法。这个方法从输入中提取用户消息，并返回一个模拟的 AI 响应。

### 使用自定义 ChatModel

创建自定义 ChatModel 后，可以像使用预定义模型一样使用它：

```ts file="../../docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-custom-usage"
const customModel = new CustomChatModel();

const result = await customModel.invoke({
  messages: [{ role: "user", content: "Tell me a joke" }],
});
console.log(result);
// Output:
// {
//   text: "Mock AI response to: Tell me a joke",
//   model: "mock-model-v1",
//   usage: {
//     inputTokens: 14,
//     outputTokens: 20,
//   }
// }
```

在这个示例中，我们创建了一个 CustomChatModel 实例，并使用 `invoke` 方法发送请求。模型处理这个请求并返回一个包含模拟响应的对象。

## 支持的功能

ChatModel 支持多种功能，包括：

1. **文本生成**：生成自然语言文本响应
2. **工具调用**：调用定义的工具执行特定任务
3. **JSON 结构化输出**：生成符合指定 JSON 模式的结构化数据
4. **流式响应**：支持增量返回响应，适用于实时显示结果
5. **多模态输入**：支持文本和图像等多种输入类型（取决于具体模型实现）

## 总结

ChatModel 是 AIGNE 框架中连接大型语言模型的核心组件，它提供了：

1. **统一接口**：抽象不同 AI 服务提供商的细节差异，提供一致的使用体验
2. **灵活扩展**：支持创建自定义 ChatModel 实现，集成新的 AI 服务或实现特定逻辑
3. **丰富功能**：支持文本生成、工具调用、JSON 结构化输出等多种功能
4. **类型安全**：使用 TypeScript 类型定义确保输入和输出的正确性

通过 ChatModel，开发者可以轻松集成和使用各种语言模型，构建功能强大的 AI 应用。无论是使用预定义的模型实现，还是创建自定义实现，ChatModel 都提供了简洁而强大的解决方案。
