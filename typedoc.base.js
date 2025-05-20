/**
 * @type {import('typedoc').TypeDocOptions}
 */
const config = {
  plugin: [
    "typedoc-plugin-no-inherit",
    "typedoc-plugin-markdown",
    "./scripts/typedoc-plugin-clean-code.ts",
    "./scripts/typedoc-plugin-sidebar.ts",
  ],
  entryPointStrategy: "expand",
  sortEntryPoints: false,
  sort: ["source-order", "static-first"],
  jsDocCompatibility: {
    exampleTag: false,
  },
  readme: "none",
  mergeReadme: true,
  router: "module",
  disableSources: true,
  inheritNone: true,
  formatWithPrettier: true,
  useCodeBlocks: false,
  expandObjects: true,
  hidePageHeader: true,
  indexFormat: "list",
  parametersFormat: "table",
  interfacePropertiesFormat: "table",
  classPropertiesFormat: "list",
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
