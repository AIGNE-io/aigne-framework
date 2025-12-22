import yargs from "yargs";
import { AIGNE_CLI_VERSION } from "../constants.js";
import { asciiLogo } from "../utils/ascii-logo.js";
import { createAppCommands } from "./app.js";
import { createCreateCommand } from "./create.js";
import { createDeployCommands } from "./deploy.js";
import { createEvalCommand } from "./eval.js";
import { createHubCommand } from "./hub.js";
import { createObservabilityCommand } from "./observe.js";
import { createRunCommand } from "./run.js";
import { createServeMCPCommand } from "./serve-mcp.js";
import { createTestCommand } from "./test.js";

export function createAIGNECommand(options?: { argv?: string[]; aigneFilePath?: string }) {
  return (
    yargs()
      .scriptName("aigne")
      .usage(`${asciiLogo}\n$0 <command> [options]`)
      .version(AIGNE_CLI_VERSION)
      // default command: when user runs `aigne` without subcommand, behave like `aigne run`
      .command(createRunCommand(options))
      .command(createEvalCommand(options))
      .command(createTestCommand(options))
      .command(createCreateCommand())
      .command(createServeMCPCommand(options))
      .command(createObservabilityCommand())
      .command(createAppCommands(options))
      .command(createHubCommand())
      .command(createDeployCommands())
      .demandCommand()
      .version(false)
      .alias("help", "h")
      .wrap(null)
      .strict()
  );
}
