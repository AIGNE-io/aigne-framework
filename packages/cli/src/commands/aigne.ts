import chalk from "chalk";
import yargs from "yargs";
import { AIGNE_CLI_VERSION } from "../constants.js";
import { asciiLogo } from "../utils/ascii-logo.js";
import { createAppCommands } from "./app.js";
import { createConnectCommand } from "./connect.js";
import { createCreateCommand } from "./create.js";
import { createObservabilityCommand } from "./observe.js";
import { createRunCommand } from "./run.js";
import { createServeMCPCommand } from "./serve-mcp.js";
import { createTestCommand } from "./test.js";

export function createAIGNECommand(options?: { aigneFilePath?: string }) {
  console.log(asciiLogo);

  console.log(
    `${chalk.grey("TIPS:")} use ${chalk.greenBright("aigne observe")} to start the observability server.\n`,
  );

  return yargs()
    .scriptName("aigne")
    .usage("CLI for AIGNE framework")
    .version(AIGNE_CLI_VERSION)
    .command(createRunCommand(options))
    .command(createTestCommand(options))
    .command(createCreateCommand())
    .command(createServeMCPCommand(options))
    .command(createObservabilityCommand())
    .command(createConnectCommand())
    .command(createAppCommands())
    .alias("help", "h")
    .alias("version", "v")
    .strict();
}
