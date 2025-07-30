#!/usr/bin/env node

import { existsSync, realpathSync, statSync } from "node:fs";
import chalk from "chalk";
import { config } from "dotenv-flow";
import { hideBin } from "yargs/helpers";
import { createAIGNECommand } from "./commands/aigne.js";

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

createAIGNECommand({ aigneFilePath })
  .parseAsync(hideBin([...process.argv.slice(0, 2), ...process.argv.slice(aigneFilePath ? 3 : 2)]))
  .catch((error) => {
    console.log(""); // Add an empty line for better readability
    console.error(`${chalk.red("Error:")} ${error.message}`);
    process.exit(1);
  });
