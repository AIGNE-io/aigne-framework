import base from "../../typedoc.base.js";

/**
 * @type {import('typedoc').TypeDocOptions}
 */
const config = {
  ...base,
  entryPoints: ["src/orchestrator", "src/filesystem", "src/fs-memory"],
  entryPointStrategy: "resolve",
};

export default config;
