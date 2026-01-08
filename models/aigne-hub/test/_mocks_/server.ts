import { AIAgent, AIGNE, type FileUnionContent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import { serve } from "bun";
import { detect } from "detect-port";
import { Hono } from "hono";

export async function createHonoServer() {
  const port = await detect();
  const url = `http://localhost:${port}/`;

  const honoApp = new Hono();

  const aigne = await createAIGNE();
  const aigneServer = new AIGNEHTTPServer(aigne);

  honoApp.post("/ai-kit/api/v2/chat", async (c) => {
    return aigneServer.invoke(c.req.raw);
  });

  honoApp.post("/ai-kit/api/v2/image", async (c) => {
    return c.json({
      images: <FileUnionContent[]>[{ type: "file", data: "test image base64" }],
      usage: {
        aigneHubCredits: 100,
      },
      model: "openai/dall-e-3",
    });
  });

  honoApp.post("/ai-kit/api/v2/video", async (c) => {
    return c.json({
      videos: <FileUnionContent[]>[{ type: "file", data: "test-video-data" }],
      usage: {
        aigneHubCredits: 200,
        inputTokens: 0,
        outputTokens: 0,
      },
      model: "openai/sora-2",
    });
  });

  honoApp.get("/__blocklet__.js", async (c) => {
    return c.json({
      componentMountPoints: [
        { did: "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ", mountPoint: "/ai-kit" },
      ],
    });
  });

  honoApp.get("/ai-kit/api/ai/models", async (c) => {
    const type = c.req.query("type");
    const mockModels = [
      {
        model: "gpt-4",
        type: "chat",
        provider: "openai",
        input_credits_per_token: "0.03",
        output_credits_per_token: "0.06",
        modelMetadata: { context_window: 8192 },
        providerDisplayName: "OpenAI",
        status: { available: true },
      },
      {
        model: "dall-e-3",
        type: "image",
        provider: "openai",
        input_credits_per_token: "0.04",
        output_credits_per_token: "0.08",
        modelMetadata: null,
        providerDisplayName: "OpenAI",
        status: { available: true },
      },
      {
        model: "sora-2",
        type: "video",
        provider: "openai",
        input_credits_per_token: "0.1",
        output_credits_per_token: "0.2",
        modelMetadata: { max_duration: 60 },
        providerDisplayName: "OpenAI",
        status: { available: true },
      },
      {
        model: "text-embedding-3-small",
        type: "embedding",
        provider: "openai",
        input_credits_per_token: "0.0001",
        output_credits_per_token: "0",
        modelMetadata: { dimensions: 1536 },
        providerDisplayName: "OpenAI",
        status: { available: true },
      },
    ];

    if (type) {
      return c.json(mockModels.filter((m) => m.type === type));
    }
    return c.json(mockModels);
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
