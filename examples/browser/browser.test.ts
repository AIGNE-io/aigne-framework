import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { nodejs } from "@aigne/core/utils/nodejs.js";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";
import { OpenAIChatModel } from "@aigne/openai";
import type { AIGNEHTTPClient } from "@aigne/transport/http-client/client.js";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import { serve } from "bun";
import detectPort from "detect-port";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { serveStatic } from "hono/serve-static";
import puppeteer, { type Browser } from "puppeteer";

test("AIGNE HTTP Client should work in browser", async () => {
  const port = await detectPort();

  const agent = AIAgent.from({
    name: "chatbot",
    memory: [],
  });

  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
    agents: [agent],
  });
  assert(aigne.model);

  const honoApp = new Hono();

  honoApp.use(
    "*",
    cors(),
    // @sqlite.org/sqlite-wasm require following headers to work properly
    secureHeaders({
      crossOriginEmbedderPolicy: "require-corp",
      crossOriginOpenerPolicy: "same-origin",
    }),
  );

  const aigneServer = new AIGNEHTTPServer(aigne);

  honoApp.post("/aigne/invoke", async (c) => {
    return aigneServer.invoke(c.req.raw);
  });

  honoApp.use(
    "*",
    serveStatic({
      getContent: async (path) => {
        const root = join(import.meta.dirname, "dist");
        const index = join(root, "index.html");
        const p = join(root, path);

        if (await nodejs.fs.exists(p)) {
          return await nodejs.fs.readFile(p);
        }

        return await nodejs.fs.readFile(index);
      },
    }),
  );

  serve({ port, fetch: honoApp.fetch });

  const browser = await puppeteer.launch();

  const pageURL = `http://localhost:${port}`;
  const aigneURL = `http://localhost:${port}/aigne/invoke`;

  spyOn(aigne.model, "process").mockReturnValueOnce(
    stringToAgentResponseStream("Hello, How can I help you?"),
  );
  const result = await runAgentInBrowser({
    browser,
    pageURL,
    aigneURL,
    agentName: "chatbot",
    input: "Hello, AIGNE!",
  });
  expect(result).toEqual({
    $message: "Hello, How can I help you?",
  });

  const modelProcess = spyOn(aigne.model, "process").mockReturnValueOnce(
    stringToAgentResponseStream('You just said, "Hello, AIGNE!"'),
  );
  const result2 = await runAgentInBrowser({
    browser,
    pageURL,
    aigneURL,
    agentName: "chatbot",
    input: "What did I just say?",
  });
  expect(result2).toEqual({
    $message: 'You just said, "Hello, AIGNE!"',
  });
  expect(modelProcess).toHaveBeenLastCalledWith(
    expect.objectContaining({
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: "system",
          content: expect.stringContaining("Hello, AIGNE!"),
        }),
        expect.objectContaining({
          role: "system",
          content: expect.stringContaining("Hello, How can I help you?"),
        }),
        expect.objectContaining({
          role: "user",
          content: "What did I just say?",
        }),
      ]),
    }),
    expect.anything(),
  );

  await browser.close();
}, 60e3);

async function runAgentInBrowser({
  browser,
  pageURL,
  aigneURL,
  agentName,
  input,
}: {
  browser: Browser;
  pageURL: string;
  aigneURL: string;
  agentName: string;
  input: string;
}) {
  const page = await browser.newPage();
  await page.goto(pageURL);

  const result = await page.evaluate(
    async ({ agentName, url, input }: { agentName: string; url: string; input: string }) => {
      const g = globalThis as unknown as {
        AIGNEHTTPClient: typeof AIGNEHTTPClient;
        DefaultMemory: typeof DefaultMemory;
      };

      const client = new g.AIGNEHTTPClient({ url });

      const agent = await client.getAgent({
        name: agentName,
        memory: new DefaultMemory({ storage: { url: "memories.sqlite3" } }),
      });

      const response = await agent.invoke(input);

      return response;
    },
    { agentName, url: aigneURL, input },
  );

  await page.close();

  return result;
}
