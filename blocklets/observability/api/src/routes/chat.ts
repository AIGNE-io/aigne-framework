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
  const userAgent = aigne.invoke(agent);
  const result = await userAgent.invoke("What is AIGNE?");
  res.json(result);
});

export default router;
