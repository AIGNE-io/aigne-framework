/**
 * @type {import('typedoc').TypeDocOptions}
 */
const config = {
  plugin: [
    "typedoc-plugin-no-inherit",
    "typedoc-plugin-markdown",
    "@aigne/typedoc-plugin-example-utils-ts",
    "./typedoc/typedoc-sidebar-plugin.ts",
  ],
  entryPoints: [
    "README.md",
    "src/aigne/index.ts",
    "src/agents/*agent.ts",
    "src/models/*.ts",
    "src/server/index.ts",
    "src/client/index.ts",
  ],
  entryPointStrategy: "expand",
  sortEntryPoints: false,
  sort: ["source-order", "static-first"],
  jsDocCompatibility: {
    exampleTag: false,
  },
  router: "module",
  cleanOutputDir: true,
  disableSources: true,
  inheritNone: true,
  formatWithPrettier: true,
  useCodeBlocks: false,
  expandObjects: true,
  hidePageHeader: false,
  indexFormat: "list",
  parametersFormat: "table",
  interfacePropertiesFormat: "table",
  classPropertiesFormat: "table",
  typeAliasPropertiesFormat: "table",
  enumMembersFormat: "table",
  propertyMembersFormat: "table",
  typeDeclarationFormat: "table",
  tableColumnSettings: {
    hideModifiers: true,
  },
  removeExpressionsFromExamples: ["spyOn", "expect", "mock", "assert"],
};

export default config;
