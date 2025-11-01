import { describe, expect, spyOn, test } from "bun:test";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { waitFileSizeStable } from "../src/utils.js";

describe("waitFileSizeStable", () => {
  test("should resolve when file size stabilizes", async () => {
    const filePath = "/tmp/test-file.mp4";
    let callCount = 0;

    const statSpy = spyOn(nodejs.fs, "stat").mockImplementation(async () => {
      callCount++;
      const sizes = [0, 100, 200, 300, 300, 300, 300];
      return { size: sizes[Math.min(callCount - 1, sizes.length - 1)] } as any;
    });

    await waitFileSizeStable(filePath, {
      checkInterval: 10,
      stableCount: 3,
      timeout: 1000,
    });

    expect(statSpy).toHaveBeenCalled();
    expect(callCount).toBeGreaterThanOrEqual(6);
  });

  test("should throw error when timeout is reached", async () => {
    const filePath = "/tmp/test-file.mp4";
    let callCount = 0;

    const statSpy = spyOn(nodejs.fs, "stat").mockImplementation(async () => {
      callCount++;
      return { size: callCount * 100 } as any;
    });

    await expect(
      waitFileSizeStable(filePath, {
        checkInterval: 10,
        stableCount: 3,
        timeout: 100,
      }),
    ).rejects.toThrow("Timeout waiting for file to stabilize: /tmp/test-file.mp4");

    expect(statSpy).toHaveBeenCalled();
  });

  test("should ignore zero-size stability", async () => {
    const filePath = "/tmp/test-file.mp4";
    let callCount = 0;

    const statSpy = spyOn(nodejs.fs, "stat").mockImplementation(async () => {
      callCount++;
      const sizes = [0, 0, 0, 100, 100, 100, 100];
      return { size: sizes[Math.min(callCount - 1, sizes.length - 1)] } as any;
    });

    await waitFileSizeStable(filePath, {
      checkInterval: 10,
      stableCount: 3,
      timeout: 1000,
    });

    expect(statSpy).toHaveBeenCalled();
    expect(callCount).toBeGreaterThanOrEqual(6);
  });

  test("should use default parameters", async () => {
    const filePath = "/tmp/test-file.mp4";
    let callCount = 0;

    const statSpy = spyOn(nodejs.fs, "stat").mockImplementation(async () => {
      callCount++;
      return { size: 100 } as any;
    });

    await waitFileSizeStable(filePath);

    expect(statSpy).toHaveBeenCalled();
    expect(callCount).toBeGreaterThanOrEqual(3);
  });

  test("should support custom stable count", async () => {
    const filePath = "/tmp/test-file.mp4";
    let callCount = 0;

    const statSpy = spyOn(nodejs.fs, "stat").mockImplementation(async () => {
      callCount++;
      return { size: 100 } as any;
    });

    await waitFileSizeStable(filePath, {
      checkInterval: 10,
      stableCount: 5,
      timeout: 1000,
    });

    expect(statSpy).toHaveBeenCalled();
    expect(callCount).toBeGreaterThanOrEqual(5);
  });

  test("should reset stable count when file size changes", async () => {
    const filePath = "/tmp/test-file.mp4";
    let callCount = 0;

    const statSpy = spyOn(nodejs.fs, "stat").mockImplementation(async () => {
      callCount++;
      const sizes = [100, 100, 200, 200, 200, 200];
      return { size: sizes[Math.min(callCount - 1, sizes.length - 1)] } as any;
    });

    await waitFileSizeStable(filePath, {
      checkInterval: 10,
      stableCount: 3,
      timeout: 1000,
    });

    expect(statSpy).toHaveBeenCalled();
    expect(callCount).toBeGreaterThanOrEqual(5);
  });

  test("should not misidentify growing file as stable", async () => {
    const filePath = "/tmp/test-file.mp4";
    let callCount = 0;

    const statSpy = spyOn(nodejs.fs, "stat").mockImplementation(async () => {
      callCount++;
      if (callCount <= 10) {
        return { size: callCount * 100 } as any;
      }
      return { size: 1000 } as any;
    });

    await waitFileSizeStable(filePath, {
      checkInterval: 10,
      stableCount: 3,
      timeout: 2000,
    });

    expect(statSpy).toHaveBeenCalled();
    expect(callCount).toBeGreaterThanOrEqual(13);
  });
});
