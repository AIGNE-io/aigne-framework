import { AIAgent, ChatModelOpenAI, ExecutionEngine } from "@aigne/core";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

// Initialize OpenAI chat model with configuration
const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
  model: DEFAULT_CHAT_MODEL,
});

// Agent 1: Marketing Analyst
// Extracts key product information from the input description
const conceptExtractor = AIAgent.from({
  instructions: `\
You are a marketing analyst. Give a product description, identity:
- Key features
- Target audience
- Unique selling points

Product description:
{{product}}`,
  outputKey: "concept",  // Output will be stored with key 'concept'
});

// Agent 2: Copywriter
// Creates marketing copy based on the analyzed concept
const writer = AIAgent.from({
  instructions: `\
You are a marketing copywriter. Given a block of text describing features, audience, and USPs,
compose a compelling marketing copy (like a newsletter section) that highlights these points.
Output should be short (around 150 words), output just the copy as a single text block.

Below is the info about the product:
{{concept}}`,  // Uses output from conceptExtractor as input
  outputKey: "draft",  // Output will be stored with key 'draft'
});

// Agent 3: Editor
// Polishes and finalizes the marketing copy
const formatProof = AIAgent.from({
  instructions: `\
You are an editor. Given the draft copy, correct grammar, improve clarity, ensure consistent tone,
give format and make it polished. Output the final improved copy as a single text block.

Draft copy:
{{draft}}`,  // Uses output from writer as input
  outputKey: "content",  // Final output will be stored with key 'content'
});

// Initialize the execution engine with the configured model
const engine = new ExecutionEngine({ model });

// Execute the sequential chain of agents
// 1. Start with product description
// 2. Extract concept (Agent 1)
// 3. Write draft (Agent 2)
// 4. Polish content (Agent 3)
const result = await engine.run(
  { product: "AIGNE is a No-code Generative AI Apps Engine" },  // Initial input
  conceptExtractor,
  writer,
  formatProof,
);
console.log(result);

// Example Output Structure:
// {
//   concept: "### Product Description:\nAIGNE is a cutting-edge No-code Generative AI Apps Engine designed to ...",
//   draft: "Unlock your creativity with AIGNE, the revolutionary No-code Generative AI Apps Engine designed to ...",
//   content: "Unlock your creativity with AIGNE, the revolutionary no-code Generative AI Apps Engine designed to ...",
// }
