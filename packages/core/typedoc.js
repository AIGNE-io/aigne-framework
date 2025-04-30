/**
 * @type {import('typedoc').TypeDocOptions}
 */
const config = {
  entryPoints: [
    "src/aigne/index.ts",
    "src/agents/*agent.ts",
    "src/models/*.ts",
    "src/server/index.ts",
    "src/client/index.ts",
  ],
  entryPointStrategy: "expand",
  jsDocCompatibility: {
    exampleTag: false,
  },
  removeExpressionsFromExamples: ["spyOn", "expect", "mock", "assert"],
};

export default config;
