import type { AFSModule } from "@aigne/afs";
import { sql } from "@aigne/sqlite";
import { compactTableName } from "../models/compact.js";
import type { AFSStorageMigrations } from "../type.js";

export const addCompactTable: AFSStorageMigrations = {
  hash: "003-add-compact-table",
  sql: (module: AFSModule) => [
    sql`\
CREATE TABLE IF NOT EXISTS ${sql.identifier(compactTableName(module))} (
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
