import base from "./typedoc.base.js";

/**
 * @type {import('typedoc').TypeDocOptions}
 */
const config = {
  ...base,
  out: "docs/api",
  basePath: "/api",
  entryPoints: ["packages/core", "packages/agent-library"],
  entryPointStrategy: "packages",
  sortEntryPoints: false,
};

export default config;
