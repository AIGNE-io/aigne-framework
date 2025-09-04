#!/usr/bin/env node

import { existsSync, realpathSync, statSync } from "node:fs";
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

export default createAIGNECommand({ aigneFilePath })
  .fail((message, error, yargs) => {
    // We catch all errors below, here just print the help message non-error case like demandCommand
    if (!error) {
      yargs.showHelp();

      console.error(`\n${message}`);
      process.exit(1);
    }
  })
  .parseAsync(process.argv.slice(aigneFilePath ? 3 : 2))
  .catch((error: Error) => {
    console.log(""); // Add an empty line for better readability
    console.error(`${chalk.red("Error:")} ${highlightUrl(error.message)}`);
    process.exit(1);
  });
