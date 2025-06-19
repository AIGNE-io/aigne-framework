import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { Router } from "express";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  modelOptions: {
    temperature: 0.8,
  },
});

const router = Router();

const agent = AIAgent.from({
  model,
  name: "chat",
  instructions: "You are a friendly chatbot",
});

router.get("/chat", async (_req, res) => {
  const result = await agent.invoke({ message: "What is AIGNE?" });
  console.log(result);
  res.json(result);
});

router.post("/chat", async (_req, res) => {
  const result = await agent.invoke({ message: "What is AIGNE?" });
  console.log(result);
  res.json(result);
});

export default router;
