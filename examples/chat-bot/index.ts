#!/usr/bin/env npx -y bun

import { spawnSync } from "node:child_process";
import { join } from "node:path";

spawnSync("npx", ["aigne", "run", join(import.meta.dirname, "agents")], {
  stdio: "inherit",
  env: process.env,
});
