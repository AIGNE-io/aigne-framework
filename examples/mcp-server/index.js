#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { argv } from "node:process";

spawnSync("aigne", [...argv.slice(2)], {
  stdio: "inherit",
  cwd: import.meta.dirname,
});
