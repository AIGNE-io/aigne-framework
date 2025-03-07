import { AIAgent, ChatModelOpenAI, ExecutionEngine } from "@aigne/core";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
  model: DEFAULT_CHAT_MODEL,
});

const productSupport = AIAgent.from({
  name: "product_support",
  description: "You are a product support agent. You help users with product-related questions.",
  instructions: `\
You are a product support agent. You help users with product-related questions.
`,
  outputKey: "product_support",
});

const feedback = AIAgent.from({
  name: "feedback",
  description: "You are a feedback agent. You help users with feedback-related questions.",
  instructions: `\
You are a feedback agent. You help users with feedback-related questions.
`,
  outputKey: "feedback",
});

const other = AIAgent.from({
  name: "other",
  description: "You are an agent for other questions.",
  instructions: `\
You are an agent for other questions.
`,
  outputKey: "other",
});

const triage = AIAgent.from({
  instructions: `\
You are a triage agent. You help route questions to the right agent.
You can ask clarifying questions to understand the user's needs.
`,
  tools: [productSupport, feedback, other],
  toolChoice: "router",
});

const engine = new ExecutionEngine({ model });

const result1 = await engine.run("How much does the app cost?", triage);
console.log(result1);
// {
//   product_support: "How can I assist you with your product-related questions today?",
// }

const result2 = await engine.run("I have feedback about the app.", triage);
console.log(result2);
// {
//   feedback: "How can I assist you with feedback-related questions today?",
// }

const result3 = await engine.run("What is the weather today?", triage);
console.log(result3);
// {
//   other: "How can I assist you today?",
// }
