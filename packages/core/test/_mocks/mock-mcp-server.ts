import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupMCPHandlers } from "../_utils/setup-mcp-server.js";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0",
});

setupMCPHandlers(server);

const transport = new StdioServerTransport();

await server.connect(transport);
