import { test } from "bun:test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { importAllModules } from "../../../scripts/test-utils/import-all-modules.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("import all modules for coverage tracking", async () => {
  await importAllModules(`${__dirname}/../src`);
});
