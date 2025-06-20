import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { Router } from "express";

const router = Router();

const aigne = new AIGNE({
  model: new OpenAIChatModel({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini" }),
});

const agent = AIAgent.from({
  name: "chat",
  instructions: "You are a friendly chatbot",
});

router.get("/chat", async (_req, res) => {
  const result = await aigne.invoke(agent, { message: "What is AIGNE?" });
  console.log(result);
  res.json(result);
});

export default router;
