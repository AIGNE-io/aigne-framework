#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { createRunCommand } from "./commands/run.js";

const program = new Command();

program.name("aigne").description("CLI for AIGNE framework").version(version);

program.addCommand(createRunCommand());

program.parse();
