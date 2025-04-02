import { Command } from "commander";
import { version } from "../../package.json";
import { createCreateCommand } from "./create.js";
import { createRunCommand } from "./run.js";
import { createTestCommand } from "./test.js";

export function createAIGNECommand(): Command {
  return new Command()
    .name("aigne")
    .description("CLI for AIGNE framework")
    .version(version)
    .addCommand(createRunCommand())
    .addCommand(createTestCommand())
    .addCommand(createCreateCommand())
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
