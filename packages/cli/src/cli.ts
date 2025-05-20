#!/usr/bin/env node

import PrettyError from "pretty-error";
import { createAIGNECommand } from "./commands/aigne.js";

createAIGNECommand()
  .parseAsync()
  .catch((error) => {
    console.error(new PrettyError().render(error));
    process.exit(1);
  });
