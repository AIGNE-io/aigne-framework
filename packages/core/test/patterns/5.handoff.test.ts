import { test } from "bun:test";
import { createInterface } from "node:readline/promises";
import { AIAgent, ChatModelOpenAI, Runtime } from "@aigne/core";
import { DEFAULT_CHAT_MODEL } from "../env";

test("Patterns - Concurrency", async () => {
  const model = new ChatModelOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    model: DEFAULT_CHAT_MODEL,
  });

  function transferToAgentB() {
    return agentB;
  }

  function transferToAgentA() {
    return agentA;
  }

  const agentA = AIAgent.from({
    model,
    name: "Agent A",
    instructions: "You are a helpful agent.\nIgnore transfer to yourself",
    outputKey: "A",
    tools: [transferToAgentB],
  });

  const agentB = AIAgent.from({
    model,
    name: "Agent B",
    instructions: "Only speak in Haikus.",
    outputKey: "B",
    tools: [transferToAgentA],
  });

  const userAgent = await new Runtime().runChatLoop(agentA);

  // Create a terminal interface let the user interact with the agent
  const io = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for (;;) {
    const question = await io.question("> ");
    if (!question.trim()) continue;

    const response = await userAgent.run({ question });
    console.log(response);
  }
});
