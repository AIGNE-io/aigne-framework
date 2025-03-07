import { expect, spyOn, test } from "bun:test";
import { AIAgent, ChatModelOpenAI, ExecutionEngine } from "@aigne/core";

test("Patterns - Sequential", async () => {
  const model = new ChatModelOpenAI();

  const conceptExtractor = AIAgent.from({
    instructions: `\
You are a marketing analyst. Give a product description, identity:
- Key features
- Target audience
- Unique selling points

Product description:
{{product}}`,
    outputKey: "concept",
  });

  const writer = AIAgent.from({
    instructions: `\
You are a marketing copywriter. Given a block of text describing features, audience, and USPs,
compose a compelling marketing copy (like a newsletter section) that highlights these points.
Output should be short (around 150 words), output just the copy as a single text block.

Below is the info about the product:
{{concept}}`,
    outputKey: "draft",
  });

  const formatProof = AIAgent.from({
    instructions: `\
You are an editor. Given the draft copy, correct grammar, improve clarity, ensure consistent tone,
give format and make it polished. Output the final improved copy as a single text block.

Draft copy:
{{draft}}`,
    outputKey: "content",
  });

  const mockModelResults = [
    {
      text: "Generated Concept: AIGNE is a No-code Generative AI Apps Engine",
    },
    {
      text: "Generated Draft: AIGNE is a No-code Generative AI Apps Engine",
    },
    {
      text: "Formatted Content: AIGNE is a No-code Generative AI Apps Engine",
    },
  ] as const;

  let modelCallCount = 0;
  spyOn(model, "process").mockImplementation(async () => mockModelResults[modelCallCount++] ?? {});

  const engine = new ExecutionEngine({ model });

  const result = await engine.run(
    { product: "AIGNE is a No-code Generative AI Apps Engine" },
    conceptExtractor,
    writer,
    formatProof,
  );

  expect(result).toEqual({
    concept: mockModelResults[0].text,
    draft: mockModelResults[1].text,
    content: mockModelResults[2].text,
  });
});
