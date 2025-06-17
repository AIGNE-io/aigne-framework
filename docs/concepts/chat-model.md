# Professional Documentation for Chat Model Module

This document provides a comprehensive guide to integrating chat models within applications by using the Chat Model Module. It primarily focuses on creating and utilizing instances of chat models, whether for OpenAI or custom-defined configurations. The module serves as a foundational component for developers looking to implement conversational AI capabilities with large language models, specifically in scenarios where customized and extensible chat solutions are required.

## Creating an OpenAI ChatModel Instance

The OpenAIChatModel demonstrates how to instantiate a chat model tailored for OpenAI's specific requirements. It requires an API key and allows selection of a model version, showcasing how developers can integrate different language models with specific configurations. This setup is crucial for enabling interaction with OpenAI's language models, emphasizing ease of configuration and immediate integration capabilities.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-openai-create-model"
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});
```

## Invoking the OpenAI ChatModel

This section explains how to invoke an instance of the OpenAIChatModel. By using the 'process' method, developers can simulate and test interaction flows, ensuring that the responses are in a pre-defined format. The snippet displays how input messages are processed and how token usage is monitored, emphasizing the importance of efficiency and cost-effectiveness in model utilization.

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

## Implementing a Custom ChatModel

Implementing a CustomChatModel provides flexibility to adapt the chat model framework to specific use cases. By extending the ChatModel class, developers have the opportunity to define custom processing logic, simulate responses, and manage token usage. This highlights model extensibility and the potential for creating customized interactions adapted to unique business needs.

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

## Utilizing the Custom ChatModel

Demonstrating the use of a custom ChatModel instance allows developers to leverage the flexibility of implementing bespoke chat processing logic. Here, the CustomChatModel is invoked to process user messages, providing controlled testing scenarios and illustrating the model's applied behavior with specific message content. This section reinforces how adaptability can be utilized to enhance user interactions within an application.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-custom-usage"
const customModel = new CustomChatModel();

const result = await customModel.invoke({
  messages: [{ role: "user", content: "Tell me a joke" }],
});
console.log(result);
```

This document outlined the key functionalities of the Chat Model Module, detailing methods for creating and invoking both standardized and custom chat models. Developers are encouraged to experiment with custom implementations to optimize interactions and explore integrative possibilities. The flexibility in model instantiation, coupled with customizable logic and efficient token management, facilitates crafting tailored conversational experiences aligned with diverse application needs.