import { isAbsolute, resolve } from "node:path";
import { AIGNE } from "@aigne/core";
import { tryOrThrow } from "@aigne/core/utils/type-utils.js";
import { Command, type OptionValues } from "commander";
import { serveMCPServer } from "../utils/serve-mcp.js";

interface ServeMCPOptions extends OptionValues {
  host: string;
  port?: number;
  mcp?: boolean;
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

export function createServeCommand(): Command {
  return new Command("serve")
    .description("Serve the agents in the specified directory as a MCP server")
    .argument("[path]", "Path to the agents directory", ".")
    .option("--mcp", "Serve the agents as a MCP server")
    .option(
      "--host <host>",
      "Host to run the MCP server on, use 0.0.0.0 to publicly expose the server",
      "localhost",
    )
    .option("--port <port>", "Port to run the MCP server on", (s) => Number.parseInt(s))
    .option("--pathname <pathname>", "Pathname to the service", "/mcp")
    .action(async (path: string, options: ServeMCPOptions) => {
      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);
      const port = options.port || DEFAULT_PORT();

      const aigne = await AIGNE.load(absolutePath);

      if (options.mcp)
        await serveMCPServer({
          aigne,
          host: options.host,
          port,
          pathname: options.pathname,
        });
      else throw new Error("Default server is not supported yet. Please use --mcp option");

      console.log(`MCP server is running on http://${options.host}:${port}${options.pathname}`);
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
