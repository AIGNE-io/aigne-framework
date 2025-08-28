import { expect, test } from "bun:test";
import { IdeogramImageModel } from "@aigne/ideogram";
import { serve } from "bun";
import { detect } from "detect-port";
import { Hono } from "hono";

async function createHonoServer() {
  const port = await detect();
  const url = `http://localhost:${port}/`;

  const honoApp = new Hono();

  honoApp.post("/", async (c) => {
    return c.json({
      data: [{ url: "https://example.com/image.png" }],
    });
  });

  const server = serve({ port, fetch: honoApp.fetch });

  return {
    url,
    close: () => server.stop(true),
  };
}

test("IdeogramImageModel should generate images successfully", async () => {
  const { url, close } = await createHonoServer();

  const model = new IdeogramImageModel({
    baseURL: url,
    apiKey: "YOUR_API_KEY",
  });

  const result = await model.invoke({ model: "ideogram-v3", prompt: "Draw an image about a cat" });

  expect(result).toEqual(
    expect.objectContaining({
      images: [{ url: "https://example.com/image.png" }],
    }),
  );

  close();
});
