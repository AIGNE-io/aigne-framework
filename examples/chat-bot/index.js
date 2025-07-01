#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { argv } from "node:process";

spawnSync("aigne", ["run", "--path", import.meta.dirname, ...argv.slice(2)], { stdio: "inherit" });
