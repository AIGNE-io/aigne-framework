import { afterAll, describe, expect, test } from "bun:test";
import { joinURL } from "ufo";
import { getAIGNEHubMountPoint } from "../../src/utils/blocklet.js";
import { createHonoServer } from "../_mocks_/server.js";

describe("AIGNEHubChatModel", async () => {
  const { url, close } = await createHonoServer();

  afterAll(async () => {
    await close();
  });

  describe("getAIGNEHubMountPoint", () => {
    test("should return the mount point for a given component", async () => {
      const mountPoint = await getAIGNEHubMountPoint(url, "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ");
      expect(mountPoint).toBe(joinURL(url, "/ai-kit"));
    });

    test("should throw an error if the component is not found", async () => {
      await expect(getAIGNEHubMountPoint(url, "unknown")).rejects.toThrow(
        "Component unknown not found in blocklet",
      );
    });
  });
});
