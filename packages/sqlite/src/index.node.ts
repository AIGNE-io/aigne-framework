import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import type { SQLiteSession } from "drizzle-orm/sqlite-core";
import type { InitDatabaseOptions } from "./index.js";
import { withRetry } from "./retry.js";

export * from "./reexport.js";

export async function initDatabase({
  url = ":memory:",
  wal = false,
  walAutocheckpoint = 5000,
}: InitDatabaseOptions & { walAutocheckpoint?: number } = {}): Promise<
  LibSQLDatabase & { vacuum?: () => Promise<void> }
> {
  let db: LibSQLDatabase & { clean?: () => Promise<void> };
  let client: ReturnType<typeof createClient> | undefined;

  if (/^file:.*/.test(url)) {
    const path = url.replace(/^file:(\/\/)?/, "");
    await mkdir(dirname(path), { recursive: true });
  }

  if (wal) {
    client = createClient({ url });
    await client.execute(`\
PRAGMA journal_mode = WAL;
PRAGMA synchronous = normal;
PRAGMA wal_autocheckpoint = ${walAutocheckpoint};
PRAGMA busy_timeout = 5000;
`);

    try {
      await client.execute(`PRAGMA auto_vacuum = FULL;`);
      await client.execute(`VACUUM;`);
    } catch (e) {
      console.warn("auto_vacuum or VACUUM failed", e);
    }

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

  db.clean = async () => {
    if (client && typeof client.execute === "function") {
      try {
        await client.execute("PRAGMA wal_checkpoint(TRUNCATE);");
        await client.execute(`VACUUM;`);
      } catch (e) {
        console.error("checkpointWal failed", e);
      }
    }
  };

  return db as LibSQLDatabase;
}
