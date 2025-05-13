#!/usr/bin/env bunwrapper

import { spawnSync } from "node:child_process";
import { join } from "node:path";

const path = join(import.meta.dirname, "agents");

spawnSync("aigne", ["run", path], { stdio: "inherit" });
