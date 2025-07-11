import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { inspect } from "node:util";

export const nodejs = {
  customInspect: inspect.custom,

  get isStdoutATTY() {
    return process.stdout?.isTTY;
  },

  get isStderrATTY() {
    return process.stderr?.isTTY;
  },

  get env() {
    return process.env;
  },

  get fs(): typeof import("node:fs/promises") {
    return fs;
  },

  get fsSync(): typeof import("node:fs") {
    return fsSync;
  },

  get path(): typeof import("node:path") {
    return path;
  },
};
