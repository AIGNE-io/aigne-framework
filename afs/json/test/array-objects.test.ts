import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AFSJSON } from "@aigne/afs-json";

let testDir: string;
let jsonFilePath: string;
let afsJSON: AFSJSON;

const testData = {
  users: [
    {
      name: "Alice",
      email: "alice@example.com",
      profile: {
        age: 30,
        city: "Beijing",
      },
    },
    {
      name: "Bob",
      email: "bob@example.com",
      profile: {
        age: 25,
        city: "Shanghai",
      },
    },
  ],
  tags: ["admin", "user", "guest"],
};

beforeAll(async () => {
  testDir = join(tmpdir(), `afs-json-array-objects-test-${Date.now()}`);
  await mkdir(testDir, { recursive: true });

  jsonFilePath = join(testDir, "data.json");
  await writeFile(jsonFilePath, JSON.stringify(testData, null, 2));

  afsJSON = new AFSJSON({ jsonPath: jsonFilePath });
});

afterAll(async () => {
  await rm(testDir, { recursive: true, force: true });
});

test("should list array of objects", async () => {
  const result = await afsJSON.list("/users");

  const paths = result.data.map((entry) => entry.path);
  expect(paths).toMatchInlineSnapshot(`
    [
      "/users",
      "/users/0",
      "/users/1",
    ]
  `);

  // Check that array elements are directories (objects)
  const firstUser = result.data.find((e) => e.path === "/users/0");
  expect(firstUser?.metadata?.type).toBe("directory");
});

test("should list nested structure in array objects", async () => {
  const result = await afsJSON.list("/users", { maxDepth: 3 });

  const paths = result.data.map((entry) => entry.path).sort();
  expect(paths).toMatchInlineSnapshot(`
    [
      "/users",
      "/users/0",
      "/users/0/email",
      "/users/0/name",
      "/users/0/profile",
      "/users/0/profile/age",
      "/users/0/profile/city",
      "/users/1",
      "/users/1/email",
      "/users/1/name",
      "/users/1/profile",
      "/users/1/profile/age",
      "/users/1/profile/city",
    ]
  `);
});

test("should read properties from array objects", async () => {
  // Read first user's name
  const { data: name1 } = await afsJSON.read("/users/0/name");
  expect(name1?.content).toBe("Alice");

  // Read second user's email
  const { data: email2 } = await afsJSON.read("/users/1/email");
  expect(email2?.content).toBe("bob@example.com");

  // Read nested property
  const { data: city1 } = await afsJSON.read("/users/0/profile/city");
  expect(city1?.content).toBe("Beijing");
});

test("should read array object as directory", async () => {
  const { data } = await afsJSON.read("/users/0");

  expect(data?.metadata?.type).toBe("directory");
  expect(data?.metadata?.childrenCount).toBe(3); // name, email, profile
  expect(data?.content).toBeUndefined();
});

test("should read nested object in array", async () => {
  const { data } = await afsJSON.read("/users/0/profile");

  expect(data?.metadata?.type).toBe("directory");
  expect(data?.metadata?.childrenCount).toBe(2); // age, city
});

test("should write to array object property", async () => {
  // Update first user's age
  await afsJSON.write("/users/0/profile/age", { content: 31 });

  // Verify the change
  const { data } = await afsJSON.read("/users/0/profile/age");
  expect(data?.content).toBe(31);
});

test("should add new property to array object", async () => {
  // Add a new property to first user
  await afsJSON.write("/users/0/active", { content: true });

  // Verify it was added
  const { data } = await afsJSON.read("/users/0/active");
  expect(data?.content).toBe(true);

  // List to see the new property
  const result = await afsJSON.list("/users/0");
  const paths = result.data.map((e) => e.path).sort();
  expect(paths).toContain("/users/0/active");
});

test("should add nested property to array object", async () => {
  // Add nested property
  await afsJSON.write("/users/1/profile/phone", { content: "13812345678" });

  // Verify it was added
  const { data } = await afsJSON.read("/users/1/profile/phone");
  expect(data?.content).toBe("13812345678");
});

test("should delete property from array object", async () => {
  // Delete email from first user
  await afsJSON.delete("/users/0/email");

  // Verify it's gone
  const result = await afsJSON.read("/users/0/email");
  expect(result.data).toBeUndefined();

  // List to verify
  const listResult = await afsJSON.list("/users/0");
  const paths = listResult.data.map((e) => e.path);
  expect(paths).not.toContain("/users/0/email");
});

test("should search in array objects", async () => {
  const result = await afsJSON.search("/users", "Alice");

  expect(result.data.length).toBeGreaterThan(0);
  const paths = result.data.map((e) => e.path);
  expect(paths).toContain("/users/0/name");
});

test("should search in nested properties of array objects", async () => {
  const result = await afsJSON.search("/users", "Beijing");

  expect(result.data.length).toBeGreaterThan(0);
  const paths = result.data.map((e) => e.path);
  expect(paths).toContain("/users/0/profile/city");
});

test("should add new object to array", async () => {
  // Add a new user object
  const newUser = {
    name: "Charlie",
    email: "charlie@example.com",
    profile: {
      age: 28,
      city: "Guangzhou",
    },
  };

  await afsJSON.write("/users/2", { content: newUser });

  // Verify it was added
  const { data: name } = await afsJSON.read("/users/2/name");
  expect(name?.content).toBe("Charlie");

  const { data: city } = await afsJSON.read("/users/2/profile/city");
  expect(city?.content).toBe("Guangzhou");

  // List users array
  const result = await afsJSON.list("/users");
  const paths = result.data.map((e) => e.path);
  expect(paths).toContain("/users/2");
});

test("should handle mixed array content", async () => {
  // The tags array contains simple strings
  const result = await afsJSON.list("/tags");
  const paths = result.data.map((e) => e.path);

  expect(paths).toMatchInlineSnapshot(`
    [
      "/tags",
      "/tags/0",
      "/tags/1",
      "/tags/2",
    ]
  `);

  // All items should be files (not directories)
  const items = result.data.filter((e) => e.path !== "/tags");
  items.forEach((item) => {
    expect(item.metadata?.type).toBe("file");
  });

  // Read individual items
  const { data: tag0 } = await afsJSON.read("/tags/0");
  expect(tag0?.content).toBe("admin");
});

test("should delete entire array object", async () => {
  // Before deletion, verify we have 3 users
  const beforeList = await afsJSON.list("/users");
  expect(beforeList.data.filter((e) => e.path.match(/^\/users\/\d+$/)).length).toBe(3);

  // Delete second user object (Bob)
  await afsJSON.delete("/users/1", { recursive: true });

  // Array should be shortened to 2 users
  const afterList = await afsJSON.list("/users");
  const userPaths = afterList.data
    .filter((e) => e.path.match(/^\/users\/\d+$/))
    .map((e) => e.path)
    .sort();
  expect(userPaths).toEqual(["/users/0", "/users/1"]);

  // After deletion, users/1 should now be Charlie (was users/2)
  const { data: name } = await afsJSON.read("/users/1/name");
  expect(name?.content).toBe("Charlie");
});

test("should rename property in array object", async () => {
  // Rename property in array object
  await afsJSON.rename("/users/0/name", "/users/0/username");

  // Verify old path is gone
  const oldResult = await afsJSON.read("/users/0/name");
  expect(oldResult.data).toBeUndefined();

  // Verify new path exists
  const { data: newData } = await afsJSON.read("/users/0/username");
  expect(newData?.content).toBe("Alice");
});

test("should list all entries recursively", async () => {
  const result = await afsJSON.list("/", { maxDepth: 10 });

  const paths = result.data.map((e) => e.path).sort();

  // Should include all nested paths
  expect(paths).toContain("/");
  expect(paths).toContain("/users");
  expect(paths).toContain("/users/0");
  expect(paths).toContain("/users/0/username"); // renamed from name
  expect(paths).toContain("/users/0/profile");
  expect(paths).toContain("/users/0/profile/city");
  expect(paths).toContain("/tags");
  expect(paths).toContain("/tags/0");
});
