import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AFSJSON } from "@aigne/afs-json";

let testDir: string;
let yamlFilePath: string;
let afsYAML: AFSJSON;

const yamlContent = `database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret
features:
  - auth
  - api
  - ui
version: "1.0.0"
metadata:
  created: "2024-01-01"
  author: test
`;

beforeAll(async () => {
  // Create a temporary directory for testing
  testDir = join(tmpdir(), `afs-yaml-test-${Date.now()}`);
  await mkdir(testDir, { recursive: true });

  // Create test YAML file
  yamlFilePath = join(testDir, "test.yaml");
  await writeFile(yamlFilePath, yamlContent);

  // Initialize AFSJSON with YAML file
  afsYAML = new AFSJSON({ jsonPath: yamlFilePath });
});

afterAll(async () => {
  // Clean up test directory
  await rm(testDir, { recursive: true, force: true });
});

// Basic YAML reading tests
test("AFSJSON should read YAML file and parse it correctly", async () => {
  const result = await afsYAML.list("/");
  const paths = result.data.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/database",
      "/features",
      "/metadata",
      "/version",
    ]
  `);
});

test("AFSJSON should read scalar value from YAML", async () => {
  const { data } = await afsYAML.read("/version");
  expect(data?.content).toBe("1.0.0");
});

test("AFSJSON should read nested value from YAML", async () => {
  const { data } = await afsYAML.read("/database/host");
  expect(data?.content).toBe("localhost");
});

test("AFSJSON should read array from YAML", async () => {
  const { data } = await afsYAML.read("/features");
  expect(data?.metadata?.type).toBe("directory");
  expect(data?.metadata?.childrenCount).toBe(3);

  const { data: data0 } = await afsYAML.read("/features/0");
  expect(data0?.content).toBe("auth");
});

test("AFSJSON should read deeply nested value from YAML", async () => {
  const { data } = await afsYAML.read("/database/credentials/username");
  expect(data?.content).toBe("admin");
});

// YAML writing tests
test("AFSJSON should write new value to YAML file", async () => {
  const { data } = await afsYAML.write("/newValue", { content: "test" });
  expect(data?.content).toBe("test");

  // Verify it persisted
  const { data: readData } = await afsYAML.read("/newValue");
  expect(readData?.content).toBe("test");
});

test("AFSJSON should update existing value in YAML file", async () => {
  await afsYAML.write("/version", { content: "2.0.0" });

  const { data } = await afsYAML.read("/version");
  expect(data?.content).toBe("2.0.0");
});

test("AFSJSON should write nested value to YAML file", async () => {
  await afsYAML.write("/database/port", { content: 3306 });

  const { data } = await afsYAML.read("/database/port");
  expect(data?.content).toBe(3306);
});

test("AFSJSON should write complex object to YAML file", async () => {
  const complexData = {
    name: "test",
    value: 42,
    nested: { key: "value" },
  };

  await afsYAML.write("/complex", { content: complexData });

  const { data: nestedData } = await afsYAML.read("/complex/nested/key");
  expect(nestedData?.content).toBe("value");
});

// YAML delete tests
test("AFSJSON should delete value from YAML file", async () => {
  await afsYAML.write("/toDelete", { content: "delete me" });

  const result = await afsYAML.delete("/toDelete");
  expect(result.message).toBe("Successfully deleted: /toDelete");

  const readResult = await afsYAML.read("/toDelete");
  expect(readResult.data).toBeUndefined();
});

// YAML rename tests
test("AFSJSON should rename value in YAML file", async () => {
  await afsYAML.write("/oldName", { content: "rename test" });

  await afsYAML.rename("/oldName", "/renamedValue");

  const oldRead = await afsYAML.read("/oldName");
  expect(oldRead.data).toBeUndefined();

  const { data: newData } = await afsYAML.read("/renamedValue");
  expect(newData?.content).toBe("rename test");
});

// YAML search tests
test("AFSJSON should search in YAML file", async () => {
  const result = await afsYAML.search("/", "admin");
  expect(result.data.length).toBeGreaterThan(0);

  const paths = result.data.map((e) => e.path);
  expect(paths).toContain("/database/credentials/username");
});

// Format detection tests
test("AFSJSON should detect YAML format from .yaml extension", () => {
  const yamlInstance = new AFSJSON({ jsonPath: "/tmp/test.yaml" });
  expect(yamlInstance.name).toBe("test");
});

test("AFSJSON should detect YAML format from .yml extension", () => {
  const yamlInstance = new AFSJSON({ jsonPath: "/tmp/test.yml" });
  expect(yamlInstance.name).toBe("test");
});

test("AFSJSON should detect JSON format from .json extension", () => {
  const jsonInstance = new AFSJSON({ jsonPath: "/tmp/config.json" });
  expect(jsonInstance.name).toBe("config");
});

// Cross-format compatibility test
test("AFSJSON should read JSON file with YAML parser", async () => {
  const jsonPath = join(testDir, "test-json.json");
  const jsonData = { key: "value", number: 42, nested: { deep: "data" } };
  await writeFile(jsonPath, JSON.stringify(jsonData, null, 2));

  const jsonInstance = new AFSJSON({ jsonPath });
  const { data } = await jsonInstance.read("/key");
  expect(data?.content).toBe("value");

  const { data: nestedData } = await jsonInstance.read("/nested/deep");
  expect(nestedData?.content).toBe("data");

  await rm(jsonPath);
});

// YAML persistence test
test("AFSJSON should persist YAML changes across instances", async () => {
  const newYamlPath = join(testDir, "persist.yaml");
  await writeFile(newYamlPath, "original: value\n");

  const persist1 = new AFSJSON({ jsonPath: newYamlPath });
  await persist1.write("/newKey", { content: "new value" });

  // Create new instance to verify persistence
  const persist2 = new AFSJSON({ jsonPath: newYamlPath });
  const { data } = await persist2.read("/newKey");
  expect(data?.content).toBe("new value");

  await rm(newYamlPath);
});

test("AFSJSON should handle non-existent YAML file", async () => {
  const nonExistentPath = join(testDir, "nonexistent.yaml");
  const emptyYAML = new AFSJSON({ jsonPath: nonExistentPath });

  // Should start with empty object
  const { data } = await emptyYAML.read("/");
  expect(data?.metadata?.type).toBe("directory");
  expect(data?.metadata?.childrenCount).toBe(0);

  // Should be able to write to it
  await emptyYAML.write("/key", { content: "value" });
  const { data: readData } = await emptyYAML.read("/key");
  expect(readData?.content).toBe("value");

  await rm(nonExistentPath);
});

// Edge cases with YAML
test("AFSJSON should handle YAML special types", async () => {
  const specialPath = join(testDir, "special.yaml");
  const specialYAML = new AFSJSON({ jsonPath: specialPath });

  // Test with null
  await specialYAML.write("/nullValue", { content: null });
  const { data: nullData } = await specialYAML.read("/nullValue");
  expect(nullData?.content).toBe(null);

  // Test with boolean
  await specialYAML.write("/boolTrue", { content: true });
  const { data: boolData } = await specialYAML.read("/boolTrue");
  expect(boolData?.content).toBe(true);

  // Test with numbers
  await specialYAML.write("/number", { content: 42 });
  const { data: numData } = await specialYAML.read("/number");
  expect(numData?.content).toBe(42);

  await rm(specialPath);
});
