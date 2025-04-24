import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type Request, type Response } from "express";
import { setupMCPHandlers } from "../_utils/setup-mcp-server.js";

export async function mockMCPStreamableHTTPServer(port: number) {
  const server = new McpServer({
    name: "example-server-streamable-http",
    version: "1.0.0",
  });

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // set to undefined for stateless servers
  });

  setupMCPHandlers(server);

  const app = express();

  app.post("/mcp", async (req: Request, res: Response) => {
    await transport.handleRequest(req, res);
  });

  await server.connect(transport);
  return app.listen(port);
}
