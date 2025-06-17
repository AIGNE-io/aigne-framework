#!/usr/bin/env bunwrapper

import { join } from "node:path";
import { $ } from "zx";

await $({
  stdio: "inherit",
})`aigne run --path ${join(import.meta.dirname, "aigne")} ${process.argv.slice(2)}`;
