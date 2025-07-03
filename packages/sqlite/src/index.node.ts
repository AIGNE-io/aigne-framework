import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import type { InitDatabaseOptions } from "./index.js";

export async function initDatabase({
  url = ":memory:",
}: InitDatabaseOptions = {}): Promise<LibSQLDatabase> {
  return drizzle(url);
}
