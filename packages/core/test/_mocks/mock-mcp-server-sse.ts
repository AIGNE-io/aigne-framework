import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { type Request, type Response } from "express";
import { setupMCPHandlers } from "../_utils/setup-mcp-server.js";

export function mockMCPSSEServer(port: number) {
  const server = new McpServer({
    name: "example-server",
    version: "1.0.0",
  });

  setupMCPHandlers(server);

  const app = express();

  const transports: { [sessionId: string]: SSEServerTransport } = {};

  app.get("/sse", async (_: Request, res: Response) => {
    const transport = new SSEServerTransport("/messages", res);
    transports[transport.sessionId] = transport;
    await server.connect(transport);
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

  const httpServer = app.listen(port);

  Object.assign(httpServer, {
    [Symbol.asyncDispose]: async () => {
      httpServer.closeAllConnections();
      httpServer.close();
    },
  });

  return httpServer;
}
