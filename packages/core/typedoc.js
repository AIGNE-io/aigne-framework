import base from "../../typedoc.base.js";

/**
 * @type {import('typedoc').TypeDocOptions}
 */
const config = {
  ...base,
  entryPoints: [
    "src/aigne/index.ts",
    "src/agents/*agent.ts",
    "src/models/chat-model.ts",
    "src/memory/index.ts",
    "src/server/index.ts",
    "src/client/index.ts",
  ],
};

export default config;
