import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

// Generate the _sidebar.md file by merging the contents of the sidebar template and the API sidebar
const apiSidebar = readFileSync(join(root, "docs/api/_sidebar.md"), "utf-8");
const sidebarTemplate = readFileSync(join(root, "docs/sidebar.md"), "utf-8");
const sidebarPath = join(root, "docs/_sidebar.md");

const sidebarContent = sidebarTemplate
  .replace(
    "<!-- api reference -->",
    `\
- API Reference\n
${apiSidebar
  .trim()
  .split("\n")
  .map((line) => `${" ".repeat(2)}${line}`.trimEnd())
  .join("\n")}
`,
  )
  .replaceAll(/\n\n+/g, "\n\n");

writeFileSync(sidebarPath, sidebarContent);

// Copy the README.md file to the docs directory
const files = [
  "README.md",
  "README.zh.md",
  "LICENSE.md",
  "CONTRIBUTING.md",
  "RELEASING.md",
  "RELEASING.zh.md",
];
for (const file of files) {
  const content = readFileSync(join(root, file), "utf-8")
    .replaceAll(/\(\.\/docs\/(\S+)\)/g, "(./$1)")
    .replaceAll(
      /\(\.\/((examples|packages)\/?\S*)\)/g,
      "(https://github.com/AIGNE-io/aigne-framework/tree/main/$1)",
    );

  writeFileSync(join(root, "docs", file), content, { force: true });
}
