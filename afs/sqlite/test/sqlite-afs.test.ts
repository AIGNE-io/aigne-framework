import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { initDatabase, sql } from "@aigne/sqlite";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { SQLiteAFS } from "../src/sqlite-afs.js";
import { SchemaIntrospector } from "../src/schema/introspector.js";
import { createPathRouter, matchPath } from "../src/router/path-router.js";
import { ActionsRegistry } from "../src/actions/registry.js";

let db: LibSQLDatabase;
let sqliteAFS: SQLiteAFS;

beforeAll(async () => {
  // Create in-memory database
  db = await initDatabase({ url: ":memory:" });

  // Create test tables
  await db.run(sql.raw(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `));

  await db.run(sql.raw(`
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `));

  // Insert test data
  await db.run(sql.raw(`INSERT INTO users (name, email) VALUES ('Alice', 'alice@test.com')`));
  await db.run(sql.raw(`INSERT INTO users (name, email) VALUES ('Bob', 'bob@test.com')`));
  await db.run(sql.raw(`INSERT INTO posts (user_id, title, content) VALUES (1, 'First Post', 'Hello World')`));
  await db.run(sql.raw(`INSERT INTO posts (user_id, title, content) VALUES (1, 'Second Post', 'More content')`));

  // Initialize SQLiteAFS with the same database URL
  sqliteAFS = new SQLiteAFS({ url: ":memory:" });
});

describe("SchemaIntrospector", () => {
  test("should introspect table schemas", async () => {
    const introspector = new SchemaIntrospector();
    const schemas = await introspector.introspect(db);

    expect(schemas.size).toBe(2);
    expect(schemas.has("users")).toBe(true);
    expect(schemas.has("posts")).toBe(true);
  });

  test("should extract column information", async () => {
    const introspector = new SchemaIntrospector();
    const schemas = await introspector.introspect(db);

    const usersSchema = schemas.get("users")!;
    expect(usersSchema.columns.length).toBe(4);

    const idCol = usersSchema.columns.find((c) => c.name === "id");
    expect(idCol?.pk).toBe(1);
    expect(idCol?.type).toBe("INTEGER");

    const nameCol = usersSchema.columns.find((c) => c.name === "name");
    expect(nameCol?.notnull).toBe(true);
  });

  test("should extract primary key", async () => {
    const introspector = new SchemaIntrospector();
    const schemas = await introspector.introspect(db);

    const usersSchema = schemas.get("users")!;
    expect(usersSchema.primaryKey).toEqual(["id"]);
  });

  test("should extract foreign keys", async () => {
    const introspector = new SchemaIntrospector();
    const schemas = await introspector.introspect(db);

    const postsSchema = schemas.get("posts")!;
    expect(postsSchema.foreignKeys.length).toBe(1);
    expect(postsSchema.foreignKeys[0].from).toBe("user_id");
    expect(postsSchema.foreignKeys[0].table).toBe("users");
    expect(postsSchema.foreignKeys[0].to).toBe("id");
  });

  test("should respect table whitelist", async () => {
    const introspector = new SchemaIntrospector();
    const schemas = await introspector.introspect(db, { tables: ["users"] });

    expect(schemas.size).toBe(1);
    expect(schemas.has("users")).toBe(true);
    expect(schemas.has("posts")).toBe(false);
  });

  test("should respect exclude tables", async () => {
    const introspector = new SchemaIntrospector();
    const schemas = await introspector.introspect(db, { excludeTables: ["posts"] });

    expect(schemas.size).toBe(1);
    expect(schemas.has("users")).toBe(true);
    expect(schemas.has("posts")).toBe(false);
  });
});

describe("PathRouter", () => {
  test("should match root path", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/");

    expect(match?.action).toBe("listTables");
  });

  test("should match table path", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/users");

    expect(match?.action).toBe("listTable");
    expect(match?.params.table).toBe("users");
  });

  test("should match row path", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/users/1");

    expect(match?.action).toBe("readRow");
    expect(match?.params.table).toBe("users");
    expect(match?.params.pk).toBe("1");
  });

  test("should match @schema path", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/users/@schema");

    expect(match?.action).toBe("getSchema");
    expect(match?.params.table).toBe("users");
  });

  test("should match @attr path", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/users/1/@attr");

    expect(match?.action).toBe("listAttributes");
    expect(match?.params.table).toBe("users");
    expect(match?.params.pk).toBe("1");
  });

  test("should match @attr/:column path", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/users/1/@attr/name");

    expect(match?.action).toBe("getAttribute");
    expect(match?.params.table).toBe("users");
    expect(match?.params.pk).toBe("1");
    expect(match?.params.column).toBe("name");
  });

  test("should match @meta path", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/users/1/@meta");

    expect(match?.action).toBe("getMeta");
    expect(match?.params.table).toBe("users");
    expect(match?.params.pk).toBe("1");
  });

  test("should match @actions path", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/users/1/@actions");

    expect(match?.action).toBe("listActions");
    expect(match?.params.table).toBe("users");
    expect(match?.params.pk).toBe("1");
  });

  test("should match @actions/:action path", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/users/1/@actions/validate");

    expect(match?.action).toBe("executeAction");
    expect(match?.params.table).toBe("users");
    expect(match?.params.pk).toBe("1");
    expect(match?.params.action).toBe("validate");
  });

  test("should match create row path", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/users/new");

    expect(match?.action).toBe("createRow");
    expect(match?.params.table).toBe("users");
  });
});

describe("ActionsRegistry", () => {
  test("should register and retrieve actions", () => {
    const registry = new ActionsRegistry();

    registry.registerSimple("test", async () => ({ success: true }));

    expect(registry.has("test")).toBe(true);
    expect(registry.get("test")?.name).toBe("test");
  });

  test("should list action names", () => {
    const registry = new ActionsRegistry();

    registry.registerSimple("action1", async () => ({ success: true }), { rowLevel: true });
    registry.registerSimple("action2", async () => ({ success: true }), { tableLevel: true });

    const allNames = registry.listNames();
    expect(allNames).toContain("action1");
    expect(allNames).toContain("action2");

    const rowLevelNames = registry.listNames({ rowLevel: true });
    expect(rowLevelNames).toContain("action1");
  });

  test("should execute actions", async () => {
    const registry = new ActionsRegistry();
    let executed = false;

    registry.registerSimple("myAction", async () => {
      executed = true;
      return { success: true, data: { result: "ok" } };
    });

    const ctx = {
      db: {} as any,
      schemas: new Map(),
      table: "test",
      pk: "1",
      module: { refreshSchema: async () => {}, exportTable: async () => ({}) },
    };

    const result = await registry.execute("myAction", ctx, {});

    expect(executed).toBe(true);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ result: "ok" });
  });

  test("should return error for unknown action", async () => {
    const registry = new ActionsRegistry();

    const ctx = {
      db: {} as any,
      schemas: new Map(),
      table: "test",
      module: { refreshSchema: async () => {}, exportTable: async () => ({}) },
    };

    const result = await registry.execute("unknown", ctx, {});

    expect(result.success).toBe(false);
    expect(result.message).toContain("Unknown action");
  });
});

describe("SQLiteAFS Module", () => {
  let afs: SQLiteAFS;

  beforeAll(async () => {
    // Create a separate instance for module tests
    afs = new SQLiteAFS({ url: ":memory:" });

    // We need to manually initialize since we're not mounting to AFS root
    // Access the private initialize method through onMount
    await afs.onMount({} as any);

    // Set up test data in this instance's database
    const testDb = afs.getDatabase();
    await testDb.run(sql.raw(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE
      )
    `));
    await testDb.run(sql.raw(`INSERT OR IGNORE INTO users (name, email) VALUES ('Test', 'test@example.com')`));

    // Refresh schema after creating tables
    await afs.refreshSchema();
  });

  test("should list tables", async () => {
    const result = await afs.list("/");

    expect(result.data.length).toBeGreaterThan(0);
    const tableNames = result.data.map((e) => e.id);
    expect(tableNames).toContain("users");
  });

  test("should list rows in table", async () => {
    const result = await afs.list("/users");

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].content).toHaveProperty("name");
  });

  test("should read a row by pk", async () => {
    const result = await afs.read("/users/1");

    expect(result.data).toBeDefined();
    expect(result.data?.content).toHaveProperty("name", "Test");
  });

  test("should get table schema", async () => {
    const result = await afs.read("/users/@schema");

    expect(result.data).toBeDefined();
    expect(result.data?.content).toHaveProperty("columns");
    expect(result.data?.content).toHaveProperty("primaryKey");
  });

  test("should list attributes for a row", async () => {
    const result = await afs.list("/users/1/@attr");

    expect(result.data.length).toBeGreaterThan(0);
    const columns = result.data.map((e) => e.summary);
    expect(columns).toContain("name");
    expect(columns).toContain("email");
  });

  test("should get single attribute", async () => {
    const result = await afs.read("/users/1/@attr/name");

    expect(result.data).toBeDefined();
    expect(result.data?.content).toBe("Test");
  });

  test("should get row metadata", async () => {
    const result = await afs.read("/users/1/@meta");

    expect(result.data).toBeDefined();
    expect(result.data?.content).toHaveProperty("table", "users");
    expect(result.data?.content).toHaveProperty("primaryKey", "id");
  });

  test("should create a new row", async () => {
    const result = await afs.write("/users/new", {
      content: { name: "NewUser", email: "new@example.com" },
    });

    expect(result.data).toBeDefined();
    expect(result.data.content).toHaveProperty("name", "NewUser");
  });

  test("should update an existing row", async () => {
    const result = await afs.write("/users/1", {
      content: { name: "UpdatedTest" },
    });

    expect(result.data).toBeDefined();
    expect(result.data.content).toHaveProperty("name", "UpdatedTest");
  });

  test("should delete a row", async () => {
    // First create a row to delete
    const createResult = await afs.write("/users/new", {
      content: { name: "ToDelete", email: "delete@example.com" },
    });
    const pk = createResult.data.content.id;

    const result = await afs.delete(`/users/${pk}`);

    expect(result.message).toContain("Deleted");
  });

  test("should list available actions", async () => {
    const result = await afs.list("/users/1/@actions");

    expect(result.data.length).toBeGreaterThan(0);
    const actionNames = result.data.map((e) => e.summary);
    expect(actionNames).toContain("validate");
    expect(actionNames).toContain("duplicate");
  });
});
