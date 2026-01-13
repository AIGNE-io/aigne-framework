#!/usr/bin/env node
/**
 * Clean coverage reports by removing build artifacts and test infrastructure
 *
 * This script post-processes lcov.info files to exclude paths that should not
 * appear in coverage reports, working around Bun's incomplete coveragePathIgnorePatterns
 * implementation.
 *
 * Usage:
 *   node scripts/clean-coverage.cjs [path-to-lcov-file]
 *   node scripts/clean-coverage.cjs --all  # Process all lcov.info files in the repo
 */

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

// Patterns to exclude from coverage reports
// Use (^|\/) to match paths at the start of string or after a slash
const EXCLUDE_PATTERNS = [
  // Build artifacts from dependencies
  /(^|\/)lib\/esm\//,
  /(^|\/)lib\/cjs\//,
  /(^|\/)lib\/dts\//,
  /(^|\/)lib\//, // Catch-all for any lib/ directory
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /(^|\/)node_modules\//,

  // Test infrastructure
  /(^|\/)_mocks\//,
  /(^|\/)_utils\//,
  /(^|\/)test\/mocks\//,
  /(^|\/)test\/utils\//,
  /(^|\/)test-agents\//,
  /(^|\/)__tests__\//,
  /(^|\/)__mocks__\//,
  /(^|\/)scripts\//,
  /\.test\.(ts|tsx|js|jsx|mjs|cjs)$/,
  /\.spec\.(ts|tsx|js|jsx|mjs|cjs)$/,

  // Type definitions
  /\.d\.ts$/,
];

/**
 * Check if a file path should be excluded
 */
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Parse and clean an lcov.info file
 */
function cleanLcovFile(lcovPath, verbose = false) {
  console.log(`Cleaning ${lcovPath}...`);

  if (!fs.existsSync(lcovPath)) {
    console.error(`Error: File not found: ${lcovPath}`);
    return false;
  }

  const content = fs.readFileSync(lcovPath, "utf-8");
  const lines = content.split("\n");

  const cleanedLines = [];
  let currentEntry = [];
  let currentFile = null;
  let shouldSkip = false;
  let excludedCount = 0;
  let keptCount = 0;

  for (const line of lines) {
    if (line.startsWith("SF:")) {
      // Start of a new entry - extract file path
      currentFile = line.substring(3);
      shouldSkip = shouldExclude(currentFile);

      if (verbose && shouldSkip) {
        console.log(`  [EXCLUDE] ${currentFile}`);
      }

      // Start collecting this entry
      currentEntry = [line];
    } else if (line === "end_of_record") {
      // End of current entry - decide whether to keep it
      currentEntry.push(line);

      if (!shouldSkip) {
        cleanedLines.push(...currentEntry);
        keptCount++;
        if (verbose) {
          console.log(`  [KEEP]    ${currentFile}`);
        }
      } else {
        excludedCount++;
      }

      // Reset for next entry
      currentEntry = [];
      currentFile = null;
      shouldSkip = false;
    } else {
      // Lines within an entry
      currentEntry.push(line);
    }
  }

  // Write cleaned content back
  const cleanedContent = cleanedLines.join("\n");
  fs.writeFileSync(lcovPath, cleanedContent, "utf-8");

  console.log(`  ✓ Kept ${keptCount} entries, excluded ${excludedCount} entries`);
  return true;
}

/**
 * Find all lcov.info files in the repository
 */
function findAllLcovFiles() {
  try {
    const output = execSync(
      'find . -name "lcov.info" -path "*/coverage/*" -not -path "*/node_modules/*"',
      { encoding: "utf-8", cwd: path.join(__dirname, "..") },
    );

    return output
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((file) => path.resolve(path.join(__dirname, ".."), file));
  } catch (error) {
    console.error("Error finding lcov.info files:", error.message);
    return [];
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log("Usage:");
    console.log("  node scripts/clean-coverage.cjs <path-to-lcov-file>");
    console.log("  node scripts/clean-coverage.cjs --all");
    console.log("  node scripts/clean-coverage.cjs --all --verbose");
    console.log("");
    console.log("Options:");
    console.log("  --all       Process all lcov.info files in the repository");
    console.log("  --verbose   Show detailed output for each file");
    console.log("  -h, --help  Show this help message");
    process.exit(0);
  }

  const verbose = args.includes("--verbose");

  if (args[0] === "--all") {
    console.log("Finding all lcov.info files...\n");
    const lcovFiles = findAllLcovFiles();

    if (lcovFiles.length === 0) {
      console.log("No lcov.info files found. Run tests with coverage first.");
      process.exit(1);
    }

    console.log(`Found ${lcovFiles.length} lcov.info files\n`);

    let successCount = 0;
    for (const file of lcovFiles) {
      if (cleanLcovFile(file, verbose)) {
        successCount++;
      }
    }

    console.log(`\n✓ Successfully cleaned ${successCount}/${lcovFiles.length} files`);
  } else {
    // Single file mode
    const lcovPath = path.resolve(args[0]);
    if (cleanLcovFile(lcovPath, verbose)) {
      console.log("\n✓ Coverage file cleaned successfully");
    } else {
      process.exit(1);
    }
  }
}

main();
