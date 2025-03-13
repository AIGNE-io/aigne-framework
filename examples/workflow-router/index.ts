#!/usr/bin/env npx -y bun

import { AIAgent, ChatModelOpenAI, ExecutionEngine, runChatLoopInTerminal } from "@aigne/core";

const model = new ChatModelOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const productSupport = AIAgent.from({
  enableHistory: true,
  name: "product_support",
  description: "Agent to assist with any product-related questions.",
  instructions: `You are an agent capable of handling any product-related questions.
  Your goal is to provide accurate and helpful information about the product.
  Be polite, professional, and ensure the user feels supported.`,
  outputKey: "product_support",
});

const feedback = AIAgent.from({
  enableHistory: true,
  name: "feedback",
  description: "Agent to assist with any feedback-related questions.",
  instructions: `You are an agent capable of handling any feedback-related questions.
  Your goal is to listen to the user's feedback, acknowledge their input, and provide appropriate responses.
  Be empathetic, understanding, and ensure the user feels heard.`,
  outputKey: "feedback",
});

const other = AIAgent.from({
  enableHistory: true,
  name: "other",
  description: "Agent to assist with any general questions.",
  instructions: `You are an agent capable of handling any general questions.
  Your goal is to provide accurate and helpful information on a wide range of topics.
  Be friendly, knowledgeable, and ensure the user feels satisfied with the information provided.`,
  outputKey: "other",
});

const triage = AIAgent.from({
  name: "triage",
  instructions: `You are an agent capable of routing questions to the appropriate agent.
  Your goal is to understand the user's query and direct them to the agent best suited to assist them.
  Be efficient, clear, and ensure the user is connected to the right resource quickly.`,
  tools: [productSupport, feedback, other],
  toolChoice: "router",
});

const engine = new ExecutionEngine({ model });

const userAgent = await engine.run(triage);

await runChatLoopInTerminal(userAgent, {
  welcome: `Welcome to the support chat!

I can help you with any questions you have, such as
- product-related queries: "How do I use this product?"
- feedback: "I have feedback about the app."
- general questions: "What is the weather today?"

How can I assist you today?
`,
  defaultQuestion: "How do I use this product?",
});
