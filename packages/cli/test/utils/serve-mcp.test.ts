import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { AIGNE_CLI_VERSION } from "@aigne/cli/constants";
import { serveMCPServer } from "@aigne/cli/utils/serve-mcp.js";
import { AIGNE } from "@aigne/core";
import { arrayToAgentProcessAsyncGenerator } from "@aigne/core/utils/stream-utils.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { detect } from "detect-port";
import { mockModule } from "../_mocks_/mock-module.js";

test("serveMCPServer should work", async () => {
  const port = await detect();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");
  const aigne = await AIGNE.load(testAgentsPath);

  assert(aigne.model, "aigne.model should be defined");
  spyOn(aigne.model, "process")
    .mockReturnValueOnce(
      Promise.resolve({
        text: "hello, how can I help you?",
      }),
    )
    .mockImplementation(() => Promise.reject(new Error("not implemented")));

  const server = await serveMCPServer({ aigne, port });

  const url = `http://localhost:${port}/mcp`;
  const transport = new StreamableHTTPClientTransport(new URL(url));
  const client = new Client({
    name: "test-client",
    version: AIGNE_CLI_VERSION,
  });

  await client.connect(transport);
  expect(client.getServerVersion()).toEqual({
    name: "test_aigne_project",
    version: AIGNE_CLI_VERSION,
  });

  expect(client.listTools()).resolves.toEqual({
    tools: [
      expect.objectContaining({
        name: "chat",
      }),
    ],
  });

  expect(client.callTool({ name: "chat", arguments: { $message: "hello" } })).resolves.toEqual({
    content: [{ type: "text", text: "hello, how can I help you?" }],
  });

  await client.close();
  server.closeAllConnections();
  server.close();
});

test("serveMCPServer should respond error from not supported methods", async () => {
  const port = await detect();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");
  const aigne = await AIGNE.load(testAgentsPath);
  const server = await serveMCPServer({ aigne, port });

  spyOn(console, "error").mockReturnValueOnce(undefined);
  const getResult = await fetch(`http://localhost:${port}/mcp`, { method: "GET" });
  expect(getResult.status).toBe(405);
  expect(getResult.json()).resolves.toEqual(
    expect.objectContaining({
      error: expect.objectContaining({
        code: -32000,
      }),
    }),
  );

  const deleteResult = await fetch(`http://localhost:${port}/mcp`, { method: "DELETE" });
  expect(deleteResult.status).toBe(405);
  expect(deleteResult.json()).resolves.toEqual(
    expect.objectContaining({
      error: expect.objectContaining({
        code: -32000,
      }),
    }),
  );

  server.closeAllConnections();
  server.close();
});

test("serveMCPServer should respond error from agent processing", async () => {
  const port = await detect();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");
  const aigne = await AIGNE.load(testAgentsPath);

  assert(aigne.model, "engine.model should be defined");
  spyOn(aigne.model, "process").mockReturnValueOnce(
    arrayToAgentProcessAsyncGenerator([new Error("test error from model")]),
  );

  const server = await serveMCPServer({ aigne, port });

  const url = `http://localhost:${port}/mcp`;
  const transport = new StreamableHTTPClientTransport(new URL(url));
  const client = new Client({
    name: "test-client",
    version: AIGNE_CLI_VERSION,
  });

  await client.connect(transport);

  expect(client.callTool({ name: "chat", arguments: { $message: "hello" } })).resolves.toEqual({
    isError: true,
    content: [
      {
        text: "test error from model",
        type: "text",
      },
    ],
  });

  await client.close();
  server.closeAllConnections();
  server.close();
});

test("serveMCPServer should respond 500 error", async () => {
  const port = await detect();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");
  const aigne = await AIGNE.load(testAgentsPath);

  await using _ = await mockModule("@aigne/cli/utils/serve-mcp.ts", () => ({
    createMcpServer: () => {
      throw new Error("test error from create mcp server");
    },
  }));

  const server = await serveMCPServer({ aigne, port });

  const url = `http://localhost:${port}/mcp`;
  const transport = new StreamableHTTPClientTransport(new URL(url));
  const client = new Client({
    name: "test-client",
    version: AIGNE_CLI_VERSION,
  });

  expect(client.connect(transport)).rejects.toThrow("test error from create mcp server");

  server.closeAllConnections();
  server.close();
});
