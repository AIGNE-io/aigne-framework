import { expect, test } from "bun:test";
import type { AgentInvokeOptions, AgentProcessResult } from "../../src/agents/agent.js";
import {
  ImageModel,
  type ImageModelInput,
  type ImageModelOutput,
} from "../../src/agents/image-model.js";
import { AIGNE } from "../../src/aigne/aigne.js";
import type { PromiseOrValue } from "../../src/utils/type-utils.js";

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

test("ImageModel getModelOptions should support nested getter pattern", async () => {
  class TestImageModel extends ImageModel {
    override process(_input: ImageModelInput): ImageModelOutput {
      return {
        images: [{ type: "file", data: Buffer.from("test").toString("base64") }],
      };
    }
  }

  const model = new TestImageModel({
    modelOptions: {
      model: "dall-e-3",
      customConfig: {
        size: { $get: "imageSize" },
        quality: "hd",
        nested: {
          level2: { $get: "nestedValue" },
        },
      },
    },
  });

  const context = new AIGNE().newContext();
  context.userContext.imageSize = "1024x1024";
  context.userContext.nestedValue = 42;

  const resolvedOptions = await model.getModelOptions(
    {
      prompt: "test",
      modelOptions: {
        preferInputFileType: { $get: "fileType" },
      },
      fileType: "url",
    },
    { context },
  );

  expect(resolvedOptions).toEqual({
    model: "dall-e-3",
    preferInputFileType: "url",
    customConfig: {
      size: "1024x1024",
      quality: "hd",
      nested: {
        level2: 42,
      },
    },
  });
});
