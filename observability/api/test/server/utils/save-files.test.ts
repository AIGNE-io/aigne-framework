import { beforeEach, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import saveFiles from "../../../api/server/utils/save-files.js";

const testDataDir = join(homedir(), ".aigne", "observability", "test-files");

const createPathRegex = (extension: string) => {
  const escapedPath = testDataDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escapedPath}\\/[a-f0-9-]+\\.${extension}$`);
};

beforeEach(() => {
  if (existsSync(testDataDir)) {
    rmSync(testDataDir, { recursive: true, force: true });
  }
});

test("should save files with type 'file' and return absolute paths", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(1);
  const fileData = result[0] as any;
  expect(fileData?.mimeType).toBe("image/png");
  expect(fileData?.type).toBe("file");
  expect(fileData?.data).toMatch(createPathRegex("png"));
  expect(existsSync(fileData?.data as string)).toBe(true);
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
  const fileData = result[0] as any;
  expect(fileData?.data).toBe(
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
  const fileData1 = result[0] as any;
  const fileData2 = result[1] as any;
  expect(fileData1?.data).toMatch(createPathRegex("png"));
  expect(fileData2?.data).toMatch(createPathRegex("jpg"));
  expect(existsSync(fileData1?.data as string)).toBe(true);
  expect(existsSync(fileData2?.data as string)).toBe(true);
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
  const fileData = result[0] as any;
  expect(fileData?.data).toMatch(createPathRegex("png"));
  expect(existsSync(fileData?.data as string)).toBe(true);
});

test("should generate unique filenames", async () => {
  const files = Array.from({ length: 3 }, () => ({
    mimeType: "image/png",
    type: "file",
    data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  }));

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(3);

  const filenames = result.map((r) => (r as any).data);
  const uniqueFilenames = new Set(filenames);
  expect(uniqueFilenames.size).toBe(3);

  // Verify all files exist
  filenames.forEach((filename) => {
    expect(existsSync(filename as string)).toBe(true);
  });
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
  const fileData1 = result[0] as any;
  expect(fileData1?.data).toMatch(createPathRegex("png"));
  expect(existsSync(fileData1?.data as string)).toBe(true);

  // Second file should be skipped (type: "image")
  const fileData2 = result[1] as any;
  expect(fileData2?.data).toBe(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  );

  // Third file should be saved (type: "file")
  const fileData3 = result[2] as any;
  expect(fileData3?.data).toMatch(createPathRegex("txt"));
  expect(existsSync(fileData3?.data as string)).toBe(true);
});

test("should handle ImageData with base64 field", async () => {
  const files = [
    {
      base64:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(1);
  const imageData = result[0] as any;
  expect(imageData).toHaveProperty("base64");
  expect(imageData).toHaveProperty("path");
  expect(imageData?.base64).toBe(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==".slice(
      0,
      20,
    ) + "...",
  );
  expect(imageData?.path).toMatch(createPathRegex("png"));
  expect(existsSync(imageData?.path as string)).toBe(true);
});

test("should handle mixed FileData and ImageData types", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
    {
      base64:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(2);

  // First file (FileData)
  const fileData = result[0] as any;
  expect(fileData?.data).toMatch(createPathRegex("png"));
  expect(existsSync(fileData?.data as string)).toBe(true);

  // Second file (ImageData)
  const imageData = result[1] as any;
  expect(imageData).toHaveProperty("base64");
  expect(imageData).toHaveProperty("path");
  expect(imageData?.path).toMatch(createPathRegex("png"));
  expect(existsSync(imageData?.path as string)).toBe(true);
});
