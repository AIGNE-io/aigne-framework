import { expect, spyOn, test } from "bun:test";
import { FileOutputType } from "@aigne/core";
import { OpenAIImageModel } from "@aigne/openai";

test("ImageAgent should work correctly", async () => {
  const model = new OpenAIImageModel({
    apiKey: "YOUR_API_KEY",
  });

  const generateSpy = spyOn(model["client"].images, "generate").mockResolvedValueOnce({
    created: 1234567890,
    data: [{ b64_json: Buffer.from("test image").toString("base64") }],
  });

  const result = await model.invoke({
    prompt: "Draw an image about a cat",
    outputType: FileOutputType.file,
  });

  expect(result).toMatchInlineSnapshot(`
    {
      "images": [
        {
          "data": "dGVzdCBpbWFnZQ==",
          "mimeType": "image/png",
          "type": "file",
        },
      ],
      "model": "dall-e-2",
      "usage": {
        "inputTokens": 0,
        "outputTokens": 0,
      },
    }
  `);

  expect(generateSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      {
        "model": "dall-e-2",
        "prompt": "Draw an image about a cat",
        "response_format": "b64_json",
      },
      {
        "stream": false,
      },
    ]
  `);
});
