/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: ["./src/index.ts"],
  out: "./docs",
  plugin: ["typedoc-plugin-markdown"],
  readme: "./README.md",
  gitRevision: "main",
  name: "@aigne/lmstudio",
};
