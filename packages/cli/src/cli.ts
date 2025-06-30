#!/usr/bin/env node

import { config } from "dotenv-flow";
import PrettyError from "pretty-error";
import { createAIGNECommand } from "./commands/aigne.js";

config({ silent: true });

createAIGNECommand()
  .parseAsync()
  .catch((error) => {
    console.error(new PrettyError().render(error));
    process.exit(1);
  });
