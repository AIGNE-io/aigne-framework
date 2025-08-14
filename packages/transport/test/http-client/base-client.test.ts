import { expect, spyOn, test } from "bun:test";
import { BaseClient } from "@aigne/transport/http-client/base-client";

test("BaseClient should retry on fetch errors", async () => {
  const client = new BaseClient({ url: "" });

  const fetch = spyOn(globalThis, "fetch");

  fetch
    .mockRejectedValueOnce(new Error("ECONNRESET"))
    .mockResolvedValueOnce(new Response(JSON.stringify({ result: "success" }), { status: 200 }));
  const result = await client.fetch("https://hub.aigne.io/api/v2/chat");
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({ result: "success" });
  expect(fetch).toHaveBeenCalledTimes(2);

  fetch.mockRestore();
});

test("BaseClient should throw error if max retries exceeded", async () => {
  const client = new BaseClient({ url: "" });

  const fetch = spyOn(globalThis, "fetch");

  fetch.mockRejectedValue(new Error("ECONNRESET"));
  const result = client.fetch("https://hub.aigne.io/api/v2/chat", { maxRetries: 2 });
  expect(result).rejects.toThrow("ECONNRESET");
  expect(fetch).toHaveBeenCalledTimes(3);

  fetch.mockRestore();
}, 10e3);
