/**
 * Utility to import all source modules for coverage tracking.
 *
 * This solves Bun's coverage gap where only files imported during test execution
 * are tracked, leading to artificially high coverage percentages.
 *
 * Usage in coverage.test.ts:
 * ```typescript
 * import { test } from "bun:test";
 * import { importAllModules } from "../../../scripts/test-utils/import-all-modules.ts";
 *
 * test("import all modules for coverage tracking", async () => {
 *   await importAllModules("./src");
 * });
 * ```
 *
 * See: https://www.charpeni.com/blog/bun-code-coverage-gap
 */

import { join, resolve } from "node:path";
import { Glob } from "bun";

export async function importAllModules(sourceDir: string): Promise<void> {
  const exclude = [
    "**/*.test.*",
    "**/*.spec.*",
    "**/__tests__/**",
    "**/__mocks__/**",
    "**/*.d.ts",
    "**/node_modules/**",
    "**/lib/**",
    "**/dist/**",
    "**/coverage/**",
  ];
  const extensions = ["ts", "tsx", "js", "jsx", "mjs", "cjs"];

  const absoluteSourceDir = resolve(sourceDir);
  const pattern =
    extensions.length === 1 ? `**/*.${extensions[0]}` : `**/*.{${extensions.join(",")}}`;

  const glob = new Glob(pattern);

  const files: string[] = [];
  for await (const file of glob.scan({
    cwd: absoluteSourceDir,
    onlyFiles: true,
  })) {
    const shouldExclude = exclude.some((pattern) => {
      const regexPattern = pattern
        .replace(/\*\*/g, ".*")
        .replace(/\*/g, "[^/]*")
        .replace(/\./g, "\\.");
      return new RegExp(regexPattern).test(file);
    });

    if (!shouldExclude) {
      files.push(file);
    }
  }

  const imports = files.map(async (file) => {
    const absoluteFilePath = join(absoluteSourceDir, file);
    try {
      const fileUrl = `file://${absoluteFilePath}`;
      await import(fileUrl);
    } catch {
      // Ignore import errors
    }
  });

  await Promise.allSettled(imports);
}
