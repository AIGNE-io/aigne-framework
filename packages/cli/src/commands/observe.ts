import { tryOrThrow } from "@aigne/core/utils/type-utils.js";
import { startObservabilityCLIServer } from "@aigne/observability-api/cli";
import getObservabilityDbPath from "@aigne/observability-api/db-path";
import chalk from "chalk";
import { Command, type OptionValues } from "commander";
import detectPort from "detect-port";

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
  return new Command("observe")
    .description("Start the observability server")
    .option(
      "--host <host>",
      "Host to run the observability server on, use 0.0.0.0 to publicly expose the server",
      "localhost",
    )
    .option("--port <port>", "Port to run the observability server on", (s) => Number.parseInt(s))
    .action(async (options: ServeMCPOptions) => {
      const port = await detectPort(options.port || DEFAULT_PORT());
      const dbUrl = getObservabilityDbPath();

      console.log("Observability database path:", chalk.greenBright(dbUrl));
      await startObservabilityCLIServer({ port, dbUrl });
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
