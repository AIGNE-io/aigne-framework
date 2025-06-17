# 聊天模型模块专业文档

本文档提供了使用聊天模型模块在应用程序中集成聊天模型的全面指南，主要关注于创建和使用聊天模型实例，无论是针对 OpenAI 还是自定义配置。该模块是为开发人员提供一个基础组件，帮助他们在需要定制和可扩展的聊天解决方案的场景下实现大型语言模型的对话式 AI 功能。

## 创建 OpenAI ChatModel 实例

OpenAIChatModel 演示了如何实例化一个针对 OpenAI 特定要求的聊天模型。它需要一个 API 密钥，并允许选择模型版本，展示了开发人员如何以特定配置集成不同的语言模型。此设置对于启用与 OpenAI 语言模型的交互至关重要，强调了配置的简易性和即时集成能力。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-openai-create-model"
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});
```

## 调用 OpenAI ChatModel

本节解释了如何调用一个 OpenAIChatModel 实例。通过使用 'process' 方法，开发人员可以模拟和测试交互流程，确保响应格式预先定义。代码片段展示了如何处理输入消息以及如何监控 token 使用情况，强调了在模型使用中效率和成本效益的重要性。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-openai-invoke"
spyOn(model, "process").mockReturnValueOnce({
  model: "gpt-4o-mini-2024-07-18",
  text: "Hello! How can I assist you today?",
  usage: {
    inputTokens: 8,
    outputTokens: 9,
  },
});
const result = await model.invoke({
  messages: [{ role: "user", content: "Hello" }],
});
console.log(result);
```

## 实现自定义 ChatModel

实现 CustomChatModel 提供了将聊天模型框架适应特定用例的灵活性。通过扩展 ChatModel 类，开发人员有机会定义自定义处理逻辑、模拟响应和管理 token 使用。这强调了模型的可扩展性以及创建适用于独特业务需求的定制交互的潜力。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-custom-implementation"
class CustomChatModel extends ChatModel {
  override process(input: ChatModelInput): ChatModelOutput {
    const userMessage = input.messages.find((msg) => msg.role === "user")?.content || "";
    return {
      text: `Mock AI response to: ${userMessage}`,
      model: "mock-model-v1",
      usage: {
        inputTokens: typeof userMessage === "string" ? userMessage.length : 0,
        outputTokens: 20,
      },
    };
  }
}
```

## 使用自定义 ChatModel

展示如何使用一个自定义 ChatModel 实例可以让开发人员利用实现特定聊天处理逻辑的灵活性。在这里，CustomChatModel 被调用来处理用户消息，提供了受控的测试场景，并通过特定消息内容展示了模型的应用行为。本节重申了如何利用适应性来增强应用中的用户交互。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-custom-usage"
const customModel = new CustomChatModel();

const result = await customModel.invoke({
  messages: [{ role: "user", content: "Tell me a joke" }],
});
console.log(result);
```

本文档概述了聊天模型模块的关键功能，详细介绍了创建和调用标准化及自定义聊天模型的方法。鼓励开发人员尝试自定义实现，以优化交互并探索整合可能性。模型实例化的灵活性，加上可定制的逻辑和高效的 token 管理，有助于打造满足多种应用需求的定制对话体验。