import { tryOrThrow } from "@aigne/core/utils/type-utils.js";
import { startObservabilityCLIServer } from "@aigne/observability-api/cli";
import getObservabilityDbPath from "@aigne/observability-api/db-path";
import chalk from "chalk";
import detectPort from "detect-port";
import type { CommandModule } from "yargs";

interface ServeMCPOptions {
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

export function createObservabilityCommand(): CommandModule<unknown, ServeMCPOptions> {
  return {
    command: "observe",
    describe: "Start the observability server",
    builder: (yargs) => {
      return yargs
        .option("host", {
          type: "string",
          describe:
            "Host to run the observability server on, use 0.0.0.0 to publicly expose the server",
          default: "localhost",
        })
        .option("port", {
          type: "number",
          describe: "Port to run the observability server on",
        });
    },
    handler: async (options) => {
      const port = await detectPort(options.port || DEFAULT_PORT());
      const dbUrl = getObservabilityDbPath();

      console.log("Observability database path:", chalk.greenBright(dbUrl));
      await startObservabilityCLIServer({ port, dbUrl });
    },
  };
}
