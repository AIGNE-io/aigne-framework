import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { serveMCPServer } from "@aigne/cli/utils/serve-mcp.js";
import { ExecutionEngine } from "@aigne/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { detect } from "detect-port";

test("serveMCPServer should work", async () => {
  const port = await detect();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");
  const engine = await ExecutionEngine.load({ path: testAgentsPath });

  assert(engine.model, "engine.model should be defined");
  spyOn(engine.model, "call").mockReturnValueOnce(
    Promise.resolve({
      text: "hello, how can I help you?",
    }),
  );

  const server = await serveMCPServer({ engine, port });

  const url = `http://localhost:${port}/sse`;
  const transport = new SSEClientTransport(new URL(url));
  const client = new Client({
    name: "test-client",
    version: "1.0.0",
  });

  await client.connect(transport);
  expect(client.getServerVersion()).toEqual({ name: "test_aigne_project", version: "1.0.0" });

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
  await new Promise((resolve) => setTimeout(resolve, 3000));
  server.closeAllConnections();
  server.close();
});
