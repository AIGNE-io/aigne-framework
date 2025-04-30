import base from "./typedoc.base.js";

/**
 * @type {import('typedoc').TypeDocOptions}
 */
const config = {
  ...base,
  out: "docs/typedoc",
  entryPoints: ["packages/core", "packages/agent-library", "packages/cli"],
  entryPointStrategy: "packages",
  sortEntryPoints: false,
};

export default config;
