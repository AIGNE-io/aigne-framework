import type { AFSModule } from "@aigne/afs";
import { sql } from "@aigne/sqlite";
import { componentsTableName } from "../models/components.js";
import type { AFSStorageMigrations } from "../type.js";

export const addComponentsTable: AFSStorageMigrations = {
  hash: "006-add-components-table",
  sql: (module: AFSModule) => {
    const componentsTable = componentsTableName(module);

    return [
      sql`\
CREATE TABLE IF NOT EXISTS ${sql.identifier(componentsTable)} (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  "path" TEXT NOT NULL,
  "sessionId" TEXT,
  "userId" TEXT,
  "agentId" TEXT,
  "summary" TEXT,
  "metadata" JSON,
  "linkTo" TEXT,
  "content" JSON,
  "componentId" TEXT NOT NULL,
  "componentName" TEXT NOT NULL,
  "props" JSON NOT NULL,
  "state" JSON NOT NULL
)
`,
      // Add index for fast sessionId queries
      sql`CREATE INDEX IF NOT EXISTS "idx_components_session_created" ON ${sql.identifier(componentsTable)} ("sessionId", "createdAt" DESC)`,
      // Add index for fast componentName queries
      sql`CREATE INDEX IF NOT EXISTS "idx_components_name_created" ON ${sql.identifier(componentsTable)} ("componentName", "createdAt" DESC)`,
      // Add index for fast componentId queries
      sql`CREATE INDEX IF NOT EXISTS "idx_components_id_created" ON ${sql.identifier(componentsTable)} ("componentId", "createdAt" DESC)`,
    ];
  },
};
