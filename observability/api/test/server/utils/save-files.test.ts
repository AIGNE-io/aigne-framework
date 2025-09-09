import { beforeEach, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import dayjs from "@abtnode/util/lib/dayjs";
import saveFiles from "../../../api/server/utils/save-files.js";

const testDataDir = "/tmp/aigne-test-save-files";

beforeEach(() => {
  if (existsSync(testDataDir)) {
    rmSync(testDataDir, { recursive: true, force: true });
  }
});

test("should save base64 files and return relative paths", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "image",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(1);
  expect(result[0]?.mimeType).toBe("image/png");
  expect(result[0]?.type).toBe("image");
  expect(result[0]?.data).toMatch(/^files\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.png$/);
});

test("should skip non-base64 data", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "image",
      data: "not-base64-data",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(1);
  expect(result[0]?.data).toBe("not-base64-data");
});

test("should create directory structure with correct date", async () => {
  const files = [
    {
      mimeType: "image/jpeg",
      type: "image",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
  ];

  await saveFiles(files, { dataDir: testDataDir });

  const today = dayjs().format("YYYY-MM-DD");
  const expectedDir = join(testDataDir, "files", today);
  expect(existsSync(expectedDir)).toBe(true);
});

test("should handle different mime types correctly", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "image",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
    {
      mimeType: "image/jpeg",
      type: "image",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(2);
  expect(result[0]?.data).toMatch(/\.png$/);
  expect(result[1]?.data).toMatch(/\.jpg$/);
});

test("should handle unknown mime type with default extension", async () => {
  const files = [
    {
      mimeType: "unknown/type",
      type: "file",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(1);
  expect(result[0]?.data).toMatch(/\.png$/);
});

test("should generate unique filenames", async () => {
  const files = Array.from({ length: 3 }, () => ({
    mimeType: "image/png",
    type: "image",
    data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  }));

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(3);

  const filenames = result.map((r) => r.data);
  const uniqueFilenames = new Set(filenames);
  expect(uniqueFilenames.size).toBe(3);
});

test("should handle empty files array", async () => {
  const result = await saveFiles([], { dataDir: testDataDir });
  expect(result).toHaveLength(0);
});
