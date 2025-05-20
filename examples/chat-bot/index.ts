#!/usr/bin/env bunwrapper

import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { argv } from "node:process";

const path = join(import.meta.dirname, "agents");

spawnSync("aigne", ["run", path, ...argv.slice(2)], { stdio: "inherit" });
