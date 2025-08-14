export const nodejs = {
  customInspect: Symbol("inspect"),

  isStdoutATTY: false,

  isStderrATTY: false,

  get env(): typeof process.env {
    return {};
  },

  get fs(): typeof import("node:fs/promises") {
    throw new Error("This code must run in a Node.js environment.");
  },

  get fsSync(): typeof import("node:fs") {
    throw new Error("This code must run in a Node.js environment.");
  },

  get path(): typeof import("node:path") {
    throw new Error("This code must run in a Node.js environment.");
  },

  get os(): typeof import("node:os") {
    throw new Error("This code must run in a Node.js environment.");
  },

  get crypto(): typeof import("node:crypto") {
    throw new Error("This code must run in a Node.js environment.");
  },
};
