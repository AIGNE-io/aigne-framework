import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { MCPAgent } from "@aigne/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { detect } from "detect-port";
import { mockMCPSSEServer } from "../_mocks/mock-mcp-server-sse.js";
import { mockMCPStreamableHTTPServer } from "../_mocks/mock-mcp-server-streamable-http.js";

async function makeMcpAssertions(mcp: MCPAgent) {
  expect(mcp.tools.map((i) => i.name)).toEqual(["echo", "error"]);
  expect(await mcp.tools.echo?.call({ message: "AIGNE" })).toEqual(
    expect.objectContaining({
      content: [
        {
          type: "text",
          text: "Tool echo: AIGNE",
        },
      ],
    }),
  );

  expect(mcp.tools.error?.call({ message: "Custom Error" })).rejects.toThrowError(
    "Custom Error",
  );

  expect(mcp.prompts.map((i) => i.name)).toEqual(["echo"]);
  const prompt = await mcp.prompts.echo?.call({ message: "AIGNE" });
  expect(prompt).toEqual(
    expect.objectContaining({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Please process this message: AIGNE",
          },
        },
        {
          role: "user",
          content: {
            type: "resource",
            resource: {
              uri: "echo://AIGNE",
              blob: Buffer.from("Resource echo: AIGNE").toString("base64"),
              mimeType: "text/plain",
            },
          },
        },
      ],
    }),
  );

  expect(mcp.resources.map((i) => i.name)).toEqual(["echo"]);
  const resource = await mcp.resources.echo?.call({ message: "AIGNE" });
  expect(resource).toEqual(
    expect.objectContaining({
      contents: [
        {
          uri: "echo://AIGNE",
          text: "Resource echo: AIGNE",
        },
      ],
    }),
  );
}

test("MCPAgent should correctly call tool, get prompt and read resource", async () => {
  const mcp = await MCPAgent.from({
    command: "bun",
    args: [join(import.meta.dir, "../_mocks/mock-mcp-server.ts")],
  });

  try {
    expect(mcp.isCallable).toBe(false);
    expect(mcp.call({})).rejects.toThrowError();

    await makeMcpAssertions(mcp);
  } finally {
    await mcp.shutdown();
  }
});

test("MCPAgent should reconnect to mcp server automatically: sse", async () => {
  const port = await detect();
  const url = `http://localhost:${port}/sse`;

  let mcpServer = mockMCPSSEServer(port);

  const mcp = await MCPAgent.from({ url });

  try {
    await makeMcpAssertions(mcp);
    // shutdown the MCP server
    mcpServer.closeAllConnections();
    mcpServer.close();

    // restart the MCP server
    mcpServer = mockMCPSSEServer(port);

    expect(await mcp.tools.echo?.call({ message: "AIGNE" })).toEqual(
      expect.objectContaining({
        content: [
          {
            type: "text",
            text: "Tool echo: AIGNE",
          },
        ],
      }),
    );
  } finally {
    await mcp.shutdown();
    mcpServer.closeAllConnections();
    mcpServer.close();
  }
});

test("MCPAgent should respect MCP_TIMEOUT and TIMEOUT env", async () => {
  process.env.MCP_TIMEOUT = "1234";

  const port = await detect();
  const url = `http://localhost:${port}/sse`;

  const mcpServer = mockMCPSSEServer(port);
  const mcp = await MCPAgent.from({ url });

  const request = spyOn(Client.prototype, "request");

  try {
    await mcp.tools.echo?.call({ message: "AIGNE" });
    expect(request).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ timeout: 1234 }),
    );
  } finally {
    await mcp.shutdown();
    mcpServer.closeAllConnections();
    mcpServer.close();
  }
});

test("MCPAgent should reconnect to mcp server automatically: streamable http", async () => {
  const port = await detect();
  const url = `http://localhost:${port}/mcp`;

  let mcpServer = await mockMCPStreamableHTTPServer(port);

  const mcp = await MCPAgent.from({ url, transport: "streamableHttp" });

  try {
    await makeMcpAssertions(mcp);

    // shutdown the MCP server
    mcpServer.closeAllConnections();
    mcpServer.close();

    // restart the MCP server
    mcpServer = await mockMCPStreamableHTTPServer(port);

    expect(await mcp.tools.echo?.call({ message: "AIGNE" })).toEqual(
      expect.objectContaining({
        content: [
          {
            type: "text",
            text: "Tool echo: AIGNE",
          },
        ],
      }),
    );
  } finally {
    await mcp.shutdown();
    mcpServer.closeAllConnections();
    mcpServer.close();
  }
});
