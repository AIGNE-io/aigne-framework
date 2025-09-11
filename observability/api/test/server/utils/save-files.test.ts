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

const base64Image =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

test("should save files with type 'file' and return absolute paths", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: base64Image,
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
      data: base64Image,
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(1);
  const fileData = result[0] as any;
  expect(fileData?.data).toBe(base64Image);
});

test("should handle different mime types correctly", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: base64Image,
    },
    {
      mimeType: "image/jpeg",
      type: "file",
      data: base64Image,
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
      data: base64Image,
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
    data: base64Image,
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
      data: base64Image,
    },
    {
      mimeType: "image/jpeg",
      type: "image",
      data: base64Image,
    },
    {
      mimeType: "text/plain",
      type: "file",
      data: "SGVsbG8gV29ybGQ=",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(3);

  const fileData1 = result[0] as any;
  expect(fileData1?.data).toMatch(createPathRegex("png"));
  expect(existsSync(fileData1?.data as string)).toBe(true);

  const fileData2 = result[1] as any;
  expect(fileData2?.data).toBe(base64Image);

  const fileData3 = result[2] as any;
  expect(fileData3?.data).toMatch(createPathRegex("txt"));
  expect(existsSync(fileData3?.data as string)).toBe(true);
});

test("should handle ImageData with base64 field", async () => {
  const files = [
    {
      base64: base64Image,
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(1);
  const imageData = result[0] as any;
  expect(imageData).toHaveProperty("base64");
  expect(imageData).toHaveProperty("path");
  expect(imageData?.base64).toBe(`${base64Image.slice(0, 20)}...`);
  expect(imageData?.path).toMatch(createPathRegex("png"));
  expect(existsSync(imageData?.path as string)).toBe(true);
});

test("should handle mixed FileData and ImageData types", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: base64Image,
    },
    {
      base64: base64Image,
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });

  expect(result).toHaveLength(2);

  const fileData = result[0] as any;
  expect(fileData?.data).toMatch(createPathRegex("png"));
  expect(existsSync(fileData?.data as string)).toBe(true);

  const imageData = result[1] as any;
  expect(imageData).toHaveProperty("base64");
  expect(imageData).toHaveProperty("path");
  expect(imageData?.path).toMatch(createPathRegex("png"));
  expect(existsSync(imageData?.path as string)).toBe(true);
});

test("should handle invalid base64 data gracefully", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: "invalid-base64-data",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });
  expect(result).toHaveLength(1);
  const fileData = result[0] as any;
  expect(existsSync(fileData?.data as string)).toBe(true);
});

test("should handle null/undefined file data", async () => {
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: null as any,
    },
    {
      mimeType: "image/png",
      type: "file",
      data: undefined as any,
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });
  expect(result).toHaveLength(2);
});

test("should handle empty base64 string", async () => {
  const files = [
    {
      base64: "",
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });
  expect(result).toHaveLength(1);
  const imageData = result[0] as any;
  expect(imageData?.base64).toBe("");
});

test("should handle files with missing mimeType", async () => {
  const files = [
    {
      type: "file",
      data: base64Image,
    } as any,
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });
  expect(result).toHaveLength(1);
  const fileData = result[0] as any;
  expect(fileData?.data).toMatch(createPathRegex("png"));
});

test("should handle files with invalid mimeType", async () => {
  const files = [
    {
      mimeType: "",
      type: "file",
      data: base64Image,
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });
  expect(result).toHaveLength(1);
  const fileData = result[0] as any;
  expect(fileData?.data).toMatch(createPathRegex("png"));
});

test("should handle files with very long base64 data", async () => {
  const longBase64 = base64Image.repeat(1000);
  const files = [
    {
      mimeType: "image/png",
      type: "file",
      data: longBase64,
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });
  expect(result).toHaveLength(1);
  const fileData = result[0] as any;
  expect(fileData?.data).toMatch(createPathRegex("png"));
  expect(existsSync(fileData?.data as string)).toBe(true);
});

test("should handle concurrent file operations", async () => {
  const files = Array.from({ length: 10 }, () => ({
    mimeType: "image/png",
    type: "file",
    data: base64Image,
  }));

  const promises = Array.from({ length: 3 }, () => saveFiles(files, { dataDir: testDataDir }));
  const results = await Promise.all(promises);

  expect(results).toHaveLength(3);
  results.forEach((result) => {
    expect(result).toHaveLength(10);
    result.forEach((file) => {
      expect(existsSync((file as any).data as string)).toBe(true);
    });
  });
});

test("should handle files with special characters in mimeType", async () => {
  const files = [
    {
      mimeType: "image/png; charset=utf-8",
      type: "file",
      data: base64Image,
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });
  expect(result).toHaveLength(1);
  const fileData = result[0] as any;
  expect(fileData?.data).toMatch(createPathRegex("png"));
});

test("should handle ImageData with null base64", async () => {
  const files = [
    {
      base64: null as any,
    },
  ];

  const result = await saveFiles(files, { dataDir: testDataDir });
  expect(result).toHaveLength(1);
  const imageData = result[0] as any;
  expect(imageData).toEqual({ base64: null });
});
