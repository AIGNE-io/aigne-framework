# ChatModel

## Overview

ChatModel is a core component in the AIGNE framework that provides a unified interface for interacting with Large Language Models (LLMs). As an extension of the Agent class, ChatModel abstracts the detail differences between different AI service providers, enabling developers to use various language models such as OpenAI, Anthropic, Bedrock, etc., in a consistent manner. ChatModel supports text generation, tool calling, JSON structured output, and image understanding capabilities, providing a solid foundation for building complex AI applications.

## Using Existing ChatModels

The AIGNE framework provides multiple predefined ChatModel implementations, allowing developers to easily connect to different AI services. Here's an example of using the OpenAI ChatModel:

```ts file="../../docs-examples/test/concepts/chat-model.test.ts" region="example-chat-models-openai-create-model"
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});
```

In the above example, we created an OpenAIChatModel instance, specifying the API key and model name. This model instance can be used to send requests to OpenAI's API.

### Invoking ChatModel

After creating a ChatModel instance, you can use the `invoke` method to send requests to the model and get responses:

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

In this example, we call the `model.invoke()` method, passing an object containing a user message. The model processes this request and returns an object containing the response text, token usage count, and model information.

## Creating Custom ChatModels

In addition to using predefined ChatModel implementations, the AIGNE framework also allows developers to create custom ChatModels. This is useful for integrating new AI services, simulating responses for testing, or implementing specific processing logic.

To create a custom ChatModel, you need to extend the ChatModel base class and implement the `process` method:

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

In the above example, we created a class called `CustomChatModel` that inherits from ChatModel and overrides the `process` method. This method extracts the user message from the input and returns a simulated AI response.

### Using Custom ChatModel

After creating a custom ChatModel, you can use it just like predefined models:

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

In this example, we created a CustomChatModel instance and used the `invoke` method to send a request. The model processes this request and returns an object containing a simulated response.

## Supported Features

ChatModel supports multiple features, including:

1. **Text Generation**: Generate natural language text responses
2. **Tool Calling**: Call defined tools to execute specific tasks
3. **JSON Structured Output**: Generate structured data conforming to specified JSON schemas
4. **Streaming Response**: Support incremental response return, suitable for real-time result display
5. **Multimodal Input**: Support multiple input types such as text and images (depending on specific model implementation)

## Summary

ChatModel is the core component in the AIGNE framework for connecting to Large Language Models, providing:

1. **Unified Interface**: Abstracts detail differences between different AI service providers, offering a consistent user experience
2. **Flexible Extension**: Supports creating custom ChatModel implementations to integrate new AI services or implement specific logic
3. **Rich Features**: Supports text generation, tool calling, JSON structured output, and other functionalities
4. **Type Safety**: Uses TypeScript type definitions to ensure input and output correctness

Through ChatModel, developers can easily integrate and use various language models to build powerful AI applications. Whether using predefined model implementations or creating custom implementations, ChatModel provides concise yet powerful solutions.
