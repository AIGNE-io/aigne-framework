import { AIAgent, type AIGNE } from "@aigne/core";
import { promiseWithResolvers } from "@aigne/core/utils/promise.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type Request, type Response, Router, json } from "express";
import { ZodObject, type ZodRawShape } from "zod";
import { AIGNE_CLI_VERSION } from "../constants.js";

export async function serveMCPServer({
  pathname = "/mcp",
  aigne,
  host = "localhost",
  port,
}: { pathname?: string; aigne: AIGNE; host?: string; port: number }) {
  const app = express();

  app.use(json());

  const router = Router();

  app.use(router);

  router.post(pathname, async (req: Request, res: Response) => {
    try {
      const server = createMcpServer(aigne);

      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

      await server.connect(transport);

      await transport.handleRequest(req, res, req.body);

      res.on("close", async () => {
        await transport.close();
        await server.close();
      });
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: error.message,
          },
          id: null,
        });
      }
    }
  });

  router.get(pathname, async (_: Request, res: Response) => {
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

  router.delete(pathname, async (_: Request, res: Response) => {
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

  const { promise, resolve, reject } = promiseWithResolvers();

  const httpServer = app.listen(port, host, (error) => {
    if (error) reject(error);
    resolve();
  });

  await promise;

  return httpServer;
}

export function createMcpServer(aigne: AIGNE) {
  const server = new McpServer(
    {
      name: aigne.name || "aigne-mcp-server",
      version: AIGNE_CLI_VERSION,
    },
    {
      capabilities: { tools: {} },
      instructions: aigne.description,
    },
  );

  for (const agent of aigne.agents) {
    const schema = agent.inputSchema;

    if (!(schema instanceof ZodObject)) throw new Error("Agent input schema must be a ZodObject");

    //@ts-ignore
    server.tool(agent.name, agent.description || "", schema.shape as ZodRawShape, async (input) => {
      const result = await aigne.invoke(agent, input);

      return {
        content: [
          {
            type: "text",
            text:
              (agent instanceof AIAgent && (result[agent.outputKey] as string)) ||
              JSON.stringify(result),
          },
        ],
      };
    });
  }

  return server;
}
