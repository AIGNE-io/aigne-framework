import { isAbsolute, resolve } from "node:path";
import { ExecutionEngine } from "@aigne/core";
import { Command, type OptionValues } from "commander";
import { serveMCPServer } from "../utils/serve-mcp.js";

interface ServeMCPOptions extends OptionValues {
  port: number;
}

export function createServeMCPCommand(): Command {
  return new Command("serve-mcp")
    .description("Serve the agents in the specified directory as a MCP server")
    .argument("[path]", "Path to the agents directory", ".")
    .option("--port <port>", "Port to run the MCP server on", "3000")
    .action(async (path: string, options: ServeMCPOptions) => {
      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);

      const engine = await ExecutionEngine.load({ path: absolutePath });

      serveMCPServer({ engine, port: options.port });
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
