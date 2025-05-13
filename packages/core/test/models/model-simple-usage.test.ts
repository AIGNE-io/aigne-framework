import { expect, spyOn, test } from "bun:test";
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

test("Example model usage with AIGNE", async () => {
  // Initialize OpenAI model
  const model = new OpenAIChatModel({
    apiKey: "YOUR_OPENAI_API_KEY",
    model: "gpt-4o-mini", // Optional, defaults to "gpt-4o-mini"
  });

  // Use with AIGNE
  const aigne = new AIGNE({ model });

  // Or use with AIAgent directly
  const agent = AIAgent.from({
    model,
    instructions: "You are a helpful assistant.",
  });

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      text: "Hello! How can I assist you today?",
    }),
  );

  const result = await aigne.invoke(agent, "Hello");

  expect(result).toEqual({
    $message: "Hello! How can I assist you today?",
  });

  console.log(result);
  // Output:
  // {
  //   $message: "Hello! How can I assist you today?",
  // }
});
