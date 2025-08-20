import { expect, spyOn, test } from "bun:test";
import { ImageAgent } from "@aigne/core";
import { z } from "zod";
import { OpenAIImageModel } from "../_mocks/mock-models.js";

test("ImageAgent should work correctly", async () => {
  const model = new OpenAIImageModel();

  const agent = new ImageAgent({
    model,
    instructions: "Draw an image about {{topic}}",
    inputSchema: z.object({
      topic: z.string(),
    }),
  });

  const modelProcess = spyOn(model, "process").mockReturnValueOnce({
    images: [{ url: "https://example.com/image.png" }],
  });

  const result = await agent.invoke({ topic: "a cat" });

  expect(result).toEqual({
    images: [{ url: "https://example.com/image.png" }],
  });

  expect(modelProcess).toHaveBeenLastCalledWith(
    expect.objectContaining({
      prompt: "Draw an image about a cat",
    }),
    expect.anything(),
  );
});
