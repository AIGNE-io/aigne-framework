import base from "../../typedoc.base.js";

/**
 * @type {import('typedoc').TypeDocOptions}
 */
export default {
  ...base,
  entryPoints: ["src/server", "src/client"],
};
