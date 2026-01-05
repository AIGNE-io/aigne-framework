import type { AFSModule } from "@aigne/afs";
import { datetime, json, sqliteTable, text } from "@aigne/sqlite";
import { v7 } from "@aigne/uuid";

export const memoryTableName = (module: AFSModule): string => `Entries_${module.name}_memory`;

export const memoryTable = (module: AFSModule) =>
  sqliteTable(memoryTableName(module), {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => v7()),
    createdAt: datetime("createdAt")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: datetime("updatedAt")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
    path: text("path").notNull(),
    userId: text("userId"),
    sessionId: text("sessionId"),
    agentId: text("agentId"),
    metadata: json<{ type?: string } & Record<string, unknown>>("metadata"),
    content: json<unknown>("content"),
  });
