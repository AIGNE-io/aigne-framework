#!/usr/bin/env npx -y bun

import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

spawnSync("npx", ["-y", "@aigne/cli", "run", join(import.meta.dirname, "agents")], {
  stdio: "inherit",
});
