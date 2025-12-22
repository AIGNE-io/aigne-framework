import { expect, test } from "bun:test";
import type { AgentInvokeOptions, AgentProcessResult } from "../../src/agents/agent.js";
import {
  VideoModel,
  type VideoModelInput,
  type VideoModelOutput,
} from "../../src/agents/video-model.js";
import { AIGNE } from "../../src/aigne/aigne.js";
import type { PromiseOrValue } from "../../src/utils/type-utils.js";

test("VideoModel should work correctly", async () => {
  class TestVideoModel extends VideoModel {
    override process(
      _input: VideoModelInput,
      _options: AgentInvokeOptions,
    ): PromiseOrValue<AgentProcessResult<VideoModelOutput>> {
      return {
        videos: [{ type: "file", data: Buffer.from("test video").toString("base64") }],
        usage: {
          inputTokens: 10,
          outputTokens: 20,
          aigneHubCredits: 30,
        },
        model: "video-model-1",
      };
    }
  }

  const model = new TestVideoModel();

  expect(model.credential).toBeTruthy();
  expect(
    await model.invoke({ prompt: "Generate a video about a cat", outputFileType: "file" }),
  ).toMatchInlineSnapshot(`
    {
      "model": "video-model-1",
      "usage": {
        "aigneHubCredits": 30,
        "inputTokens": 10,
        "outputTokens": 20,
      },
      "videos": [
        {
          "data": "dGVzdCB2aWRlbw==",
          "type": "file",
        },
      ],
    }
  `);
});

test("VideoModel should handle different input parameters", async () => {
  class TestVideoModel extends VideoModel {
    override process(
      input: VideoModelInput,
      _options: AgentInvokeOptions,
    ): PromiseOrValue<AgentProcessResult<VideoModelOutput>> {
      return {
        videos: [{ type: "file", data: Buffer.from("test video").toString("base64") }],
        usage: {
          inputTokens: 15,
          outputTokens: 25,
        },
        model: input.model || "default-model",
      };
    }
  }

  const model = new TestVideoModel();

  const result = await model.invoke({
    prompt: "Generate a video about a dog",
    model: "video-pro-1",
    size: "1080p",
    outputFileType: "file",
  });

  expect(result).toMatchInlineSnapshot(`
    {
      "model": "video-pro-1",
      "usage": {
        "inputTokens": 15,
        "outputTokens": 25,
      },
      "videos": [
        {
          "data": "dGVzdCB2aWRlbw==",
          "type": "file",
        },
      ],
    }
  `);
});

test("VideoModel should update context usage", async () => {
  class TestVideoModel extends VideoModel {
    override process(
      _input: VideoModelInput,
      _options: AgentInvokeOptions,
    ): PromiseOrValue<AgentProcessResult<VideoModelOutput>> {
      return {
        videos: [{ type: "file", data: Buffer.from("test video").toString("base64") }],
        usage: {
          inputTokens: 100,
          outputTokens: 200,
          aigneHubCredits: 50,
        },
      };
    }
  }

  const aigne = new AIGNE();
  const context = aigne.newContext();
  const model = new TestVideoModel();

  expect(context.usage.inputTokens).toBe(0);
  expect(context.usage.outputTokens).toBe(0);
  expect(context.usage.aigneHubCredits).toBe(0);

  await model.invoke({ prompt: "Generate a video" }, { context });

  expect(context.usage.inputTokens).toBe(100);
  expect(context.usage.outputTokens).toBe(200);
  expect(context.usage.aigneHubCredits).toBe(50);
});

test("VideoModel with custom credential", async () => {
  class TestVideoModel extends VideoModel {
    override get credential() {
      return {
        url: "https://api.example.com",
        apiKey: "test-api-key",
        model: "video-pro",
      };
    }

    override process(
      _input: VideoModelInput,
      _options: AgentInvokeOptions,
    ): PromiseOrValue<AgentProcessResult<VideoModelOutput>> {
      return {
        videos: [{ type: "file", data: Buffer.from("test video").toString("base64") }],
        usage: {
          inputTokens: 10,
          outputTokens: 20,
        },
      };
    }
  }

  const model = new TestVideoModel();

  expect(model.credential).toEqual({
    url: "https://api.example.com",
    apiKey: "test-api-key",
    model: "video-pro",
  });
});

test("VideoModel tag should be VideoModelAgent", async () => {
  class TestVideoModel extends VideoModel {
    override process(
      _input: VideoModelInput,
      _options: AgentInvokeOptions,
    ): PromiseOrValue<AgentProcessResult<VideoModelOutput>> {
      return {
        videos: [{ type: "file", data: Buffer.from("test video").toString("base64") }],
      };
    }
  }

  const model = new TestVideoModel();
  expect(model.tag).toBe("VideoModelAgent");
});

test("VideoModel getModelOptions should support nested getter pattern", async () => {
  class TestVideoModel extends VideoModel {
    override process(_input: VideoModelInput): VideoModelOutput {
      return {
        videos: [{ type: "file", data: Buffer.from("test").toString("base64") }],
      };
    }
  }

  const model = new TestVideoModel({
    modelOptions: {
      model: "video-gen-1",
      customConfig: {
        resolution: { $get: "videoResolution" },
        fps: 30,
        nested: {
          level2: { $get: "nestedValue" },
        },
      },
    },
  });

  const context = new AIGNE().newContext();
  context.userContext.videoResolution = "1920x1080";
  context.userContext.nestedValue = "advanced";

  const resolvedOptions = await model.getModelOptions(
    {
      prompt: "test video",
      modelOptions: {
        outputFormat: { $get: "formatType" },
      },
      formatType: "mp4",
    },
    { context },
  );

  expect(resolvedOptions).toEqual({
    model: "video-gen-1",
    outputFormat: "mp4",
    customConfig: {
      resolution: "1920x1080",
      fps: 30,
      nested: {
        level2: "advanced",
      },
    },
  });
});
