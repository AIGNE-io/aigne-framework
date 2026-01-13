import { test } from "bun:test";
import { importAllModules } from "@aigne/test-utils/utils/import-all-modules.js";

/**
 * This test ensures all source files are imported and tracked by the coverage reporter.
 *
 * Without this, Bun's coverage only tracks files that are actually imported by tests,
 * which can result in misleadingly high coverage percentages that exclude untested files.
 *
 * See: https://www.charpeni.com/blog/bun-code-coverage-gap
 */
test("import all modules for coverage tracking", async () => {
  await importAllModules({
    sourceDir: "../src",
    verbose: false,
  });
});
