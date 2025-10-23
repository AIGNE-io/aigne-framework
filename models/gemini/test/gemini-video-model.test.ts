import { expect, spyOn, test } from "bun:test";
import { GeminiVideoModel } from "@aigne/gemini";

test("GeminiVideoModel should work correctly", async () => {
  const model = new GeminiVideoModel({
    apiKey: "YOUR_API_KEY",
    model: "veo-3.1-generate-preview",
    pollingInterval: 100,
  });

  const mockVideoFile = {
    name: "test-video",
    videoBytes: Buffer.from("mock-video-data"),
  };

  const mockOperation = {
    done: true,
    response: {
      generatedVideos: [
        {
          video: mockVideoFile,
        },
      ],
    },
  };

  spyOn(model["client"].models, "generateVideos").mockResolvedValueOnce({
    done: false,
    name: "operations/test",
  } as any);

  spyOn(model["client"].operations, "getVideosOperation").mockResolvedValueOnce(
    mockOperation as any,
  );

  spyOn(model["client"].files, "download").mockResolvedValueOnce(undefined);

  const result = await model.invoke({
    prompt: "A beautiful sunset over the ocean",
  });

  expect(result.videos).toBeDefined();
  expect(result.videos.length).toBe(1);
  expect(result.videos[0]?.type).toBe("local");
  expect(result.model).toBe("veo-3.1-generate-preview");
  expect(result.usage).toBeDefined();
});

test("GeminiVideoModel should support custom parameters", async () => {
  const model = new GeminiVideoModel({
    apiKey: "YOUR_API_KEY",
    model: "veo-3.1-generate-preview",
    pollingInterval: 100,
  });

  const mockVideoFile = {
    name: "test-video-custom",
    videoBytes: Buffer.from("mock-video-data"),
  };

  const mockOperation = {
    done: true,
    response: {
      generatedVideos: [
        {
          video: mockVideoFile,
        },
      ],
    },
  };

  const generateVideosSpy = spyOn(model["client"].models, "generateVideos").mockResolvedValueOnce({
    done: false,
    name: "operations/test",
  } as any);

  spyOn(model["client"].operations, "getVideosOperation").mockResolvedValueOnce(
    mockOperation as any,
  );

  spyOn(model["client"].files, "download").mockResolvedValueOnce(undefined);

  await model.invoke({
    prompt: "A car driving on a highway",
    negativePrompt: "blurry, low quality",
    aspectRatio: "16:9",
    size: "720p",
    seconds: "8",
    personGeneration: "allow_adult",
  });

  expect(generateVideosSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      model: "veo-3.1-generate-preview",
      prompt: "A car driving on a highway",
      config: expect.objectContaining({
        negativePrompt: "blurry, low quality",
        aspectRatio: "16:9",
        resolution: "720p",
        durationSeconds: 8,
        personGeneration: "allow_adult",
      }),
    }),
  );
});
