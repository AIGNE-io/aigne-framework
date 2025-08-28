import yargs from "yargs";
import { AIGNE_CLI_VERSION } from "../constants.js";
import { asciiLogo } from "../utils/ascii-logo.js";
import { createAppCommands } from "./app.js";
import { createCreateCommand } from "./create.js";
import { createDeployCommands } from "./deploy.js";
import { createHubCommand } from "./hub.js";
import { createObservabilityCommand } from "./observe.js";
import { createRunCommand } from "./run.js";
import { createServeMCPCommand } from "./serve-mcp.js";
import { createTestCommand } from "./test.js";

export function createAIGNECommand(options?: { aigneFilePath?: string }) {
  return yargs()
    .scriptName("aigne")
    .usage(`${asciiLogo}\n$0 <command> [options]`)
    .version(AIGNE_CLI_VERSION)
    .command(createRunCommand(options))
    .command(createTestCommand(options))
    .command(createCreateCommand())
    .command(createServeMCPCommand(options))
    .command(createObservabilityCommand())
    .command(createAppCommands())
    .command(createHubCommand())
    .command(createDeployCommands())
    .demandCommand()
    .alias("help", "h")
    .alias("version", "v")
    .wrap(null)
    .strict();
}
