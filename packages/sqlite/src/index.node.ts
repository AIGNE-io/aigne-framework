import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import type { InitDatabaseOptions } from "./index.js";

export async function initDatabase({
  url = ":memory:",
  wal = false,
}: InitDatabaseOptions = {}): Promise<LibSQLDatabase> {
  if (wal) {
    const client = createClient({ url });
    await client.execute("PRAGMA journal_mode=WAL;");
    return drizzle(client);
  }

  return drizzle(url);
}
