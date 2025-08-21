import { expect, spyOn, test } from "bun:test";
import { OpenAIImageModel } from "@aigne/openai";

test("ImageAgent should work correctly", async () => {
  const model = new OpenAIImageModel({
    apiKey: "YOUR_API_KEY",
  });

  const generateSpy = spyOn(model["client"].images, "generate").mockResolvedValueOnce({
    created: 1234567890,
    data: [{ url: "https://example.com/image.png" }],
  });

  const result = await model.invoke({ prompt: "Draw an image about a cat" });

  expect(result).toEqual(
    expect.objectContaining({
      images: [{ url: "https://example.com/image.png" }],
    }),
  );

  expect(generateSpy).toHaveBeenLastCalledWith(
    expect.objectContaining({
      prompt: "Draw an image about a cat",
    }),
  );
});
