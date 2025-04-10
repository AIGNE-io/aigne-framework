import { isAbsolute, resolve } from "node:path";
import { ExecutionEngine } from "@aigne/core";
import { tryOrThrow } from "@aigne/core/utils/type-utils.js";
import { Command, type OptionValues } from "commander";
import { serveMCPServer } from "../utils/serve-mcp.js";

interface ServeMCPOptions extends OptionValues {
  port?: number;
  mcp?: boolean;
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

export function createServeCommand(): Command {
  return new Command("serve")
    .description("Serve the agents in the specified directory as a MCP server")
    .argument("[path]", "Path to the agents directory", ".")
    .option("--mcp", "Serve the agents as a MCP server")
    .option("--port <port>", "Port to run the MCP server on", (s) => Number.parseInt(s))
    .action(async (path: string, options: ServeMCPOptions) => {
      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);
      const port = options.port || DEFAULT_PORT();

      const engine = await ExecutionEngine.load({ path: absolutePath });

      if (options.mcp) await serveMCPServer({ engine, port });
      else throw new Error("Default server is not supported yet. Please use --mcp option");
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
