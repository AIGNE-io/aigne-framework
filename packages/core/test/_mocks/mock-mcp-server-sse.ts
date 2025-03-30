import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { type Request, type Response } from "express";
import { z } from "zod";

export function mockMCPSSEServer(port: number) {
  const server = new McpServer({
    name: "example-server",
    version: "1.0.0",
  });

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

  const app = express();

  const transports: { [sessionId: string]: SSEServerTransport } = {};

  app.get("/sse", async (_: Request, res: Response) => {
    const transport = new SSEServerTransport("/messages", res);
    transports[transport.sessionId] = transport;
    console.log("New transport connected", transport.sessionId);
    await server.connect(transport);
    console.log("New transport connected end", transport.sessionId);
    res.flushHeaders();
  });

  app.post("/messages", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports[sessionId];
    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(400).send("No transport found for sessionId");
    }
  });

  return app.listen(port);
}
