import { isAbsolute, resolve } from "node:path";
import { tryOrThrow } from "@aigne/core/utils/type-utils.js";
import type { CommandModule } from "yargs";
import { loadAIGNE } from "../utils/load-aigne.js";
import { serveMCPServer } from "../utils/serve-mcp.js";

interface ServeMCPOptions {
  path: string;
  host: string;
  port?: number;
  pathname: string;
}

const DEFAULT_PORT = () =>
  tryOrThrow(
    () => {
      const { PORT } = process.env;
      if (!PORT) return 3000;
      const port = Number.parseInt(PORT);
      if (!port || !Number.isInteger(port)) throw new Error(`Invalid PORT: ${PORT}`);
      return port;
    },
    (error) => new Error(`parse PORT error ${error.message}`),
  );

export function createServeMCPCommand({
  aigneFilePath,
}: {
  aigneFilePath?: string;
} = {}): CommandModule<{}, ServeMCPOptions> {
  return {
    command: "serve-mcp",
    describe: "Serve the agents in the specified directory as a MCP server (streamable http)",
    builder: (yargs) => {
      return yargs
        .option("path", {
          describe: "Path to the agents directory or URL to aigne project",
          type: "string",
          default: ".",
          alias: ["url"],
        })
        .option("host", {
          describe: "Host to run the MCP server on, use 0.0.0.0 to publicly expose the server",
          type: "string",
          default: "localhost",
        })
        .option("port", {
          describe: "Port to run the MCP server on",
          type: "number",
        })
        .option("pathname", {
          describe: "Pathname to the service",
          type: "string",
          default: "/mcp",
        });
    },
    handler: async (options) => {
      const path = aigneFilePath || options.path;
      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);
      const port = options.port || DEFAULT_PORT();

      const aigne = await loadAIGNE(absolutePath);

      await serveMCPServer({
        aigne,
        host: options.host,
        port,
        pathname: options.pathname,
      });

      console.log(`MCP server is running on http://${options.host}:${port}${options.pathname}`);
    },
  };
}
