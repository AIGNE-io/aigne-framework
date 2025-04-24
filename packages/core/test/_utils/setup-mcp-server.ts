import { type McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function setupMCPHandlers(server: McpServer) {
  server.resource(
    "echo",
    new ResourceTemplate("echo://{message}", { list: undefined }),
    async (uri, { message }) => ({
      contents: [
        {
          uri: uri.href,
          text: `Resource echo: ${message}`,
        },
      ],
    }),
  );

  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }],
  }));

  server.tool("error", { message: z.string() }, async ({ message }) => {
    throw new Error(message);
  });

  server.prompt("echo", { message: z.string() }, ({ message }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please process this message: ${message}`,
        },
      },
      {
        role: "user",
        content: {
          type: "resource",
          resource: {
            uri: `echo://${message}`,
            blob: Buffer.from(`Resource echo: ${message}`).toString("base64"),
            mimeType: "text/plain",
          },
        },
      },
    ],
  }));
}
