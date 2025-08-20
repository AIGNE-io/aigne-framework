import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { serve } from "bun";
import { detect } from "detect-port";
import { Hono } from "hono";

export async function createHonoServer() {
  const port = await detect();
  const url = `http://localhost:${port}/`;

  const honoApp = new Hono();

  const aigne = await createAIGNE();

  honoApp.post("/ai-kit/api/v2/chat", async (c) => {
    return c.json({
      result: "success",
      headers: c.req.header(),
    });
  });

  honoApp.get("/__blocklet__.js", async (c) => {
    return c.json({
      componentMountPoints: [
        { did: "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ", mountPoint: "/ai-kit" },
      ],
    });
  });

  const server = serve({ port, fetch: honoApp.fetch });

  return {
    url,
    aigne,
    close: () => server.stop(true),
  };
}

async function createAIGNE() {
  const model = new OpenAIChatModel();

  const chat = AIAgent.from({
    name: "chat",
    inputKey: "message",
  });

  return new AIGNE({ model, agents: [chat] });
}
