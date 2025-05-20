#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { argv } from "node:process";

if (!getBunVersion()) {
  spawnSync("npx", ["-y", "bun", ...argv.slice(2)], { stdio: "inherit" });
} else {
  spawnSync("bun", argv.slice(2), { stdio: "inherit" });
}

function getBunVersion() {
  try {
    const { stdout } = spawnSync("bun", ["--version"], { stdio: "pipe" });
    return stdout.toString().trim() || undefined;
  } catch {
    return false;
  }
}
