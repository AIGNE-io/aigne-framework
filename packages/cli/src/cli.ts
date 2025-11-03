#!/usr/bin/env node

import { existsSync, realpathSync, statSync } from "node:fs";
import { LogLevel, logger } from "@aigne/core/utils/logger.js";
import chalk from "chalk";
import { config } from "dotenv-flow";
import { createAIGNECommand } from "./commands/aigne.js";
import { highlightUrl } from "./utils/string-utils.js";

config({ silent: true });

function getAIGNEFilePath() {
  let file = process.argv[2];
  if (file) {
    if (!existsSync(file)) return;
    file = realpathSync(file);
    if (statSync(file).isFile()) return file;
  }
}

const aigneFilePath = getAIGNEFilePath();

const argv = process.argv.slice(aigneFilePath ? 3 : 2);

export default createAIGNECommand({ argv, aigneFilePath })
  .fail((message, error, yargs) => {
    // We catch all errors below, here just print the help message non-error case like demandCommand
    if (!error) {
      yargs.showHelp();

      console.error(`\n${message}`);
      process.exit(1);
    }
  })
  .parseAsync(argv)
  .catch((error: Error) => {
    if (error.name !== "ExitPromptError") {
      console.log(""); // Add an empty line for better readability

      if (logger.enabled(LogLevel.ERROR)) {
        console.error(chalk.red(error.stack));
      } else {
        console.error(`${chalk.red("Error:")} ${highlightUrl(error.message)}`);
      }
    }
    process.exit(1);
  });
