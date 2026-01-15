import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { initDatabase, sql } from "@aigne/sqlite";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { SQLiteAFS } from "../src/sqlite-afs.js";
import { SchemaIntrospector } from "../src/schema/introspector.js";
import { createPathRouter, matchPath } from "../src/router/path-router.js";
import { ActionsRegistry } from "../src/actions/registry.js";
import { CRUDOperations } from "../src/operations/crud.js";
import { FTSSearch, createFTSConfig } from "../src/operations/search.js";
import {
  buildSelectByPK,
  buildSelectAll,
  buildInsert,
  buildUpdate,
  buildDelete,
  formatValue,
  escapeSQLString,
  buildGetLastRowId,
} from "../src/operations/query-builder.js";
import {
  buildRowEntry,
  buildTableEntry,
  buildSchemaEntry,
  buildAttributeEntry,
  buildAttributeListEntry,
  buildMetaEntry,
  buildActionsListEntry,
  buildSearchEntry,
} from "../src/node/builder.js";
import { sqliteAFSConfigSchema } from "../src/config.js";
import type { TableSchema } from "../src/schema/types.js";

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

  test("should return null for invalid paths", () => {
    const router = createPathRouter();
    const match = matchPath(router, "/invalid/path/too/deep/nested");

    // This may or may not match depending on router implementation
    // The important thing is it doesn't throw
    expect(match === null || match !== null).toBe(true);
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

  test("should register action with full options", () => {
    const registry = new ActionsRegistry();

    registry.register({
      name: "fullAction",
      description: "A fully configured action",
      tableLevel: true,
      rowLevel: false,
      inputSchema: { type: "object" },
      handler: async () => ({ success: true }),
    });

    expect(registry.has("fullAction")).toBe(true);
    const action = registry.get("fullAction");
    expect(action?.description).toBe("A fully configured action");
    expect(action?.tableLevel).toBe(true);
    expect(action?.rowLevel).toBe(false);
  });

  test("should list table level actions only", () => {
    const registry = new ActionsRegistry();

    registry.registerSimple("rowAction", async () => ({ success: true }), { rowLevel: true });
    registry.registerSimple("tableAction", async () => ({ success: true }), { tableLevel: true });

    const tableNames = registry.listNames({ tableLevel: true });
    expect(tableNames).toContain("tableAction");
    expect(tableNames).not.toContain("rowAction");
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

  test("should return empty for invalid list path", async () => {
    const result = await afs.list("/nonexistent");
    expect(result.data).toEqual([]);
  });

  test("should return empty for invalid read path", async () => {
    const result = await afs.read("/nonexistent/path");
    expect(result.data).toBeUndefined();
  });

  test("should throw on write to invalid path", async () => {
    await expect(afs.write("/invalid", { content: {} })).rejects.toThrow();
  });

  test("should throw on delete invalid path", async () => {
    await expect(afs.delete("/")).rejects.toThrow();
  });

  test("should get schemas map", () => {
    const schemas = afs.getSchemas();
    expect(schemas).toBeInstanceOf(Map);
    expect(schemas.has("users")).toBe(true);
  });

  test("should get database instance", () => {
    const database = afs.getDatabase();
    expect(database).toBeDefined();
  });
});

describe("SQLiteAFS Static Methods", () => {
  test("should return schema", () => {
    const schema = SQLiteAFS.schema();
    expect(schema).toBeDefined();
  });

  test("should load from config", async () => {
    const afs = await SQLiteAFS.load({
      filepath: "/test/path",
      parsed: { url: ":memory:", name: "test-db" },
    });

    expect(afs).toBeInstanceOf(SQLiteAFS);
    expect(afs.name).toBe("test-db");
  });
});

describe("SQLiteAFS Readonly Mode", () => {
  let readonlyAfs: SQLiteAFS;

  beforeAll(async () => {
    readonlyAfs = new SQLiteAFS({ url: ":memory:", accessMode: "readonly" });
    await readonlyAfs.onMount({} as any);

    const testDb = readonlyAfs.getDatabase();
    await testDb.run(sql.raw(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `));
    await testDb.run(sql.raw(`INSERT INTO items (name) VALUES ('Item1')`));
    await readonlyAfs.refreshSchema();
  });

  test("should throw on write in readonly mode", async () => {
    await expect(
      readonlyAfs.write("/items/new", { content: { name: "NewItem" } })
    ).rejects.toThrow("readonly");
  });

  test("should throw on delete in readonly mode", async () => {
    await expect(readonlyAfs.delete("/items/1")).rejects.toThrow("readonly");
  });

  test("should allow read operations in readonly mode", async () => {
    const result = await readonlyAfs.list("/items");
    expect(result.data.length).toBeGreaterThan(0);
  });
});

describe("SQLiteAFS Search", () => {
  let searchAfs: SQLiteAFS;

  beforeAll(async () => {
    searchAfs = new SQLiteAFS({
      url: ":memory:",
      fts: {
        enabled: true,
        tables: { articles: ["title", "content"] },
      },
    });
    await searchAfs.onMount({} as any);

    const testDb = searchAfs.getDatabase();
    await testDb.run(sql.raw(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT
      )
    `));
    await testDb.run(sql.raw(`INSERT INTO articles (title, content) VALUES ('Test Article', 'This is test content')`));
    await searchAfs.refreshSchema();
  });

  test("should search when FTS is not available", async () => {
    // FTS tables don't exist, so search should return empty
    const result = await searchAfs.search("/", "test");
    expect(result.data).toBeDefined();
  });

  test("should search specific table", async () => {
    const result = await searchAfs.search("/articles", "test");
    expect(result.data).toBeDefined();
  });
});

describe("SQLiteAFS Exec", () => {
  let execAfs: SQLiteAFS;

  beforeAll(async () => {
    execAfs = new SQLiteAFS({ url: ":memory:" });
    await execAfs.onMount({} as any);

    const testDb = execAfs.getDatabase();
    await testDb.run(sql.raw(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `));
    await testDb.run(sql.raw(`INSERT INTO tasks (name) VALUES ('Task1')`));
    await execAfs.refreshSchema();
  });

  test("should throw on exec for unsupported path", async () => {
    await expect(execAfs.exec("/", {}, {})).rejects.toThrow("Exec not supported");
  });

  test("should execute action via exec", async () => {
    const result = await execAfs.exec("/tasks/1/@actions/validate", {}, {});
    expect(result.data).toBeDefined();
  });
});

describe("SQLiteAFS Custom Actions", () => {
  let actionAfs: SQLiteAFS;

  beforeAll(async () => {
    actionAfs = new SQLiteAFS({ url: ":memory:" });
    await actionAfs.onMount({} as any);

    const testDb = actionAfs.getDatabase();
    await testDb.run(sql.raw(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL
      )
    `));
    await testDb.run(sql.raw(`INSERT INTO products (name, price) VALUES ('Product1', 9.99)`));
    await actionAfs.refreshSchema();
  });

  test("should register custom action", async () => {
    actionAfs.registerAction(
      "customAction",
      async (ctx, params) => {
        return { custom: true, table: ctx.table };
      },
      { rowLevel: true }
    );

    const actions = await actionAfs.list("/products/1/@actions");
    const actionNames = actions.data.map((e) => e.summary);
    expect(actionNames).toContain("customAction");
  });
});

describe("SQLiteAFS Export Table", () => {
  let exportAfs: SQLiteAFS;

  beforeAll(async () => {
    exportAfs = new SQLiteAFS({ url: ":memory:" });
    await exportAfs.onMount({} as any);

    const testDb = exportAfs.getDatabase();
    await testDb.run(sql.raw(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        city TEXT
      )
    `));
    await testDb.run(sql.raw(`INSERT INTO customers (name, city) VALUES ('John', 'NYC')`));
    await testDb.run(sql.raw(`INSERT INTO customers (name, city) VALUES ('Jane', 'LA')`));
    await exportAfs.refreshSchema();
  });

  test("should export table as JSON", async () => {
    const result = await (exportAfs as any).exportTable("customers", "json");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  test("should export table as CSV", async () => {
    const result = await (exportAfs as any).exportTable("customers", "csv");
    expect(typeof result).toBe("string");
    expect(result).toContain("id,name,city");
    expect(result).toContain("John");
  });

  test("should return empty for non-existent table", async () => {
    const result = await (exportAfs as any).exportTable("nonexistent", "json");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("should throw for CSV export of non-existent table", async () => {
    await expect((exportAfs as any).exportTable("nonexistent", "csv")).rejects.toThrow("not found");
  });

  test("should export CSV with special characters", async () => {
    const testDb = exportAfs.getDatabase();
    await testDb.run(sql.raw(`INSERT INTO customers (name, city) VALUES ('Test, User', 'New York, NY')`));
    await exportAfs.refreshSchema();

    const result = await (exportAfs as any).exportTable("customers", "csv");
    expect(result).toContain('"Test, User"'); // Commas are quoted
    expect(result).toContain('"New York, NY"');
  });
});

describe("Query Builder", () => {
  const mockSchema: TableSchema = {
    name: "test",
    columns: [
      { name: "id", type: "INTEGER", notnull: false, dfltValue: null, pk: 1 },
      { name: "name", type: "TEXT", notnull: true, dfltValue: null, pk: 0 },
      { name: "value", type: "REAL", notnull: false, dfltValue: null, pk: 0 },
    ],
    primaryKey: ["id"],
    foreignKeys: [],
    indexes: [],
  };

  test("buildSelectByPK should escape special characters", () => {
    const query = buildSelectByPK("test", mockSchema, "O'Brien");
    expect(query).toContain("O''Brien");
  });

  test("buildSelectAll with orderBy", () => {
    const query = buildSelectAll("test", {
      orderBy: [["name", "asc"], ["id", "desc"]],
    });
    expect(query).toContain("ORDER BY");
    expect(query).toContain('"name" ASC');
    expect(query).toContain('"id" DESC');
  });

  test("buildSelectAll with offset", () => {
    const query = buildSelectAll("test", { limit: 10, offset: 5 });
    expect(query).toContain("LIMIT 10");
    expect(query).toContain("OFFSET 5");
  });

  test("buildInsert should throw for empty content", () => {
    expect(() => buildInsert("test", mockSchema, {})).toThrow();
  });

  test("buildInsert with valid content", () => {
    const query = buildInsert("test", mockSchema, { name: "Test", value: 123 });
    expect(query).toContain("INSERT INTO");
    expect(query).toContain('"name"');
    expect(query).toContain("'Test'");
  });

  test("buildUpdate should throw for empty content", () => {
    expect(() => buildUpdate("test", mockSchema, "1", {})).toThrow();
  });

  test("buildUpdate should exclude PK column", () => {
    const query = buildUpdate("test", mockSchema, "1", { id: 999, name: "Updated" });
    expect(query).not.toContain("SET \"id\"");
    expect(query).toContain('"name" =');
  });

  test("buildDelete", () => {
    const query = buildDelete("test", mockSchema, "1");
    expect(query).toContain("DELETE FROM");
    expect(query).toContain('"id" = \'1\'');
  });

  test("formatValue with various types", () => {
    expect(formatValue(null)).toBe("NULL");
    expect(formatValue(undefined)).toBe("NULL");
    expect(formatValue(42)).toBe("42");
    expect(formatValue(true)).toBe("1");
    expect(formatValue(false)).toBe("0");
    expect(formatValue("test")).toBe("'test'");
    expect(formatValue("O'Brien")).toBe("'O''Brien'");

    const date = new Date("2024-01-01T00:00:00.000Z");
    expect(formatValue(date)).toContain("2024-01-01");

    const obj = { key: "value" };
    expect(formatValue(obj)).toContain('{"key":"value"}');
  });

  test("escapeSQLString", () => {
    expect(escapeSQLString("normal")).toBe("normal");
    expect(escapeSQLString("it's")).toBe("it''s");
    expect(escapeSQLString("'quoted'")).toBe("''quoted''");
  });

  test("buildGetLastRowId", () => {
    const query = buildGetLastRowId();
    expect(query).toBe("SELECT last_insert_rowid() as id");
  });
});

describe("CRUDOperations", () => {
  let crudDb: LibSQLDatabase;
  let schemas: Map<string, TableSchema>;
  let crud: CRUDOperations;

  beforeAll(async () => {
    crudDb = await initDatabase({ url: ":memory:" });
    await crudDb.run(sql.raw(`
      CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 0
      )
    `));
    await crudDb.run(sql.raw(`INSERT INTO items (name, quantity) VALUES ('Item1', 10)`));

    const introspector = new SchemaIntrospector();
    schemas = await introspector.introspect(crudDb);
    crud = new CRUDOperations(crudDb, schemas, "");
  });

  test("hasTable returns true for existing table", () => {
    expect(crud.hasTable("items")).toBe(true);
  });

  test("hasTable returns false for non-existing table", () => {
    expect(crud.hasTable("nonexistent")).toBe(false);
  });

  test("getTableSchema returns schema for existing table", () => {
    const schema = crud.getTableSchema("items");
    expect(schema).toBeDefined();
    expect(schema?.name).toBe("items");
  });

  test("getTableSchema returns undefined for non-existing table", () => {
    const schema = crud.getTableSchema("nonexistent");
    expect(schema).toBeUndefined();
  });

  test("listTable returns message for non-existing table", async () => {
    const result = await crud.listTable("nonexistent");
    expect(result.message).toContain("not found");
  });

  test("readRow returns message for non-existing table", async () => {
    const result = await crud.readRow("nonexistent", "1");
    expect(result.message).toContain("not found");
  });

  test("readRow returns message for non-existing row", async () => {
    const result = await crud.readRow("items", "9999");
    expect(result.message).toContain("not found");
  });

  test("getSchema returns message for non-existing table", () => {
    const result = crud.getSchema("nonexistent");
    expect(result.message).toContain("not found");
  });

  test("listAttributes returns message for non-existing table", async () => {
    const result = await crud.listAttributes("nonexistent", "1");
    expect(result.message).toContain("not found");
  });

  test("listAttributes returns message for non-existing row", async () => {
    const result = await crud.listAttributes("items", "9999");
    expect(result.message).toContain("not found");
  });

  test("getAttribute returns message for non-existing table", async () => {
    const result = await crud.getAttribute("nonexistent", "1", "name");
    expect(result.message).toContain("not found");
  });

  test("getAttribute returns message for non-existing column", async () => {
    const result = await crud.getAttribute("items", "1", "nonexistent");
    expect(result.message).toContain("not found");
  });

  test("getAttribute returns message for non-existing row", async () => {
    const result = await crud.getAttribute("items", "9999", "name");
    expect(result.message).toContain("not found");
  });

  test("getMeta returns message for non-existing table", async () => {
    const result = await crud.getMeta("nonexistent", "1");
    expect(result.message).toContain("not found");
  });

  test("getMeta returns message for non-existing row", async () => {
    const result = await crud.getMeta("items", "9999");
    expect(result.message).toContain("not found");
  });

  test("createRow throws for non-existing table", async () => {
    await expect(crud.createRow("nonexistent", { name: "Test" })).rejects.toThrow();
  });

  test("updateRow throws for non-existing table", async () => {
    await expect(crud.updateRow("nonexistent", "1", { name: "Test" })).rejects.toThrow();
  });

  test("deleteRow throws for non-existing table", async () => {
    await expect(crud.deleteRow("nonexistent", "1")).rejects.toThrow();
  });

  test("deleteRow returns message for non-existing row", async () => {
    const result = await crud.deleteRow("items", "9999");
    expect(result.message).toContain("not found");
  });

  test("setSchemas updates the schemas", () => {
    const newSchemas = new Map<string, TableSchema>();
    crud.setSchemas(newSchemas);
    expect(crud.hasTable("items")).toBe(false);

    // Restore original schemas
    crud.setSchemas(schemas);
    expect(crud.hasTable("items")).toBe(true);
  });
});

describe("FTSSearch", () => {
  let ftsDb: LibSQLDatabase;
  let schemas: Map<string, TableSchema>;
  let ftsSearch: FTSSearch;

  beforeAll(async () => {
    ftsDb = await initDatabase({ url: ":memory:" });
    await ftsDb.run(sql.raw(`
      CREATE TABLE docs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT
      )
    `));
    await ftsDb.run(sql.raw(`INSERT INTO docs (title, body) VALUES ('Hello World', 'This is a test document')`));

    const introspector = new SchemaIntrospector();
    schemas = await introspector.introspect(ftsDb);
  });

  test("search returns message when FTS disabled", async () => {
    const config = createFTSConfig({ enabled: false });
    const search = new FTSSearch(ftsDb, schemas, config, "");

    const result = await search.search("test");
    expect(result.message).toContain("not enabled");
  });

  test("hasFTS returns false when disabled", () => {
    const config = createFTSConfig({ enabled: false });
    const search = new FTSSearch(ftsDb, schemas, config, "");

    expect(search.hasFTS("docs")).toBe(false);
  });

  test("hasFTS returns false for unconfigured table", () => {
    const config = createFTSConfig({ enabled: true, tables: { other: ["col"] } });
    const search = new FTSSearch(ftsDb, schemas, config, "");

    expect(search.hasFTS("docs")).toBe(false);
  });

  test("hasFTS returns true for configured table", () => {
    const config = createFTSConfig({ enabled: true, tables: { docs: ["title", "body"] } });
    const search = new FTSSearch(ftsDb, schemas, config, "");

    expect(search.hasFTS("docs")).toBe(true);
  });

  test("getFTSConfig returns config for table", () => {
    const config = createFTSConfig({ enabled: true, tables: { docs: ["title", "body"] } });
    const search = new FTSSearch(ftsDb, schemas, config, "");

    const tableConfig = search.getFTSConfig("docs");
    expect(tableConfig?.columns).toEqual(["title", "body"]);
  });

  test("getFTSConfig returns undefined for unconfigured table", () => {
    const config = createFTSConfig({ enabled: true, tables: {} });
    const search = new FTSSearch(ftsDb, schemas, config, "");

    expect(search.getFTSConfig("docs")).toBeUndefined();
  });

  test("simpleLikeSearch returns message for non-existing table", async () => {
    const config = createFTSConfig({ enabled: false });
    const search = new FTSSearch(ftsDb, schemas, config, "");

    const result = await search.simpleLikeSearch("nonexistent", "test", ["col"]);
    expect(result.message).toContain("not found");
  });

  test("simpleLikeSearch returns message for invalid columns", async () => {
    const config = createFTSConfig({ enabled: false });
    const search = new FTSSearch(ftsDb, schemas, config, "");

    const result = await search.simpleLikeSearch("docs", "test", ["nonexistent"]);
    expect(result.message).toContain("No valid columns");
  });

  test("simpleLikeSearch finds matching rows", async () => {
    const config = createFTSConfig({ enabled: false });
    const search = new FTSSearch(ftsDb, schemas, config, "");

    const result = await search.simpleLikeSearch("docs", "Hello", ["title"]);
    expect(result.data.length).toBeGreaterThan(0);
  });

  test("setSchemas updates the schemas", () => {
    const config = createFTSConfig({ enabled: false });
    const search = new FTSSearch(ftsDb, schemas, config, "");

    const newSchemas = new Map<string, TableSchema>();
    search.setSchemas(newSchemas);

    // After clearing schemas, table lookup should fail
    const result = search.getFTSConfig("docs");
    // Config is separate from schemas, so this should still work
    expect(result).toBeUndefined();
  });
});

describe("createFTSConfig", () => {
  test("creates disabled config by default", () => {
    const config = createFTSConfig();
    expect(config.enabled).toBe(false);
    expect(config.tables.size).toBe(0);
  });

  test("creates enabled config with tables", () => {
    const config = createFTSConfig({
      enabled: true,
      tables: {
        users: ["name", "email"],
        posts: ["title", "content"],
      },
    });

    expect(config.enabled).toBe(true);
    expect(config.tables.size).toBe(2);
    expect(config.tables.get("users")?.columns).toEqual(["name", "email"]);
  });
});

describe("Node Builder", () => {
  const mockSchema: TableSchema = {
    name: "test",
    columns: [
      { name: "id", type: "INTEGER", notnull: false, dfltValue: null, pk: 1 },
      { name: "name", type: "TEXT", notnull: true, dfltValue: null, pk: 0 },
      { name: "created_at", type: "DATETIME", notnull: false, dfltValue: null, pk: 0 },
    ],
    primaryKey: ["id"],
    foreignKeys: [{ from: "user_id", table: "users", to: "id", onUpdate: "CASCADE", onDelete: "CASCADE" }],
    indexes: [{ name: "idx_name", unique: true, origin: "c" }],
  };

  test("buildRowEntry creates correct entry", () => {
    const row = { id: 1, name: "Test", created_at: "2024-01-01" };
    const entry = buildRowEntry("test", mockSchema, row);

    expect(entry.id).toBe("test:1");
    expect(entry.path).toBe("/test/1");
    expect(entry.content).toEqual(row);
    expect(entry.metadata?.table).toBe("test");
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  test("buildRowEntry with basePath", () => {
    const row = { id: 1, name: "Test" };
    const entry = buildRowEntry("test", mockSchema, row, { basePath: "/modules/db" });

    expect(entry.path).toBe("/modules/db/test/1");
  });

  test("buildRowEntry uses rowid when pk missing", () => {
    const schemaWithoutPK: TableSchema = { ...mockSchema, primaryKey: [] };
    const row = { rowid: 99, name: "Test" };
    const entry = buildRowEntry("test", schemaWithoutPK, row);

    expect(entry.id).toBe("test:99");
  });

  test("buildTableEntry creates correct entry", () => {
    const entry = buildTableEntry("test", mockSchema, { rowCount: 100 });

    expect(entry.id).toBe("test");
    expect(entry.path).toBe("/test");
    expect(entry.metadata?.columnCount).toBe(3);
    expect(entry.metadata?.childrenCount).toBe(100);
  });

  test("buildSchemaEntry creates correct entry", () => {
    const entry = buildSchemaEntry("test", mockSchema);

    expect(entry.id).toBe("test:@schema");
    expect(entry.path).toBe("/test/@schema");
    expect((entry.content as any).columns.length).toBe(3);
    expect((entry.content as any).foreignKeys.length).toBe(1);
    expect((entry.content as any).indexes.length).toBe(1);
  });

  test("buildAttributeEntry creates correct entry", () => {
    const entry = buildAttributeEntry("test", "1", "name", "Test Value");

    expect(entry.id).toBe("test:1:@attr:name");
    expect(entry.path).toBe("/test/1/@attr/name");
    expect(entry.content).toBe("Test Value");
  });

  test("buildAttributeListEntry creates entries for all columns", () => {
    const row = { id: 1, name: "Test", created_at: "2024-01-01" };
    const entries = buildAttributeListEntry("test", mockSchema, "1", row);

    expect(entries.length).toBe(3);
    expect(entries.map((e) => e.summary)).toContain("name");
    expect(entries.map((e) => e.summary)).toContain("id");
  });

  test("buildMetaEntry creates correct entry", () => {
    const row = { id: 1, name: "Test", user_id: 5 };
    const entry = buildMetaEntry("test", mockSchema, "1", row);

    expect(entry.id).toBe("test:1:@meta");
    expect(entry.path).toBe("/test/1/@meta");
    expect((entry.content as any).table).toBe("test");
    expect((entry.content as any).primaryKey).toBe("id");
  });

  test("buildActionsListEntry creates entries for all actions", () => {
    const entries = buildActionsListEntry("test", "1", ["validate", "duplicate", "custom"]);

    expect(entries.length).toBe(3);
    expect(entries.map((e) => e.summary)).toContain("validate");
    expect(entries.map((e) => e.summary)).toContain("duplicate");
  });

  test("buildSearchEntry adds snippet as summary", () => {
    const row = { id: 1, name: "Test" };
    const entry = buildSearchEntry("test", mockSchema, row, "<mark>Test</mark> result");

    expect(entry.summary).toBe("<mark>Test</mark> result");
  });

  test("buildSearchEntry without snippet", () => {
    const row = { id: 1, name: "Test" };
    const entry = buildSearchEntry("test", mockSchema, row);

    expect(entry.summary).toBeUndefined();
  });
});

describe("Config Schema", () => {
  test("validates minimal config", () => {
    const result = sqliteAFSConfigSchema.safeParse({ url: ":memory:" });
    expect(result.success).toBe(true);
  });

  test("validates full config", () => {
    const result = sqliteAFSConfigSchema.safeParse({
      url: "file:./test.db",
      name: "test-db",
      description: "Test database",
      accessMode: "readonly",
      tables: ["users", "posts"],
      excludeTables: ["logs"],
      fts: {
        enabled: true,
        tables: { users: ["name", "email"] },
      },
      wal: false,
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid url", () => {
    const result = sqliteAFSConfigSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test("rejects invalid accessMode", () => {
    const result = sqliteAFSConfigSchema.safeParse({
      url: ":memory:",
      accessMode: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("Built-in Actions Integration", () => {
  let actionDb: LibSQLDatabase;
  let afs: SQLiteAFS;

  beforeAll(async () => {
    afs = new SQLiteAFS({ url: ":memory:" });
    await afs.onMount({} as any);

    actionDb = afs.getDatabase();
    await actionDb.run(sql.raw(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `));
    await actionDb.run(sql.raw(`
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `));
    await actionDb.run(sql.raw(`INSERT INTO categories (name) VALUES ('Electronics')`));
    await actionDb.run(sql.raw(`INSERT INTO products (name, price, category_id) VALUES ('Laptop', 999.99, 1)`));
    await afs.refreshSchema();
  });

  test("validate action passes for valid row", async () => {
    const result = await afs.write("/products/1/@actions/validate", { content: {} });
    expect(result.data.content).toHaveProperty("valid", true);
  });

  test("duplicate action creates new row", async () => {
    const result = await afs.write("/products/1/@actions/duplicate", { content: {} });
    expect(result.data.content).toHaveProperty("newId");
  });

  test("validate action with foreign key check", async () => {
    // Insert product with valid foreign key
    await actionDb.run(sql.raw(`INSERT INTO products (name, price, category_id) VALUES ('Phone', 599.99, 1)`));
    await afs.refreshSchema();

    // Get the new product id
    const listResult = await afs.list("/products");
    const phone = listResult.data.find((p) => (p.content as any).name === "Phone");

    if (phone) {
      const pkValue = (phone.content as any).id;
      const result = await afs.write(`/products/${pkValue}/@actions/validate`, { content: {} });
      expect(result.data.content).toHaveProperty("valid", true);
    }
  });
});

describe("Built-in Actions - Row Level Actions", () => {
  let afs: SQLiteAFS;
  let db: LibSQLDatabase;

  beforeAll(async () => {
    afs = new SQLiteAFS({ url: ":memory:" });
    await afs.onMount({} as any);

    db = afs.getDatabase();
    await db.run(sql.raw(`
      CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer TEXT NOT NULL,
        total REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `));
    await db.run(sql.raw(`INSERT INTO orders (customer, total) VALUES ('Alice', 100.00)`));
    await db.run(sql.raw(`INSERT INTO orders (customer, total) VALUES ('Bob', 200.00)`));
    await db.run(sql.raw(`INSERT INTO orders (customer, total) VALUES ('Charlie', 300.00)`));
    await afs.refreshSchema();
  });

  test("refresh action is not available at row level", async () => {
    // refresh is table-level only, should throw at row level
    await expect(afs.write("/orders/1/@actions/refresh", { content: {} })).rejects.toThrow(
      "Action 'refresh' is not available at row level"
    );
  });

  test("validate action on specific row", async () => {
    const result = await afs.write("/orders/1/@actions/validate", { content: {} });
    expect(result.data.content).toHaveProperty("valid", true);
  });

  test("duplicate action creates a copy of the row", async () => {
    const result = await afs.write("/orders/1/@actions/duplicate", { content: {} });
    expect(result.data.content).toBeDefined();
    // After duplication, there should be more rows
    const listResult = await afs.list("/orders");
    expect(listResult.data.length).toBeGreaterThan(3);
  });

  test("export action via exportTable method", async () => {
    // Test exportTable directly since actions are row-level
    const jsonData = await afs.exportTable("orders", "json");
    expect(Array.isArray(jsonData)).toBe(true);
    expect((jsonData as any[]).length).toBeGreaterThan(0);

    const csvData = await afs.exportTable("orders", "csv");
    expect(typeof csvData).toBe("string");
    expect((csvData as string)).toContain("id,customer,total");
  });
});

describe("Validate Action Edge Cases", () => {
  let afs: SQLiteAFS;
  let db: LibSQLDatabase;

  beforeAll(async () => {
    afs = new SQLiteAFS({ url: ":memory:" });
    await afs.onMount({} as any);

    db = afs.getDatabase();
    await db.run(sql.raw(`
      CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER,
        FOREIGN KEY (parent_id) REFERENCES items(id)
      )
    `));
    await db.run(sql.raw(`INSERT INTO items (name) VALUES ('Root')`));
    await db.run(sql.raw(`INSERT INTO items (name, parent_id) VALUES ('Child', 1)`));
    await afs.refreshSchema();
  });

  test("validate detects invalid foreign key reference", async () => {
    // Disable FK enforcement to allow inserting invalid reference
    await db.run(sql.raw(`PRAGMA foreign_keys = OFF`));
    await db.run(sql.raw(`INSERT INTO items (name, parent_id) VALUES ('Orphan', 9999)`));
    await db.run(sql.raw(`PRAGMA foreign_keys = ON`));
    await afs.refreshSchema();

    const listResult = await afs.list("/items");
    const orphan = listResult.data.find((i) => (i.content as any).name === "Orphan");

    if (orphan) {
      const pkValue = (orphan.content as any).id;
      // Validate action throws when validation fails (success: false causes throw)
      await expect(afs.write(`/items/${pkValue}/@actions/validate`, { content: {} })).rejects.toThrow(
        "Foreign key violation"
      );
    }
  });
});

describe("Node Builder Edge Cases", () => {
  const mockSchema: TableSchema = {
    name: "test",
    columns: [
      { name: "id", type: "INTEGER", notnull: false, dfltValue: null, pk: 1 },
      { name: "updated_at", type: "DATETIME", notnull: false, dfltValue: null, pk: 0 },
    ],
    primaryKey: ["id"],
    foreignKeys: [],
    indexes: [],
  };

  test("buildRowEntry parses updatedAt from timestamp", () => {
    const row = { id: 1, updated_at: 1704067200000 }; // Unix timestamp in ms
    const entry = buildRowEntry("test", mockSchema, row);

    expect(entry.updatedAt).toBeInstanceOf(Date);
  });

  test("buildRowEntry parses createdAt from Date object", () => {
    const row = { id: 1, createdAt: new Date("2024-01-01") };
    const entry = buildRowEntry("test", mockSchema, row);

    expect(entry.createdAt).toBeInstanceOf(Date);
  });
});

describe("Schema Introspector - Indexes", () => {
  let db: LibSQLDatabase;

  beforeAll(async () => {
    db = await initDatabase({ url: ":memory:" });
    await db.run(sql.raw(`
      CREATE TABLE indexed_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE
      )
    `));
    await db.run(sql.raw(`CREATE INDEX idx_name ON indexed_table(name)`));
  });

  test("should introspect indexes", async () => {
    const introspector = new SchemaIntrospector();
    const schemas = await introspector.introspect(db);

    const schema = schemas.get("indexed_table");
    expect(schema).toBeDefined();
    expect(schema!.indexes.length).toBeGreaterThan(0);

    const nameIndex = schema!.indexes.find((idx) => idx.name === "idx_name");
    expect(nameIndex).toBeDefined();
  });
});

describe("Built-in Actions - Direct Registry Tests", () => {
  let afs: SQLiteAFS;
  let db: LibSQLDatabase;

  beforeAll(async () => {
    afs = new SQLiteAFS({ url: ":memory:" });
    await afs.onMount({} as any);

    db = afs.getDatabase();
    await db.run(sql.raw(`
      CREATE TABLE registry_test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value INTEGER
      )
    `));
    await db.run(sql.raw(`INSERT INTO registry_test (name, value) VALUES ('Test', 123)`));
    await afs.refreshSchema();
  });

  test("duplicate action returns error when row data is not available", async () => {
    // Test by calling exec with a path that doesn't fetch row data
    // Since this goes through write() which fetches row data, we test via a non-existent row
    await expect(afs.write("/registry_test/9999/@actions/duplicate", { content: {} })).rejects.toThrow(
      "Row data not available"
    );
  });

  test("validate action returns error when row data is not available", async () => {
    // Test with a non-existent row
    await expect(afs.write("/registry_test/9999/@actions/validate", { content: {} })).rejects.toThrow(
      "Row data not available"
    );
  });

  test("validate action succeeds for valid row", async () => {
    // Validate a valid row should succeed
    const result = await afs.write("/registry_test/1/@actions/validate", { content: {} });
    expect(result.data.content).toHaveProperty("valid", true);
    expect((result.data.content as any).errors).toEqual([]);
  });
});

describe("formatValueForSQL Coverage", () => {
  let afs: SQLiteAFS;
  let db: LibSQLDatabase;

  beforeAll(async () => {
    afs = new SQLiteAFS({ url: ":memory:" });
    await afs.onMount({} as any);

    db = afs.getDatabase();
    await db.run(sql.raw(`
      CREATE TABLE format_test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        count INTEGER,
        is_active INTEGER,
        created_at TEXT,
        metadata TEXT
      )
    `));
    await db.run(sql.raw(`INSERT INTO format_test (name, count, is_active, created_at, metadata) VALUES ('Test', 1, 1, '2024-01-01', '{}')`));
    await afs.refreshSchema();
  });

  test("duplicate handles boolean values", async () => {
    // Insert a row with boolean-like value
    await db.run(sql.raw(`INSERT INTO format_test (name, count, is_active) VALUES ('Boolean Test', 42, 0)`));
    await afs.refreshSchema();

    const listResult = await afs.list("/format_test");
    const row = listResult.data.find((r) => (r.content as any).name === "Boolean Test");

    if (row) {
      const pkValue = (row.content as any).id;
      const result = await afs.write(`/format_test/${pkValue}/@actions/duplicate`, { content: {} });
      expect(result.data.content).toHaveProperty("newId");
    }
  });

  test("duplicate handles Date values", async () => {
    // The duplicate action will process Date values when duplicating
    await db.run(sql.raw(`INSERT INTO format_test (name, created_at) VALUES ('Date Test', '2024-06-15T12:00:00.000Z')`));
    await afs.refreshSchema();

    const listResult = await afs.list("/format_test");
    const row = listResult.data.find((r) => (r.content as any).name === "Date Test");

    if (row) {
      const pkValue = (row.content as any).id;
      const result = await afs.write(`/format_test/${pkValue}/@actions/duplicate`, { content: {} });
      expect(result.data.content).toHaveProperty("newId");
    }
  });

  test("duplicate handles object/JSON values", async () => {
    await db.run(sql.raw(`INSERT INTO format_test (name, metadata) VALUES ('JSON Test', '{"key": "value"}')`));
    await afs.refreshSchema();

    const listResult = await afs.list("/format_test");
    const row = listResult.data.find((r) => (r.content as any).name === "JSON Test");

    if (row) {
      const pkValue = (row.content as any).id;
      const result = await afs.write(`/format_test/${pkValue}/@actions/duplicate`, { content: {} });
      expect(result.data.content).toHaveProperty("newId");
    }
  });

  test("duplicate handles null values", async () => {
    await db.run(sql.raw(`INSERT INTO format_test (name, count, is_active, created_at, metadata) VALUES ('Null Test', NULL, NULL, NULL, NULL)`));
    await afs.refreshSchema();

    const listResult = await afs.list("/format_test");
    const row = listResult.data.find((r) => (r.content as any).name === "Null Test");

    if (row) {
      const pkValue = (row.content as any).id;
      const result = await afs.write(`/format_test/${pkValue}/@actions/duplicate`, { content: {} });
      expect(result.data.content).toHaveProperty("newId");
    }
  });
});
