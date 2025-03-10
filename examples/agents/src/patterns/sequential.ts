import { AIAgent, ChatModelOpenAI, ExecutionEngine } from "@aigne/core";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
  model: DEFAULT_CHAT_MODEL,
});

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

const engine = new ExecutionEngine({ model });

const result = await engine.run(
  { product: "AIGNE is a No-code Generative AI Apps Engine" },
  conceptExtractor,
  writer,
  formatProof,
);
console.log(result);

// Output:
// {
//   concept: "### Product Description:\nAIGNE is a cutting-edge No-code Generative AI Apps Engine designed to ...",
//   draft: "Unlock your creativity with AIGNE, the revolutionary No-code Generative AI Apps Engine designed to ...",
//   content: "Unlock your creativity with AIGNE, the revolutionary no-code Generative AI Apps Engine designed to ...",
// }
