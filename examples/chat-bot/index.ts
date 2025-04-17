#!/usr/bin/env bun

import { spawnSync } from "node:child_process";
import { join } from "node:path";

spawnSync("aigne", ["run", join(import.meta.dirname, "agents")], {
  stdio: "inherit",
});
