import { isAbsolute, resolve } from "node:path";
import { ExecutionEngine } from "@aigne/core";
import { Command, type OptionValues } from "commander";
import { serveMCPServer } from "../utils/serve-mcp.js";

interface ServeMCPOptions extends OptionValues {
  port: number;
  mcp?: boolean;
}

export function createServeCommand(): Command {
  return new Command("serve")
    .description("Serve the agents in the specified directory as a MCP server")
    .argument("[path]", "Path to the agents directory", ".")
    .option("--mcp", "Serve the agents as a MCP server")
    .option("--port <port>", "Port to run the MCP server on", Number.parseInt, 3000)
    .action(async (path: string, options: ServeMCPOptions) => {
      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);

      const engine = await ExecutionEngine.load({ path: absolutePath });

      if (options.mcp) await serveMCPServer({ engine, port: options.port });
      else throw new Error("Default server is not supported yet. Please use --mcp option");
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
