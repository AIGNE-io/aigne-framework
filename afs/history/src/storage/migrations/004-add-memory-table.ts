import type { AFSModule } from "@aigne/afs";
import { sql } from "@aigne/sqlite";
import { memoryTableName } from "../models/memory.js";
import type { AFSStorageMigrations } from "../type.js";

export const addMemoryTable: AFSStorageMigrations = {
  hash: "004-add-memory-table",
  sql: (module: AFSModule) => [
    sql`\
CREATE TABLE IF NOT EXISTS ${sql.identifier(memoryTableName(module))} (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  "path" TEXT NOT NULL,
  "sessionId" TEXT,
  "userId" TEXT,
  "agentId" TEXT,
  "metadata" JSON,
  "content" JSON
)
`,
  ],
};
