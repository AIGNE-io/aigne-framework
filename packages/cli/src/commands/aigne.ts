import { Command } from "commander";
import pkg from "../../package.json" with { type: "json" };
import { asciiLogo } from "../utils/ascii-logo.js";
import { createCreateCommand } from "./create.js";
import { createRunCommand } from "./run.js";
import { createServeCommand } from "./serve.js";
import { createTestCommand } from "./test.js";

export function createAIGNECommand(): Command {
  console.log(asciiLogo);

  return new Command()
    .name("aigne")
    .description("CLI for AIGNE framework")
    .version(pkg.version)
    .addCommand(createRunCommand())
    .addCommand(createTestCommand())
    .addCommand(createCreateCommand())
    .addCommand(createServeCommand())
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
