import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { getModels } from "../../src/utils/hub.js";
import { createHonoServer } from "../_mocks_/server.js";

describe("getModels", () => {
  let baseURL: string;
  let close: () => void;

  beforeAll(async () => {
    const server = await createHonoServer();
    baseURL = server.url;
    close = server.close;
  });

  afterAll(async () => {
    await close();
  });

  test("should fetch chat models", async () => {
    const models = await getModels({ baseURL, type: "chat" });
    expect(Array.isArray(models)).toBe(true);
  });

  test("should fetch image models", async () => {
    const models = await getModels({ baseURL, type: "image" });
    expect(Array.isArray(models)).toBe(true);
  });

  test("should fetch video models", async () => {
    const models = await getModels({ baseURL, type: "video" });
    expect(Array.isArray(models)).toBe(true);
  });

  test("should fetch embedding models", async () => {
    const models = await getModels({ baseURL, type: "embedding" });
    expect(Array.isArray(models)).toBe(true);
  });

  test("should fetch all models when no type specified", async () => {
    const models = await getModels({ baseURL });
    expect(Array.isArray(models)).toBe(true);
  });

  test("should validate model schema", async () => {
    const models = await getModels({ baseURL, type: "video" });
    if (models.length > 0) {
      const model = models[0];
      expect(model).toHaveProperty("model");
      expect(model).toHaveProperty("type");
      expect(model).toHaveProperty("provider");
      expect(model).toHaveProperty("input_credits_per_token");
      expect(model).toHaveProperty("output_credits_per_token");
      expect(model).toHaveProperty("providerDisplayName");
    }
  });
});
