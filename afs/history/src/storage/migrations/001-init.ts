import type { AFSModule } from "@aigne/afs";
import { sql } from "@aigne/sqlite";
import { entriesTableName } from "../models/entries.js";
import type { AFSStorageMigrations } from "../type.js";

export const init: AFSStorageMigrations = {
  hash: "001-init",
  sql: (module: AFSModule) => [
    sql`\
CREATE TABLE ${sql.identifier(entriesTableName(module))} (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  "path" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT,
  "summary" TEXT,
  "metadata" JSON,
  "linkTo" TEXT,
  "content" JSON,
  UNIQUE (path)
)
`,
  ],
};
