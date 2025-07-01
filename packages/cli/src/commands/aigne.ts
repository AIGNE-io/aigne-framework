import { Command } from "commander";
import { AIGNE_CLI_VERSION } from "../constants.js";
import { asciiLogo } from "../utils/ascii-logo.js";
import { createCreateCommand } from "./create.js";
import { createObservabilityCommand } from "./observe.js";
import { createRunCommand } from "./run.js";
import { createServeMCPCommand } from "./serve-mcp.js";
import { createTestCommand } from "./test.js";

export function createAIGNECommand(): Command {
  console.log(asciiLogo);

  return new Command()
    .name("aigne")
    .description("CLI for AIGNE framework")
    .version(AIGNE_CLI_VERSION)
    .addCommand(createRunCommand())
    .addCommand(createTestCommand())
    .addCommand(createCreateCommand())
    .addCommand(createServeMCPCommand())
    .addCommand(createObservabilityCommand())
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
