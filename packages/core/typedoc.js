import { readdirSync } from "node:fs";
import { join } from "node:path";
import base from "../../typedoc.base.js";

const modelsDir = join(import.meta.dirname, "src/models");
const models = readdirSync(modelsDir, { recursive: false })
  .filter((i) => i.endsWith(".ts") && i !== "chat-model.ts")
  .map((i) => join("src/models", i));

/**
 * @type {import('typedoc').TypeDocOptions}
 */
const config = {
  ...base,
  entryPoints: [
    "src/aigne/index.ts",
    "src/agents/*agent.ts",
    "src/models/chat-model.ts",
    ...models,
    "src/server/index.ts",
    "src/client/index.ts",
  ],
};

export default config;
