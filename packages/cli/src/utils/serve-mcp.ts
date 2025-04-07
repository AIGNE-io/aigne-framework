import type { Server } from "node:http";
import { type ExecutionEngine, getMessage } from "@aigne/core";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { type ErrorRequestHandler, type Request, type Response } from "express";
import { ZodObject, type ZodRawShape } from "zod";

export function serveMCPServer({ engine, port }: { engine: ExecutionEngine; port: number }) {
  const server = new McpServer(
    {
      name: engine.name || "aigne-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: { tools: {} },
      instructions: engine.description,
    },
  );

  for (const agent of engine.agents) {
    const schema = agent.inputSchema;

    if (!(schema instanceof ZodObject)) throw new Error("Agent input schema must be a ZodObject");

    server.tool(agent.name, agent.description || "", schema.shape as ZodRawShape, async (input) => {
      const result = await engine.call(agent, input);

      return {
        content: [
          {
            type: "text",
            text: getMessage(result) || JSON.stringify(result),
          },
        ],
      };
    });
  }

  const app = express();

  app.use(<ErrorRequestHandler>((error, _req, res, _next) => {
    console.error("handle route error", { error });
    res.status(500).json({ error: { message: error.message } });
  }));

  const transports: { [sessionId: string]: SSEServerTransport } = {};

  app.get("/sse", async (_: Request, res: Response) => {
    const transport = new SSEServerTransport("/messages", res);
    transports[transport.sessionId] = transport;
    res.on("close", () => {
      delete transports[transport.sessionId];
    });
    await server.connect(transport);
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

  return new Promise<Server>((resolve, reject) => {
    const server = app.listen(port, (error) => {
      if (error) reject(error);
      resolve(server);
    });
  });
}
