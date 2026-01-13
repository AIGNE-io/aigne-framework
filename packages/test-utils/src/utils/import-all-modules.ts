import { join, resolve } from "node:path";
import { Glob } from "bun";

export interface ImportAllModulesOptions {
  /**
   * The root directory to scan for source files
   */
  sourceDir: string;

  /**
   * Patterns to exclude from import (default: test files, type definitions, build artifacts)
   */
  exclude?: string[];

  /**
   * File extensions to include (default: ts, tsx, js, jsx, mjs, cjs)
   */
  extensions?: string[];

  /**
   * Whether to show verbose logging (default: false)
   */
  verbose?: boolean;
}

/**
 * Import all modules in a directory for coverage tracking.
 *
 * This utility dynamically imports all source files in a package to ensure
 * Bun's coverage reporter includes them in coverage metrics, even if they
 * aren't directly imported by any tests.
 *
 * @example
 * ```typescript
 * import { test } from 'bun:test';
 * import { importAllModules } from '@aigne/test-utils/utils/import-all-modules';
 *
 * test('import all modules for coverage tracking', async () => {
 *   await importAllModules({
 *     sourceDir: '../src',
 *   });
 * });
 * ```
 */
export async function importAllModules(options: ImportAllModulesOptions): Promise<void> {
  const {
    sourceDir,
    exclude = [
      "**/*.test.*",
      "**/*.spec.*",
      "**/__tests__/**",
      "**/__mocks__/**",
      "**/*.d.ts",
      "**/node_modules/**",
      "**/lib/**",
      "**/dist/**",
      "**/coverage/**",
    ],
    extensions = ["ts", "tsx", "js", "jsx", "mjs", "cjs"],
    verbose = false,
  } = options;

  // Resolve sourceDir to absolute path from current working directory
  const absoluteSourceDir = resolve(sourceDir);

  // Build the glob pattern for matching files
  const pattern =
    extensions.length === 1 ? `**/*.${extensions[0]}` : `**/*.{${extensions.join(",")}}`;

  const glob = new Glob(pattern);

  // Scan for files
  const files: string[] = [];
  for await (const file of glob.scan({
    cwd: absoluteSourceDir,
    onlyFiles: true,
  })) {
    // Check if file should be excluded
    const shouldExclude = exclude.some((pattern) => {
      // Simple pattern matching (supports ** and * wildcards)
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

  if (verbose) {
    console.log(`[coverage] Found ${files.length} source files to import`);
  }

  // Import all files in parallel
  const imports = files.map(async (file) => {
    const absoluteFilePath = join(absoluteSourceDir, file);
    try {
      // Use file:// URL for reliable imports across different CWDs
      const fileUrl = `file://${absoluteFilePath}`;
      await import(fileUrl);
      if (verbose) {
        console.log(`[coverage] ✓ Imported: ${file}`);
      }
    } catch (error) {
      // Some files may fail to import (e.g., templates, type-only files)
      // This is expected and should not fail the test
      if (verbose) {
        console.warn(`[coverage] ⚠ Failed to import ${file}:`, error);
      }
    }
  });

  await Promise.allSettled(imports);

  if (verbose) {
    console.log(`[coverage] Completed importing ${files.length} modules`);
  }
}
