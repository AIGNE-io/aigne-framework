import { expect, test } from "bun:test";
import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ImageModel,
  type ImageModelInput,
  type ImageModelOutput,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";

test("ImageModel should work correctly", async () => {
  class TestImageModel extends ImageModel {
    override process(
      _input: ImageModelInput,
      _options: AgentInvokeOptions,
    ): PromiseOrValue<AgentProcessResult<ImageModelOutput>> {
      return {
        images: [{ type: "file", data: Buffer.from("test image").toString("base64") }],
        usage: {
          inputTokens: 10,
          outputTokens: 20,
          aigneHubCredits: 30,
        },
      };
    }
  }

  const model = new TestImageModel();

  expect(model.credential).toBeTruthy();
  expect(
    await model.invoke({ prompt: "Draw an image about a cat", outputFileType: "file" }),
  ).toMatchInlineSnapshot(`
    {
      "images": [
        {
          "data": "dGVzdCBpbWFnZQ==",
          "type": "file",
        },
      ],
      "usage": {
        "aigneHubCredits": 30,
        "inputTokens": 10,
        "outputTokens": 20,
      },
    }
  `);
});
