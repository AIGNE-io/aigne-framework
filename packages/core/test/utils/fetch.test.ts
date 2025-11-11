import { beforeEach, expect, type Mock, spyOn, test } from "bun:test";
import { afterEach } from "node:test";
import { fetch } from "@aigne/core/utils/fetch.js";

let fetchSpy: Mock<typeof fetch>;

beforeEach(() => {
  fetchSpy = spyOn(globalThis, "fetch");
});

afterEach(() => {
  fetchSpy.mockRestore();
});

test("fetch should reject with timeout error after default timeout", async () => {
  fetchSpy.mockImplementationOnce(async (_, init) => {
    return new Promise((_, reject) => {
      init?.signal?.addEventListener("abort", () => {
        reject(new Error("The operation was aborted"));
      });
    });
  });

  const response = fetch("https://example.com", {
    timeout: 300,
  });

  expect(response).rejects.toMatchInlineSnapshot(
    `[Error: Fetch https://example.com error: The operation was aborted]`,
  );
});

test("fetch should custom error message on network error", async () => {
  fetchSpy.mockRejectedValueOnce(new Error("Network failure"));

  const response = fetch("https://example.com");

  expect(response).rejects.toMatchInlineSnapshot(
    `[Error: Fetch https://example.com error: Network failure]`,
  );
});

test("fetch should custom error message on error response", async () => {
  fetchSpy.mockResolvedValueOnce(
    new Response("Not Found", { status: 404, statusText: "Not Found" }),
  );

  const response = fetch("https://example.com");

  expect(response).rejects.toMatchInlineSnapshot(
    `[Error: Fetch https://example.com error: 404 Not Found Not Found]`,
  );
});

test("fetch should catch json error and custom error message", async () => {
  fetchSpy.mockResolvedValueOnce(new Response("Invalid JSON", { status: 200, statusText: "OK" }));

  const response = fetch("https://example.com");

  const json = response.then((res) => res.json());

  expect(json).rejects.toMatchInlineSnapshot(
    `[Error: Parse JSON from https://example.com error: Failed to parse JSON]`,
  );
});
