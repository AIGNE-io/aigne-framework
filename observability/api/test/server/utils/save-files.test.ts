import { beforeEach, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import saveFiles from "../../../api/server/utils/save-files.js";

const testDataDir = "/tmp/aigne-test-save-files";

beforeEach(() => {
  if (existsSync(testDataDir)) {
    rmSync(testDataDir, { recursive: true, force: true });
  }
});

test("should save files with type 'file' and return relative paths", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(1);
  expect(result[0]?.mimeType).toBe("image/png");
  expect(result[0]?.type).toBe("file");
  expect(result[0]?.data).toMatch(/^files\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.png$/);
});

test("should skip files with type other than 'file'", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "image",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(1);
  expect(result[0]?.data).toBe(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  );
});

test("should handle different mime types correctly", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
    {
      mimeType: "image/jpeg",
      type: "file",
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
    type: "file",
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

test("should handle mixed file types correctly", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
    {
      mimeType: "image/jpeg",
      type: "image",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
    {
      mimeType: "text/plain",
      type: "file",
      data: "SGVsbG8gV29ybGQ=",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(3);

  // First file should be saved (type: "file")
  expect(result[0]?.data).toMatch(/^files\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.png$/);

  // Second file should be skipped (type: "image")
  expect(result[1]?.data).toBe(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  );

  // Third file should be saved (type: "file")
  expect(result[2]?.data).toMatch(/^files\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.txt$/);
});
