// Import required dependencies
import { createInterface } from "node:readline/promises";
import { AIAgent, ChatModelOpenAI, ExecutionEngine } from "@aigne/core";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

// Initialize the OpenAI chat model with API key and model name
const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
  model: DEFAULT_CHAT_MODEL,
});

// Function to transfer control to Agent B
function transferToAgentB() {
  return agentB;
}

// Function to transfer control to Agent A
function transferToAgentA() {
  return agentA;
}

// Create Agent A with the ability to transfer to Agent B
const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent.",
  outputKey: "A",
  tools: [transferToAgentB],
});

// Create Agent B that speaks in Haikus and can transfer back to Agent A
const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  tools: [transferToAgentA],
});

// Initialize the execution engine with the model
const engine = new ExecutionEngine({ model });

// Start with Agent A as the initial agent
const userAgent = await engine.run(agentA);

// Set up interactive terminal interface for user input
const io = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Infinite loop to handle user interactions
for (;;) {
  const question = await io.question("> ");
  if (!question.trim()) continue;  // Skip empty inputs

  const response = await userAgent.call(question);
  console.log(response);
}
