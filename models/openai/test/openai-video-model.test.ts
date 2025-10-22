import { beforeEach, expect, spyOn, test } from "bun:test";
import { OpenAIVideoModel } from "@aigne/openai";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";

let model: OpenAIVideoModel;

beforeEach(() => {
  model = new OpenAIVideoModel({
    apiKey: "YOUR_API_KEY",
    model: "sora-2",
  });
});

test("OpenAIVideoModel basic usage", async () => {
  const videoId = "video_123";
  const mockVideoData = Buffer.from("mock video content");

  const createSpy = spyOn((model.client as any).videos, "create").mockResolvedValueOnce({
    id: videoId,
    status: "completed",
    progress: 100,
  });

  const retrieveSpy = spyOn((model.client as any).videos, "retrieve");

  const downloadSpy = spyOn((model.client as any).videos, "downloadContent").mockResolvedValueOnce({
    arrayBuffer: async () => mockVideoData.buffer,
  });

  const result = await model.invoke({
    prompt: "A cat playing with a ball",
  });

  expect(createSpy).toHaveBeenCalledWith({
    model: "sora-2",
    prompt: "A cat playing with a ball",
  });

  expect(retrieveSpy).not.toHaveBeenCalled();

  expect(downloadSpy).toHaveBeenCalledWith(videoId);

  expect(result).toMatchObject({
    videos: [
      {
        type: "local",
        path: expect.stringContaining(`${videoId}.mp4`),
      },
    ],
    usage: {
      inputTokens: 0,
      outputTokens: 0,
    },
    model: "sora-2",
  });
});

test("OpenAIVideoModel with polling (queued -> in_progress -> completed)", async () => {
  const videoId = "video_456";
  const mockVideoData = Buffer.from("mock video content");

  const modelWithFastPolling = new OpenAIVideoModel({
    apiKey: "YOUR_API_KEY",
    model: "sora-2",
    pollingInterval: 10,
  });

  const createSpy = spyOn(
    (modelWithFastPolling.client as any).videos,
    "create",
  ).mockResolvedValueOnce({
    id: videoId,
    status: "queued",
    progress: 0,
  });

  let callCount = 0;
  const retrieveSpy = spyOn(
    (modelWithFastPolling.client as any).videos,
    "retrieve",
  ).mockImplementation(async () => {
    callCount++;
    if (callCount === 1) {
      return {
        id: videoId,
        status: "in_progress",
        progress: 50,
      };
    }
    return {
      id: videoId,
      status: "completed",
      progress: 100,
    };
  });

  const downloadSpy = spyOn(
    (modelWithFastPolling.client as any).videos,
    "downloadContent",
  ).mockResolvedValueOnce({
    arrayBuffer: async () => mockVideoData.buffer,
  });

  const result = await modelWithFastPolling.invoke({
    prompt: "A dog running in the park",
    seconds: "8",
    size: "1920x1080",
  });

  expect(createSpy).toHaveBeenCalledWith({
    model: "sora-2",
    prompt: "A dog running in the park",
    seconds: "8",
    size: "1920x1080",
  });

  expect(retrieveSpy).toHaveBeenCalledTimes(2);

  expect(downloadSpy).toHaveBeenCalledWith(videoId);

  expect(result).toMatchObject({
    videos: [
      {
        type: "local",
        path: expect.stringContaining(`${videoId}.mp4`),
      },
    ],
    model: "sora-2",
  });
});

test("OpenAIVideoModel with input reference", async () => {
  const videoId = "video_789";
  const mockVideoData = Buffer.from("mock video content");

  const createSpy = spyOn((model.client as any).videos, "create").mockResolvedValueOnce({
    id: videoId,
    status: "completed",
    progress: 100,
  });

  const downloadSpy = spyOn((model.client as any).videos, "downloadContent").mockResolvedValueOnce({
    arrayBuffer: async () => mockVideoData.buffer,
  });

  const result = await model.invoke({
    prompt: "Extend this video",
    inputReference: "https://example.com/image.png",
  });

  expect(createSpy).toHaveBeenCalledWith({
    model: "sora-2",
    prompt: "Extend this video",
    input_reference: "https://example.com/image.png",
  });

  expect(downloadSpy).toHaveBeenCalledWith(videoId);

  expect(result.videos[0]?.type).toBe("local");
});

test("OpenAIVideoModel should handle failed status", async () => {
  const videoId = "video_failed";

  spyOn((model.client as any).videos, "create").mockResolvedValueOnce({
    id: videoId,
    status: "failed",
    error: { message: "GPU timeout" },
    progress: 45,
  });

  await expect(
    model.invoke({
      prompt: "A complex scene",
    }),
  ).rejects.toThrow("Video generation failed: GPU timeout");
});

test("OpenAIVideoModel should handle failed status without error message", async () => {
  const videoId = "video_failed_no_msg";

  spyOn((model.client as any).videos, "create").mockResolvedValueOnce({
    id: videoId,
    status: "failed",
    progress: 30,
  });

  await expect(
    model.invoke({
      prompt: "Another scene",
    }),
  ).rejects.toThrow("Video generation failed: Unknown error");
});

test("OpenAIVideoModel should handle unexpected status", async () => {
  const videoId = "video_unexpected";

  spyOn((model.client as any).videos, "create").mockResolvedValueOnce({
    id: videoId,
    status: "cancelled",
    progress: 20,
  });

  await expect(
    model.invoke({
      prompt: "Test prompt",
    }),
  ).rejects.toThrow("Unexpected video status: cancelled");
});

test("OpenAIVideoModel custom model option", async () => {
  const customModel = new OpenAIVideoModel({
    apiKey: "YOUR_API_KEY",
    model: "sora-1",
  });

  const videoId = "video_custom";
  const mockVideoData = Buffer.from("mock video content");

  const createSpy = spyOn((customModel.client as any).videos, "create").mockResolvedValueOnce({
    id: videoId,
    status: "completed",
    progress: 100,
  });

  spyOn((customModel.client as any).videos, "downloadContent").mockResolvedValueOnce({
    arrayBuffer: async () => mockVideoData.buffer,
  });

  const result = await customModel.invoke({
    prompt: "Test with custom model",
  });

  expect(createSpy).toHaveBeenCalledWith({
    model: "sora-1",
    prompt: "Test with custom model",
  });

  expect(result.model).toBe("sora-1");
});

test("OpenAIVideoModel override model in input", async () => {
  const videoId = "video_override";
  const mockVideoData = Buffer.from("mock video content");

  const createSpy = spyOn((model.client as any).videos, "create").mockResolvedValueOnce({
    id: videoId,
    status: "completed",
    progress: 100,
  });

  spyOn((model.client as any).videos, "downloadContent").mockResolvedValueOnce({
    arrayBuffer: async () => mockVideoData.buffer,
  });

  const result = await model.invoke({
    prompt: "Override model test",
    model: "sora-3",
  });

  expect(createSpy).toHaveBeenCalledWith({
    model: "sora-3",
    prompt: "Override model test",
  });

  expect(result.model).toBe("sora-3");
});

test("OpenAIVideoModel should throw error if no API key", () => {
  const modelNoKey = new OpenAIVideoModel({});

  expect(() => modelNoKey.client).toThrow(
    "OpenAIVideoModel requires an API key. Please provide it via `options.apiKey`, or set the `OPENAI_API_KEY` environment variable",
  );
});

test("OpenAIVideoModel downloadToFile", async () => {
  const videoId = "video_download";
  const mockVideoData = Buffer.from("test video data");
  const testPath = nodejs.path.join(nodejs.os.tmpdir(), `test_${videoId}.mp4`);

  spyOn((model.client as any).videos, "downloadContent").mockResolvedValueOnce({
    arrayBuffer: async () => mockVideoData.buffer,
  });

  const filePath = await model.downloadToFile(videoId, testPath);

  expect(filePath).toBe(testPath);

  const fs = await import("node:fs");
  const fileContent = fs.readFileSync(testPath);
  expect(fileContent.toString()).toBe("test video data");

  // cleanup
  fs.unlinkSync(testPath);
});

test("OpenAIVideoModel with all optional parameters", async () => {
  const videoId = "video_full";
  const mockVideoData = Buffer.from("mock video content");

  const createSpy = spyOn((model.client as any).videos, "create").mockResolvedValueOnce({
    id: videoId,
    status: "completed",
    progress: 100,
  });

  spyOn((model.client as any).videos, "downloadContent").mockResolvedValueOnce({
    arrayBuffer: async () => mockVideoData.buffer,
  });

  const result = await model.invoke({
    prompt: "A beautiful sunset over mountains",
    seconds: "16",
    size: "1920x1080",
    inputReference: "https://example.com/reference.jpg",
  });

  expect(createSpy).toHaveBeenCalledWith({
    model: "sora-2",
    prompt: "A beautiful sunset over mountains",
    seconds: "16",
    size: "1920x1080",
    input_reference: "https://example.com/reference.jpg",
  });

  expect(result).toMatchObject({
    videos: [
      {
        type: "local",
        path: expect.stringContaining(`${videoId}.mp4`),
      },
    ],
    model: "sora-2",
  });
});

test("OpenAIVideoModel credential getter", () => {
  const modelWithOptions = new OpenAIVideoModel({
    apiKey: "test-key",
    baseURL: "https://custom.openai.com",
    model: "custom-model",
  });

  const credential = modelWithOptions.credential;

  expect(credential).toEqual({
    url: "https://custom.openai.com",
    apiKey: "test-key",
    model: "custom-model",
  });
});

test("OpenAIVideoModel modelOptions getter", () => {
  const options = { seconds: "10" };
  const modelWithOptions = new OpenAIVideoModel({
    apiKey: "test-key",
    modelOptions: options,
  });

  expect(modelWithOptions.modelOptions).toEqual(options);
});
