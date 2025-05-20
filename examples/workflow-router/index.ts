#!/usr/bin/env bunwrapper

import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, AIAgentToolChoice } from "@aigne/core";

const productSupport = AIAgent.from({
  name: "product_support",
  description: "Agent to assist with any product-related questions.",
  instructions: `You are an agent capable of handling any product-related questions.
  Your goal is to provide accurate and helpful information about the product.
  Be polite, professional, and ensure the user feels supported.`,
  memory: true,
});

const feedback = AIAgent.from({
  name: "feedback",
  description: "Agent to assist with any feedback-related questions.",
  instructions: `You are an agent capable of handling any feedback-related questions.
  Your goal is to listen to the user's feedback, acknowledge their input, and provide appropriate responses.
  Be empathetic, understanding, and ensure the user feels heard.`,
  memory: true,
});

const other = AIAgent.from({
  name: "other",
  description: "Agent to assist with any general questions.",
  instructions: `You are an agent capable of handling any general questions.
  Your goal is to provide accurate and helpful information on a wide range of topics.
  Be friendly, knowledgeable, and ensure the user feels satisfied with the information provided.`,
  memory: true,
});

const triage = AIAgent.from({
  name: "triage",
  instructions: `You are an intelligent routing agent responsible for directing user queries to the most appropriate specialized agent.
Your task is to analyze the user's request and select exactly one tool from the available options.
You must always choose a tool — do not answer the question directly or leave the tool unspecified.
Be concise, accurate, and ensure efficient handoff to the correct agent.`,
  skills: [productSupport, feedback, other],
  toolChoice: AIAgentToolChoice.router,
});

await runWithAIGNE(triage, {
  chatLoopOptions: {
    welcome: `Welcome to the support chat!

I can help you with any questions you have, such as
- product-related queries: "How do I use this product?"
- feedback: "I have feedback about the app."
- general questions: "What is the weather today?"

How can I assist you today?
`,
    defaultQuestion: "How do I use this product?",
  },
});
