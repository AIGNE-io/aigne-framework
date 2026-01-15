import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AFSJSON } from "@aigne/afs-json";

let testDir: string;
let jsonFilePath: string;
let afsJSON: AFSJSON;

const testData = {
  database: {
    host: "localhost",
    port: 5432,
    credentials: {
      username: "admin",
      password: "secret",
    },
  },
  features: ["auth", "api", "ui"],
  version: "1.0.0",
  metadata: {
    created: "2024-01-01",
    author: "test",
  },
};

beforeAll(async () => {
  // Create a temporary directory for testing
  testDir = join(tmpdir(), `afs-json-test-${Date.now()}`);
  await mkdir(testDir, { recursive: true });

  // Create test JSON file
  jsonFilePath = join(testDir, "test.json");
  await writeFile(jsonFilePath, JSON.stringify(testData, null, 2));

  // Initialize AFSJSON
  afsJSON = new AFSJSON({ jsonPath: jsonFilePath });
});

afterAll(async () => {
  // Clean up test directory
  await rm(testDir, { recursive: true, force: true });
});

// List tests
test("AFSJSON should list root level entries", async () => {
  const result = await afsJSON.list("/");

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

  // Check metadata types
  const types = result.data.map((entry) => ({
    path: entry.path,
    type: entry.metadata?.type,
  }));
  expect(types.sort((a, b) => a.path.localeCompare(b.path))).toMatchInlineSnapshot(`
    [
      {
        "path": "/",
        "type": "directory",
      },
      {
        "path": "/database",
        "type": "directory",
      },
      {
        "path": "/features",
        "type": "directory",
      },
      {
        "path": "/metadata",
        "type": "directory",
      },
      {
        "path": "/version",
        "type": "file",
      },
    ]
  `);
});

test("AFSJSON should list nested directory entries", async () => {
  const result = await afsJSON.list("/database");

  const paths = result.data.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/database",
      "/database/credentials",
      "/database/host",
      "/database/port",
    ]
  `);
});

test("AFSJSON should list array entries with numeric indices", async () => {
  const result = await afsJSON.list("/features");

  const paths = result.data.map((entry) => entry.path);
  expect(paths).toMatchInlineSnapshot(`
    [
      "/features",
      "/features/0",
      "/features/1",
      "/features/2",
    ]
  `);
});

test("AFSJSON should list recursively with maxDepth", async () => {
  const result = await afsJSON.list("/", { maxDepth: 10 });

  const paths = result.data.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/database",
      "/database/credentials",
      "/database/credentials/password",
      "/database/credentials/username",
      "/database/host",
      "/database/port",
      "/features",
      "/features/0",
      "/features/1",
      "/features/2",
      "/metadata",
      "/metadata/author",
      "/metadata/created",
      "/version",
    ]
  `);
});

test("AFSJSON should respect maxDepth option", async () => {
  const result = await afsJSON.list("/", { maxDepth: 1 });

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

test("AFSJSON should respect limit option", async () => {
  const result = await afsJSON.list("/", { limit: 3 });

  expect(result.data).toBeDefined();
  expect(result.data.length).toBe(3);
});

test("AFSJSON should respect maxChildren option", async () => {
  const result = await afsJSON.list("/", { maxChildren: 2, maxDepth: 2 });

  // Root should only process first 2 children
  const paths = result.data.map((entry) => entry.path);
  expect(paths.length).toBeLessThanOrEqual(7); // root + 2 children + their children

  // Root should be marked as truncated
  const rootEntry = result.data.find((e) => e.path === "/");
  expect(rootEntry?.metadata?.childrenTruncated).toBe(true);
});

// Read tests
test("AFSJSON should read a scalar value", async () => {
  const { data } = await afsJSON.read("/version");

  expect(data).toBeDefined();
  expect(data?.path).toBe("/version");
  expect(data?.content).toBe("1.0.0");
  expect(data?.metadata?.type).toBe("file");
});

test("AFSJSON should read a nested scalar value", async () => {
  const { data } = await afsJSON.read("/database/host");

  expect(data).toBeDefined();
  expect(data?.path).toBe("/database/host");
  expect(data?.content).toBe("localhost");
  expect(data?.metadata?.type).toBe("file");
});

test("AFSJSON should read an object as directory", async () => {
  const { data } = await afsJSON.read("/database");

  expect(data).toBeDefined();
  expect(data?.path).toBe("/database");
  expect(data?.content).toBeUndefined();
  expect(data?.metadata?.type).toBe("directory");
  expect(data?.metadata?.childrenCount).toBe(3);
});

test("AFSJSON should read an array as directory", async () => {
  const { data } = await afsJSON.read("/features");

  expect(data).toBeDefined();
  expect(data?.path).toBe("/features");
  expect(data?.content).toBeUndefined();
  expect(data?.metadata?.type).toBe("directory");
  expect(data?.metadata?.childrenCount).toBe(3);
});

test("AFSJSON should read array element by index", async () => {
  const { data: data0 } = await afsJSON.read("/features/0");
  expect(data0?.content).toBe("auth");

  const { data: data1 } = await afsJSON.read("/features/1");
  expect(data1?.content).toBe("api");

  const { data: data2 } = await afsJSON.read("/features/2");
  expect(data2?.content).toBe("ui");
});

test("AFSJSON should read deeply nested value", async () => {
  const { data } = await afsJSON.read("/database/credentials/username");

  expect(data).toBeDefined();
  expect(data?.path).toBe("/database/credentials/username");
  expect(data?.content).toBe("admin");
});

test("AFSJSON should return undefined for non-existent path", async () => {
  const result = await afsJSON.read("/nonexistent");

  expect(result.data).toBeUndefined();
  expect(result.message).toBe("Path not found: /nonexistent");
});

test("AFSJSON should return undefined for invalid array index", async () => {
  const result = await afsJSON.read("/features/99");

  expect(result.data).toBeUndefined();
  expect(result.message).toBe("Path not found: /features/99");
});

// Write tests
test("AFSJSON should write a new scalar value", async () => {
  const { data } = await afsJSON.write("/newValue", { content: "test" });

  expect(data).toBeDefined();
  expect(data.path).toBe("/newValue");
  expect(data.content).toBe("test");

  // Verify it was written
  const { data: readData } = await afsJSON.read("/newValue");
  expect(readData?.content).toBe("test");
});

test("AFSJSON should update an existing value", async () => {
  const { data } = await afsJSON.write("/version", { content: "2.0.0" });

  expect(data).toBeDefined();
  expect(data.path).toBe("/version");
  expect(data.content).toBe("2.0.0");

  // Verify it was updated
  const { data: readData } = await afsJSON.read("/version");
  expect(readData?.content).toBe("2.0.0");
});

test("AFSJSON should write a nested value", async () => {
  const { data } = await afsJSON.write("/database/port", { content: 3306 });

  expect(data).toBeDefined();
  expect(data.content).toBe(3306);

  // Verify it was updated
  const { data: readData } = await afsJSON.read("/database/port");
  expect(readData?.content).toBe(3306);
});

test("AFSJSON should write a deeply nested new value", async () => {
  const { data } = await afsJSON.write("/database/ssl/enabled", { content: true });

  expect(data).toBeDefined();
  expect(data.content).toBe(true);

  // Verify the structure was created
  const { data: sslData } = await afsJSON.read("/database/ssl");
  expect(sslData?.metadata?.type).toBe("directory");

  const { data: enabledData } = await afsJSON.read("/database/ssl/enabled");
  expect(enabledData?.content).toBe(true);
});

test("AFSJSON should write an array element", async () => {
  const { data } = await afsJSON.write("/features/1", { content: "dashboard" });

  expect(data).toBeDefined();
  expect(data.content).toBe("dashboard");

  // Verify it was updated
  const { data: readData } = await afsJSON.read("/features/1");
  expect(readData?.content).toBe("dashboard");
});

test("AFSJSON should write complex object", async () => {
  const complexData = {
    name: "test",
    value: 42,
    nested: { key: "value" },
  };

  const { data } = await afsJSON.write("/complex", { content: complexData });

  expect(data).toBeDefined();
  expect(data.content).toEqual(complexData);

  // Verify nested access
  const { data: nestedData } = await afsJSON.read("/complex/nested/key");
  expect(nestedData?.content).toBe("value");
});

// Delete tests
test("AFSJSON should delete a scalar value", async () => {
  // First write a value
  await afsJSON.write("/toDelete", { content: "delete me" });

  // Delete it
  const result = await afsJSON.delete("/toDelete");
  expect(result.message).toBe("Successfully deleted: /toDelete");

  // Verify it's gone
  const readResult = await afsJSON.read("/toDelete");
  expect(readResult.data).toBeUndefined();
});

test("AFSJSON should delete an array element", async () => {
  // Delete array element at index 2
  const result = await afsJSON.delete("/features/2");
  expect(result.message).toBe("Successfully deleted: /features/2");

  // Verify array was shortened
  const { data } = await afsJSON.read("/features");
  expect(data?.metadata?.childrenCount).toBe(2);

  // Index 2 should now be undefined (or non-existent)
  const readResult = await afsJSON.read("/features/2");
  expect(readResult.data).toBeUndefined();
});

test("AFSJSON should delete an object without children", async () => {
  // First create an empty object
  await afsJSON.write("/emptyObj/temp", { content: "value" });
  await afsJSON.delete("/emptyObj/temp");

  // Now delete the empty object
  const result = await afsJSON.delete("/emptyObj");
  expect(result.message).toBe("Successfully deleted: /emptyObj");
});

test("AFSJSON should throw error when deleting directory without recursive", async () => {
  expect(afsJSON.delete("/database")).rejects.toThrow(
    "Cannot delete directory '/database' without recursive option",
  );
});

test("AFSJSON should delete directory with recursive option", async () => {
  // Create a nested structure
  await afsJSON.write("/deleteDir/sub/value", { content: "test" });

  // Delete recursively
  const result = await afsJSON.delete("/deleteDir", { recursive: true });
  expect(result.message).toBe("Successfully deleted: /deleteDir");

  // Verify it's gone
  const readResult = await afsJSON.read("/deleteDir");
  expect(readResult.data).toBeUndefined();
});

// Rename tests
test("AFSJSON should rename a value", async () => {
  // Create a value
  await afsJSON.write("/oldName", { content: "rename test" });

  // Rename it
  const result = await afsJSON.rename("/oldName", "/newName");
  expect(result.message).toBe("Successfully renamed '/oldName' to '/newName'");

  // Verify old path is gone
  const oldRead = await afsJSON.read("/oldName");
  expect(oldRead.data).toBeUndefined();

  // Verify new path exists
  const { data: newData } = await afsJSON.read("/newName");
  expect(newData?.content).toBe("rename test");
});

test("AFSJSON should rename to nested path", async () => {
  await afsJSON.write("/flatValue", { content: "move me" });

  const result = await afsJSON.rename("/flatValue", "/nested/path/movedValue");
  expect(result.message).toBe("Successfully renamed '/flatValue' to '/nested/path/movedValue'");

  // Verify it exists at new location
  const { data } = await afsJSON.read("/nested/path/movedValue");
  expect(data?.content).toBe("move me");
});

test("AFSJSON should throw error when renaming to existing path without overwrite", async () => {
  await afsJSON.write("/source", { content: "source" });
  await afsJSON.write("/target", { content: "target" });

  expect(afsJSON.rename("/source", "/target")).rejects.toThrow(
    "Destination '/target' already exists. Set overwrite: true to replace it.",
  );
});

test("AFSJSON should rename with overwrite option", async () => {
  await afsJSON.write("/source2", { content: "source2" });
  await afsJSON.write("/target2", { content: "target2" });

  const result = await afsJSON.rename("/source2", "/target2", { overwrite: true });
  expect(result.message).toBe("Successfully renamed '/source2' to '/target2'");

  // Verify source is gone
  const sourceRead = await afsJSON.read("/source2");
  expect(sourceRead.data).toBeUndefined();

  // Verify target has source content
  const { data: targetData } = await afsJSON.read("/target2");
  expect(targetData?.content).toBe("source2");
});

// Search tests
test("AFSJSON should search for string values", async () => {
  const result = await afsJSON.search("/", "admin");

  expect(result.data).toBeDefined();
  expect(result.data.length).toBeGreaterThan(0);

  const paths = result.data.map((e) => e.path);
  expect(paths).toContain("/database/credentials/username");
});

test("AFSJSON should search case-insensitively by default", async () => {
  const result = await afsJSON.search("/", "LOCALHOST");

  expect(result.data).toBeDefined();
  expect(result.data.length).toBeGreaterThan(0);

  const paths = result.data.map((e) => e.path);
  expect(paths).toContain("/database/host");
});

test("AFSJSON should search case-sensitively when specified", async () => {
  const result1 = await afsJSON.search("/", "LOCALHOST", { caseSensitive: true });
  expect(result1.data.length).toBe(0);

  const result2 = await afsJSON.search("/", "localhost", { caseSensitive: true });
  expect(result2.data.length).toBeGreaterThan(0);
});

test("AFSJSON should search in specific subtree", async () => {
  const result = await afsJSON.search("/database", "admin");

  expect(result.data).toBeDefined();
  const paths = result.data.map((e) => e.path);

  // Should only find results under /database
  paths.forEach((path) => {
    expect(path.startsWith("/database")).toBe(true);
  });
});

test("AFSJSON should respect search limit", async () => {
  const result = await afsJSON.search("/", "a", { limit: 2 });

  expect(result.data).toBeDefined();
  expect(result.data.length).toBe(2);
  expect(result.message).toBe("Results truncated to limit 2");
});

test("AFSJSON should search in number values", async () => {
  const result = await afsJSON.search("/", "3306");

  expect(result.data).toBeDefined();
  expect(result.data.length).toBeGreaterThan(0);

  const paths = result.data.map((e) => e.path);
  expect(paths).toContain("/database/port");
});

test("AFSJSON should return empty results for no matches", async () => {
  const result = await afsJSON.search("/", "nonexistentstring12345");

  expect(result.data).toBeDefined();
  expect(result.data.length).toBe(0);
});

// File persistence tests
test("AFSJSON should persist changes to file", async () => {
  const newFilePath = join(testDir, "persist.json");
  await writeFile(newFilePath, JSON.stringify({ original: "value" }, null, 2));

  const persistJSON = new AFSJSON({ jsonPath: newFilePath });

  // Write a value
  await persistJSON.write("/newKey", { content: "new value" });

  // Create a new instance to read the file
  const persistJSON2 = new AFSJSON({ jsonPath: newFilePath });
  const { data } = await persistJSON2.read("/newKey");

  expect(data?.content).toBe("new value");

  // Clean up
  await rm(newFilePath);
});

test("AFSJSON should handle non-existent file", async () => {
  const nonExistentPath = join(testDir, "nonexistent.json");
  const emptyJSON = new AFSJSON({ jsonPath: nonExistentPath });

  // Should start with empty object
  const { data } = await emptyJSON.read("/");
  expect(data?.metadata?.type).toBe("directory");
  expect(data?.metadata?.childrenCount).toBe(0);

  // Should be able to write to it
  await emptyJSON.write("/key", { content: "value" });
  const { data: readData } = await emptyJSON.read("/key");
  expect(readData?.content).toBe("value");

  // Clean up
  await rm(nonExistentPath);
});

// Path normalization tests
test("AFSJSON should handle various path formats", async () => {
  // All these should refer to the same path
  const { data: data1 } = await afsJSON.read("/version");
  const { data: data2 } = await afsJSON.read("version");
  const { data: data3 } = await afsJSON.read("/version/");

  expect(data1?.content).toBe(data2?.content);
  expect(data2?.content).toBe(data3?.content);
});

// Options tests
test("AFSJSON should support name option", () => {
  const customJSON = new AFSJSON({
    jsonPath: jsonFilePath,
    name: "custom-name",
  });

  expect(customJSON.name).toBe("custom-name");
});

test("AFSJSON should default name to filename", () => {
  expect(afsJSON.name).toBe("test");
});

test("AFSJSON should support description option", () => {
  const customJSON = new AFSJSON({
    jsonPath: jsonFilePath,
    description: "Test description",
  });

  expect(customJSON.description).toBe("Test description");
});

test("AFSJSON should support accessMode option", () => {
  const readonlyJSON = new AFSJSON({
    jsonPath: jsonFilePath,
    accessMode: "readonly",
  });

  expect(readonlyJSON.accessMode).toBe("readonly");

  const readwriteJSON = new AFSJSON({
    jsonPath: jsonFilePath,
    accessMode: "readwrite",
  });

  expect(readwriteJSON.accessMode).toBe("readwrite");
});

test("AFSJSON should default to readwrite accessMode", () => {
  expect(afsJSON.accessMode).toBe("readwrite");
});

test("AFSJSON should default to readonly when agentSkills is enabled", () => {
  const skillsJSON = new AFSJSON({
    jsonPath: jsonFilePath,
    agentSkills: true,
  });

  expect(skillsJSON.accessMode).toBe("readonly");
});

// Edge cases
test("AFSJSON should handle empty arrays", async () => {
  await afsJSON.write("/emptyArray", { content: [] });

  const { data } = await afsJSON.read("/emptyArray");
  expect(data?.metadata?.type).toBe("directory");
  expect(data?.metadata?.childrenCount).toBe(0);
});

test("AFSJSON should handle null values", async () => {
  await afsJSON.write("/nullValue", { content: null });

  const { data } = await afsJSON.read("/nullValue");
  expect(data?.content).toBe(null);
});

test("AFSJSON should handle boolean values", async () => {
  await afsJSON.write("/boolTrue", { content: true });
  await afsJSON.write("/boolFalse", { content: false });

  const { data: data1 } = await afsJSON.read("/boolTrue");
  expect(data1?.content).toBe(true);

  const { data: data2 } = await afsJSON.read("/boolFalse");
  expect(data2?.content).toBe(false);
});

test("AFSJSON should handle number values", async () => {
  await afsJSON.write("/intValue", { content: 42 });
  await afsJSON.write("/floatValue", { content: 3.14 });
  await afsJSON.write("/negativeValue", { content: -10 });

  const { data: data1 } = await afsJSON.read("/intValue");
  expect(data1?.content).toBe(42);

  const { data: data2 } = await afsJSON.read("/floatValue");
  expect(data2?.content).toBe(3.14);

  const { data: data3 } = await afsJSON.read("/negativeValue");
  expect(data3?.content).toBe(-10);
});
