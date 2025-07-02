#!/usr/bin/env node

import { existsSync, realpathSync, statSync } from "node:fs";
import { config } from "dotenv-flow";
import PrettyError from "pretty-error";
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
  .parseAsync(["", "", ...process.argv.slice(aigneFilePath ? 3 : 2)])
  .catch((error) => {
    console.error(new PrettyError().render(error));
    process.exit(1);
  });
