import { expect, spyOn, test } from "bun:test";
import { GeminiImageModel } from "@aigne/gemini";

test("GeminiImageModel other model should work correctly", async () => {
  const model = new GeminiImageModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model["client"].models, "generateContent").mockResolvedValueOnce({
    candidates: [
      {
        content: {
          parts: [
            {
              inlineData: {
                data: "base64",
              },
            },
          ],
        },
      },
    ],
    text: undefined,
    data: undefined,
    functionCalls: undefined,
    executableCode: undefined,
    codeExecutionResult: undefined,
  });

  const result = await model.invoke({ prompt: "Draw an image about a cat" });

  expect(result).toEqual(
    expect.objectContaining({
      images: [{ base64: "base64" }],
    }),
  );
});
