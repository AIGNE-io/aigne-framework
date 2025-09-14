import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import type { SQLiteSession } from "drizzle-orm/sqlite-core";
import type { InitDatabaseOptions } from "./index.js";
import { withRetry } from "./retry.js";

export * from "./reexport.js";

export async function initDatabase({
  url = ":memory:",
  wal = false,
}: InitDatabaseOptions = {}): Promise<LibSQLDatabase> {
  let db: LibSQLDatabase;

  if (wal) {
    const client = createClient({ url });
    await client.execute(`\
PRAGMA journal_mode = WAL;
PRAGMA synchronous = normal;
PRAGMA wal_autocheckpoint = 5000;
PRAGMA busy_timeout = 5000;
`);
    db = drizzle(client);
  } else {
    db = drizzle(url);
  }

  if ("session" in db && db.session && typeof db.session === "object") {
    db.session = withRetry(db.session as SQLiteSession<any, any, any, any>, [
      "all",
      "get",
      "run",
      "values",
      "count",
    ]);
  }

  return db;
}
