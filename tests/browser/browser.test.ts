import { afterAll, beforeAll, expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { exists, readFile } from "node:fs/promises";
import { join } from "node:path";
import { AIAgent, AIGNE, type Message } from "@aigne/core";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";
import { DefaultMemory } from "@aigne/default-memory";
import { OpenAIChatModel } from "@aigne/openai";
import type {
  AIGNEHTTPClient,
  AIGNEHTTPClientInvokeOptions,
} from "@aigne/transport/http-client/client.js";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import { serve } from "bun";
import detectPort from "detect-port";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { serveStatic } from "hono/serve-static";
import { type Browser, chromium, type Page, webkit } from "playwright";

let browsers: {
  webkit: Browser;
  chromium: Browser;
};

beforeAll(async () => {
  browsers = {
    webkit: await webkit.launch({}),
    chromium: await chromium.launch({}),
  };
});

afterAll(async () => {
  await Promise.all(Object.values(browsers).map((browser) => browser.close()));
});

test.each<Readonly<[AIGNEHTTPClientInvokeOptions, keyof typeof browsers]>>(
  [{ streaming: false }, { streaming: true }].flatMap((options) =>
    ["webkit" as const, "chromium" as const].map((browser) => [options, browser] as const),
  ),
)(
  "AIGNE HTTP Client should work in browser with %p %s",
  async (options, browserType) => {
    const { server, aigne, pageURL, aigneURL } = await startServer();

    const browser = browsers[browserType];
    const page = await browser.newPage();

    spyOn(aigne.model, "process").mockReturnValueOnce(
      stringToAgentResponseStream("Hello, How can I help you?"),
    );

    await page.goto(pageURL);

    const result = await runAgentInBrowser({
      ...options,
      page,
      aigneURL,
      agentName: "chatbot",
      input: { message: "Hello, AIGNE!" },
    });

    expect(result).toEqual({
      message: "Hello, How can I help you?",
    });

    await server.stop(true);
  },
  60e3,
);

test("AIGNE HTTP Client should work with client memory in browser", async () => {
  const { server, aigne, pageURL, aigneURL } = await startServer();

  const browser = browsers.chromium;
  const page = await browser.newPage();
  await page.goto(pageURL);

  spyOn(aigne.model, "process").mockReturnValueOnce(
    stringToAgentResponseStream("Hello, How can I help you?"),
  );
  const result = await runAgentInBrowser({
    page,
    aigneURL,
    agentName: "chatbot",
    input: { message: "Hello, AIGNE!" },
  });
  expect(result).toEqual({
    message: "Hello, How can I help you?",
  });

  const modelProcess = spyOn(aigne.model, "process").mockReturnValueOnce(
    stringToAgentResponseStream('You just said, "Hello, AIGNE!"'),
  );
  const result2 = await runAgentInBrowser({
    page,
    aigneURL,
    agentName: "chatbot",
    input: { message: "What did I just say?" },
  });
  expect(result2).toEqual({
    message: 'You just said, "Hello, AIGNE!"',
  });

  expect(modelProcess.mock.lastCall).toMatchSnapshot([{}, expect.anything()]);

  await server.stop(true);
}, 60e3);

async function startServer() {
  const port = await detectPort();

  const agent = AIAgent.from({
    name: "chatbot",
    memory: [],
    inputKey: "message",
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

        if (await exists(p)) {
          return await readFile(p);
        }

        return await readFile(index);
      },
    }),
  );

  return {
    port,
    aigne: aigne as AIGNE & Required<Pick<AIGNE, "model">>,
    pageURL: `http://localhost:${port}`,
    aigneURL: `http://localhost:${port}/aigne/invoke`,
    server: serve({ port, fetch: honoApp.fetch }),
  };
}

async function runAgentInBrowser({
  page,
  aigneURL,
  agentName,
  input,
  streaming = false,
}: {
  page: Page;
  aigneURL: string;
  agentName: string;
  input: Message;
  streaming?: boolean;
}) {
  const result = await page.evaluate(
    async ({
      agentName,
      url,
      input,
      streaming,
    }: {
      agentName: string;
      url: string;
      input: Message;
      streaming?: boolean;
    }) => {
      const g = globalThis as unknown as typeof import("@aigne/core") & {
        AIGNEHTTPClient: typeof AIGNEHTTPClient;
        DefaultMemory: typeof DefaultMemory;
      };

      const client = new g.AIGNEHTTPClient({ url });

      const agent = await client.getAgent({
        name: agentName,
        memory: new DefaultMemory({ storage: { url: "memories.sqlite3" } }),
      });

      if (!streaming) {
        return await agent.invoke(input);
      }

      const response = await agent.invoke(input, { streaming: true });
      const result = {};

      for await (const chunk of response) {
        g.mergeAgentResponseChunk(result, chunk);
      }

      return result;
    },
    { agentName, url: aigneURL, input, streaming },
  );

  return result;
}
