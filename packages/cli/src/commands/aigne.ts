import { Command } from "commander";
import pkg from "../../package.json" with { type: "json" };
import { createCreateCommand } from "./create.js";
import { createRunCommand } from "./run.js";
import { createTestCommand } from "./test.js";

export function createAIGNECommand(): Command {
  return new Command()
    .name("aigne")
    .description("CLI for AIGNE framework")
    .version(pkg.version)
    .addCommand(createRunCommand())
    .addCommand(createTestCommand())
    .addCommand(createCreateCommand())
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
