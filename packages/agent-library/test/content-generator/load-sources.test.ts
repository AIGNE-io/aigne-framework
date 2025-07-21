import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import loadSources from "../../src/content-generator/load-sources.mjs";

// Type assertion for the loadSources function
const loadSourcesTyped = loadSources as (options?: {
  sources?: string[];
  sourcesPath?: string | string[];
  includePatterns?: string | string[];
  excludePatterns?: string | string[];
  outputDir?: string;
  docsDir?: string;
  currentPath?: string;
  useDefaultPatterns?: boolean;
}) => Promise<{
  datasourcesList: Array<{ sourceId: string; content: string }>;
  datasources: string;
  content?: string;
  originalStructurePlan?: any;
}>;

describe("loadSources", () => {
  let testDir: string;
  let tempDir: string;

  beforeAll(async () => {
    // Create test directory structure
    testDir = path.join(process.cwd(), "test-content-generator");
    tempDir = path.join(testDir, "temp");

    await mkdir(testDir, { recursive: true });
    await mkdir(tempDir, { recursive: true });
    await mkdir(path.join(testDir, "src"), { recursive: true });
    await mkdir(path.join(testDir, "docs"), { recursive: true });
    await mkdir(path.join(testDir, "node_modules"), { recursive: true });
    await mkdir(path.join(testDir, "test"), { recursive: true });

    // Create multi-level directory structure under src
    await mkdir(path.join(testDir, "src/components"), { recursive: true });
    await mkdir(path.join(testDir, "src/components/ui"), { recursive: true });
    await mkdir(path.join(testDir, "src/utils/helpers"), { recursive: true });
    await mkdir(path.join(testDir, "src/services/api"), { recursive: true });
    await mkdir(path.join(testDir, "src/config"), { recursive: true });

    // Create test files in root and src
    await writeFile(path.join(testDir, "package.json"), JSON.stringify({ name: "test" }));
    await writeFile(path.join(testDir, "README.md"), "# Test Project");
    await writeFile(path.join(testDir, "src/index.js"), "console.log('hello');");
    await writeFile(path.join(testDir, "src/utils.js"), "export function test() {}");

    // Create files in multi-level directories
    await writeFile(path.join(testDir, "src/components/Button.js"), "export class Button {}");
    await writeFile(path.join(testDir, "src/components/ui/Modal.js"), "export class Modal {}");
    await writeFile(path.join(testDir, "src/components/ui/Input.js"), "export class Input {}");
    await writeFile(
      path.join(testDir, "src/utils/helpers/format.js"),
      "export function format() {}",
    );
    await writeFile(
      path.join(testDir, "src/utils/helpers/validate.js"),
      "export function validate() {}",
    );
    await writeFile(path.join(testDir, "src/services/api/client.js"), "export class ApiClient {}");
    await writeFile(
      path.join(testDir, "src/services/api/endpoints.js"),
      "export const endpoints = {}",
    );
    await writeFile(path.join(testDir, "src/config/database.js"), "export const dbConfig = {}");
    await writeFile(path.join(testDir, "src/config/app.js"), "export const appConfig = {}");

    // Create some non-JS files to test filtering
    await writeFile(path.join(testDir, "src/components/ui/styles.css"), "/* styles */");
    await writeFile(
      path.join(testDir, "src/config/settings.json"),
      JSON.stringify({ theme: "dark" }),
    );
    await writeFile(path.join(testDir, "src/utils/helpers/data.yaml"), "version: 1.0");

    // Create test files
    await writeFile(path.join(testDir, "test/test.js"), "describe('test', () => {});");

    // Create files with _test pattern to test the new exclusion
    await writeFile(path.join(testDir, "src/server_test.go"), "func TestServer() {}");
    await writeFile(path.join(testDir, "src/user_test.js"), "describe('user', () => {});");
    await writeFile(path.join(testDir, "src/api_test.ts"), "describe('api', () => {});");
    await writeFile(path.join(testDir, "src/utils_test.py"), "def test_utils(): pass");
    await writeFile(
      path.join(testDir, "src/components/Button_test.jsx"),
      "test('button', () => {});",
    );
    await writeFile(
      path.join(testDir, "src/utils/helpers/format_test.js"),
      "test('format', () => {});",
    );

    await mkdir(path.join(testDir, "node_modules/some-package"), { recursive: true });
    await writeFile(path.join(testDir, "node_modules/some-package/package.json"), "{}");
    await writeFile(path.join(testDir, "temp/temp.txt"), "temp file");
    await writeFile(path.join(testDir, "ignore.txt"), "should be ignored");

    // Create .gitignore file
    await writeFile(
      path.join(testDir, ".gitignore"),
      "node_modules/\n" + "temp/\n" + "ignore.txt\n" + "*.log\n",
    );
  });

  afterAll(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  test("should load files with default patterns", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: testDir,
      useDefaultPatterns: true,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();
    expect(result.datasourcesList.length).toBeGreaterThan(0);

    // Debug: log actual file paths
    console.log(
      "Actual file paths:",
      result.datasourcesList.map((f) => f.sourceId),
    );

    // Should include package.json, README.md, src files
    const filePaths = result.datasourcesList.map((f) => f.sourceId);
    expect(filePaths.some((f) => f.includes("package.json"))).toBe(true);
    expect(filePaths.some((f) => f.includes("README.md"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/index.js"))).toBe(true);

    // Should exclude node_modules, temp, test files
    expect(filePaths.some((f) => f.includes("node_modules"))).toBe(false);
    expect(filePaths.some((f) => f.includes("temp/"))).toBe(false);
    expect(filePaths.some((f) => f.includes("test/test.js"))).toBe(false);
    expect(filePaths.some((f) => f.includes("ignore.txt"))).toBe(false);
  });

  test("should load files with custom patterns", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: testDir,
      includePatterns: ["*.js", "*.json"],
      excludePatterns: ["test/*"],
      useDefaultPatterns: false,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();
    expect(result.datasourcesList.length).toBeGreaterThan(0);

    const filePaths = result.datasourcesList.map((f) => f.sourceId);
    expect(filePaths.some((f) => f.includes("package.json"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/index.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils.js"))).toBe(true);

    // Should exclude test files
    expect(filePaths.some((f) => f.includes("test/test.js"))).toBe(false);
  });

  test("should respect .gitignore patterns", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: testDir,
      includePatterns: ["*"],
      excludePatterns: [],
      useDefaultPatterns: false,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();

    const filePaths = result.datasourcesList.map((f) => f.sourceId);

    // Should exclude files listed in .gitignore
    expect(filePaths.some((f) => f.includes("node_modules"))).toBe(false);
    expect(filePaths.some((f) => f.includes("temp/"))).toBe(false);
    expect(filePaths.some((f) => f.includes("ignore.txt"))).toBe(false);
  });

  test("should handle path-based patterns", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: testDir,
      includePatterns: ["src/**/*.js"],
      excludePatterns: ["**/test/**"],
      useDefaultPatterns: false,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();

    // Debug: log actual file paths
    console.log(
      "Path-based patterns - Actual file paths:",
      result.datasourcesList.map((f) => f.sourceId),
    );

    const filePaths = result.datasourcesList.map((f) => f.sourceId);
    expect(filePaths.some((f) => f.includes("src/index.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils.js"))).toBe(true);

    // Should exclude test files
    expect(filePaths.some((f) => f.includes("test/test.js"))).toBe(false);
  });

  test("should handle multiple source paths", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: [testDir, path.join(testDir, "src")],
      includePatterns: ["*.js"],
      useDefaultPatterns: false,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();
    expect(result.datasourcesList.length).toBeGreaterThan(0);

    const filePaths = result.datasourcesList.map((f) => f.sourceId);
    expect(filePaths.some((f) => f.includes("src/index.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils.js"))).toBe(true);
  });

  test("should handle non-existent directories gracefully", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: path.join(testDir, "non-existent"),
      useDefaultPatterns: true,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();
    expect(result.datasourcesList.length).toBe(0);
  });

  test("should merge user patterns with default patterns", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: testDir,
      includePatterns: ["*.txt"],
      excludePatterns: ["docs/*"],
      useDefaultPatterns: true,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();

    const filePaths = result.datasourcesList.map((f) => f.sourceId);

    // Should include default patterns (package.json, README.md, etc.)
    expect(filePaths.some((f) => f.includes("package.json"))).toBe(true);
    expect(filePaths.some((f) => f.includes("README.md"))).toBe(true);

    // Should include user patterns (txt files that are not in .gitignore)
    // Note: ignore.txt is in .gitignore, so it should be excluded

    // Should exclude user exclude patterns
    expect(filePaths.some((f) => f.includes("docs/"))).toBe(false);
  });

  test("should handle multi-level directory structure", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: testDir,
      includePatterns: ["**/*.js"],
      excludePatterns: [],
      useDefaultPatterns: false,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();
    expect(result.datasourcesList.length).toBeGreaterThan(0);

    const filePaths = result.datasourcesList.map((f) => f.sourceId);

    // Should include files from all levels
    expect(filePaths.some((f) => f.includes("src/index.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/components/Button.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/components/ui/Modal.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/components/ui/Input.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils/helpers/format.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils/helpers/validate.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/services/api/client.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/services/api/endpoints.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/config/database.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/config/app.js"))).toBe(true);

    // Should exclude non-JS files
    expect(filePaths.some((f) => f.includes("styles.css"))).toBe(false);
    expect(filePaths.some((f) => f.includes("settings.json"))).toBe(false);
    expect(filePaths.some((f) => f.includes("data.yaml"))).toBe(false);
  });

  test("should filter by specific subdirectories", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: testDir,
      includePatterns: ["src/components/**/*.js", "src/utils/**/*.js"],
      excludePatterns: ["src/components/ui/*.js"],
      useDefaultPatterns: false,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();

    const filePaths = result.datasourcesList.map((f) => f.sourceId);

    // Should include files from specified subdirectories
    expect(filePaths.some((f) => f.includes("src/components/Button.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils/helpers/format.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils/helpers/validate.js"))).toBe(true);

    // Should exclude files from excluded subdirectories
    expect(filePaths.some((f) => f.includes("src/components/ui/Modal.js"))).toBe(false);
    expect(filePaths.some((f) => f.includes("src/components/ui/Input.js"))).toBe(false);

    // Should exclude files from other directories
    expect(filePaths.some((f) => f.includes("src/services/api/client.js"))).toBe(false);
    expect(filePaths.some((f) => f.includes("src/config/database.js"))).toBe(false);
  });

  test("should handle mixed file types in multi-level directories", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: testDir,
      includePatterns: ["**/*.js", "**/*.json", "**/*.yaml"],
      excludePatterns: ["**/node_modules/**"],
      useDefaultPatterns: false,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();

    const filePaths = result.datasourcesList.map((f) => f.sourceId);

    // Should include JS files from all levels
    expect(filePaths.some((f) => f.includes("src/components/Button.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils/helpers/format.js"))).toBe(true);

    // Should include JSON and YAML files
    expect(filePaths.some((f) => f.includes("src/config/settings.json"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils/helpers/data.yaml"))).toBe(true);

    // Should exclude CSS files
    expect(filePaths.some((f) => f.includes("styles.css"))).toBe(false);

    // Should exclude node_modules
    expect(filePaths.some((f) => f.includes("node_modules"))).toBe(false);
  });

  test("should exclude files with _test pattern using default patterns", async () => {
    const result = await loadSourcesTyped({
      sourcesPath: testDir,
      useDefaultPatterns: true,
      outputDir: tempDir,
      docsDir: path.join(testDir, "docs"),
    });

    expect(result.datasourcesList).toBeDefined();

    const filePaths = result.datasourcesList.map((f) => f.sourceId);

    // Debug: log actual file paths to see what's included
    console.log(
      "Files with _test pattern - Actual file paths:",
      result.datasourcesList.map((f) => f.sourceId),
    );

    // Should exclude files with _test pattern
    expect(filePaths.some((f) => f.includes("server_test.go"))).toBe(false);
    expect(filePaths.some((f) => f.includes("user_test.js"))).toBe(false);
    expect(filePaths.some((f) => f.includes("api_test.ts"))).toBe(false);
    expect(filePaths.some((f) => f.includes("utils_test.py"))).toBe(false);
    expect(filePaths.some((f) => f.includes("Button_test.jsx"))).toBe(false);
    expect(filePaths.some((f) => f.includes("format_test.js"))).toBe(false);

    // Should still include regular files
    expect(filePaths.some((f) => f.includes("src/index.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/utils.js"))).toBe(true);
    expect(filePaths.some((f) => f.includes("src/components/Button.js"))).toBe(true);
  });
});
