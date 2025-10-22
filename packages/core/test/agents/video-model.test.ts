import { expect, test } from "bun:test";
import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  type AgentResponseStream,
  AIGNE,
  isAgentResponseDelta,
  jsonDelta,
  textDelta,
  VideoModel,
  type VideoModelInput,
  type VideoModelOutput,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";

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
  expect(await model.invoke({ prompt: "Generate a video about a cat" })).toMatchInlineSnapshot(`
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

test("VideoModel with streaming response", async () => {
  class StreamingVideoModel extends VideoModel {
    override process(_input: VideoModelInput): AgentResponseStream<VideoModelOutput> {
      return new ReadableStream({
        start(controller) {
          controller.enqueue(textDelta({ text: "Generating" }));
          controller.enqueue(textDelta({ text: " video" }));
          controller.enqueue(textDelta({ text: "..." }));
          controller.enqueue(
            jsonDelta({
              videos: [{ type: "file", data: Buffer.from("test video").toString("base64") }],
              model: "video-model-1",
              usage: { inputTokens: 10, outputTokens: 20 },
            }),
          );
          controller.close();
        },
      });
    }
  }

  const model = new StreamingVideoModel();
  const stream = await model.invoke({ prompt: "Generate a video" }, { streaming: true });

  let fullText = "";
  const json: Partial<AgentProcessResult<VideoModelOutput>> = {};
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) fullText += text;
      if (chunk.delta.json) Object.assign(json, chunk.delta.json);
    }
  }

  expect(fullText).toBe("Generating video...");
  expect(json).toEqual({
    videos: [{ type: "file", data: Buffer.from("test video").toString("base64") }],
    model: "video-model-1",
    usage: { inputTokens: 10, outputTokens: 20 },
  });
});

test("VideoModel with streaming response using async generator", async () => {
  class StreamingVideoModel extends VideoModel {
    override async *process(_input: VideoModelInput): AgentProcessResult<VideoModelOutput> {
      yield textDelta({ text: "Starting" });
      yield textDelta({ text: " video" });
      yield textDelta({ text: " generation" });
      yield textDelta({ text: "..." });

      return {
        videos: [{ type: "file", data: Buffer.from("test video").toString("base64") }],
        model: "video-model-2",
        usage: { inputTokens: 15, outputTokens: 25 },
      };
    }
  }

  const model = new StreamingVideoModel();
  const stream = await model.invoke({ prompt: "Generate a video" }, { streaming: true });

  let fullText = "";
  const json: Partial<AgentProcessResult<VideoModelOutput>> = {};
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) fullText += text;
      if (chunk.delta.json) Object.assign(json, chunk.delta.json);
    }
  }

  expect(fullText).toBe("Starting video generation...");
  expect(json).toEqual({
    videos: [{ type: "file", data: Buffer.from("test video").toString("base64") }],
    model: "video-model-2",
    usage: { inputTokens: 15, outputTokens: 25 },
  });
});

test("VideoModel should return multiple videos", async () => {
  class TestVideoModel extends VideoModel {
    override process(
      _input: VideoModelInput,
      _options: AgentInvokeOptions,
    ): PromiseOrValue<AgentProcessResult<VideoModelOutput>> {
      return {
        videos: [
          { type: "file", data: Buffer.from("video 1").toString("base64") },
          { type: "file", data: Buffer.from("video 2").toString("base64") },
          { type: "url", url: "https://example.com/video3.mp4" },
        ],
        usage: {
          inputTokens: 20,
          outputTokens: 40,
        },
      };
    }
  }

  const model = new TestVideoModel();
  const result = await model.invoke({ prompt: "Generate three videos" });

  expect(result.videos).toHaveLength(3);
  expect(result.videos[0]).toEqual({
    type: "file",
    data: Buffer.from("video 1").toString("base64"),
  });
  expect(result.videos[1]).toEqual({
    type: "file",
    data: Buffer.from("video 2").toString("base64"),
  });
  expect(result.videos[2]).toEqual({
    type: "url",
    url: "https://example.com/video3.mp4",
  });
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
