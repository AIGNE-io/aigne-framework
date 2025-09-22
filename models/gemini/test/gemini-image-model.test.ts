import { expect, spyOn, test } from "bun:test";
import { FileOutputType } from "@aigne/core";
import { GeminiImageModel } from "@aigne/gemini";

test("GeminiImageModel imagen model should work correctly", async () => {
  const model = new GeminiImageModel({
    apiKey: "YOUR_API_KEY",
    model: "imagen-4.0-generate-001",
  });

  spyOn(model["client"].models, "generateImages").mockResolvedValueOnce({
    generatedImages: [
      {
        image: {
          imageBytes: "base64",
        },
      },
    ],
  });

  const result = await model.invoke({
    prompt: "Draw an image about a cat",
    outputType: FileOutputType.file,
  });

  expect(result).toMatchInlineSnapshot(`
    {
      "images": [
        {
          "data": "base64",
          "mimeType": undefined,
          "type": "file",
        },
      ],
      "model": "imagen-4.0-generate-001",
      "usage": {
        "inputTokens": 0,
        "outputTokens": 0,
      },
    }
  `);
});

test("GeminiImageModel imagen model should work correctly", async () => {
  const model = new GeminiImageModel({
    apiKey: "YOUR_API_KEY",
    model: "gemini-2.5-flash",
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

  const result = await model.invoke({
    prompt: "Draw an image about a cat",
    outputType: FileOutputType.file,
  });

  expect(result).toMatchInlineSnapshot(`
    {
      "images": [
        {
          "data": "base64",
          "filename": undefined,
          "mimeType": undefined,
          "type": "file",
        },
      ],
      "model": "gemini-2.5-flash",
      "usage": {
        "inputTokens": 0,
        "outputTokens": 0,
      },
    }
  `);
});
