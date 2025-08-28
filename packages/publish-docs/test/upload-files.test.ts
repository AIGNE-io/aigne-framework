import { afterAll, afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { join } from "node:path";
import YAML from "yaml";
import { mockModule } from "./mock-module.js";

// Mock dependencies first
const mockReadFileSync = mock();
const mockWriteFileSync = mock();
const mockExistsSync = mock();
const mockStatSync = mock();
const mockGetComponentMountPoint = mock();
const mockCreateHash = mock();

const mockFetch = spyOn(globalThis, "fetch");

// Create mock crypto module
const mockCrypto = {
  createHash: mockCreateHash,
};

const cryptoMock = await mockModule("node:crypto", () => ({
  default: mockCrypto,
  createHash: mockCreateHash,
}));

const fsMock = await mockModule("node:fs", () => ({
  default: {
    readFileSync: mockReadFileSync,
    writeFileSync: mockWriteFileSync,
    existsSync: mockExistsSync,
    statSync: mockStatSync,
  },
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync,
  existsSync: mockExistsSync,
  statSync: mockStatSync,
}));

const mountPointMock = await mockModule(
  join(import.meta.dirname, "../src/utils/get-component-mount-point.js"),
  () => ({
    default: {
      getComponentMountPoint: mockGetComponentMountPoint,
    },
    getComponentMountPoint: mockGetComponentMountPoint,
  }),
);

afterAll(async () => {
  await cryptoMock[Symbol.asyncDispose]?.();
  await fsMock[Symbol.asyncDispose]?.();
  await mountPointMock[Symbol.asyncDispose]?.();
  mockFetch.mockRestore();
});

// Now import the module under test
import { type UploadFilesOptions, uploadFiles } from "../src/utils/upload-files.js";

// Mock console methods
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

describe("upload-files", () => {
  beforeEach(() => {
    mockReadFileSync.mockClear();
    mockWriteFileSync.mockClear();
    mockExistsSync.mockClear();
    mockStatSync.mockClear();
    mockFetch.mockClear();
    mockGetComponentMountPoint.mockClear();
    mockCreateHash.mockClear();
    console.warn = mock();
    console.error = mock();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe("uploadFiles", () => {
    const baseOptions: UploadFilesOptions = {
      appUrl: "https://example.com",
      filePaths: ["/path/to/file1.jpg"],
      accessToken: "test-token",
      concurrency: 2,
      cacheFilePath: "/cache.yml",
    };

    test("should return empty results for empty file paths", async () => {
      const options: UploadFilesOptions = {
        ...baseOptions,
        filePaths: [],
      };

      const result = await uploadFiles(options);

      expect(result).toEqual({ results: [] });
    });

    test("should successfully upload files without cache", async () => {
      const options: UploadFilesOptions = {
        appUrl: "https://example.com",
        filePaths: ["/path/to/file1.jpg"],
        accessToken: "test-token",
      };

      // Mock file system operations
      const fileBuffer = Buffer.from("fake image data");
      mockReadFileSync.mockReturnValue(fileBuffer);
      mockStatSync.mockReturnValue({ size: fileBuffer.length });

      // Mock crypto hash
      const mockHashInstance = {
        update: mock().mockReturnThis(),
        digest: mock().mockReturnValue("abc123hash"),
      };
      mockCreateHash.mockReturnValue(mockHashInstance);

      // Mock component mount point
      mockGetComponentMountPoint.mockResolvedValue("/mount-point");

      // Mock successful upload
      const mockCreateResponse = new Response(null, {
        headers: {
          location: "/upload/123",
        },
      });

      const mockUploadResponse = new Response(
        JSON.stringify({
          url: "https://cdn.example.com/uploaded-file.jpg",
        }),
      );

      mockFetch
        .mockResolvedValueOnce(mockCreateResponse) // Create upload
        .mockResolvedValueOnce(mockUploadResponse); // Upload file

      const result = await uploadFiles(options);

      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual({
        filePath: "/path/to/file1.jpg",
        url: "https://cdn.example.com/uploaded-file.jpg",
      });
    });

    test("should handle upload creation failure", async () => {
      const fileBuffer = Buffer.from("fake image data");
      mockReadFileSync.mockReturnValue(fileBuffer);
      mockStatSync.mockReturnValue({ size: 100 });

      const mockHashInstance = {
        update: mock().mockReturnThis(),
        digest: mock().mockReturnValue("abc123hash"),
      };
      mockCreateHash.mockReturnValue(mockHashInstance);

      mockGetComponentMountPoint.mockResolvedValue("/mount-point");

      // Mock failed creation
      const mockCreateResponse = new Response("Invalid request", {
        status: 400,
        statusText: "Bad Request",
      });

      mockFetch.mockResolvedValue(mockCreateResponse);

      const result = await uploadFiles({
        ...baseOptions,
        filePaths: ["/path/to/file1.jpg"],
      });

      expect(result.results).toHaveLength(1);
      expect(result.results[0]?.url).toBe("");
      expect(console.error).toHaveBeenCalled();
    });

    test("should handle file processing errors", async () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error("File read error");
      });

      const result = await uploadFiles({
        ...baseOptions,
        filePaths: ["/path/to/file1.jpg"],
      });

      expect(result.results[0]).toEqual({
        filePath: "/path/to/file1.jpg",
        url: "",
      });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/Error processing/),
        expect.any(Error),
      );
    });

    test("should use cache when available", async () => {
      const cacheData = {
        abc123hash: {
          local_path: "path/to/file1.jpg",
          sites: {
            "https://example.com": {
              url: "https://cdn.example.com/cached-file.jpg",
              upload_time: "2023-01-01T00:00:00.000Z",
            },
          },
        },
      };

      // Mock cache file exists and contains data
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync
        .mockReturnValueOnce(YAML.stringify(cacheData)) // Cache file
        .mockReturnValue(Buffer.from("fake image data")); // File content for hash

      const mockHashInstance = {
        update: mock().mockReturnThis(),
        digest: mock().mockReturnValue("abc123hash"),
      };
      mockCreateHash.mockReturnValue(mockHashInstance);

      const result = await uploadFiles(baseOptions);

      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual({
        filePath: "/path/to/file1.jpg",
        url: "https://cdn.example.com/cached-file.jpg",
      });
    });

    test("should handle missing upload URL in response", async () => {
      const fileBuffer = Buffer.from("fake image data");
      mockReadFileSync.mockReturnValue(fileBuffer);
      mockStatSync.mockReturnValue({ size: 100 });

      const mockHashInstance = {
        update: mock().mockReturnThis(),
        digest: mock().mockReturnValue("abc123hash"),
      };
      mockCreateHash.mockReturnValue(mockHashInstance);

      mockGetComponentMountPoint.mockResolvedValue("/mount-point");

      // Mock response with no Location header
      const mockCreateResponse = new Response(null, {});

      mockFetch.mockResolvedValue(mockCreateResponse);

      const result = await uploadFiles({
        ...baseOptions,
        filePaths: ["/path/to/file1.jpg"],
      });

      expect(result.results[0]?.url).toBe("");
      expect(console.error).toHaveBeenCalled();
    });

    test("should handle upload patch failure", async () => {
      const fileBuffer = Buffer.from("fake image data");
      mockReadFileSync.mockReturnValue(fileBuffer);
      mockStatSync.mockReturnValue({ size: 100 });

      const mockHashInstance = {
        update: mock().mockReturnThis(),
        digest: mock().mockReturnValue("abc123hash"),
      };
      mockCreateHash.mockReturnValue(mockHashInstance);

      mockGetComponentMountPoint.mockResolvedValue("/mount-point");

      const mockCreateResponse = new Response(null, {
        headers: {
          location: "/upload/123",
        },
      });

      const mockUploadResponse = new Response("Upload failed", {
        status: 500,
        statusText: "Internal Server Error",
      });

      mockFetch.mockResolvedValueOnce(mockCreateResponse).mockResolvedValueOnce(mockUploadResponse);

      const result = await uploadFiles({
        ...baseOptions,
        filePaths: ["/path/to/file1.jpg"],
      });

      expect(result.results[0]?.url).toBe("");
      expect(console.error).toHaveBeenCalled();
    });

    test("should handle missing URL in upload response", async () => {
      const fileBuffer = Buffer.from("fake image data");
      mockReadFileSync.mockReturnValue(fileBuffer);
      mockStatSync.mockReturnValue({ size: 100 });

      const mockHashInstance = {
        update: mock().mockReturnThis(),
        digest: mock().mockReturnValue("abc123hash"),
      };
      mockCreateHash.mockReturnValue(mockHashInstance);

      mockGetComponentMountPoint.mockResolvedValue("/mount-point");

      const mockCreateResponse = new Response(null, {
        headers: {
          location: "/upload/123",
        },
      });

      const mockUploadResponse = new Response(JSON.stringify({}), {});

      mockFetch.mockResolvedValueOnce(mockCreateResponse).mockResolvedValueOnce(mockUploadResponse);

      const result = await uploadFiles({
        ...baseOptions,
        filePaths: ["/path/to/file1.jpg"],
      });

      expect(result.results[0]?.url).toBe("");
      expect(console.error).toHaveBeenCalled();
    });

    test("should handle corrupted cache file", async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync
        .mockReturnValueOnce("invalid yaml content [") // Corrupted cache
        .mockReturnValue(Buffer.from("fake image data"));

      mockStatSync.mockReturnValue({ size: 100 });

      const mockHashInstance = {
        update: mock().mockReturnThis(),
        digest: mock().mockReturnValue("abc123hash"),
      };
      mockCreateHash.mockReturnValue(mockHashInstance);

      mockGetComponentMountPoint.mockResolvedValue("/mount-point");

      const mockCreateResponse = new Response(null, {
        headers: {
          location: "/upload/123",
        },
      });
      const mockUploadResponse = new Response(
        JSON.stringify({
          url: "https://cdn.example.com/uploaded.jpg",
        }),
      );

      mockFetch.mockResolvedValueOnce(mockCreateResponse).mockResolvedValueOnce(mockUploadResponse);

      const result = await uploadFiles(baseOptions);

      expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/Failed to load cache file/));
      expect(result.results).toHaveLength(1);
    });
  });
});
