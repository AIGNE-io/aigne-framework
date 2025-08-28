import { afterAll, afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

// Mock fetch
const mockFetch = spyOn(globalThis, "fetch");

afterAll(() => {
  mockFetch.mockRestore();
});

// Import the function under test
import { getComponentMountPoint } from "../src/utils/get-component-mount-point.js";

// Mock console methods
const originalConsoleError = console.error;

describe("getComponentMountPoint", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    console.error = mock();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  test("should return mount point for existing component", async () => {
    const mockConfig = {
      componentMountPoints: [
        {
          mountPoint: "/component1",
          title: "Component 1",
          did: "did:component:1",
        },
        {
          mountPoint: "/component2",
          title: "Component 2",
          did: "did:component:2",
        },
      ],
    };

    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockConfig)));

    const result = await getComponentMountPoint("https://app.example.com", "did:component:2");

    expect(result).toBe("/component2");
    expect(mockFetch).toHaveBeenCalledWith("https://app.example.com/__blocklet__.js?type=json", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  });

  test("should handle appUrl with path", async () => {
    const mockConfig = {
      componentMountPoints: [
        {
          mountPoint: "/mount",
          title: "Test Component",
          did: "did:test",
        },
      ],
    };

    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockConfig)));

    const result = await getComponentMountPoint("https://app.example.com/path", "did:test");

    expect(result).toBe("/mount");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://app.example.com/__blocklet__.js?type=json",
      expect.any(Object),
    );
  });

  test("should throw error when component not found", async () => {
    const mockConfig = {
      componentMountPoints: [
        {
          mountPoint: "/component1",
          title: "Component 1",
          did: "did:component:1",
        },
      ],
    };

    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockConfig)));

    expect(getComponentMountPoint("https://app.example.com", "did:nonexistent")).rejects.toThrow(
      "Component did:nonexistent not found in blocklet: https://app.example.com",
    );
  });

  test("should throw error when fetch fails", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 404, statusText: "Not Found" }));

    expect(getComponentMountPoint("https://app.example.com", "did:test")).rejects.toThrow(
      "Failed to fetch blocklet json: 404 Not Found, https://app.example.com/__blocklet__.js?type=json",
    );
  });

  test("should throw error when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    expect(getComponentMountPoint("https://app.example.com", "did:test")).rejects.toThrow(
      "Network error",
    );
  });

  test("should handle empty componentMountPoints array", async () => {
    const mockConfig = {
      componentMountPoints: [],
    };

    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockConfig)));

    expect(getComponentMountPoint("https://app.example.com", "did:test")).rejects.toThrow(
      "Component did:test not found in blocklet: https://app.example.com",
    );
  });

  test("should handle malformed JSON response", async () => {
    mockFetch.mockResolvedValue(new Response("Invalid JSON"));

    expect(getComponentMountPoint("https://app.example.com", "did:test")).rejects.toThrow(
      "Failed to parse JSON",
    );
  });

  test("should handle config without componentMountPoints property", async () => {
    const mockConfig = {};

    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockConfig)));

    expect(getComponentMountPoint("https://app.example.com", "did:test")).rejects.toThrow(); // Will throw because componentMountPoints is undefined
  });

  test("should construct correct URL for different origins", async () => {
    const mockConfig = {
      componentMountPoints: [
        {
          mountPoint: "/test",
          title: "Test",
          did: "did:test",
        },
      ],
    };

    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockConfig)));

    // Test with different URL formats
    await getComponentMountPoint("http://localhost:3000", "did:test");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/__blocklet__.js?type=json",
      expect.any(Object),
    );

    mockFetch.mockClear();

    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockConfig)));
    await getComponentMountPoint("https://subdomain.example.com:8080/app", "did:test");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://subdomain.example.com:8080/__blocklet__.js?type=json",
      expect.any(Object),
    );
  });

  test("should handle component with special characters in did", async () => {
    const specialDid = "did:component:special-chars_123";
    const mockConfig = {
      componentMountPoints: [
        {
          mountPoint: "/special",
          title: "Special Component",
          did: specialDid,
        },
      ],
    };

    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockConfig)));

    const result = await getComponentMountPoint("https://app.example.com", specialDid);

    expect(result).toBe("/special");
  });

  test("should handle case-sensitive did matching", async () => {
    const mockConfig = {
      componentMountPoints: [
        {
          mountPoint: "/case",
          title: "Case Sensitive",
          did: "did:Case:Sensitive",
        },
      ],
    };

    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockConfig)));

    // Should find exact match
    const result = await getComponentMountPoint("https://app.example.com", "did:Case:Sensitive");
    expect(result).toBe("/case");

    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockConfig)));
    // Should not find case-different match
    expect(getComponentMountPoint("https://app.example.com", "did:case:sensitive")).rejects.toThrow(
      "Component did:case:sensitive not found in blocklet",
    );
  });

  test("should handle response with non-200 status codes", async () => {
    const testCases = [
      { status: 401, statusText: "Unauthorized" },
      { status: 403, statusText: "Forbidden" },
      { status: 500, statusText: "Internal Server Error" },
      { status: 503, statusText: "Service Unavailable" },
    ];

    for (const testCase of testCases) {
      mockFetch.mockResolvedValue(
        new Response(null, {
          status: testCase.status,
          statusText: testCase.statusText,
        }),
      );

      expect(getComponentMountPoint("https://app.example.com", "did:test")).rejects.toThrow(
        `Failed to fetch blocklet json: ${testCase.status} ${testCase.statusText}`,
      );

      mockFetch.mockClear();
    }
  });
});
