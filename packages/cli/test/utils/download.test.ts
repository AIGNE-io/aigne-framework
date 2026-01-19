import { afterAll, afterEach, beforeAll, beforeEach, expect, mock, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { downloadAndExtract } from "@aigne/cli/utils/download.js";
import { mockAIGNEPackage } from "../_mocks_/mock-aigne-package.js";

// Save the original fetch to restore later
const originalFetch = globalThis.fetch;

// Create our mock
const mockFetch = mock(() => Promise.resolve(new Response("{}")));

beforeAll(() => {
  // Replace global fetch with our mock before any tests run
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

afterAll(() => {
  // Restore original fetch after all tests complete
  globalThis.fetch = originalFetch;
});

beforeEach(() => {
  mockFetch.mockClear();
});

afterEach(() => {
  // Reset to default implementation after each test
  mockFetch.mockReset();
  mockFetch.mockImplementation(() => Promise.resolve(new Response("{}")));
});

test("downloadPackage should work", async () => {
  const url = "https://www.aigne.io/projects/xxx/test-package.tgz";
  const dir = join(tmpdir(), randomUUID());
  await mkdir(dir, { recursive: true });

  try {
    mockFetch.mockReturnValueOnce(Promise.resolve(new Response(await mockAIGNEPackage())));

    await downloadAndExtract(url, dir);

    expect((await stat(join(dir, "aigne.yaml"))).isFile()).toBeTrue();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("downloadPackage should raise error with custom message", async () => {
  const url = "https://www.aigne.io/projects/xxx/test-package.tgz";
  const dir = join(tmpdir(), randomUUID());
  await mkdir(dir, { recursive: true });

  try {
    mockFetch.mockReturnValueOnce(Promise.reject(new Error("Network error")));

    expect(downloadAndExtract(url, dir)).rejects.toMatchInlineSnapshot(
      `[Error: Fetch https://www.aigne.io/projects/xxx/test-package.tgz error: Network error]`,
    );

    mockFetch.mockReturnValueOnce(
      Promise.resolve(new Response(null, { status: 404, statusText: "Not Found" })),
    );

    expect(downloadAndExtract(url, dir)).rejects.toMatchInlineSnapshot(
      `[Error: Fetch https://www.aigne.io/projects/xxx/test-package.tgz error: 404 Not Found ]`,
    );

    mockFetch.mockReturnValueOnce(Promise.resolve(new Response(null)));

    expect(downloadAndExtract(url, dir)).rejects.toMatchInlineSnapshot(
      `[Error: Failed to download package from https://www.aigne.io/projects/xxx/test-package.tgz: Unexpected to get empty response]`,
    );

    mockFetch.mockReturnValueOnce(Promise.resolve(new Response("invalid tgz file content")));

    expect(downloadAndExtract(url, dir)).rejects.toMatchInlineSnapshot(
      `[Error: Failed to extract package from https://www.aigne.io/projects/xxx/test-package.tgz: TAR_BAD_ARCHIVE: Unrecognized archive format]`,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
