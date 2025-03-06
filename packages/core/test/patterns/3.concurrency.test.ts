import { expect, test } from "bun:test";
import { AIAgent, ChatModelOpenAI, ExecutionEngine } from "../../src";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

test("Patterns - Concurrency", async () => {
  const model = new ChatModelOpenAI({
    apiKey: OPENAI_API_KEY,
    model: DEFAULT_CHAT_MODEL,
  });

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

  const result = await new ExecutionEngine({ model }).runParallel(
    { product: "AIGNE is a No-code Generative AI Apps Engine" },
    featureExtractor,
    audienceAnalyzer,
  );

  expect(result).toEqual({
    features: expect.stringContaining(""),
    audience: expect.stringContaining(""),
  });
});
