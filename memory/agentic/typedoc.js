import base from "../../typedoc.base.js";

/**
 * @type {import('typedoc').TypeDocOptions}
 */
const config = {
  ...base,
  entryPoints: ["src/index.ts"],
};

export default config;
