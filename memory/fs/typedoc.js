import base from "../../typedoc.base.js";

/**
 * @type {import('typedoc').TypeDocOptions}
 */
const config = {
  ...base,
  entryPoints: ["src/orchestrator", "src/fs-memory", "src/default-memory"],
  entryPointStrategy: "resolve",
};

export default config;
