// Import required dependencies
import { AIAgent, ChatModelOpenAI, ExecutionEngine } from "@aigne/core";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

// Initialize the OpenAI chat model
const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
  model: DEFAULT_CHAT_MODEL,
});

// Create an agent to extract and summarize product features
const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.

Product description:
{{product}}`,
  outputKey: "features",
});

// Create an agent to analyze target audience
const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.

Product description:
{{product}}`,
  outputKey: "audience",
});

// Initialize the execution engine
const engine = new ExecutionEngine({ model });

// Run both agents concurrently with the same input
const result = await engine.run(
  { product: "AIGNE is a No-code Generative AI Apps Engine" },
  { concurrency: true },  // Enable concurrent execution
  featureExtractor,
  audienceAnalyzer,
);

console.log(result);
// Output:
// {
//   features: "**Product Name:** AIGNE\n\n**Product Type:** No-code Generative AI Apps Engine\n\n...",
//   audience: "**Small to Medium Enterprises (SMEs)**: \n   - Businesses that may not have extensive IT resources or budget for app development but are looking to leverage AI to enhance their operations or customer engagement.\n\n...",
// }
