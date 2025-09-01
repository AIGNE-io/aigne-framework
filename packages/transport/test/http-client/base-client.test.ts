import { expect, spyOn, test } from "bun:test";
import { FunctionAgent } from "@aigne/core";
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

test("BaseClient should pick options correctly", async () => {
  const client = new BaseClient({ url: "" });

  const fetch = spyOn(globalThis, "fetch");

  fetch.mockResolvedValueOnce(new Response(JSON.stringify({ text: "hello" })));

  const result = await client.__invoke(
    undefined,
    {},
    {
      fetchOptions: {},
      userContext: {},
      hooks: {},
      prompts: {} as any,
      memories: [],
      streaming: false,
      returnActiveAgent: true,
      returnProgressChunks: true,
      returnMetadata: true,
      disableTransfer: true,
      sourceAgent: FunctionAgent.from(() => ({})),
      newContext: true,
      ...{ context: {} }, // should be ignored field
    },
  );

  expect(result).toMatchInlineSnapshot(`
    {
      "text": "hello",
    }
  `);

  expect(fetch.mock.calls[0]?.[1]?.body).toMatchInlineSnapshot(
    `"{"input":{},"agent":"$CHAT_MODEL","options":{"userContext":{},"memories":[],"streaming":false,"returnProgressChunks":true}}"`,
  );

  fetch.mockRestore();
});
