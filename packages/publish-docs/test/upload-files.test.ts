import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import YAML from "yaml";

// Mock dependencies first
const mockReadFileSync = mock();
const mockWriteFileSync = mock();
const mockExistsSync = mock();
const mockStatSync = mock();
const mockFetch = mock() as any;
const mockGetComponentMountPoint = mock();
const mockCreateHash = mock();

// Create mock crypto module
const mockCrypto = {
  createHash: mockCreateHash,
};

mock.module("node:crypto", () => ({
  default: mockCrypto,
  createHash: mockCreateHash,
}));

mock.module("node:fs", () => ({
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

mock.module("../src/utils/get-component-mount-point.js", () => ({
  default: {
    getComponentMountPoint: mockGetComponentMountPoint,
  },
  getComponentMountPoint: mockGetComponentMountPoint,
}));

// Mock global fetch
(global as any).fetch = mockFetch;

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
      const mockCreateResponse = {
        ok: true,
        headers: {
          get: mock().mockReturnValue("/upload/123"),
        },
      };

      const mockUploadResponse = {
        ok: true,
        json: mock().mockResolvedValue({
          url: "https://cdn.example.com/uploaded-file.jpg",
        }),
      };

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
      const mockCreateResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: mock().mockResolvedValue("Invalid request"),
      };

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
      const mockCreateResponse = {
        ok: true,
        headers: { get: mock().mockReturnValue(null) },
      };

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

      const mockCreateResponse = {
        ok: true,
        headers: { get: mock().mockReturnValue("/upload/123") },
      };

      const mockUploadResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: mock().mockResolvedValue("Upload failed"),
      };

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

      const mockCreateResponse = {
        ok: true,
        headers: { get: mock().mockReturnValue("/upload/123") },
      };

      const mockUploadResponse = {
        ok: true,
        json: mock().mockResolvedValue({}), // No URL in response
      };

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

      const mockCreateResponse = {
        ok: true,
        headers: { get: mock().mockReturnValue("/upload/123") },
      };
      const mockUploadResponse = {
        ok: true,
        json: mock().mockResolvedValue({ url: "https://cdn.example.com/uploaded.jpg" }),
      };

      mockFetch.mockResolvedValueOnce(mockCreateResponse).mockResolvedValueOnce(mockUploadResponse);

      const result = await uploadFiles(baseOptions);

      expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/Failed to load cache file/));
      expect(result.results).toHaveLength(1);
    });
  });
});
