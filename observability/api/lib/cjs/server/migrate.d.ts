import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
export declare function migrate(db: LibSQLDatabase | SqliteRemoteDatabase): Promise<void>;
