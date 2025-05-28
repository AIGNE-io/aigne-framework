export const nodejs = {
  customInspect: isNodejsEnvironment() ? require("node:util").inspect.custom : Symbol("inspect"),

  isStdoutATTY: isNodejsEnvironment() && process.stdout?.isTTY,

  isStderrATTY: isNodejsEnvironment() && process.stderr?.isTTY,

  env: isNodejsEnvironment() ? process.env : {},

  get fs(): typeof import("node:fs/promises") {
    ensureNodejsEnvironment();
    return require("node:fs/promises");
  },

  get path(): typeof import("node:path") {
    ensureNodejsEnvironment();
    return require("node:path");
  },
};

function isNodejsEnvironment() {
  return typeof process !== "undefined";
}

function ensureNodejsEnvironment() {
  if (!isNodejsEnvironment()) throw new Error("This code must run in a Node.js environment.");
}
