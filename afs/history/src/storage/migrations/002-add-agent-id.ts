import type { AFSModule } from "@aigne/afs";
import { sql } from "@aigne/sqlite";
import { entriesTableName } from "../models/entries.js";
import type { AFSStorageMigrations } from "../type.js";

export const addAgentId: AFSStorageMigrations = {
  hash: "002-add-agent-id",
  sql: (module: AFSModule) => [
    sql`\
ALTER TABLE ${sql.identifier(entriesTableName(module))} ADD COLUMN "agentId" TEXT;
`,
  ],
};
