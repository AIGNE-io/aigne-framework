import base from "../../typedoc.base.js";

/**
 * @type {import('typedoc').TypeDocOptions}
 */
export default {
  ...base,
  entryPoints: ["src/http-server/index.ts", "src/http-client/index.ts"],
};
