import { expect, spyOn, test } from "bun:test";
import { ChatModel, type ChatModelInput, type ChatModelOutput } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

test("Example ChatModel: OpenAI", async () => {
  // #region example-chat-models-openai

  // #region example-chat-models-openai-create-model
  const model = new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  });
  // #endregion example-chat-models-openai-create-model

  // #region example-chat-models-openai-invoke
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
  // Output:
  // {
  //   text: "Hello! How can I assist you today?",
  //   usage: {
  //     inputTokens: 8,
  //     outputTokens: 9,
  //   },
  //   model: "gpt-4o-mini-2024-07-18",
  // };
  expect(result).toEqual({
    text: "Hello! How can I assist you today?",
    usage: {
      inputTokens: 8,
      outputTokens: 9,
    },
    model: "gpt-4o-mini-2024-07-18",
  });
  // #endregion example-chat-models-openai-invoke

  // #endregion example-chat-models-openai
});

test("Example ChatModel: Custom Implementation", async () => {
  // #region example-chat-models-custom

  // #region example-chat-models-custom-implementation
  class CustomChatModel extends ChatModel {
    override process(input: ChatModelInput): ChatModelOutput {
      // Extract the user's message
      const userMessage = input.messages.find((msg) => msg.role === "user")?.content || "";

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

    async getCredential() {
      return {};
    }
  }
  // #endregion example-chat-models-custom-implementation

  // #region example-chat-models-custom-usage
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
  expect(result).toEqual({
    text: "Mock AI response to: Tell me a joke",
    model: "mock-model-v1",
    usage: {
      inputTokens: 14,
      outputTokens: 20,
    },
  });
  // #endregion example-chat-models-custom-usage

  // #endregion example-chat-models-custom
});
