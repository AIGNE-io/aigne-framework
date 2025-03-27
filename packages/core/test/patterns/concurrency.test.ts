import { expect, spyOn, test } from "bun:test";
import { AIAgent, ExecutionEngine, parallel } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

test("Patterns - Concurrency", async () => {
  const model = new OpenAIChatModel();

  const featureExtractor = AIAgent.from({
    instructions: `\
You are a product analyst. Extract and summarize the key features of the product.

Product description:
{{product}}`,
    outputKey: "features",
  });

  const audienceAnalyzer = AIAgent.from({
    instructions: `\
You are a market researcher. Identify the target audience for the product.

Product description:
{{product}}`,
    outputKey: "audience",
  });

  const engine = new ExecutionEngine({ model });

  spyOn(model, "process").mockImplementation(async (input) => {
    const messages = JSON.stringify(input.messages);

    if (messages.includes("You are a product analyst")) {
      return {
        text: "Extracted features: AIGNE is a No-code Generative AI Apps Engine",
      };
    }

    if (messages.includes("You are a market researcher")) {
      return {
        text: "Audience: AIGNE is a No-code Generative AI Apps Engine",
      };
    }

    return {};
  });

  const result = await engine.call(parallel(featureExtractor, audienceAnalyzer), {
    product: "AIGNE is a No-code Generative AI Apps Engine",
  });

  expect(result).toEqual({
    features: "Extracted features: AIGNE is a No-code Generative AI Apps Engine",
    audience: "Audience: AIGNE is a No-code Generative AI Apps Engine",
  });
});
