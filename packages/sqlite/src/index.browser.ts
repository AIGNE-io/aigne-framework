import { type SqliteRemoteDatabase, drizzle } from "drizzle-orm/sqlite-proxy";
// @ts-ignore sqlocal does not support commonjs, but we can use it in the browser with ESM module
import { SQLocalDrizzle } from "sqlocal/drizzle";
import type { InitDatabaseOptions } from "./index.js";

export async function initDatabase({
  url = ":memory:",
}: InitDatabaseOptions = {}): Promise<SqliteRemoteDatabase> {
  const init = Promise.withResolvers<void>();

  const { driver } = new SQLocalDrizzle({
    databasePath: url,
    onConnect: () => init.resolve(),
  });

  await init.promise;

  const db = drizzle(driver);

  return db;
}
