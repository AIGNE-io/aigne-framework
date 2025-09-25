import { expect, spyOn, test } from "bun:test";
import { DoubaoImageModel } from "@aigne/doubao";
import { serve } from "bun";
import { detect } from "detect-port";
import { Hono } from "hono";
import { joinURL } from "ufo";

async function createHonoServer() {
  const port = await detect();
  const url = `http://localhost:${port}/`;

  const honoApp = new Hono();

  honoApp.post("/api/v3/non-streaming/images/generations", async (c) => {
    const body = await c.req.json();
    return c.json({
      data: [{ b64_json: "test image base64" }],
      model: body.model,
      usage: {
        output_tokens: 100,
      },
    });
  });
  honoApp.post("/api/v3/non-streaming/error/images/generations", async (c) => {
    return c.json(
      {
        error: {
          message: "Invalid prompt",
          code: "INVALID_PROMPT",
        },
      },
      400,
    );
  });

  honoApp.post("/api/v3/streaming/images/generations", async (c) => {
    const body = await c.req.json();

    const sseData = [
      `event: image_generation.partial_succeeded`,
      `data: {"type":"image_generation.partial_succeeded","model":"${body.model}","created":1757931143,"image_index":0,"url":"https://example.com/image.png","size":"1024x1024"}`,
      ``,
      `event: image_generation.completed`,
      `data: {"type":"image_generation.completed","model":"${body.model}","created":1757931143,"usage":{"generated_images":1,"output_tokens":100,"total_tokens":100}}`,
      ``,
      `data: [DONE]`,
    ].join("\n");

    return new Response(sseData, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  });

  honoApp.post("/api/v3/streaming/error/images/generations", async (c) => {
    const body = await c.req.json();

    const sseData = [
      `event: image_generation.partial_failed`,
      `data: {"type":"image_generation.partial_failed","model":"${body.model}","error":{"message":"Invalid prompt","code":"INVALID_PROMPT"}}`,
      ``,
      `data: [DONE]`,
    ].join("\n");

    return new Response(sseData, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  });

  const server = serve({ port, fetch: honoApp.fetch });

  return {
    url,
    close: () => server.stop(true),
  };
}

test("DoubaoImageModel should generate images successfully with non-streaming", async () => {
  const { url, close } = await createHonoServer();

  const model = new DoubaoImageModel({
    apiKey: "YOUR_API_KEY",
    model: "doubao-seedream-4-0-250828",
    baseURL: joinURL(url, "api/v3/non-streaming"),
  });

  const result = await model.invoke({
    prompt: "Draw an image about a cat",
    model: "doubao-seedream-4-0-250828",
    outputFileType: "file",
  });

  expect(result).toMatchInlineSnapshot(`
    {
      "images": [
        {
          "data": "test image base64",
          "mimeType": "image/jpeg",
          "type": "file",
        },
      ],
      "model": "doubao-seedream-4-0-250828",
      "usage": {
        "inputTokens": 0,
        "outputTokens": 100,
      },
    }
  `);

  close();
});

test("DoubaoImageModel should generate images successfully with streaming", async () => {
  const { url, close } = await createHonoServer();

  const model = new DoubaoImageModel({
    apiKey: "YOUR_API_KEY",
    model: "doubao-seedream-4-0-250828",
    baseURL: joinURL(url, "api/v3/streaming"),
  });

  spyOn(model, "downloadFile").mockResolvedValueOnce(new Response("test image"));

  const result = await model.invoke({
    prompt: "Draw an image about a cat",
    model: "doubao-seedream-4-0-250828",
    stream: true,
    outputFileType: "file",
  });

  expect(result).toMatchInlineSnapshot(`
    {
      "images": [
        {
          "data": "dGVzdCBpbWFnZQ==",
          "mimeType": "image/jpeg",
          "type": "file",
        },
      ],
      "model": "doubao-seedream-4-0-250828",
      "usage": {
        "inputTokens": 0,
        "outputTokens": 100,
      },
    }
  `);

  close();
});

test("DoubaoImageModel should handle non-streaming API errors", async () => {
  const { url, close } = await createHonoServer();

  const model = new DoubaoImageModel({
    apiKey: "YOUR_API_KEY",
    model: "doubao-seedream-4-0-250828",
    baseURL: joinURL(url, "api/v3/non-streaming/error"),
  });

  expect(
    model.invoke({
      prompt: "Invalid prompt",
      model: "doubao-seedream-4-0-250828",
    }),
  ).rejects.toThrow(/"Invalid prompt"/);

  close();
});

test("DoubaoImageModel should handle streaming API errors", async () => {
  const { url, close } = await createHonoServer();

  const model = new DoubaoImageModel({
    apiKey: "YOUR_API_KEY",
    model: "doubao-seedream-4-0-250828",
    baseURL: joinURL(url, "api/v3/streaming/error"),
  });

  expect(
    model.invoke({
      prompt: "Invalid prompt",
      model: "doubao-seedream-4-0-250828",
      stream: true,
    }),
  ).rejects.toThrow("Doubao API error: Invalid prompt");

  close();
});
