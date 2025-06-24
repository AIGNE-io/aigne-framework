import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { tryOrThrow } from "@aigne/core/utils/type-utils.js";
// @ts-ignore
import { startServer as startObservabilityServer } from "@aigne/observability/server";
import { Command, type OptionValues } from "commander";

interface ServeMCPOptions extends OptionValues {
  host: string;
  port?: number;
}

const DEFAULT_PORT = () =>
  tryOrThrow(
    () => {
      const { PORT } = process.env;
      if (!PORT) return 7890;
      const port = Number.parseInt(PORT);
      if (!port || !Number.isInteger(port)) throw new Error(`Invalid PORT: ${PORT}`);
      return port;
    },
    (error) => new Error(`parse PORT error ${error.message}`),
  );

export function createObservabilityCommand(): Command {
  return new Command("observability")
    .description("Start the observability server")
    .option(
      "--host <host>",
      "Host to run the MCP server on, use 0.0.0.0 to publicly expose the server",
      "localhost",
    )
    .option("--port <port>", "Port to run the MCP server on", (s) => Number.parseInt(s))
    .action(async (options: ServeMCPOptions) => {
      const port = options.port || DEFAULT_PORT();

      const homeDir = homedir();
      const AIGNE_OBSERVER_DIR = join(homeDir, ".aigne", "observability");
      mkdirSync(AIGNE_OBSERVER_DIR, { recursive: true });

      await startObservabilityServer({
        port: Number(port) || 3000,
        dbUrl: join("file:", AIGNE_OBSERVER_DIR, "observer.db"),
      });
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
