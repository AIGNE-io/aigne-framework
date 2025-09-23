import { expect, spyOn, test } from "bun:test";
import { ImageAgent } from "@aigne/core";
import { z } from "zod";
import { OpenAIImageModel } from "../_mocks/mock-models.js";

test("ImageAgent should work correctly", async () => {
  const imageModel = new OpenAIImageModel();

  const agent = new ImageAgent({
    imageModel,
    instructions: "Draw an image about {{topic}}",
    inputSchema: z.object({
      topic: z.string(),
    }),
    outputFileType: "file",
  });

  const modelProcess = spyOn(imageModel, "process").mockReturnValueOnce({
    images: [{ type: "file", data: Buffer.from("test image").toString("base64") }],
  });

  const result = await agent.invoke({ topic: "a cat" });

  expect(result).toMatchInlineSnapshot(`
    {
      "images": [
        {
          "data": "dGVzdCBpbWFnZQ==",
          "type": "file",
        },
      ],
    }
  `);

  expect(modelProcess).toHaveBeenLastCalledWith(
    expect.objectContaining({
      prompt: "Draw an image about a cat",
    }),
    expect.anything(),
  );
});
