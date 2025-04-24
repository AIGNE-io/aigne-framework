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

  // Serve Service MCP server
  app.get("/mcp", (_: Request, res: Response) => {
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      }),
    );
  });

  app.delete("/mcp", (_: Request, res: Response) => {
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      }),
    );
  });

  app.post("/mcp", async (req: Request, res: Response) => {
    try {
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("failed to handle MCP request", { request: req.body, error });
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  await server.connect(transport);
  return app.listen(port);
}
