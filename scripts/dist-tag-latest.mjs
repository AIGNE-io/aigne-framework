#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import json from "../.release-please-manifest.json" with { type: "json" };

const root = join(import.meta.dirname, "..");
const packages = Object.entries(json).filter(([name]) => name !== ".");

for (const [pkg] of packages) {
  const path = join(root, pkg, "package.json");
  const { name, version } = await readFile(path, "utf-8").then(JSON.parse);
  spawnSync("npm", ["dist-tag", "add", `${name}@${version}`, "latest"], { cwd: dirname(path) });
}
